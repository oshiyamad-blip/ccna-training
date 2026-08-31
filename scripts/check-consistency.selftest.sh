#!/usr/bin/env bash
#
# check-consistency.mjs の自己テスト。
#
# 「検査が通った」ことに意味があるのは、その検査が本当に落とせるときだけ。
# ここではリポジトリをわざと壊して、check-consistency.mjs が気づくかを確かめる。
# 壊した内容は毎回 git checkout で戻すため、**未コミットの変更がある状態では
# 実行しないこと**（消えます）。
#
#   bash scripts/check-consistency.selftest.sh
#
set -u
cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "未コミットの変更があります。この自己テストは git checkout で作業ツリーを"
  echo "戻すため、先にコミットまたは stash してください。"
  exit 1
fi

pass=0; fail=0
try() {  # try "壊し方の名前" "壊すコマンド" "検出されたら現れるはずの文字列"
  eval "$2"
  if node scripts/check-consistency.mjs 2>&1 | grep -q "$3"; then
    echo "  ✓ 検出できた: $1"; pass=$((pass+1))
  else
    echo "  ✗ 見逃した!!  : $1"; fail=$((fail+1))
  fi
  git checkout -- . 2>/dev/null
}

echo "== わざと壊して、検査が気づくか確かめる =="
try "LESSON 区切りマーカーの書き換え（今回の実際の事故）" \
  "sed -i 's|Exercise 5 / 10 / 15 は、それぞれ|Exercise 2 / 10 / 15 は、それぞれ|' 04-guidance.md" \
  "区切り"
try "課題名のゼロ埋め落ち" \
  "sed -i 's|\[Exercise01\] ラボ|[Exercise1] ラボ|' materials/lesson1/exercise01-lecture.md" \
  "ゼロ埋め"
try "想起クイズの出典ずれ" \
  "sed -i '0,/分散学習: Exercise 8/s//分散学習: Exercise 15/' materials/lesson2/exercise09-lecture.md" \
  "出典"
try "未習 Exercise を既習扱い" \
  "printf '\nExercise 18 で学んだとおり。\n' >> materials/lesson1/exercise01-lecture.md" \
  "既習扱い"
try "図版の番号不一致" \
  "sed -i 's|exercise01-topology.png|exercise09-topology.png|' materials/lesson1/exercise01-lab.md" \
  "図版を参照"
try "参照切れリンク" \
  "sed -i 's|(../images/exercise06-topology.png)|(../images/nonexistent.png)|' materials/lesson2/exercise06-lab.md" \
  "nonexistent"
try "まとめテストの位置ずれ" \
  "sed -i '1s|# Exercise 5 小テスト（LESSON1 まとめテスト）|# Exercise 5 小テスト|' materials/lesson1/exercise05-quiz.md" \
  "まとめテストになっていない"
try "設問の欠落" \
  "sed -i '0,/^\*\*Q3\./s|^\*\*Q3\.|**QX.|' materials/lesson1/exercise01-quiz.md" \
  "問（期待"
try "DAYS の並びの崩れ" \
  "sed -i '0,/day: 7, week: 2/s//day: 77, week: 2/' scripts/curriculum-data.mjs" \
  "day が 77"
try "配置先の LESSON 表記ずれ" \
  "sed -i '3s|01_教材 > LESSON1|01_教材 > LESSON4|' materials/lesson1/exercise01-lecture.md" \
  "配置先が LESSON4"
try "ビルドシートの対象ラボが別の lesson を指す" \
  "sed -i '3s|materials/lesson1/exercise05-lab.md|materials/lesson3/exercise05-lab.md|' materials/pkt-build-sheets/exercise05.md" \
  "対象ラボが"
try "ビルドシートが存在しない手順を参照" \
  "sed -i '0,/手順4以降/s//手順40以降/' materials/pkt-build-sheets/exercise05.md" \
  "がラボにない"
try "機種にないポートをビルドシートが指定" \
  "sed -i '0,/Gi0\/2/s//Gi0\/7/' materials/pkt-build-sheets/exercise05.md" \
  "は実在しない"
try "講義の本文が丸ごと消える（今回の実際の事故）" \
  "python3 -c \"import re,pathlib;p=pathlib.Path('materials/lesson3/exercise11-lecture.md');s=p.read_text();i=s.index('## 1.');j=s.index('## 確認問題');p.write_text(s[:i]+s[j:])\"" \
  "本文の章が"
try "手順書のチェックリストから開始ファイルが抜ける" \
  "sed -i '/- \\[ \\] Exercise17 — start/d' materials/pkt-build-guide.md" \
  "start 一覧が"
try "開始ファイルなしのラボから配置手順が消える" \
  "sed -i 's|^## 手順 1: トポロジの作成（15 分）|## 手順 1: （削除）|; s|^1. Packet Tracer を起動し、新規ファイルを開く||' materials/lesson3/exercise13-lab.md && sed -i '/配置/d;/ケーブル/d;/結線/d;/稲妻/d' materials/lesson3/exercise13-lab.md" \
  "の手順がない"
try "3桁インターフェース名の解説が消える" \
  "sed -i 's|^### インターフェース名の桁数が機種によって違う|### （削除された見出し）|' materials/lesson4/exercise17-lecture.md" \
  "の解説がない"
try "LESSON フォルダ名の接尾辞ゆれ" \
  "sed -i '0,/📁 LESSON1$/s//📁 LESSON1_ネットワーク基礎/' 02-backlog-design.md" \
  "接尾辞なし"
try "小テストが受講者向け投入に混入" \
  "sed -i \"s|if (kind === 'quiz' \&\& !INCLUDE_QUIZ) continue||\" scripts/upload-wiki.mjs" \
  "投入に含まれている"

echo ""
echo "自己テスト: 検出 $pass 件 / 見逃し $fail 件"
git status --short | head
