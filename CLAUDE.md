# CLAUDE.md

このリポジトリで作業する AI アシスタント向けのガイドです。

## 概要

**ccna-training** は、CCNA 200-301 v1.1 に準拠した社内研修プログラムの一式です。
Nulab **Backlog** 上で運用する前提で、設計ドキュメント・教材・運用スクリプトを
管理します。ローリング型（受講者が随時入学し、CCNA 合格をもって卒業）で運用します。

もともと `oshiyamad-blip/mood-cinema` リポジトリの `ccna-training/` フォルダで
開発され、2026-07 にこの専用リポジトリへ切り出されました（それ以前の履歴は
mood-cinema の `claude/ccna-training-feasibility-hsopen` ブランチにあります）。

## 構成

| パス | 内容 |
|---|---|
| `00`〜`07-*.md` | 設計ドキュメント（実現可能性調査 / カリキュラム / Backlog構成 / PTマニュアル / ガイダンス / 講師ガイド / ローリング運用 / 試験対策フェーズ） |
| `PROJECT-BACKLOG.md` | **開発側の課題管理台帳**。作業のたびに状態を更新してコミットする |
| `materials/` | 教材本体。`weekN/dayNN-{lecture,lab,quiz}.md`（Day 1〜20 × 3種）+ `day00-setup.md` + `templates/` |
| `samples/` | Day 1 のフォーマット基準（教材執筆時はこれに合わせる） |
| `scripts/` | Backlog API / Claude API の運用スクリプト（Node 18+）。`ai-grade.mjs` のみ `scripts/` で `npm install` が必要 |

## 慣習と注意点

- **言語は日本語**（教材・ドキュメント・コミットメッセージとも）。文体は「です・ます」調
- **教材は完全オリジナル執筆**。既存教材・書籍・Web記事の転載は著作権上不可
- 教材フォーマットの正は `samples/day01-*.md` と `materials/README.md` の執筆仕様
- **quiz ファイルには解答・解説が含まれる**。Backlog へ投入する際は受講者に
  見えない場所（04_講師用）で管理する。`upload-wiki.mjs` は既定で quiz を除外する
- カリキュラム内容を変更したら `01-curriculum.md` と
  `scripts/curriculum-data.mjs` の**両方**を更新する（二重管理）
- スクリプトは依存なしの素の Node（`ai-grade.mjs` のみ `@anthropic-ai/sdk`）。
  変更後は `node --check` と `--dry-run` で検証する
- テストランナー・リンターはなし
- **制作ワークフローの AI モデル配分は固定しない**。タスクに応じて選択する
  （目安: 技術的正確さの検証・難しい設計 = 高能力モデル、教材の量産執筆 = 中位、
  形式チェック・機械的作業 = 軽量モデル + 低 effort）。実行中・再開予定の
  ワークフローはキャッシュ保全のためモデル指定を変更しないこと

## Backlog 運用の前提

- 運用モデル A: 共有「CCNA-教材」プロジェクト + 受講者ごとの「CCNA-氏名」プロジェクト
- 入学のたびに `scripts/create-backlog-issues.mjs --project <KEY> --start <日付>` を実行
  （Day00 環境構築 + Day1〜20 + 試験対策フェーズ Day21〜25 = 69課題を投入）
- 講師は兼務 2 名（当番制）。採点は `grade-quiz.mjs`（選択式）/ `ai-grade.mjs`（AI一次採点）
