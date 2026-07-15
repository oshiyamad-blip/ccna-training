#!/usr/bin/env node
// 教材 Markdown（materials/ 以下）を Backlog Wiki へ一括投入するスクリプト。
// 投入後、Backlog の「Wiki → ドキュメント移行機能」でドキュメント化する想定
// （ドキュメント機能の API は未提供のため Wiki を経由する）。
//
// 使い方:
//   BACKLOG_SPACE_URL=https://your-space.backlog.jp \
//   BACKLOG_API_KEY=xxxxxxxx \
//   node upload-wiki.mjs --project CCNA [--include-quiz] [--dry-run]
//
//   --include-quiz  小テストファイル（dayNN-quiz.md）も投入する。
//                   ※ quiz ファイルには解答・解説が含まれるため既定では除外。
//                     受講者が Wiki を閲覧できる場合は絶対に指定しないこと。
//   --dry-run       API を呼ばず投入予定を表示する
//
// 同名の Wiki ページが既にあれば内容を更新する（冪等）。
// Node.js 18 以上、依存パッケージなし。

import { readdir, readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
function argValue(name) {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const PROJECT_KEY = argValue('--project')
const INCLUDE_QUIZ = args.includes('--include-quiz')
const DRY_RUN = args.includes('--dry-run')

const SPACE_URL = (process.env.BACKLOG_SPACE_URL ?? '').replace(/\/$/, '')
const API_KEY = process.env.BACKLOG_API_KEY

if (!PROJECT_KEY || (!DRY_RUN && (!SPACE_URL || !API_KEY))) {
  console.error('必須の指定が不足しています。')
  console.error('  環境変数: BACKLOG_SPACE_URL, BACKLOG_API_KEY（--dry-run 時は不要）')
  console.error('  引数    : --project <KEY> [--include-quiz] [--dry-run]')
  process.exit(1)
}

const MATERIALS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'materials')
const GUIDANCE_FILES = [
  { file: join(dirname(fileURLToPath(import.meta.url)), '..', '04-guidance.md'), page: 'CCNA研修/00_ガイダンス/研修の進め方' },
  { file: join(dirname(fileURLToPath(import.meta.url)), '..', 'materials', 'day00-setup.md'), page: 'CCNA研修/00_ガイダンス/Day00 環境構築' },
  { file: join(dirname(fileURLToPath(import.meta.url)), '..', 'materials', 'templates', 'error-log.md'), page: 'CCNA研修/00_ガイダンス/誤答ノートの書き方' },
  { file: join(dirname(fileURLToPath(import.meta.url)), '..', 'materials', 'templates', 'weekly-retro.md'), page: 'CCNA研修/00_ガイダンス/週次振り返りの書き方' },
  { file: join(dirname(fileURLToPath(import.meta.url)), '..', 'materials', 'drills', 'binary-drill.md'), page: 'CCNA研修/00_ガイダンス/計算ドリル_2進数16進数' },
  { file: join(dirname(fileURLToPath(import.meta.url)), '..', 'materials', 'drills', 'subnet-drill.md'), page: 'CCNA研修/00_ガイダンス/計算ドリル_サブネット' },
  { file: join(dirname(fileURLToPath(import.meta.url)), '..', 'materials', 'drills', 'wildcard-drill.md'), page: 'CCNA研修/00_ガイダンス/計算ドリル_ワイルドカード' },
  { file: join(dirname(fileURLToPath(import.meta.url)), '..', '01-curriculum.md'), page: 'CCNA研修/00_ガイダンス/カリキュラム全体表' },
  { file: join(dirname(fileURLToPath(import.meta.url)), '..', '03-packet-tracer-manual.md'), page: 'CCNA研修/00_ガイダンス/PacketTracer導入マニュアル' },
]

const KIND_LABEL = { lecture: '講義', lab: 'ラボ手順書', work: '実習', quiz: '小テスト' }
const KIND_FOLDER = { lecture: '01_教材', lab: '02_ラボ手順書', work: '02_実習手順書', quiz: '04_講師用_小テスト原本' }

async function api(method, path, params = {}) {
  const url = new URL(`${SPACE_URL}/api/v2${path}`)
  url.searchParams.set('apiKey', API_KEY)
  const init = { method }
  if (method === 'GET') {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  } else {
    const body = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) body.set(k, v)
    init.body = body
  }
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Backlog API ${method} ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

// Backlog Markdown モードで添付画像をインライン表示する参照形式（実機検証済み）。
const imageRef = (_alt, filename) => `![${filename}][${filename}]`

// 本文中の ../images/xxx.png 参照を抽出し、{alt, filename, absPath} の配列で返す
function extractImages(content, mdDir) {
  const refs = []
  for (const m of content.matchAll(/!\[([^\]]*)\]\((\.\.\/images\/([^)]+))\)/g)) {
    refs.push({ alt: m[1], rel: m[2], filename: m[3], absPath: join(mdDir, m[2]) })
  }
  return refs
}

