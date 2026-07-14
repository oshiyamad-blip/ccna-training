# day04 .pktビルドシート

- **対象ラボ**: `materials/week1/day04-lab.md`（IPv6 アドレッシング — 静的設定と SLAAC の構成）
- **作り込みレベル**: **A（配線済み・IP済み）** — ただし `pkt-build-spec.md` の day04 特記事項により調整あり:
  「IPv6設定が本題。PCのIPv4は不要、機器配置+配線済み」。
  本ラボは IPv4 を一切使わない IPv6 専用ラボであり、かつ **PC の IPv6 アドレス設定そのもの
  （静的入力・SLAAC への切り替え）がラボ手順書「手順3」の学習対象**なので、標準レベル A の
  「PC/サーバの IP・GW 設定済み」は適用しない。開始ファイルでは PC の IP（IPv4/IPv6 とも）は
  未設定のまま保存する。ルータ・スイッチも通常のレベル A どおり初期状態（未設定）。
- **保存ファイル名**: `day04_start.pkt`
- **参照した図**: `materials/images/day04-topology.svg`（本文の結線・IP・機器と完全一致を確認済み）

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名（Device Name） |
|---|---|---|---|
| ルータ | **2911**（オンボード GigabitEthernet0/0・0/1 の2ポートを利用。手順書のインターフェース名 `gigabitEthernet 0/0` / `0/1` と一致） | 1 | R1 |
| スイッチ | **2960** | 2 | SW1, SW2 |
| PC | PC-PT（汎用 PC） | 4 | PC1, PC2, PC3, PC4 |

> ラボ手順書「手順1」の指定どおり 2911×1・2960×2・PC×4。スイッチはデフォルト VLAN のアクセスポートのまま使用し、追加設定は一切行わない（ラボの範囲外）。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 / GigabitEthernet0/0 | ストレートケーブル | SW1 / FastEthernet0/1 |
| SW1 / FastEthernet0/2 | ストレートケーブル | PC1 / FastEthernet0 |
| SW1 / FastEthernet0/3 | ストレートケーブル | PC2 / FastEthernet0 |
| R1 / GigabitEthernet0/1 | ストレートケーブル | SW2 / FastEthernet0/1 |
| SW2 / FastEthernet0/2 | ストレートケーブル | PC3 / FastEthernet0 |
| SW2 / FastEthernet0/3 | ストレートケーブル | PC4 / FastEthernet0 |

- 全6本とも「自動選択（Automatically Choose Connection Type）」で可（すべて異種機器間のためストレートで自動判定される）。
- 配線直後の見え方（初期状態のまま保存するのが正しい状態）:
  - SW1-PC1、SW1-PC2、SW2-PC3、SW2-PC4 の4本 → スイッチ側は起動後 STP 収束ですぐ**緑**になる
  - R1-SW1、R1-SW2 の2本 → **ルータの GigabitEthernet インターフェースは工場出荷時 `shutdown` のため、初期状態では赤（down）のまま**でよい。ラボ手順書「手順2」で受講者が `no shutdown` するまで直さない（先に緑にすると本題を代わりにやってしまうことになるので注意）。

## 3. PC/サーバ設定

**このラボは day04 特記事項によりレベル A の PC IP 事前設定を適用しない。開始ファイル（`day04_start.pkt`）では PC1〜PC4 とも IP Configuration は初期状態（IPv4: DHCP のデフォルト表示のまま／IPv6: `Automatic` トグルはオフ、アドレス欄は空欄）で保存すること。** 下表は受講者がラボ手順書「手順3」で最終的に入力・確認する値の参照であり、講師用の完成見本（`day04_answer.pkt`、後述）にはこの値を反映する。

| デバイス | IPアドレス | サブネットマスク／プレフィックス長 | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 2001:DB8:0:1::10（静的入力） | 64 | 2001:DB8:0:1::1 | IPv6 設定を Static に切り替えてから入力。IPv4 は未使用 |
| PC2 | 2001:DB8:0:1::11（静的入力） | 64 | 2001:DB8:0:1::1 | IPv6 設定を Static に切り替えてから入力。IPv4 は未使用 |
| PC3 | 自動割当（SLAAC、`2001:DB8:0:2::/64` 内） | 64（自動） | R1 Gi0/1 のリンクローカルから自動学習 | IPv6 設定を Automatic に切り替えるのみ。値は入力しない |
| PC4 | 自動割当（SLAAC、`2001:DB8:0:2::/64` 内） | 64（自動） | R1 Gi0/1 のリンクローカルから自動学習 | IPv6 設定を Automatic に切り替えるのみ。値は入力しない |

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

- R1: ホスト名すら未設定の工場出荷状態のまま配置・保存する（`enable` すら入力しない。IOS には一切コマンドを投入しない）。プロンプトは `Router>` のまま。
- SW1 / SW2: 初期状態のまま（本ラボはスイッチの IOS 設定を一切行わない）。
- PC1〜PC4: 上記のとおり IPv4・IPv6 とも未設定のまま保存する。

これはレベル A の定義（機器配置＋全ケーブル済み、ルータ/スイッチは未設定）に、day04 特記事項（IPv6 アドレッシング自体が本日の学習対象のため PC の IP も未設定に残す）を重ねた状態。

## 5. 完成コンフィグ（`day04_answer.pkt` 用・講師用）

