# day08 .pktビルドシート

- **対象ラボ**: `materials/week2/day08-lab.md`（VLAN 間ルーティング — Router-on-a-Stick と L3 スイッチ + SVI）
- **作り込みレベル**: **C（前提設定済み）** — `pkt-build-spec.md` の指定どおり、
  「VLAN・アクセスポート・PC IP 済み。Router-on-a-Stick / SVI が本題」とする。
  具体的には SW1 の VLAN 作成とアクセスポート割り当て（手順1）、および全 PC の
  IP/マスク/デフォルトゲートウェイ（手順4 前半分）を投入済みにし、**トランク設定
  （手順2）・ルータのサブインターフェース設定（手順3）・Part2 の MLS 一式（手順5〜8）は
  すべて受講者に残す**。
- **保存ファイル名**: `day08_start.pkt`

> 参考画像: `materials/images/day08-topology.svg`（Part1/Part2 双方の完成トポロジ）を
> 結線の確認に使用した。本シートの機器・ポート・IP は `day08-lab.md` の
> IP アドレス表および手順1・2・3・5・6 の記述と完全一致させている。

---

## 0. このラボ特有の設計判断（重要）

Day8 は 1 本のラボの中でトポロジが **Part1（R1 + SW1 2960）→ Part2（R1 は放置、
SW1 を削除して MLS 3560 に置き換え）** と物理的に変化する。そのため `day08_start.pkt`
に含めるのは **Part1 の初期トポロジのみ**であり、MLS（3560）は配置しない。

- MLS の配置・SW1 の削除・PC の再結線（手順5 手順1〜2）自体が GUI 操作の練習として
  ラボ手順に明記されているため、ここを先回りして作り込むとその練習機会を奪ってしまう。
- Part2 側で行う VLAN 作成・アクセスポート割り当て（手順5 手順3）は、SW1 が消えて
  MLS に置き換わる以上、開始ファイルにあらかじめ入れておくことが構造的にできない
  （入れる先の機器がまだ存在しない）。そのため Part2 側の VLAN/アクセスポートは
  Part1 と同様の設定を受講者がもう一度入力することになるが、これはラボ設計上
  避けられない仕様であり、ビルドシートの不備ではない。
- 結果として「VLAN・アクセスポート・PC IP 済み」というレベル C の指定は、
  **開始時点で存在する SW1 と全 PC** に対して適用する。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| ルータ（Part1 用） | Cisco 2911 | 1 | R1 |
| スイッチ（Part1 用・L2） | Cisco 2960 | 1 | SW1 |
| PC | 汎用 PC（PC-PT） | 4 | PC1, PC2, PC3, PC4 |

- R1 は `GigabitEthernet0/0` を `.10`／`.20` のサブインターフェースに分割するため
  2911（Gi0/0 を持つモデル）を使用する。手順書のコマンドも `gigabitethernet0/0.10`
  と一致する。
- **Multilayer Switch 3560（MLS）は開始ファイルに配置しない**（上記「0.」参照。
  手順5 で受講者自身が配置する）。
- Router 2911 のスロットにモジュールを追加する必要はない（オンボードの Gi0/0 のみ使用）。

## 2. 結線表

Part1（開始ファイルの状態）のみを結線する。

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 GigabitEthernet0/0 | ストレート | SW1 FastEthernet0/24 |
| PC1 FastEthernet0 | ストレート | SW1 FastEthernet0/1 |
| PC2 FastEthernet0 | ストレート | SW1 FastEthernet0/2 |
| PC3 FastEthernet0 | ストレート | SW1 FastEthernet0/3 |
| PC4 FastEthernet0 | ストレート | SW1 FastEthernet0/4 |

- 手順書の指定どおり全リンクは**ストレートケーブル**。Packet Tracer の
  「自動選択（Automatically Choose Connection Type）」でも同じ結線になるが、
  赤リンクになった場合は上表のとおり明示的にストレートを選び直すこと。
- SW1 の Fa0/5〜Fa0/23 は未使用のまま空けておく（手順8 の発展課題でも別ポート
  `Fa0/23` を使うのは Part2 の MLS 側であり、SW1 側には触れない）。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.10.11 | 255.255.255.0 | 192.168.10.1 | DNS 設定不要 |
