#!/usr/bin/env node
// Backlog へ CCNA 研修の課題（講義・ラボ・小テスト × 20 日分）を一括投入するスクリプト。
// 種別・カテゴリー・マイルストーンが未作成なら先に作成する。
//
// 使い方:
//   BACKLOG_SPACE_URL=https://your-space.backlog.jp \
//   BACKLOG_API_KEY=xxxxxxxx \
//   node create-backlog-issues.mjs --project CCNA --start 2026-08-03 [--trainee 山田] [--assignee <userId>] [--dry-run]
//
//   --project   Backlog プロジェクトキー（必須）
//   --start     Day 1 の日付 YYYY-MM-DD（必須）。土日はスキップして期限日を採番する
//   --trainee   受講者名（省略可）。単一プロジェクトに複数受講者を同居させる場合に指定。
//               課題名に [名前] プレフィックス、マイルストーン名に「名前-」が付き、
//               受講者ごとに独立した課題セット・マイルストーンが作られる。
//               受講者ごとにプロジェクトを分ける運用（推奨）では指定不要。
//   --assignee  課題の担当者のユーザー ID（数値、省略可）
//   --skip-precourse  Week0「ITベーシック」プレコースを省略する（IT経験者向け）
//   --skip-ops  継続率・合格率の運営課題（週次伴走・KPI・キックオフ等）を省略する。
//               既定では作成する（10-retention-and-pass-rate.md に対応）
//   --dry-run   API を呼ばず作成予定の内容を表示する
//
// ローリング型（受講者が随時入学）の運用では、受講者の入学ごとに本スクリプトを
// その受講者の開始日で 1 回実行する。種別・カテゴリーは既存があれば再利用される（冪等）。
//
// 必要権限: API キーのユーザーがプロジェクト管理者であること（種別等の作成に必要）。
// Node.js 18 以上（fetch 内蔵）で動作。依存パッケージなし。

import {
  ISSUE_TYPES, CATEGORIES, MILESTONES, DAYS, EXAM_PHASE_ISSUES, PRE_PHASE_ISSUES, OPS_ISSUES,
  lectureDescription, labDescription, quizDescription,
} from './curriculum-data.mjs'

// ---------- 引数・環境変数 ----------

const args = process.argv.slice(2)
function argValue(name) {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const PROJECT_KEY = argValue('--project')
const START = argValue('--start')
const TRAINEE = argValue('--trainee')
const ASSIGNEE = argValue('--assignee')
const DRY_RUN = args.includes('--dry-run')
// 既定では Week0「ITベーシック」プレコース（5営業日）から開始する（受講者はITリテラシーゼロ前提）。
// IT経験者には --skip-precourse を指定すると Day1 から開始し、Day00（環境構築）課題を別途作成する
const SKIP_PRE = args.includes('--skip-precourse')
const OFFSET = SKIP_PRE ? 0 : 5 // 本編 Day1 の開始が Week0 のぶん後ろにずれる
// 既定で継続率・合格率の運営課題（週次伴走・KPI・キックオフ等）も作成する。
// 運営タスクを別管理する純粋な学習者専用プロジェクトでは --skip-ops で省略できる。
const SKIP_OPS = args.includes('--skip-ops')

// 受講者名によるプレフィックス（単一プロジェクト同居モード用）
const summaryPrefix = TRAINEE ? `[${TRAINEE}] ` : ''
const milestonePrefix = TRAINEE ? `${TRAINEE}-` : ''

const SPACE_URL = (process.env.BACKLOG_SPACE_URL ?? '').replace(/\/$/, '')
const API_KEY = process.env.BACKLOG_API_KEY

if (!PROJECT_KEY || !START || (!DRY_RUN && (!SPACE_URL || !API_KEY))) {
  console.error('必須の指定が不足しています。')
  console.error('  環境変数: BACKLOG_SPACE_URL, BACKLOG_API_KEY（--dry-run 時は不要）')
  console.error('  引数    : --project <KEY> --start <YYYY-MM-DD> [--assignee <userId>] [--dry-run]')
  process.exit(1)
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(START)) {
  console.error(`--start は YYYY-MM-DD 形式で指定してください: ${START}`)
  process.exit(1)
}

// ---------- Backlog API クライアント ----------

async function api(method, path, params = {}) {
  const url = new URL(`${SPACE_URL}/api/v2${path}`)
  url.searchParams.set('apiKey', API_KEY)

  const init = { method }
  if (method === 'GET') {
    for (const [k, v] of Object.entries(params)) {
      if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x))
      else if (v !== undefined) url.searchParams.set(k, v)
    }
  } else {
    const body = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (Array.isArray(v)) v.forEach((x) => body.append(k, x))
      else if (v !== undefined) body.set(k, v)
    }
    init.body = body
  }

  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Backlog API ${method} ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

