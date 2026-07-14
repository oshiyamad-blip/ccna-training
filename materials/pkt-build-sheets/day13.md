# day13 .pktビルドシート

- **対象ラボ**: `materials/week3/day13-lab.md`（OSPF トラブルシューティングと HSRP による
  デフォルトゲートウェイ冗長化）
- **作り込みレベル**: **C（前提設定済み）** — `pkt-build-spec.md` の day13 行の指定どおり、
  「OSPF障害切り分け+HSRP。**意図的なミス入りのOSPF設定を投入済み**（手順書の障害
  シナリオどおり）。切り分けとHSRPが本題」とする。具体的には、ラボ手順1（機器配置・
  配線・インターフェース IP・PC IP）と手順2（OSPF プロセス起動。ここに 4 つの障害が
  仕込まれている）までを投入済みにし、**手順3〜15（4 障害の切り分け・修正、疎通確認、
  デフォルトルート配布、HSRP 設定、フェイルオーバー確認）はすべて受講者に残す**。
- **保存ファイル名**: `day13_start.pkt`

> `materials/images/day13-topology.svg` は本セッションの時点で存在しなかったため、
> 結線の確認は `day13-lab.md` の「完成トポロジ」節の IP アドレス表（本文 33〜44 行目）
> のみを正として行った。作業時に画像が用意されている場合は、結線前に必ず突き合わせて
> 確認すること。

---

## 0. このラボ特有の設計判断（重要）

Day13 は「意図的なミス入りの OSPF 設定」がラボの出発点そのものである。したがって
`day13_start.pkt` は、他の日のような「本題部分だけ空にする」のではなく、
**ラボ手順書の手順2に書かれているコマンドをそのままの順序・そのままの誤りで投入した
状態**を再現する。ビルド担当者が「親切心で」誤りを直してしまうとラボが成立しなくなる
ため、以下の 4 つの障害を**意図的に、そのまま**投入する。

| # | 障害内容 | 仕込み箇所 | ラボ手順書での検出手順 |
|---|---|---|---|
| 1 | Hello interval 不一致（`ip ospf hello-interval 5`） | R1 の Gi0/1 | 手順3 |
| 2 | `network` 文の漏れ（`10.0.23.0/30` が未投入） | R2 の `router ospf 10` | 手順4 |
| 3 | `passive-interface` の誤設定（バックボーン側まで誤ってパッシブ化） | R3 の Gi0/1 | 手順5 |
| 4 | IP MTU 不一致（`ip mtu 1400`） | R1 の Gi0/1 | 手順6（Packet Tracer では再現しないことがある旨、手順書に注記あり） |

この 4 つは下記「4. 貼り付け用コンフィグ」の中に `!` コメント行（IOS が無視する
コメント区切り行。そのまま CLI に貼っても実害はない）として明示している。

HSRP（手順10〜15）は「後半・応用部分」としてレベル C の対象外とし、開始ファイルには
一切投入しない。PC1・PC2 のデフォルトゲートウェイは HSRP 仮想 IP（`192.168.10.1`）を
先に設定しておく（手順1で指定されている値であり、HSRP 自体が未設定でも PC 側の設定
としては正しい。HSRP 未設定のため、この時点では PC1↔PC3 は疎通しない）。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| ルータ | Cisco 2911 | 3 | R1, R2, R3 |
| スイッチ（L2） | Cisco 2960 | 2 | SW1, SW2 |
| PC | 汎用 PC（PC-PT） | 3 | PC1, PC2, PC3 |

- 2911 はオンボードで `GigabitEthernet0/0`〜`0/2` の 3 ポートを持つため、R3 が
  Gi0/0・Gi0/1・Gi0/2 の 3 つを使うラボ手順書のコマンドとそのまま一致する。追加の
  HWIC モジュールは不要（R1・R2 は Gi0/0・Gi0/1 の 2 ポートのみ使用）。
- ラボ手順書冒頭「手順1」の機器指定（Router 2911 × 3、Switch 2960 × 2、PC × 3）と
  一致させている。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 GigabitEthernet0/0 | ストレート | SW1 FastEthernet0/1 |
