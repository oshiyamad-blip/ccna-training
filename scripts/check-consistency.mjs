#!/usr/bin/env node
/**
 * 教材とカリキュラムデータの整合性チェック
 *
 * Exercise の並べ替え・追加・削除・一括置換のあとに必ず通す。
 * 「機械で判定できる崩れ」だけを見る。内容の良し悪しは対象外。
 *
 *   node scripts/check-consistency.mjs            # 失敗があれば終了コード 1
 *   node scripts/check-consistency.mjs --verbose  # 成功した検査も表示
 *
 * 検査の追加はこのファイルの check() 呼び出しを増やすだけでよい。
 */
import { readFile, readdir, access } from 'node:fs/promises'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { DAYS, PRE_PHASE_ISSUES, EXAM_PHASE_ISSUES, OPS_ISSUES } from './curriculum-data.mjs'
import { collectPages, GUIDANCE_FILES } from './upload-wiki.mjs'

const execFileAsync = promisify(execFile)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MATERIALS = join(ROOT, 'materials')
const VERBOSE = process.argv.includes('--verbose')

// LESSON まとめテストを置く Exercise（＝各 LESSON の最終回）はデータから導く。
// ハードコードすると、まさに今回直した「位置マーカーのずれ」を検出できなくなる。
const BOUNDARIES = DAYS.filter((d) => d.weeklyTest).map((d) => d.day)
const LAST_DAY = Math.max(...DAYS.map((d) => d.day))
const lessonDir = (day) => `lesson${DAYS.find((d) => d.day === day).week}`
const pad = (n) => String(n).padStart(2, '0')

// ---------------------------------------------------------------- 実行基盤

let failed = 0
const results = []

/** name の検査を実行する。fn は不整合の説明文字列の配列を返す。 */
async function check(name, fn) {
  let problems
  try {
    problems = (await fn()) ?? []
  } catch (e) {
    problems = [`検査自体が例外で停止: ${e.message}`]
  }
  if (problems.length) failed += problems.length
  results.push({ name, problems })
}

const exists = (p) => access(p).then(() => true, () => false)
const read = (p) => readFile(p, 'utf8')

/**
 * コードブロック（```）とインラインコード（`…`）を落とす。
 * `![alt](添付名)` のような「書式の説明例」を実在チェックにかけないため。
 */
function stripCode(text) {
  let inFence = false
  return text.split('\n').map((l) => {
    if (/^\s*```/.test(l)) { inFence = !inFence; return '' }
    return inFence ? '' : l.replace(/`[^`]*`/g, '')
  }).join('\n')
}
const rel = (p) => relative(ROOT, p)

/** 本編 20 Exercise ぶんの教材ファイルを列挙する。 */
function materialFiles() {
  const out = []
  for (const d of DAYS) {
    for (const kind of ['lecture', 'lab', 'quiz']) {
      out.push({ day: d.day, kind, path: join(MATERIALS, lessonDir(d.day), `exercise${pad(d.day)}-${kind}.md`) })
    }
  }
  return out
}

/** 教材・設計文書のうち、Markdown 全般をなめる必要がある検査で使う。 */
async function allMarkdown() {
  const out = []
  const walk = async (dir) => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.git') continue
        await walk(p)
      } else if (e.name.endsWith('.md')) {
        out.push(p)
      }
    }
  }
  await walk(ROOT)
  // reports/ は過去の監査記録、PROJECT-BACKLOG.md は作業履歴。
  // どちらも「その時点の事実」を残す文書なので、現在の構成との一致は求めない。
  return out.filter((p) => !rel(p).startsWith('reports/') && rel(p) !== 'PROJECT-BACKLOG.md')
}

// ------------------------------------------------------- A. カリキュラムデータ

await check('DAYS の day が 1 から連番', () =>
  DAYS.map((d, i) => (d.day === i + 1 ? null : `${i + 1} 番目の要素の day が ${d.day}`)).filter(Boolean))

await check('DAYS の week が day から導ける値と一致', () =>
  DAYS.filter((d) => d.week !== Math.floor((d.day - 1) / 5) + 1)
    .map((d) => `Exercise${d.day} の week が ${d.week}（期待 ${Math.floor((d.day - 1) / 5) + 1}）`))

await check('weeklyTest が各 LESSON の最終回にだけ付いている', () => {
  const expected = DAYS.filter((d) => d.day % 5 === 0).map((d) => d.day)
  const actual = BOUNDARIES
  return String(expected) === String(actual)
    ? []
    : [`weeklyTest が付いているのは Exercise ${actual.join('/')}（期待 ${expected.join('/')}）`]
})