このラボを完成させた状態の全機器設定。採点・質問対応の見本として、別ファイル `day04_answer.pkt` に投入しておく。

### R1

```
enable
configure terminal
hostname R1
ipv6 unicast-routing
interface gigabitEthernet 0/0
 ipv6 address 2001:DB8:0:1::1/64
 no shutdown
 exit
interface gigabitEthernet 0/1
 ipv6 address 2001:DB8:0:2::/64 eui-64
 no shutdown
 exit
end
copy running-config startup-config
```

> Gi0/1 の実際の GUA（EUI-64 生成結果）は R1 の Gi0/1 の MAC アドレスに依存するため、Packet Tracer 上での実値は機体ごとに異なる（`2001:DB8:0:2:xxxx:xxff:fexx:xxxx` の形式になる）。`show ipv6 interface gi0/1` で確認できる値をそのまま `day04_answer.pkt` の動作確認記録に残しておくこと。

### SW1 / SW2

```
! コンフィグ投入なし。工場出荷時の初期状態のまま。
! (本ラボはスイッチのIOS設定を範囲に含まない。デフォルトVLANのアクセスポートのみ使用)
```

### PC1〜PC4（Desktop > IP Configuration）

| デバイス | IPv6 設定 | IPv6 Address | Prefix Length | IPv6 Default Gateway |
|---|---|---|---|---|
| PC1 | Static | 2001:DB8:0:1::10 | 64 | 2001:DB8:0:1::1 |
| PC2 | Static | 2001:DB8:0:1::11 | 64 | 2001:DB8:0:1::1 |
| PC3 | Automatic（SLAAC） | （自動取得。`ipconfig` で確認） | 64（自動） | （RA から自動学習） |
| PC4 | Automatic（SLAAC） | （自動取得。`ipconfig` で確認） | 64（自動） | （RA から自動学習） |

### 確認用コマンド（講師が動作確認する際の参考、ラボ手順書「手順4・5」相当）

R1 の CLI で:

```
show ipv6 interface brief
show ipv6 interface gi0/0
show ipv6 interface gi0/1
show ipv6 route
show ipv6 neighbors
```

PC1 の Command Prompt で:

```
ipconfig
ping 2001:DB8:0:1::11
ping 2001:DB8:0:2:xxxx:xxxx:xxxx:xxxx
```
（2番目の ping の宛先は PC3 の `ipconfig` で確認した実際の GUA に置き換える）

- `show ipv6 interface brief` で Gi0/0・Gi0/1 とも `up`/`up`、それぞれにリンクローカル（`fe80::`）と GUA の2つが表示されること
- `show ipv6 route` に静的セグメント（`2001:DB8:0:1::/64`）・SLAACセグメント（`2001:DB8:0:2::/64`）の両方について `C`（Connected）・`L`（Local）の経路が登録されていること
- PC3・PC4 の `ipconfig` 結果で、GUA のインターフェース ID 部分に `fffe` が含まれていること（EUI-64 生成の確認）
- PC1→PC2（同一セグメント）、PC1→PC3（セグメント間、R1 経由）の ping がいずれも成功すること
- ping 成功後、R1 の `show ipv6 neighbors` に PC1・PC2・PC3 等の IPv6-MAC 対応（NDP）が表示されること

## 6. 組み立て後チェック

- [ ] R1(Gi0/0)-SW1(Fa0/1)、SW1(Fa0/2)-PC1、SW1(Fa0/3)-PC2、R1(Gi0/1)-SW2(Fa0/1)、SW2(Fa0/2)-PC3、SW2(Fa0/3)-PC4 の計6本の結線が図（`day04-topology.svg`）と完全一致
- [ ] PC-スイッチ間の4本のリンクは**緑**
- [ ] R1-SW1、R1-SW2 の2本は、ルータのインターフェースが未設定（`shutdown`）のため**赤のままでよい**（`no shutdown` していないのに緑になっている場合は、誤って設定を投入してしまっているので R1 を初期状態に戻す）
- [ ] `day04_start.pkt` を開いた際、R1 は `hostname` すら未設定（プロンプトが `Router>`）であることを確認
- [ ] `day04_start.pkt` の PC1〜PC4 は IP Configuration が IPv4・IPv6 とも初期状態（未入力）のまま残っていることを確認（本題＝IPv6アドレッシングが未実施のまま残っている＝day04特記事項どおり）
- [ ] SW1・SW2 は初期状態（VLANやホスト名の設定なし）
- [ ] 講師用 `day04_answer.pkt` を別途作成し、上記「5. 完成コンフィグ」を全機器へ投入した状態で、PC1→PC2（静的セグメント内）・PC1→PC3（セグメント間、SLAAC 側の実 GUA 宛て）の2種の IPv6 ping がいずれも成功することを確認
- [ ] `day04_answer.pkt` で `show ipv6 interface brief`（R1）が Gi0/0・Gi0/1 とも `up`/`up` であり、両インターフェースにリンクローカルと GUA が表示されることを確認
- [ ] `day04_answer.pkt` で PC3・PC4 の SLAAC 取得アドレスのインターフェース ID に `fffe` が含まれることを確認
- [ ] `.pkt` として保存後、一度閉じて再度開き、配線・状態（未設定/設定済み）が保たれていることを確認
- [ ] ファイル名が `day04_start.pkt`（開始用）/ `day04_answer.pkt`（完成見本）になっている