| R2 GigabitEthernet0/0 | ストレート | SW1 FastEthernet0/2 |
| PC1 FastEthernet0 | ストレート | SW1 FastEthernet0/3 |
| PC2 FastEthernet0 | ストレート | SW1 FastEthernet0/4 |
| R1 GigabitEthernet0/1 | ストレート | R3 GigabitEthernet0/0 |
| R2 GigabitEthernet0/1 | ストレート | R3 GigabitEthernet0/1 |
| R3 GigabitEthernet0/2 | ストレート | SW2 FastEthernet0/1 |
| PC3 FastEthernet0 | ストレート | SW2 FastEthernet0/2 |

- IP アドレス表（`day13-lab.md` 33〜44 行目）の「接続先」列と 1 対 1 で一致させている。
- ルータ〜ルータ間（R1-R3、R2-R3）もギガビットポート同士だが、Packet Tracer 9.x の
  自動 MDI-X によりストレートケーブルで結線できる。「自動選択（Automatically Choose
  Connection Type）」でも同じ結線になるが、赤リンクになった場合は上表のとおり明示的に
  ストレートを選び直すこと。
- SW1 の Fa0/5〜Fa0/24、SW2 の Fa0/3〜Fa0/24 は未使用のまま空けておく。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.10.10 | 255.255.255.0 | 192.168.10.1 | DNS 設定不要。GW は HSRP 仮想 IP（未設定のため現時点では応答なし） |
| PC2 | 192.168.10.11 | 255.255.255.0 | 192.168.10.1 | 同上 |
| PC3 | 192.168.30.10 | 255.255.255.0 | 192.168.30.1 | GW は R3 Gi0/2 の物理 IP（HSRP 対象外） |

- Desktop > IP Configuration で Static を選択し、上記の IP / マスク / デフォルト
  ゲートウェイまで入力済みにする（レベル C は手順1相当まで済ませる指定のため）。
- この時点（OSPF 未修復・HSRP 未設定）では、PC1↔PC2 は SW1 経由の同一セグメント内
  なので ping が通るが、PC1↔PC3・PC2↔PC3 は OSPF 経路がまだ無いため失敗する。これは
  ラボ手順1の6「この時点では PC1↔PC3 の疎通はまだ確認しません」と整合する正しい状態。

## 4. 貼り付け用コンフィグ（事前設定）

以下を各ルータの CLI にそのまま貼り付ける（`enable` → `configure terminal` から開始する
前提。プロンプトが `Router>` の状態から `enable` を入力すること）。**ラボ手順書の手順1
（IP アドレス設定）と手順2（OSPF 起動。障害入り）の内容をそのまま投入したものであり、
障害を先回りして直してはいけない。**

### R1（障害1・障害4を含む）

```
enable
configure terminal
hostname R1
interface gigabitethernet0/0
 ip address 192.168.10.2 255.255.255.0
 no shutdown
 exit
interface gigabitethernet0/1
 ip address 10.0.13.1 255.255.255.252
 no shutdown
 exit
router ospf 10
 network 192.168.10.0 0.0.0.255 area 0
 network 10.0.13.0 0.0.0.3 area 0
 passive-interface gigabitethernet0/0
 exit
interface gigabitethernet0/1
! === 障害1: Hello interval を既定の10秒から5秒に変更（R3側は既定のまま→不一致） ===
 ip ospf hello-interval 5
! === 障害4: IP MTUを既定の1500から1400に変更（R3側は既定のまま→不一致） ===
 ip mtu 1400
 exit
end
copy running-config startup-config
```

### R2（障害2を含む）

```
enable
configure terminal
hostname R2
interface gigabitethernet0/0
 ip address 192.168.10.3 255.255.255.0
 no shutdown
 exit
interface gigabitethernet0/1
 ip address 10.0.23.1 255.255.255.252
 no shutdown
 exit
router ospf 10
 network 192.168.10.0 0.0.0.255 area 0
! === 障害2: 10.0.23.0/30（R2-R3間リンク）向けのnetwork文を意図的に投入しない ===
 passive-interface gigabitethernet0/0
 exit
end
copy running-config startup-config
```