// 画像参照を添付ファイル参照へ書き換える
function rewriteImageRefs(content, images) {
  let out = content
  for (const img of images) {
    out = out.replaceAll(`![${img.alt}](${img.rel})`, imageRef(img.alt, img.filename))
  }
  return out
}

// スペースへ添付ファイルをアップロードし attachment id を返す（multipart）
async function uploadSpaceAttachment(absPath, filename) {
  const buf = await readFile(absPath)
  const form = new FormData()
  form.set('file', new Blob([buf], { type: 'image/png' }), filename)
  const url = new URL(`${SPACE_URL}/api/v2/space/attachment`)
  url.searchParams.set('apiKey', API_KEY)
  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`添付アップロード失敗 (${filename}): ${res.status} ${text}`)
  }
  return (await res.json()).id
}

// ページの画像を Wiki に添付する（既に同名が添付済みならスキップ）
async function attachImagesToWiki(wikiId, images) {
  if (!images.length) return 0
  const existing = await api('GET', `/wikis/${wikiId}/attachments`)
  const existingNames = new Set(existing.map((a) => a.name))
  let attached = 0
  for (const img of images) {
    if (existingNames.has(img.filename)) continue
    try {
      const attachmentId = await uploadSpaceAttachment(img.absPath, img.filename)
      await api('POST', `/wikis/${wikiId}/attachments`, { 'attachmentId[]': attachmentId })
      attached++
    } catch (err) {
      console.warn(`  画像添付をスキップ: ${img.filename} (${err.message})`)
    }
  }
  return attached
}

// Backlog の Markdown は段落内の単一改行を <br> として描画するため、教材の
// ハードラップ（Git 可読性のための手動折り返し）がそのまま改行として出てしまう。
// 送信前に「段落・箇条書き項目・引用の内部の折り返し改行」だけを連結する。
// 見出し・表・コードフェンス・水平線・HTML・画像単独行・箇条書きマーカーは構造として保持。
// 英数字で単語が分断された箇所のみ半角スペースを入れ、日本語同士は詰める。
function normalizeForBacklog(md) {
  const lines = md.split('\n')
  const out = []
  let inFence = false
  let buf = null
  let bufType = null
  const needSpace = (a, b) => /[A-Za-z0-9]$/.test(a) && /^[A-Za-z0-9]/.test(b)
  const join = (a, b) => a + (needSpace(a, b) ? ' ' : '') + b
  // 段落・引用は句点「。」ごとに1文=1行へ分割（文の途中では切らない）。
  // Backlog は単一改行を <br> にするため、これで密になりすぎず読みやすいリズムになる。
  // 太字(**)やコード(`)を分断しないよう、記号が奇数個で閉じていない断片は次の文と結合する
  const balanced = (s) => (s.match(/\*\*/g) || []).length % 2 === 0 && (s.match(/`/g) || []).length % 2 === 0
  const splitSentences = (t) => {
    const raw = t.match(/[^。]*。[」』）】〕》”’"']*|[^。]+$/g) || [t]
    const res = []
    for (const p of raw) {
      if (res.length && !balanced(res[res.length - 1])) res[res.length - 1] += p
      else res.push(p)
    }
    return res
  }
  const flush = () => {
    if (buf === null) return
    if (bufType === 'prose') for (const s of splitSentences(buf)) out.push(s)
    else if (bufType === 'quote') for (const s of splitSentences(buf.replace(/^>\s?/, ''))) out.push('> ' + s)
    else out.push(buf)
    buf = null; bufType = null
  }

  const isBlank = (l) => /^\s*$/.test(l)
  const isFence = (l) => /^\s*(```|~~~)/.test(l)
  const isHeading = (l) => /^#{1,6}\s/.test(l)
  const isHr = (l) => /^\s*([-*_])\s*(\1\s*){2,}$/.test(l)
  const isTable = (l) => /^\s*\|/.test(l)
  const isList = (l) => /^\s*(?:[-*+]|\d+[.)])\s+/.test(l)
  // 選択肢行（a. / A) / ア. / ① …）も各行を独立させる（連結しない）
  const isChoice = (l) => /^\s*(?:[A-Za-zＡ-Ｚａ-ｚア-ン][.)．）]|[①-⑳])[ 　]/.test(l)
  // W1. / Q10. / S2. / 問3. などの番号付きラベル行も独立させる（解答の連結防止）
  const isLabel = (l) => /^\s*(?:[A-Za-zＡ-Ｚ]{1,3}\d{1,3}|問\d{1,3}|設問\d{1,3})[.)．）:：][ 　]?/.test(l)
  const isQuote = (l) => /^\s*>/.test(l)
  const isHtml = (l) => /^\s*<\/?[a-zA-Z]/.test(l)
  const isImageOnly = (l) => /^\s*!\[[^\]]*\][([][^)\]]*[)\]]\s*$/.test(l)

  for (const line of lines) {
    if (isFence(line)) { flush(); out.push(line); inFence = !inFence; continue }
    if (inFence) { out.push(line); continue }
    if (isBlank(line)) { flush(); out.push(line); continue }
    if (isHeading(line) || isHr(line) || isTable(line) || isHtml(line) || isImageOnly(line)) {
      flush(); out.push(line); continue
    }
    if (isList(line) || isChoice(line) || isLabel(line)) { flush(); buf = line.replace(/\s+$/, ''); bufType = 'list'; continue }
    if (isQuote(line)) {
      const content = line.replace(/^\s*>\s?/, '')
      if (content === '') { flush(); out.push(line); continue }
      if (bufType === 'quote') buf = join(buf, content)
      else { flush(); buf = '> ' + content; bufType = 'quote' }
      continue
    }
    const text = line.trim()
    if (bufType === 'prose' || bufType === 'list' || bufType === 'quote') buf = join(buf, text)
    else { buf = text; bufType = 'prose' }
  }
  flush()
  return out.join('\n')
}