// ---------- 日付ユーティリティ（土日スキップ） ----------

function prevBusinessDay(startYmd) {
  // startYmd の直前の営業日（YYYY-MM-DD）を返す
  const [y, m, d] = startYmd.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  do {
    date.setUTCDate(date.getUTCDate() - 1)
  } while (date.getUTCDay() === 0 || date.getUTCDay() === 6)
  return date.toISOString().slice(0, 10)
}

function addBusinessDays(startYmd, n) {
  // startYmd を 0 営業日目として n 営業日後の YYYY-MM-DD を返す
  const [y, m, d] = startYmd.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  // 開始日が土日なら次の月曜へ
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() + 1)
  let remaining = n
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1)
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) remaining--
  }
  return date.toISOString().slice(0, 10)
}

// ---------- メイン ----------

async function ensureByName(existing, wanted, create, label) {
  // 既存一覧 existing（{id, name}[]）に wanted.name がなければ create() で作成し、
  // name -> id のマップを返す
  const map = new Map(existing.map((e) => [e.name, e.id]))
  for (const item of wanted) {
    if (map.has(item.name)) continue
    if (DRY_RUN) {
      console.log(`[dry-run] ${label} を作成: ${item.name}`)
      map.set(item.name, 0)
      continue
    }
    const created = await create(item)
    map.set(created.name, created.id)
    console.log(`${label} を作成しました: ${created.name} (id=${created.id})`)
  }
  return map
}

