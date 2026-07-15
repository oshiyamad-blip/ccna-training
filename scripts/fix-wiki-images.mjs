#!/usr/bin/env node
// Wiki ページ内の画像参照を Backlog の #image(filename) 記法に書き換える。
// Backlog Markdown モードでも添付ファイルのインライン表示には #image() が必要。
//
// 使い方:
//   BACKLOG_SPACE_URL=https://your-space.backlog.com \
//   BACKLOG_API_KEY=xxx \
//   node fix-wiki-images.mjs <PROJECT_KEY> [--dry-run]

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
    const attachments = await api(`/wikis/${w.id}/attachments`)
    if (!attachments.length) continue

    const detail = await api(`/wikis/${w.id}`)
    let content = detail.content ?? ''
    let changed = false

    for (const { name: filename } of attachments) {
      const escName = filename.replace(/\./g, '\\.')
      // downloadWikiAttachment URL 形式 → #image()
      const patternUrl = new RegExp(
        `!\\[[^\\]]*\\]\\(https?://[^)]+/downloadWikiAttachment/\\d+/\\d+\\)`,
        'g'
      )
      // ファイル名だけの形式 → #image()
      const patternName = new RegExp(`!\\[[^\\]]*\\]\\(${escName}\\)`, 'g')

      for (const pat of [patternUrl, patternName]) {
        const replaced = content.replace(pat, `#image(${filename})`)
        if (replaced !== content) { content = replaced; changed = true }
      }
    }

    if (!changed) continue

    if (DRY_RUN) {
      console.log(`[dry-run] 更新: ${w.name}`)
      const imgs = attachments.map(a => a.name).join(', ')
      console.log(`  → #image(${imgs})`)
    } else {
      await patchWiki(w.id, content)
      console.log(`更新: ${w.name}`)
      updated++
    }
  }
  if (!DRY_RUN) console.log(`\n完了: ${updated} ページを更新`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