await check('DAYS の必須項目が空でない', () =>
  DAYS.flatMap((d) => ['theme', 'lecture', 'lab', 'quiz']
    .filter((k) => !d[k]?.trim())
    .map((k) => `Exercise${d.day} の ${k} が空`)))

// ------------------------------------------------------------- B. 教材ファイル

await check('本編 20 Exercise の講義・ラボ・小テストがそろっている', async () => {
  const missing = []
  for (const f of materialFiles()) if (!(await exists(f.path))) missing.push(`${rel(f.path)} がない`)
  return missing
})

await check('LESSON0 の P1〜P5 がそろっている', async () => {
  const missing = []
  for (let p = 1; p <= 5; p++) {
    for (const kind of ['lecture', 'work', 'quiz']) {
      const t = join(MATERIALS, 'lesson0', `p0${p}-${kind}.md`)
      if (!(await exists(t))) missing.push(`${rel(t)} がない`)
    }
  }
  return missing
})

await check('見出しの Exercise 番号がファイル名と一致', async () => {
  const bad = []
  for (const f of materialFiles()) {
    if (!(await exists(f.path))) continue
    const first = (await read(f.path)).split('\n')[0]
    const m = first.match(/^# Exercise ?(\d{1,2})/)
    if (!m) bad.push(`${rel(f.path)}: 1 行目が「# Exercise N …」の形式でない（${first.slice(0, 40)}）`)
    else if (Number(m[1]) !== f.day) bad.push(`${rel(f.path)}: 見出しが Exercise ${m[1]}`)
  }
  return bad
})

await check('「配置先」の LESSON 表記が実際のフォルダと一致', async () => {
  const bad = []
  for (const f of materialFiles()) {
    // 小テストは講師用の原本で受講者に配布しないため、配置先の行を持たない
    if (f.kind === 'quiz') continue
    if (!(await exists(f.path))) continue
    const m = (await read(f.path)).match(/^> 配置先: ドキュメント `([^`]+)`/m)
    if (!m) { bad.push(`${rel(f.path)}: 配置先の行がない`); continue }
    const want = `LESSON${DAYS.find((d) => d.day === f.day).week}`
    const got = m[1].match(/LESSON\d/)?.[0]
    if (got !== want) bad.push(`${rel(f.path)}: 配置先が ${got ?? m[1]}（期待 ${want}）`)
  }
  return bad
})

// --------------------------------------------------------------- C. 参照整合

await check('相対リンクの参照先が実在する', async () => {
  const bad = []
  for (const p of await allMarkdown()) {
    for (const m of stripCode(await read(p)).matchAll(/\]\((\.{1,2}\/[^)\s]+)\)/g)) {
      const t = resolve(dirname(p), m[1].split('#')[0])
      if (!(await exists(t))) bad.push(`${rel(p)} → ${m[1]}`)
    }
  }
  return bad
})

await check('画像の参照先が実在する', async () => {
  const bad = []
  for (const p of await allMarkdown()) {
    for (const m of stripCode(await read(p)).matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
      const t = resolve(dirname(p), m[1])
      if (!(await exists(t))) bad.push(`${rel(p)} → ${m[1]}`)
    }
  }
  return bad
})

await check('教材が参照する図版の番号が自分の Exercise 番号と一致', async () => {
  const bad = []
  for (const f of materialFiles()) {
    if (!(await exists(f.path))) continue
    for (const m of (await read(f.path)).matchAll(/!\[[^\]]*\]\([^)]*?exercise(\d{2})[^)]*\)/g)) {
      if (Number(m[1]) !== f.day) bad.push(`${rel(f.path)} が exercise${m[1]}-* の図版を参照`)
    }
  }
  return bad
})

await check('未習の Exercise を「学んだ」ものとして参照していない', async () => {
  const bad = []
  const past = /Exercise ?(\d{1,2})(?![0-9])[^\n]{0,40}?(で学んだ|で学びました|で学習した|で扱った|で設定した|で作成した)/g
  for (const f of materialFiles()) {
    if (!(await exists(f.path))) continue
    const lines = (await read(f.path)).split('\n')
    lines.forEach((line, i) => {
      for (const m of line.matchAll(past)) {
        const n = Number(m[1])
        if (n > f.day && n <= LAST_DAY) bad.push(`${rel(f.path)}:${i + 1} Exercise${n} を既習扱い（自身は Exercise${f.day}）`)
      }
    })
  }
  return bad
})

// --------------------------------------------------- D. ウォームアップ想起クイズ

// 出典は「1 つ前・3 つ前・5 つ前」。materials/README.md・01-curriculum.md に書かれた設計。
const warmupSources = (day) => [day - 1, day - 3, day - 5].filter((n) => n >= 1)

await check('ウォームアップの出典が 1・3・5 つ前の Exercise と一致', async () => {
  const bad = []
  for (const d of DAYS) {
    if (d.day === 1) continue
    const p = join(MATERIALS, lessonDir(d.day), `exercise${pad(d.day)}-lecture.md`)
    if (!(await exists(p))) continue
    const s = await read(p)
    const m = s.match(/分散学習: (.*?) の範囲から出題/s)
    if (!m) { bad.push(`${rel(p)}: ウォームアップの出典を書いた行がない`); continue }
    const got = [...m[1].matchAll(/Exercise (\d+)/g)].map((x) => Number(x[1]))
    const want = warmupSources(d.day)
    if (String(got) !== String(want)) bad.push(`${rel(p)}: 出典が ${got.join('/')}（期待 ${want.join('/')}）`)
  }
  return bad
})

await check('ウォームアップの設問数・解答数が出典数と一致', async () => {
  const bad = []
  for (const d of DAYS) {
    if (d.day === 1) continue
    const p = join(MATERIALS, lessonDir(d.day), `exercise${pad(d.day)}-lecture.md`)
    if (!(await exists(p))) continue
    const block = (await read(p)).match(/## ウォームアップ（想起クイズ）\n[\s\S]*?\n---/)?.[0]
    if (!block) continue
    const want = warmupSources(d.day).length
    const qs = [...block.matchAll(/^\*\*W(\d+)\.\*\*/gm)].length
    const as = [...block.matchAll(/^W(\d+)\. /gm)].length
    if (qs !== want) bad.push(`${rel(p)}: 設問 ${qs} 問（期待 ${want} 問）`)
    if (as !== want) bad.push(`${rel(p)}: 解答 ${as} 件（期待 ${want} 件）`)
  }
  return bad
})

// ------------------------------------------------------------------ E. テスト

await check('LESSON まとめテストが LESSON の最終回にだけ置かれている', async () => {
  const bad = []
  for (const d of DAYS) {
    const p = join(MATERIALS, lessonDir(d.day), `exercise${pad(d.day)}-quiz.md`)
    if (!(await exists(p))) continue
    const head = (await read(p)).split('\n')[0]
    const isSummary = /（(LESSON\d+ まとめテスト|研修修了テスト)）/.test(head)
    const shouldBe = BOUNDARIES.includes(d.day)
    if (isSummary && !shouldBe) bad.push(`${rel(p)}: まとめテストだが Exercise${d.day} は LESSON の区切りでない`)
    if (!isSummary && shouldBe) bad.push(`${rel(p)}: Exercise${d.day} は LESSON の区切りだがまとめテストになっていない`)
  }
  return bad
})

await check('小テストの設問数が種別どおり（通常10／まとめ25／修了60）', async () => {
  const bad = []
  for (const d of DAYS) {
    const p = join(MATERIALS, lessonDir(d.day), `exercise${pad(d.day)}-quiz.md`)
    if (!(await exists(p))) continue
    const s = await read(p)
    const want = d.finalTest ? 60 : BOUNDARIES.includes(d.day) ? 25 : 10
    const qs = [...s.matchAll(/^\*\*Q(\d+)\.\*\*/gm)].length
    if (qs !== want) bad.push(`${rel(p)}: ${qs} 問（期待 ${want} 問）`)
  }
  return bad
})

await check('小テストの設問数と解答表の行数が一致', async () => {
  const bad = []
  for (const d of DAYS) {
    const p = join(MATERIALS, lessonDir(d.day), `exercise${pad(d.day)}-quiz.md`)
    if (!(await exists(p))) continue
    const s = await read(p)
    const qs = [...s.matchAll(/^\*\*Q(\d+)\.\*\*/gm)].length
    const as = [...s.matchAll(/^\| Q(\d+) \|/gm)].length
    if (qs !== as) bad.push(`${rel(p)}: 設問 ${qs} 問に対し解答 ${as} 行`)
  }
  return bad
})

// ------------------------------------------------- F. 位置マーカー・命名規則

await check('LESSON の区切りを示す Exercise 番号が全文書で一致', async () => {
  // 「Exercise 5 / 10 / 15 / 20」は中身ではなく“位置”を指す。番号の一括置換で
  // 真っ先に壊れるのがここ。区切りの列挙を見つけたら BOUNDARIES と突き合わせる。
  const bad = []
  const re = /Exercise ?(\d{1,2})(?: ?\/ ?(\d{1,2}))+/g
  for (const p of await allMarkdown()) {
    const lines = (await read(p)).split('\n')
    lines.forEach((line, i) => {
      for (const m of line.matchAll(re)) {
        const nums = m[0].match(/\d{1,2}/g).map(Number)
        // 区切りの列挙かどうかは「まとめテスト／LESSON」の文脈で判断する
        if (!/まとめテスト|LESSON|振り返り|締めくくり/.test(line)) continue
        const isSubset = nums.every((n) => BOUNDARIES.includes(n))
        if (!isSubset) bad.push(`${rel(p)}:${i + 1} 「${m[0]}」が区切り（${BOUNDARIES.join('/')}）と食い違う`)
      }
    })
  }
  return bad
})

await check('LESSON フォルダ名に接尾辞が付いていない', async () => {
  // 2026-08 決定: フォルダ名は upload-wiki.mjs が実際に作る `LESSON1` の形に統一する
  // （`LESSON1_ネットワーク基礎` のような接尾辞付きは使わない）。
  const bad = []
  for (const p of await allMarkdown()) {
    const lines = (await read(p)).split('\n')
    lines.forEach((l, i) => {
      const m = l.match(/LESSON\d_[^\s/`）」]+/)
      if (m) bad.push(`${rel(p)}:${i + 1} 「${m[0]}」は接尾辞なし（LESSON${m[0][6]}）にする`)
    })
  }
  return bad
})