- `network 10.0.23.0 0.0.0.3 area 0` の行は**入力しない**こと（これが障害2そのもの）。
  誤って投入しないよう、他日のビルドシートと違いこの行はコメントとしてのみ記載している。

### R3（障害3を含む）

```
enable
configure terminal
hostname R3
interface gigabitethernet0/0
 ip address 10.0.13.2 255.255.255.252
 no shutdown
 exit
interface gigabitethernet0/1
 ip address 10.0.23.2 255.255.255.252
 no shutdown
 exit
interface gigabitethernet0/2
 ip address 192.168.30.1 255.255.255.0
 no shutdown
 exit
router ospf 10
 network 10.0.13.0 0.0.0.3 area 0
 network 10.0.23.0 0.0.0.3 area 0
 network 192.168.30.0 0.0.0.255 area 0
 passive-interface gigabitethernet0/2
! === 障害3: 本来パッシブにすべきでないバックボーン側(R2向け)まで誤ってパッシブ化 ===
 passive-interface gigabitethernet0/1
 exit
end
copy running-config startup-config
```

### SW1・SW2

**事前設定なし（機器は初期状態）。**

このラボはスイッチが OSPF や VLAN に関与しないため、ホスト名すら設定しない工場出荷
状態（`Switch>`）のまま保存する。ポートはすべて既定（VLAN1・access）で、単純な L2
中継として機能する。

### PC1〜PC3

IOS 設定は存在しない（PC のため）。IP 設定は「3. PC/サーバ設定」のとおり投入済み。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

ラボ手順書の手順3〜15をすべて完了させた最終状態。4 つの障害はすべて修正済み（該当
コマンドは `no ip ospf hello-interval` などで既定値に戻すため、最終 `running-config`
には該当行自体が残らない点に注意）。R3 にデフォルトルート配布、R1・R2 に HSRP を設定し、
手順15の復旧（R1 の Gi0/0 を `no shutdown` してプリエンプトで Active を奪還した後）の
状態で保存する。

### R1（最終状態）

```
enable
configure terminal
hostname R1
interface gigabitethernet0/0
 ip address 192.168.10.2 255.255.255.0
 standby version 2
 standby 1 ip 192.168.10.1
 standby 1 priority 110
 standby 1 preempt
 no shutdown
 exit
interface gigabitethernet0/1
 ip address 10.0.13.1 255.255.255.252
 no shutdown
 exit
router ospf 10
 network 192.168.10.0 0.0.0.255 area 0
 network 10.0.13.0 0.0.0.3 area 0
 passive-interface gigabitethernet0/0
 exit
end
copy running-config startup-config
```

- 障害1（`ip ospf hello-interval 5`）・障害4（`ip mtu 1400`）は手順3・手順6で
  `no ip ospf hello-interval` / `no ip mtu` により既定値へ戻し済みのため、Gi0/1 の
  設定に上記2行は現れない。

### R2（最終状態）

```
enable
configure terminal
hostname R2
interface gigabitethernet0/0
 ip address 192.168.10.3 255.255.255.0
 standby version 2
 standby 1 ip 192.168.10.1
 no shutdown
 exit
interface gigabitethernet0/1
 ip address 10.0.23.1 255.255.255.252
 no shutdown
 exit
router ospf 10
 network 192.168.10.0 0.0.0.255 area 0
 network 10.0.23.0 0.0.0.3 area 0
 passive-interface gigabitethernet0/0
 exit
end
copy running-config startup-config
```

- 障害2は手順4で `network 10.0.23.0 0.0.0.3 area 0` を追加して解消済み。

### R3（最終状態）

