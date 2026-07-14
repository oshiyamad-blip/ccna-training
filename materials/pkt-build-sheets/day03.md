# day03 .pktビルドシート

- **対象ラボ**: `materials/week1/day03-lab.md`（VLSM によるアドレス設計とルーティング）
- **作り込みレベル**: **B（配線済み・IP未）** — `pkt-build-spec.md` の日別指示どおり。理由: VLSM 設計自体が本日の学習対象なので、機器配置＋ケーブルのみ済ませ、ルータの IOS 設定・PC の IP 設定はいずれも受講者が行う
- **保存ファイル名**: `day03_start.pkt`
- **参照した図**: `materials/images/day03-topology.svg`（本文の結線・IP・機器と完全一致を確認済み）

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名（Device Name） |
|---|---|---|---|
| ルータ | **2911**（オンボードで GigabitEthernet0/0〜0/2 の 3 ポートを持つため、R1 の Gi0/0・Gi0/1・Gi0/2 という 3 インターフェース利用に追加モジュール不要） | 2 | R1, R2 |
| スイッチ | **2960** | 2 | SW1, SW2 |
| PC | PC-PT（汎用 PC） | 4 | PC1, PC2, PC3, PC4 |

> ラボ手順書「手順2」の指定どおり 2911×2・2960×2・PC×4。R2 は Gi0/0 の 1 ポートしか使わないが、機種はラボ指定に合わせて R1 と同じ 2911 にする。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 / GigabitEthernet0/0 | ストレートケーブル | SW1 / FastEthernet0/1 |
| R1 / GigabitEthernet0/1 | ストレートケーブル | SW2 / FastEthernet0/1 |
| R1 / GigabitEthernet0/2 | ストレートケーブル（Auto-MDIX によりクロス代用可） | R2 / GigabitEthernet0/0 |
| SW1 / FastEthernet0/2 | ストレートケーブル | PC1 / FastEthernet0 |
| SW1 / FastEthernet0/3 | ストレートケーブル | PC2 / FastEthernet0 |
| SW2 / FastEthernet0/2 | ストレートケーブル | PC3 / FastEthernet0 |
| SW2 / FastEthernet0/3 | ストレートケーブル | PC4 / FastEthernet0 |

- 全 7 本すべて「自動選択（Automatically Choose Connection Type）」で可。R1-R2 間（ルータ同士の直結）は本来クロスケーブルが必要な組み合わせだが、Gigabit インタフェースの **Auto-MDIX** によりストレートでもリンクアップする（ラボ手順書の注記どおり）。赤くなる場合のみ明示的にケーブル種別を選び直す。
- 配線直後の見え方（初期状態のまま保存するのが正しい状態）:
  - SW1-PC1、SW1-PC2、SW2-PC3、SW2-PC4 の 4 本 → スイッチ側は起動後 STP 収束ですぐ**緑**になる
  - R1-SW1、R1-SW2、R1-R2 の 3 本 → **ルータの GigabitEthernet インターフェースは工場出荷時 `shutdown` のため、初期状態では赤（down）のまま**でよい。これはラボ手順書「手順2」の最後で明示されている想定どおりの状態であり、受講者が「手順4」で `no shutdown` するまで直さない（先に緑にしてしまうと本題を代わりにやってしまうことになるので注意）。

## 3. PC/サーバ設定

**このラボは作り込みレベル B のため、開始ファイル（`day03_start.pkt`）では PC1〜PC4 の IP はすべて未設定のまま（Desktop > IP Configuration が空欄の初期状態）で保存すること。** 下表は受講者が最終的に入力する値（＝ VLSM 設計結果）の参照であり、講師用の完成見本（`day03_answer.pkt`、後述）にはこの値を入力する。

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.100.2 | 255.255.255.192（/26） | 192.168.100.1 | DNS 未使用 |
| PC2 | 192.168.100.3 | 255.255.255.192（/26） | 192.168.100.1 | DNS 未使用 |
| PC3 | 192.168.100.66 | 255.255.255.224（/27） | 192.168.100.65 | DNS 未使用 |
| PC4 | 192.168.100.67 | 255.255.255.224（/27） | 192.168.100.65 | DNS 未使用 |

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

- R1 / R2: ホスト名すら未設定の工場出荷状態のまま配置・保存する（`enable` すら入力しない。IOS には一切コマンドを投入しない）。
- SW1 / SW2: 初期状態のまま（本ラボはスイッチの IOS 設定を一切行わない）。
- PC1〜PC4: 上記のとおり IP アドレスも未設定のまま保存する。