async function collectPages() {
  const pages = []

  // ガイダンス系
  for (const g of GUIDANCE_FILES) {
    try {
      const content = await readFile(g.file, 'utf8')
      pages.push({ name: g.page, content: normalizeForBacklog(content), images: [] })
    } catch {
      console.warn(`スキップ（読めません）: ${g.file}`)
    }
  }

  // materials/weekN/dayNN-{lecture,lab,quiz}.md（week0 は pNN-{lecture,work,quiz}.md）
  const weeks = (await readdir(MATERIALS_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && /^week\d$/.test(e.name))
    .map((e) => e.name)
    .sort()

  for (const week of weeks) {
    const files = (await readdir(join(MATERIALS_DIR, week))).filter((f) => f.endsWith('.md')).sort()
    for (const f of files) {
      // 本編は dayNN-{lecture,lab,quiz}、Week0 は pN-{lecture,work,quiz}
      const dm = f.match(/^day(\d{2})-(lecture|lab|quiz)\.md$/)
      const pm = f.match(/^p(\d{1,2})-(lecture|work|quiz)\.md$/)
      const m = dm || pm
      if (!m) continue
      const kind = m[2]
      const itemPrefix = dm ? `Day${m[1]}` : `P${Number(m[1])}`
      if (kind === 'quiz' && !INCLUDE_QUIZ) continue
      const mdDir = join(MATERIALS_DIR, week)
      const raw = await readFile(join(mdDir, f), 'utf8')
      const images = extractImages(raw, mdDir)
      const weekLabel = week.replace('week', 'Week')
      pages.push({
        name: `CCNA研修/${KIND_FOLDER[kind]}/${weekLabel}/${itemPrefix} ${KIND_LABEL[kind]}`,
        content: normalizeForBacklog(rewriteImageRefs(raw, images)),
        images,
      })
    }
  }
  return pages
}

async function main() {
  const pages = await collectPages()
  console.log(`投入対象: ${pages.length} ページ${INCLUDE_QUIZ ? '（小テスト原本を含む — 受講者に Wiki 閲覧権限がないことを確認してください）' : '（小テストは除外。--include-quiz で含められます）'}`)

  if (DRY_RUN) {
    for (const p of pages) console.log(`[dry-run] ${p.name} (${p.content.length} 文字${p.images.length ? `・画像 ${p.images.length} 点` : ''})`)
    return
  }

  const project = await api('GET', `/projects/${PROJECT_KEY}`)
  const existing = await api('GET', '/wikis', { projectIdOrKey: PROJECT_KEY })
  const byName = new Map(existing.map((w) => [w.name, w.id]))

  let created = 0
  let updated = 0
  let attachedTotal = 0
  for (const p of pages) {
    let wikiId
    if (byName.has(p.name)) {
      wikiId = byName.get(p.name)
      await api('PATCH', `/wikis/${wikiId}`, { name: p.name, content: p.content, mailNotify: 'false' })
      updated++
      console.log(`更新: ${p.name}`)
    } else {
      const wiki = await api('POST', '/wikis', { projectId: project.id, name: p.name, content: p.content, mailNotify: 'false' })
      wikiId = wiki.id
      created++
      console.log(`作成: ${p.name}`)
    }
    const attached = await attachImagesToWiki(wikiId, p.images)
    if (attached) {
      attachedTotal += attached
      console.log(`  画像を添付: ${attached} 点`)
    }
  }
  console.log(`\n完了: 作成 ${created} / 更新 ${updated} / 画像添付 ${attachedTotal}`)
  console.log('次の手順: Backlog の「Wiki → ドキュメント移行機能」で各ページをドキュメントへ変換し、フォルダと権限（講師用は受講者非公開）を整えてください。')
  if (attachedTotal) console.log('注意: 画像のインライン表示はスペースの書式設定に依存します。表示されない場合は upload-wiki.mjs の imageRef テンプレートを調整してください。')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