| PC2 | 192.168.10.12 | 255.255.255.0 | 192.168.10.1 | DNS 設定不要 |
| PC3 | 192.168.20.11 | 255.255.255.0 | 192.168.20.1 | DNS 設定不要 |
| PC4 | 192.168.20.12 | 255.255.255.0 | 192.168.20.1 | DNS 設定不要 |

- Desktop > IP Configuration で Static を選択し、上記の IP / マスク / デフォルト
  ゲートウェイまで入力済みにする（レベル C は PC IP 済みが指定のため、Day1/Day3 の
  ように空欄で残す必要はない）。
- デフォルトゲートウェイの値は Part1（R1 のサブインターフェース）・Part2（MLS の
  SVI）のどちらでも同一 IP（192.168.10.1 / 192.168.20.1）になるため、Part2 移行後も
  PC 側の設定変更は不要（ラボ手順6の5でも明記されている）。

## 4. 貼り付け用コンフィグ（事前設定）

### R1

**事前設定なし（機器は初期状態）。**

ホスト名すら設定しない工場出荷状態（`Router>`）で保存する。`GigabitEthernet0/0` も
`no shutdown` していない administratively down のままにすること。物理インターフェースの
有効化（`no shutdown`）とサブインターフェース作成は手順3（本日の本題）で受講者が行う。

### SW1

VLAN 作成とアクセスポート割り当て（手順1相当）のみを投入済みにする。以下を
そのまま SW1 の CLI に貼り付ける（`enable` → `configure terminal` から開始する前提）。
**トランク化（`switchport mode trunk`）は含めない**（手順2として受講者に残す）。

```
enable
configure terminal
vlan 10
 name SALES
 exit
vlan 20
 name DEV
 exit
interface range fastethernet0/1-2
 switchport mode access
 switchport access vlan 10
 exit
interface range fastethernet0/3-4
 switchport mode access
 switchport access vlan 20
 exit
end
copy running-config startup-config
```

- ホスト名は設定しない（プロンプトは `Switch>` のまま残る点は day06/day07 の
  ビルドシートと同様）。
- 保存前に `show vlan brief` で Fa0/1-2 が VLAN10、Fa0/3-4 が VLAN20 に入っており、
  `show interfaces trunk` には**何も表示されない**（Fa0/24 がまだトランクでない）
  ことを確認すること。

### PC1〜PC4

IOS 設定は存在しない（PC のため）。IP 設定は「3. PC/サーバ設定」のとおり投入済み。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

ラボ手順書の手順9にあるとおり、最終提出物は **Part1・Part2 両方の完成状態を
含む 1 つの `.pkt`** になる（Part2 移行時に SW1 は削除されるため、最終ファイルに
残るのは R1（Part1 の設定を保持したまま未接続で放置）＋ MLS（Part2 の設定）＋ PC1〜4）。
講師用の完成見本はこの流れを 2 段階で示す。

### 5-1. Part1 完了時点（MLS 移行前・記録用）

#### R1（Part1 完了状態）

```
enable
configure terminal
hostname R1
interface gigabitethernet0/0
 no shutdown
 exit
interface gigabitethernet0/0.10
 encapsulation dot1q 10
 ip address 192.168.10.1 255.255.255.0
 exit
interface gigabitethernet0/0.20
 encapsulation dot1q 20
 ip address 192.168.20.1 255.255.255.0
 exit
end
copy running-config startup-config
```

#### SW1（Part1 完了状態）

```
enable
configure terminal
hostname SW1
vlan 10
 name SALES
 exit
vlan 20
 name DEV
 exit
interface range fastethernet0/1-2
 switchport mode access
 switchport access vlan 10
 exit
interface range fastethernet0/3-4
 switchport mode access
 switchport access vlan 20
 exit
interface fastethernet0/24
 switchport mode trunk
 exit
end
copy running-config startup-config
```

