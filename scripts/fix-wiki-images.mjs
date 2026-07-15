#!/usr/bin/env node
// Wiki ページ内の画像参照 ![alt](filename.png) を
// Backlog 添付ダウンロードURL ![alt](https://space/downloadWikiAttachment/wikiId/attachId) に書き換える

const SPACE_URL = (process.env.BACKLOG_SPACE_URL ?? '').replace(/\/$/, '')
const API_KEY = process.env.BACKLOG_API_KEY
const PROJECT_KEY = process.argv[2]
const DRY_RUN = process.argv.includes('--dry-run')

if (!PROJECT_KEY || !SPACE_URL || !API_KEY) {
  console.error('使い方: BACKLOG_SPACE_URL=... BACKLOG_API_KEY=... node fix-wiki-images.mjs <PROJECT_KEY> [--dry-run]')
  process.exit(1)
}

async function api(path, params = {}) {
  const url = new URL(`${SPACE_URL}/api/v2${path}`)
  url.searchParams.set('apiKey', API_KEY)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API GET ${path} failed: ${res.status}`)
  return res.json()
}

async function patchWiki(wikiId, content) {
  const url = new URL(`${SPACE_URL}/api/v2/wikis/${wikiId}`)
  url.searchParams.set('apiKey', API_KEY)
  const body = new URLSearchParams({ content, mailNotify: 'false' })
  const res = await fetch(url, { method: 'PATCH', body })
  if (!res.ok) throw new Error(`PATCH /wikis/${wikiId} failed: ${res.status}`)
  return res.json()
}

async function main() {
  const wikis = await api('/wikis', { projectIdOrKey: PROJECT_KEY })
  console.log(`対象 Wiki: ${wikis.length} ページ`)

  let updated = 0
  for (const w of wikis) {
    // 添付ファイルがないページはスキップ
    const attachments = await api(`/wikis/${w.id}/attachments`)
    if (!attachments.length) continue

    // filename → download URL マップ
    const urlMap = new Map(
      attachments.map(a => [a.name, `${SPACE_URL}/downloadWikiAttachment/${w.id}/${a.id}`])
    )

    // 個別取得でコンテンツを得る
    const detail = await api(`/wikis/${w.id}`)
    let content = detail.content ?? ''
    let changed = false
    for (const [filename, dlUrl] of urlMap) {
      const pattern = new RegExp(`!\\[([^\\]]*)\\]\\(${filename.replace('.', '\\.')}\\)`, 'g')
      const replaced = content.replace(pattern, (_, alt) => `![${alt}](${dlUrl})`)
      if (replaced !== content) { content = replaced; changed = true }
    }

    if (!changed) continue

    if (DRY_RUN) {
      console.log(`[dry-run] 更新: ${w.name}`)
      for (const [f, u] of urlMap) console.log(`  ${f} → ${u}`)
    } else {
      await patchWiki(w.id, content)
      console.log(`更新: ${w.name}`)
      updated++
    }
  }
  if (!DRY_RUN) console.log(`\n完了: ${updated} ページを更新`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