await check('課題名の例が [ExerciseNN] のゼロ埋め表記', async () => {
  const bad = []
  for (const p of await allMarkdown()) {
    const lines = (await read(p)).split('\n')
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/\[Exercise(\d)\](?!\d)/g)) {
        bad.push(`${rel(p)}:${i + 1} 「${m[0]}」はゼロ埋め（[Exercise0${m[1]}]）にする`)
      }
    })
  }
  return bad
})

// ------------------------------------------------------------ G. 投入物の員数

await check('課題投入 dry-run の件数がデータ模型と一致', async () => {
  const expected = PRE_PHASE_ISSUES.length + DAYS.length * 3 + EXAM_PHASE_ISSUES.length + OPS_ISSUES.length
  const { stdout } = await execFileAsync('node', [
    join(ROOT, 'scripts/create-backlog-issues.mjs'),
    '--project', 'CHECK', '--start', '2026-09-01', '--dry-run',
  ], { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 })
  const actual = Number(stdout.match(/完了: (\d+) 件/)?.[1] ?? -1)
  if (VERBOSE) console.log(`  （課題 ${actual} 件）`)
  return actual === expected ? [] : [`dry-run が ${actual} 件、データ模型からの期待は ${expected} 件`]
})

await check('Wiki 投入ページ数がデータ模型と一致', async () => {
  // ガイダンス等 + LESSON0（講義・実習 各5）+ 本編（講義・ラボ）。小テストは既定で除外。
  const pages = await collectPages()
  // ガイダンス・試験対策・環境構築系（GUIDANCE_FILES）+ LESSON0（P1〜P5 の講義・実習）
  // + 本編（Exercise ごとに講義・ラボ）。小テストは既定で投入しない。
  const expected = GUIDANCE_FILES.length + 5 * 2 + DAYS.length * 2
  if (VERBOSE) console.log(`  （Wiki ${pages.length} ページ）`)
  return pages.length === expected ? [] : [`collectPages() が ${pages.length} ページ、期待は ${expected} ページ`]
})

await check('小テストが Wiki 投入対象に混ざっていない', async () => {
  // 解答つきの小テスト原本を受講者に見せてしまう事故の検出。
  const pages = await collectPages()
  return pages.filter((p) => p.name.includes('小テスト')).map((p) => `受講者向け投入に含まれている: ${p.name}`)
})

// ------------------------------------------------------------------ 結果表示

const pass = results.filter((r) => !r.problems.length)
for (const r of results) {
  if (r.problems.length) {
    console.log(`✗ ${r.name}`)
    for (const p of r.problems.slice(0, 20)) console.log(`    ${p}`)
    if (r.problems.length > 20) console.log(`    … ほか ${r.problems.length - 20} 件`)
  } else if (VERBOSE) {
    console.log(`✓ ${r.name}`)
  }
}
console.log(`\n${pass.length}/${results.length} 検査に合格` + (failed ? `（不整合 ${failed} 件）` : ''))
process.exit(failed ? 1 : 0)