- 確認: `show ip route`（R1）に `192.168.10.0/24`・`192.168.20.0/24` が `C` で表示、
  `show vlan brief`／`show interfaces trunk`（SW1）が手順2の期待どおりであること。
- PC1 の Command Prompt: `ping 192.168.10.12` 成功、`ping 192.168.20.11` 成功、
  `tracert 192.168.20.11` の 1 ホップ目が `192.168.10.1`。

### 5-2. 最終提出状態（Part2 完了後 = `day08_answer.pkt`）

SW1 は削除済み。R1 は上記 Part1 の設定を保持したまま、ケーブルが外れて
未接続の状態で放置する（`no shutdown` はしてあるが `line protocol` は down になる）。
PC1〜4 は MLS の `Fa0/1`〜`Fa0/4` に、Part1 と同じ割り当てで接続し直す。

#### MLS（Part2 完了状態。手順8 の発展課題を含む）

```
enable
configure terminal
hostname MLS
vlan 10
 name SALES
 exit
vlan 20
 name DEV
 exit
interface range fastethernet0/1-2
 switchport mode access
 switchport access vlan 10
 exit
interface range fastethernet0/3-4
 switchport mode access
 switchport access vlan 20
 exit
ip routing
interface vlan 10
 ip address 192.168.10.1 255.255.255.0
 no shutdown
 exit
interface vlan 20
 ip address 192.168.20.1 255.255.255.0
 no shutdown
 exit
interface fastethernet0/23
 no switchport
 ip address 192.168.99.1 255.255.255.252
 no shutdown
 exit
end
copy running-config startup-config
```

- 手順8（発展）はオプション課題のため、`_answer.pkt` には含めるが `day08_start.pkt`
  には一切関係しない（手順書上も「発展」として区別されている）。
- 確認: `show ip interface brief`（MLS）で `Vlan10`／`Vlan20`／`FastEthernet0/23`
  すべて `up/up`。`show ip route` に `192.168.10.0/24`・`192.168.20.0/24` が `C`。
- 手順7 の検証（`no ip routing` → PC1→PC3 ping 失敗・PC1→PC2 ping 成功 →
  `ip routing` 再有効化）は**確認後に必ず戻すこと**。`_answer.pkt` の最終状態は
  `ip routing` が有効になっていなければならない。
- PC1 の Command Prompt: `ping 192.168.20.11` 成功（MLS 経由）。

#### PC1〜PC4

IP 設定は「3. PC/サーバ設定」のまま変更なし。物理的な接続先のみ SW1 → MLS の
同一ポート番号（Fa0/1〜Fa0/4）に付け替わる。

## 6. 組み立て後チェック

- [ ] R1-SW1、PC1〜PC4-SW1 の全リンクが緑（STP 収束済み）
- [ ] SW1 で `show vlan brief` を実行し、Fa0/1-2 が VLAN10（SALES）、Fa0/3-4 が
      VLAN20（DEV）に割り当て済みであることを確認
- [ ] SW1 で `show interfaces trunk` を実行し、**何も表示されない**（Fa0/24 が
      まだトランク化されていない）ことを確認 ＝手順2が本題として残っていること
- [ ] R1 はホスト名未設定（`Router>` のまま）、`show ip interface brief` で
      `GigabitEthernet0/0` が `administratively down/down` のままであることを確認
      ＝手順3（サブインターフェース設定）が本題として残っていること
- [ ] PC1〜PC4 の Desktop > IP Configuration に、3. の表のとおり IP・マスク・
      デフォルトゲートウェイが入力済み
- [ ] この時点で PC1 → PC2（同一 VLAN10、SW1 内のみで疎通）の ping は**成功**する
      一方、PC1 → PC3（別 VLAN、ルーティング未設定）の ping は**失敗**する
      （`Request timed out.` または `Destination host unreachable.`）— レベル C の
      狙いどおり、ルーティング未設定のため異 VLAN 間だけが失敗する状態が正しい
- [ ] MLS（3560）は配置されていない（手順5 で受講者自身が配置・結線する）
- [ ] `day08_start.pkt` として保存し、再度開いて配線・SW1 の VLAN/アクセスポート・
      PC の IP が保持されていることを確認
