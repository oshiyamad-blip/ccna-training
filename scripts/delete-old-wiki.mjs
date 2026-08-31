#!/usr/bin/env node
// 旧名の Wiki ページを一括削除するスクリプト。
//
// 仕組み: いまの upload-wiki.mjs が生成する「正のページ名一覧」を計算し、
// プロジェクトの Wiki のうち prefix（既定 `CCNA研修/`）配下で
// 正の一覧に含まれないページ＝旧名ページ（Week/Day 時代・テーマなし時代・
// 旧ガイダンス配置など）だけを削除する。
//
// 使い方:
//   BACKLOG_SPACE_URL=https://your-space.backlog.com \
//   BACKLOG_API_KEY=xxxxxxxx \
//   node delete-old-wiki.mjs --project CCNA [--include-quiz] [--execute]
//
//   --project      Backlog プロジェクトキー（必須）
//   --include-quiz 正の一覧に quiz ページも含める（講師用プロジェクトを掃除する場合。
//                  upload-wiki を --include-quiz で投入したプロジェクトでは必ず付ける。
//                  付け忘れると現行の quiz ページまで「旧ページ」と誤判定して削除する）
//   --execute      実際に削除する。付けない場合は削除対象の一覧表示のみ（dry-run）
//   --prefix      対象を絞る名前の接頭辞（既定: CCNA研修/）。接頭辞の外は一切触らない
//
// 安全設計:
//   - 既定は dry-run。--execute を付けたときだけ削除する
//   - prefix 配下以外（Backlog 既定の Home など）は対象外
//   - 削除は Wiki のみ。ドキュメント（Wiki から移行済みのもの）には影響しない
// Node.js 18 以上、依存パッケージなし。

import { collectPages } from './upload-wiki.mjs'

const args = process.argv.slice(2)
function argValue(name) {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const PROJECT_KEY = argValue('--project')
const EXECUTE = args.includes('--execute')
const PREFIX = argValue('--prefix') ?? 'CCNA研修/'

const SPACE_URL = (process.env.BACKLOG_SPACE_URL ?? '').replace(/\/$/, '')
const API_KEY = process.env.BACKLOG_API_KEY

if (!PROJECT_KEY || !SPACE_URL || !API_KEY) {
  console.error('必須の指定が不足しています。')
  console.error('  環境変数: BACKLOG_SPACE_URL, BACKLOG_API_KEY')
  console.error('  引数    : --project <KEY> [--include-quiz] [--execute] [--prefix <名前接頭辞>]')
  process.exit(1)
}

async function api(method, path, params = {}) {
  const url = new URL(`${SPACE_URL}/api/v2${path}`)
  url.searchParams.set('apiKey', API_KEY)
  const init = { method }
  if (method === 'GET' || method === 'DELETE') {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Backlog API ${method} ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function main() {
  // 正のページ名一覧（upload-wiki.mjs と同じロジック。--include-quiz も同じ引数で効く）
  const current = new Set((await collectPages()).map((p) => p.name))

  const wikis = await api('GET', '/wikis', { projectIdOrKey: PROJECT_KEY })
  const inScope = wikis.filter((w) => w.name.startsWith(PREFIX))
  const stale = inScope.filter((w) => !current.has(w.name))
  const keep = inScope.length - stale.length

  console.log(`プロジェクト: ${PROJECT_KEY} / 接頭辞: ${PREFIX}`)
  console.log(`Wiki 全 ${wikis.length} ページ中、対象範囲 ${inScope.length}（維持 ${keep} / 旧ページ ${stale.length}）\n`)

  if (stale.length === 0) {
    console.log('削除すべき旧ページはありません。')
    return
  }

  for (const w of stale) {
    if (EXECUTE) {
      await api('DELETE', `/wikis/${w.id}`, { mailNotify: 'false' })
      console.log(`削除: ${w.name}`)
    } else {
      console.log(`[dry-run] 削除対象: ${w.name}`)
    }
  }

  if (EXECUTE) {
    console.log(`\n完了: ${stale.length} ページを削除しました。`)
  } else {
    console.log(`\n${stale.length} ページが削除対象です。実行するには --execute を付けてください。`)
    console.log('（講師用プロジェクトでは --include-quiz を忘れずに。付けないと現行の quiz ページも削除対象に出ます）')
  }
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