async function main() {
  console.log(`プロジェクト: ${PROJECT_KEY} / 開始日: ${START}${DRY_RUN ? ' [dry-run]' : ''}`)

  let issueTypeIds = new Map()
  let categoryIds = new Map()
  let milestoneIds = new Map()
  let priorityId = 3 // 「中」の既定 ID

  if (!DRY_RUN) {
    // 種別
    const types = await api('GET', `/projects/${PROJECT_KEY}/issueTypes`)
    issueTypeIds = await ensureByName(
      types, ISSUE_TYPES,
      (t) => api('POST', `/projects/${PROJECT_KEY}/issueTypes`, { name: t.name, color: t.color }),
      '種別',
    )

    // カテゴリー
    const cats = await api('GET', `/projects/${PROJECT_KEY}/categories`)
    categoryIds = await ensureByName(
      cats, CATEGORIES.map((name) => ({ name })),
      (c) => api('POST', `/projects/${PROJECT_KEY}/categories`, { name: c.name }),
      'カテゴリー',
    )

    // マイルストーン（週ごとに開始日・期限日を付与）
    const versions = await api('GET', `/projects/${PROJECT_KEY}/versions`)
    milestoneIds = await ensureByName(
      versions,
      MILESTONES.filter((m) => !(SKIP_PRE && m.week === 0)).map((m) => ({
        ...m,
        name: milestonePrefix + m.name,
        startDate: addBusinessDays(START, m.week === 0 ? 0 : OFFSET + (m.week - 1) * 5),
        releaseDueDate: addBusinessDays(START, (m.week === 0 ? 0 : OFFSET + (m.week - 1) * 5) + 4),
      })),
      (m) => api('POST', `/projects/${PROJECT_KEY}/versions`, {
        name: m.name, startDate: m.startDate, releaseDueDate: m.releaseDueDate,
      }),
      'マイルストーン',
    )

    // 優先度「中」の ID を取得
    const priorities = await api('GET', '/priorities')
    priorityId = (priorities.find((p) => p.name === '中') ?? priorities[Math.floor(priorities.length / 2)]).id
  }

  // プロジェクト ID（課題作成に必要）
  const projectId = DRY_RUN ? 0 : (await api('GET', `/projects/${PROJECT_KEY}`)).id

  // 課題の生成
  let created = 0

  // Week 0 プレコース（既定）: P1〜P5 の課題
  if (!SKIP_PRE) {
    for (const e of PRE_PHASE_ISSUES) {
      const dueDate = addBusinessDays(START, e.day - 1)
      const summary = summaryPrefix + e.summary
      if (DRY_RUN) {
        console.log(`[dry-run] 課題: ${summary}  期限=${dueDate} 種別=${e.type} 週=Week0`)
        created++
        continue
      }
      await api('POST', '/issues', {
        projectId,
        summary,
        description: e.description,
        issueTypeId: issueTypeIds.get(e.type),
        priorityId,
        dueDate,
        'milestoneId[]': [milestoneIds.get(milestonePrefix + MILESTONES.find((m) => m.week === 0).name)],
        ...(ASSIGNEE ? { assigneeId: ASSIGNEE } : {}),
      })
      created++
      console.log(`課題を作成しました: ${summary} (期限 ${dueDate})`)
    }
  }

  // Day 0: 環境構築（期限 = 開講前日）。プレコースあり時は P5 に統合されるため作成しない
  const day00 = {
    summary: `${summaryPrefix}[Day00] 環境構築: Packet Tracer セットアップ`,
    dueDate: prevBusinessDay(START),
    description: [
      '## ゴール',
      '- 研修で毎日使う Cisco Packet Tracer を自分の PC で使える状態にする',
      '',
      '## 手順書',
      '- ドキュメント: 「00_ガイダンス > Day00 環境構築」を最初から最後まで実施する',
      '',
      '## 提出物',
      '- ping 成功のスクリーンショットをコメントに貼る',
      '- day00_氏名.pkt をこの課題に添付する',
      '',
      '## 完了条件',
      '- [ ] NetAcad アカウントでログインできる',
      '- [ ] Packet Tracer が起動する',
      '- [ ] ミニ演習（PC2台+スイッチ）の ping が成功した',
      '- [ ] スクリーンショットと .pkt を提出した',
    ].join('\n'),
  }
  if (!SKIP_PRE) {
    // プレコースありの場合、環境構築は P5 で実施
  } else if (DRY_RUN) {
    console.log(`[dry-run] 課題: ${day00.summary}  期限=${day00.dueDate} 種別=ラボ 週=Week1`)
    created++
  } else {
    await api('POST', '/issues', {
      projectId,
      summary: day00.summary,
      description: day00.description,
      issueTypeId: issueTypeIds.get('ラボ'),
      priorityId,
      dueDate: day00.dueDate,
      'milestoneId[]': [milestoneIds.get(milestonePrefix + MILESTONES.find((m) => m.week === 1).name)],
      ...(ASSIGNEE ? { assigneeId: ASSIGNEE } : {}),
    })
    created++
    console.log(`課題を作成しました: ${day00.summary} (期限 ${day00.dueDate})`)
  }

  for (const d of DAYS) {
    const dd = String(d.day).padStart(2, '0')
    const dueDate = addBusinessDays(START, OFFSET + d.day - 1)
    const quizType = d.weeklyTest ? '週次テスト' : '小テスト'
    const quizTitle = d.finalTest
      ? `${summaryPrefix}[Day${dd}] 修了テスト: 全範囲（60問/120分）`
      : d.weeklyTest
        ? `${summaryPrefix}[Day${dd}] 週次テスト: ${d.quiz}`
        : `${summaryPrefix}[Day${dd}] 小テスト: ${d.quiz}`

    const issues = [
      { type: '講義', summary: `${summaryPrefix}[Day${dd}] 講義: ${d.theme}`, description: lectureDescription(d) },
      { type: 'ラボ', summary: `${summaryPrefix}[Day${dd}] ラボ: ${d.lab}`, description: labDescription(d) },
      { type: quizType, summary: quizTitle, description: quizDescription(d) },
    ]

    for (const issue of issues) {
      if (DRY_RUN) {
        console.log(`[dry-run] 課題: ${issue.summary}  期限=${dueDate} 種別=${issue.type} 週=Week${d.week} カテゴリー=${d.categories.join(',')}`)
        created++
        continue
      }
      await api('POST', '/issues', {
        projectId,
        summary: issue.summary,
        description: issue.description,
        issueTypeId: issueTypeIds.get(issue.type),
        priorityId,
        dueDate,
        'categoryId[]': d.categories.map((c) => categoryIds.get(c)),
        'milestoneId[]': [milestoneIds.get(milestonePrefix + MILESTONES.find((m) => m.week === d.week).name)],
        ...(ASSIGNEE ? { assigneeId: ASSIGNEE } : {}),
      })
      created++
      console.log(`課題を作成しました: ${issue.summary} (期限 ${dueDate})`)
    }
  }

  // 試験対策フェーズ（Day 21〜25）: 模試サイクルの課題
  for (const e of EXAM_PHASE_ISSUES) {
    const dueDate = addBusinessDays(START, OFFSET + e.day - 1)
    const summary = summaryPrefix + e.summary
    if (DRY_RUN) {
      console.log(`[dry-run] 課題: ${summary}  期限=${dueDate} 種別=${e.type} 週=Week5`)
      created++
      continue
    }
    await api('POST', '/issues', {
      projectId,
      summary,
      description: e.description,
      issueTypeId: issueTypeIds.get(e.type),
      priorityId,
      dueDate,
      'milestoneId[]': [milestoneIds.get(milestonePrefix + MILESTONES.find((m) => m.week === 5).name)],
      ...(ASSIGNEE ? { assigneeId: ASSIGNEE } : {}),
    })
    created++
    console.log(`課題を作成しました: ${summary} (期限 ${dueDate})`)
  }

  // 運営課題（継続率・合格率の伴走タスク。10-retention-and-pass-rate.md に対応）
  if (!SKIP_OPS) {
    for (const o of OPS_ISSUES) {
      // 期限日: pre=開講前日 / start=その週の開始日 / end=その週の最終営業日
      const base = o.week === 0 ? 0 : OFFSET + (o.week - 1) * 5
      const dueDate = o.at === 'pre'
        ? prevBusinessDay(START)
        : addBusinessDays(START, o.at === 'end' ? base + 4 : base)
      // マイルストーン: Week0 が省略されている場合は Week1 に寄せる
      const mWeek = (o.week === 0 && SKIP_PRE) ? 1 : o.week
      const summary = summaryPrefix + o.summary
      if (DRY_RUN) {
        console.log(`[dry-run] 課題: ${summary}  期限=${dueDate} 種別=運営 週=Week${mWeek}`)
        created++
        continue
      }
      await api('POST', '/issues', {
        projectId,
        summary,
        description: o.description,
        issueTypeId: issueTypeIds.get('運営'),
        priorityId,
        dueDate,
        'milestoneId[]': [milestoneIds.get(milestonePrefix + MILESTONES.find((m) => m.week === mWeek).name)],
        ...(ASSIGNEE ? { assigneeId: ASSIGNEE } : {}),
      })
      created++
      console.log(`課題を作成しました: ${summary} (期限 ${dueDate})`)
    }
  }

  console.log(`\n完了: ${created} 件の課題を${DRY_RUN ? '作成予定として表示' : '作成'}しました。`)
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