```
enable
configure terminal
hostname R3
interface gigabitethernet0/0
 ip address 10.0.13.2 255.255.255.252
 no shutdown
 exit
interface gigabitethernet0/1
 ip address 10.0.23.2 255.255.255.252
 no shutdown
 exit
interface gigabitethernet0/2
 ip address 192.168.30.1 255.255.255.0
 no shutdown
 exit
ip route 0.0.0.0 0.0.0.0 Null0
router ospf 10
 network 10.0.13.0 0.0.0.3 area 0
 network 10.0.23.0 0.0.0.3 area 0
 network 192.168.30.0 0.0.0.255 area 0
 passive-interface gigabitethernet0/2
 default-information originate
 exit
end
copy running-config startup-config
```

- 障害3は手順5で `no passive-interface gigabitethernet0/1` により解消済み。
- 手順8のデフォルトルート配布（`ip route 0.0.0.0 0.0.0.0 Null0` +
  `default-information originate`）を追加している。

### SW1・SW2（最終状態）

変更なし（初期状態のまま）。VLAN・トランクともにこのラボの学習対象外。

### PC1〜PC3

IP 設定は「3. PC/サーバ設定」のまま変更なし。

### 完成状態の確認例

- `R1# show ip ospf neighbor` / `R2# show ip ospf neighbor` / `R3# show ip ospf neighbor`
  … R1-R3 間・R2-R3 間ともに State が **FULL**。
- `R1# show ip route` に `O*E2  0.0.0.0/0 [110/1] via 10.0.13.2` が表示される。
- `R1# show standby brief` … R1 = **Active**、R2 = **Standby**（`R2# show standby brief`
  で確認）。仮想 IP `192.168.10.1` と仮想 MAC が表示される。
- PC1 の Command Prompt から `ping 192.168.30.10`（PC3）が成功する。
- R1 の Gi0/0 を `shutdown` すると R2 が数秒以内に Active へ遷移し（`R2# show standby`）、
  連続 ping が数回失敗した後に再開する。`no shutdown` で R1 に戻すとプリエンプトにより
  R1 が Active を奪還する。

## 6. 組み立て後チェック

- [ ] R1-SW1、R2-SW1、PC1/PC2-SW1、R1-R3、R2-R3、R3-SW2、PC3-SW2 の全リンクが緑
      （STP 収束済み）
- [ ] 各ルータの `show ip interface brief` で、結線したインターフェースがすべて
      `up/up` であること（ホスト名・IP は 4. の投入内容と一致）
- [ ] `R1# show ip ospf neighbor` … R1-R3 間のネイバーが**一切表示されない**
      （障害1: Hello interval 不一致によりネイバーが Init にすら進まない）
- [ ] `R2# show ip protocols` … Passive Interface に `GigabitEthernet0/0` のみが
      表示され、`Routing for Networks` に `192.168.10.0` のみが表示される
      （障害2: `10.0.23.0/30` の `network` 文が未投入であることを確認）
- [ ] `R3# show ip protocols` … Passive Interface に `GigabitEthernet0/1` と
      `GigabitEthernet0/2` の両方が表示される（障害3: 本来パッシブにすべきでない
      `GigabitEthernet0/1` まで誤ってパッシブ化されていることを確認）
- [ ] `R1# show ip interface GigabitEthernet0/1 | include MTU` … `1400 bytes`
      と表示される（障害4。ラボ手順書の注記どおり、Packet Tracer のバージョンに
      よっては MTU 不一致でも `show ip ospf neighbor` が FULL になる場合があるが、
      それ自体は異常ではない）
- [ ] R1・R2・R3 とも HSRP（`standby`）関連の設定は一切投入されていない
      （`show standby brief` が何も表示しない）
- [ ] SW1・SW2 はホスト名未設定（`Switch>` のまま）
- [ ] PC1↔PC2（同一セグメント、SW1 内のみ）の ping は**成功**する
- [ ] PC1↔PC3・PC2↔PC3 の ping は**失敗**する（OSPF 未修復のため経路がない） ＝
      レベル C の狙いどおり、手順3〜9（障害切り分け・疎通確認）が本題として
      残っていること
- [ ] `day13_start.pkt` として保存し、再度開いて配線・IP・OSPF の障害入り設定が
      保持されていることを確認