これはレベル B の定義（機器配置＋全ケーブルのみ）どおりであり、VLSM 設計・ルータの IP 設定・PC の IP 設定そのものが本日の学習対象であるため。

## 5. 完成コンフィグ（`day03_answer.pkt` 用・講師用）

このラボを完成させた状態の全機器設定。採点・質問対応の見本として、別ファイル `day03_answer.pkt` に投入しておく。

### R1

```
enable
configure terminal
hostname R1
interface gigabitEthernet0/0
 ip address 192.168.100.1 255.255.255.192
 no shutdown
 exit
interface gigabitEthernet0/1
 ip address 192.168.100.65 255.255.255.224
 no shutdown
 exit
interface gigabitEthernet0/2
 ip address 192.168.100.97 255.255.255.252
 no shutdown
 exit
end
copy running-config startup-config
```

R1 は部署A・部署B・WANリンクの3ネットワークすべてに直結しているため、スタティックルートは不要（直結ネットワークは自動的にルーティングテーブルへ登録される）。

### R2

```
enable
configure terminal
hostname R2
interface gigabitEthernet0/0
 ip address 192.168.100.98 255.255.255.252
 no shutdown
 exit
ip route 0.0.0.0 0.0.0.0 192.168.100.97
end
copy running-config startup-config
```

### SW1 / SW2

```
! コンフィグ投入なし。工場出荷時の初期状態のまま。
! (本ラボはスイッチのIOS設定を範囲に含まない)
```

### PC1〜PC4（Desktop > IP Configuration）

| デバイス | IP Address | Subnet Mask | Default Gateway |
|---|---|---|---|
| PC1 | 192.168.100.2 | 255.255.255.192 | 192.168.100.1 |
| PC2 | 192.168.100.3 | 255.255.255.192 | 192.168.100.1 |
| PC3 | 192.168.100.66 | 255.255.255.224 | 192.168.100.65 |
| PC4 | 192.168.100.67 | 255.255.255.224 | 192.168.100.65 |

### 確認用コマンド（講師が動作確認する際の参考、ラボ手順書「手順7」相当）

R1 の CLI で:

```
show ip interface brief
show ip route
```

PC1 の Command Prompt で:

```
ipconfig
ping 192.168.100.3
ping 192.168.100.66
ping 192.168.100.98
```

- `show ip interface brief` で Gi0/0・Gi0/1・Gi0/2 すべて `up`/`up` になっていること
- `show ip route` に `C`（Connected）と `L`（Local, /32）が /26・/27・/30 の3経路とも登録されていること
- PC1 → PC2（同一部署内 /26）、PC1 → PC3（部署間、R1 経由）、PC1 → R2 の Gi0/0（WAN 越し End-to-End）の 3 種類の ping がすべて成功すること

## 6. 組み立て後チェック

- [ ] R1(Gi0/0)-SW1(Fa0/1)、R1(Gi0/1)-SW2(Fa0/1)、R1(Gi0/2)-R2(Gi0/0)、SW1(Fa0/2)-PC1、SW1(Fa0/3)-PC2、SW2(Fa0/2)-PC3、SW2(Fa0/3)-PC4 の計7本の結線が図（`day03-topology.svg`）と完全一致
- [ ] PC-スイッチ間の4本のリンクは**緑**
- [ ] R1-SW1、R1-SW2、R1-R2 の3本は、ルータのインターフェースが未設定（`shutdown`）のため**赤のままでよい**（`no shutdown` していないのに緑になっている場合は、誤って設定を投入してしまっているので R1/R2 を初期状態に戻す）
- [ ] `day03_start.pkt` を開いた際、R1・R2 とも `hostname` すら未設定（プロンプトが `Router>`）であることを確認
- [ ] `day03_start.pkt` の PC1〜PC4 は IP Configuration が全て空欄（レベル B どおり、本題＝VLSM設計・IP設定が未実施のまま残っている）
- [ ] SW1・SW2 は初期状態（VLANやホスト名の設定なし）
- [ ] 講師用 `day03_answer.pkt` を別途作成し、上記「5. 完成コンフィグ」を全機器へ投入した状態で、PC1→PC2（部署内）・PC1→PC3（部署間）・PC1→R2 Gi0/0（WAN越し）の3種のpingが全て成功することを確認
- [ ] `day03_answer.pkt` で `show ip interface brief`（R1）が Gi0/0・Gi0/1・Gi0/2 とも `up`/`up` であることを確認
- [ ] `.pkt` として保存後、一度閉じて再度開き、配線・状態（未設定/設定済み）が保たれていることを確認
- [ ] ファイル名が `day03_start.pkt`（開始用）/ `day03_answer.pkt`（完成見本）になっている
