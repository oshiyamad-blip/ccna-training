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
| `materials/` | 教材本体。`lessonN/exerciseNN-{lecture,lab,quiz}.md`（Exercise 1〜20 × 3種）+ LESSON0 の `lesson0/pN-{lecture,work,quiz}.md` + `exercise00-setup.md` + `templates/` |
| `samples/` | Exercise 1 のフォーマット基準（教材執筆時はこれに合わせる） |
| `scripts/` | Backlog API / Claude API の運用スクリプト（Node 18+）。`ai-grade.mjs` のみ `scripts/` で `npm install` が必要 |

## 慣習と注意点

- **言語は日本語**（教材・ドキュメント・コミットメッセージとも）。文体は「です・ます」調
- **教材は完全オリジナル執筆**。既存教材・書籍・Web記事の転載は著作権上不可
- 教材フォーマットの正は `samples/exercise01-*.md` と `materials/README.md` の執筆仕様
- **quiz ファイルには解答・解説が含まれる**。Backlog へ投入する際は受講者に
  見えない場所（04_講師用）で管理する。`upload-wiki.mjs` は既定で quiz を除外する
- カリキュラム内容を変更したら `01-curriculum.md` と
  `scripts/curriculum-data.mjs` の**両方**を更新する（二重管理）
- 継続率・合格率の運用施策は `10-retention-and-pass-rate.md` が単一の真実源。
  施策に対応する Backlog 課題は `scripts/curriculum-data.mjs` の `OPS_ISSUES`
  （種別「運営」）／`EXAM_PHASE_ISSUES`（B1・B5）で、変更時は両方を同期する
- スクリプトは依存なしの素の Node（`ai-grade.mjs` のみ `@anthropic-ai/sdk`）。
  変更後は `node --check` と `--dry-run` で検証する
- **教材・カリキュラムを触ったら `node scripts/check-consistency.mjs` を通す**。
  Exercise の並べ替え・追加・削除や、番号の一括置換のあとは必須。
  作業の最後にまとめてではなく、**各ステップの直後に**通すこと（どの操作が
  壊したかが分かる）。落ちたまま先に進まない。検査自体を疑うときは
  `bash scripts/check-consistency.selftest.sh`（わざと壊して検出を確認する。
  未コミットの変更があると止まる）
  - とくに `Exercise 5 / 10 / 15 / 20` は**中身ではなく位置**（LESSON の区切り）を
    指す。番号の一括置換ではここと `[ExerciseNN]` のゼロ埋めが真っ先に壊れる。
    `reports/` と `PROJECT-BACKLOG.md` は当時の事実を残す文書なので置換対象外
- テストランナー・リンターはなし（整合性チェックが実質のゲート）
- 受講者は IT リテラシーゼロが前提。本編 Exercise1〜20 の前に LESSON0「ITベーシック」
  プレコース（materials/lesson0/）がある。ペルソナは `08-personas.md` が正
  - 執筆トーンは materials/README.md の規定に従う: **成人学習者として扱う**
    （ひらがな緩和表記や子ども向けの言い回し禁止）、たとえ話は厳選、
    絵文字乱用・励まし連発などの過剰表現禁止
  （中心は完全未経験者。実務出口は SES 客先常駐の保守・運用で、
  「実務では」コラムはこの現場を軸に書く）
- **制作ワークフローの AI モデル配分は固定しない**。タスクに応じて選択する
  （目安: 技術的正確さの検証・難しい設計 = 高能力モデル、教材の量産執筆 = 中位、
  形式チェック・機械的作業 = 軽量モデル + 低 effort）。実行中・再開予定の
  ワークフローはキャッシュ保全のためモデル指定を変更しないこと

## Backlog 運用の前提

- 運用モデル A: 共有「CCNA-教材」プロジェクト + 受講者ごとの「CCNA-氏名」プロジェクト
- 入学のたびに `scripts/create-backlog-issues.mjs --project <KEY> --start <日付>` を実行
  （LESSON0 プレコース 15 + 本編 Exercise1〜20 の 60 + 試験対策フェーズ Exercise21〜25 の 10
  = 計 85 課題を投入。さらに既定では継続率・合格率の運営課題 7 件が加わり **計 92 課題**
  （`--skip-ops` で運営課題を省略可）。`--skip-precourse` 指定時は LESSON0 を除き
  Exercise00 環境構築を追加して 71 課題／運営課題込みで 78 課題）
- 講師は兼務 2 名（当番制）。採点は `grade-quiz.mjs`（選択式）/ `ai-grade.mjs`（AI一次採点）
- **自習型モデル**: 一斉講義は行わない。受講者は `01_教材`（Exercise 別テキスト）を自分で読んで
  学び、講師は提出物・質問のレビュー（確認・フィードバック・採点・進捗フォロー）を担う。
  「講義」は教材ドキュメント／その読解課題の名称であり、講師が話す時間ではない。教材や
  ガイダンスの文言を編集する際はこの前提（自習＋レビュー）を崩さないこと
