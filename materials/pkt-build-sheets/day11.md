# day11 .pktビルドシート

- **対象ラボ**: `materials/week3/day11-lab.md`（静的ルートとフローティングスタティックの構成 —
  R1-R2-R3 直列トポロジ、IPv4/IPv6 静的ルート・デフォルトルート・フローティングスタティック）
- **作り込みレベル**: **A（配線済み・IP済み）** — `pkt-build-spec.md` の day11 行の指定どおり、
  「ルータ3台+PC配線済み・各インターフェースIP済み・PC IP済み。ルーティング設定は空
  （静的ルート投入が本題）」とする。汎用の A 定義（ルータ/スイッチは未設定＝ホスト名すら
  未設定の初期状態）ではなく、この day11 個別指定を優先する。具体的には、ラボ手順書の
  **手順1（トポロジ作成・ホスト名・インターフェース IPv4/IPv6・`ipv6 unicast-routing`）と
  手順2（PC の IP 設定）までを投入済み**にし、**手順4以降（IPv4/IPv6 静的ルート、
  デフォルトルート、フローティングスタティック）はすべて受講者が入力する**空の状態で
  保存する。
- **保存ファイル名**: `day11_start.pkt`

> 参考画像: `materials/images/day11-topology.svg` を確認済み。結線（PC1-R1 Gi0/0、
> R1 Gi0/1-R2 Gi0/0、R2 Gi0/1-R3 Gi0/0、R3 Gi0/1-PC3、R1 Gi0/2-R3 Gi0/2 の直結）・
> インターフェース名・IP・主経路/バックアップ経路の区別は、いずれも本シートおよび
> `day11-lab.md` の IP アドレス表・手順1と完全一致している。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| ルータ | Cisco 2911 | 3 | R1, R2, R3 |
| PC | 汎用 PC（PC-PT） | 2 | PC1, PC3 |

- 2911 はオンボードで `GigabitEthernet0/0`〜`0/2` の 3 ポートを持ち、ラボ手順書の
  コマンド（R1・R3 は Gi0/0〜Gi0/2 の3ポート、R2 は Gi0/0〜Gi0/1 の2ポートを使用）と
  インターフェース名がそのまま一致する。追加の HWIC モジュールは不要。
- ラボ手順書冒頭の「使用機器」欄の指定（Router 2911 × 3、PC × 2）と一致させている。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| PC1 FastEthernet0 | ストレート | R1 GigabitEthernet0/0 |
| R1 GigabitEthernet0/1 | ストレート | R2 GigabitEthernet0/0 |
| R2 GigabitEthernet0/1 | ストレート | R3 GigabitEthernet0/0 |
| R3 GigabitEthernet0/1 | ストレート | PC3 FastEthernet0 |
| R1 GigabitEthernet0/2 | ストレート | R3 GigabitEthernet0/2 |

- ラボ手順書 手順1-4 の指定どおり、**全リンクがストレートケーブル**（GigabitEthernet
  ポートは auto-mdix のためルータ同士でもストレートで結線可能）。Packet Tracer の
  「自動選択（Automatically Choose Connection Type）」でも同じ結線になるが、赤リンクに
  なった場合は上表のとおり手動でストレートを選び直すこと。
- 5 本目の R1 Gi0/2 ⇔ R3 Gi0/2 は**主経路として使う直結リンク**（R1-R2-R3 側の
  Gi0/1 系統がバックアップ）。取り違えないよう配線後に `show cdp neighbors` や
  結線図で必ず確認する。
- 全リンクが緑になるまで待ってから次に進む。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.1.10 | 255.255.255.0 | 192.168.1.1 | IPv6: 2001:db8:1::10/64（プレフィックス長64）、IPv6 GW: 2001:db8:1::1 |
| PC3 | 192.168.3.10 | 255.255.255.0 | 192.168.3.1 | IPv6: 2001:db8:3::10/64（プレフィックス長64）、IPv6 GW: 2001:db8:3::1 |

- Desktop > IP Configuration で Static を選択し、IPv4（Address / Subnet Mask /
  Default Gateway）と IPv6（Address / Prefix Length / Default Gateway）の両方を
  入力済みにする（レベル A の指定どおり PC 側は投入済み）。
- DNS 欄は空欄のままでよい（ラボで DNS は使用しない）。

## 4. 貼り付け用コンフィグ（事前設定）

ラボ手順書の**手順1（ホスト名・インターフェース IPv4/IPv6・`ipv6 unicast-routing`）**
までを投入済みにする。`enable` → `configure terminal` から開始する前提で、以下を
そのまま各ルータの CLI に貼り付ける。**`ip route` / `ipv6 route`（手順4以降の静的
ルート・デフォルトルート・フローティングスタティック）は一切含めない**——これが
day11 の本題であり、受講者が入力する部分として空のまま残す。

### R1

```
enable
configure terminal
hostname R1
interface gigabitEthernet 0/0
 ip address 192.168.1.1 255.255.255.0
 ipv6 address 2001:db8:1::1/64
 no shutdown
 exit
interface gigabitEthernet 0/1
 ip address 10.0.12.1 255.255.255.252
 ipv6 address 2001:db8:12::1/64
 no shutdown
 exit
interface gigabitEthernet 0/2
 ip address 10.0.13.1 255.255.255.252
 ipv6 address 2001:db8:13::1/64
 no shutdown
 exit
ipv6 unicast-routing
end
copy running-config startup-config
```

### R2

```
enable
configure terminal
hostname R2
interface gigabitEthernet 0/0
 ip address 10.0.12.2 255.255.255.252
 ipv6 address 2001:db8:12::2/64
 no shutdown
 exit
interface gigabitEthernet 0/1
 ip address 10.0.23.1 255.255.255.252
 ipv6 address 2001:db8:23::1/64
 no shutdown
 exit
ipv6 unicast-routing
end
copy running-config startup-config
```

### R3

```
enable
configure terminal
hostname R3
interface gigabitEthernet 0/0
 ip address 10.0.23.2 255.255.255.252
 ipv6 address 2001:db8:23::2/64
 no shutdown
 exit
interface gigabitEthernet 0/1
 ip address 192.168.3.1 255.255.255.0
 ipv6 address 2001:db8:3::1/64
 no shutdown
 exit
interface gigabitEthernet 0/2
 ip address 10.0.13.2 255.255.255.252
 ipv6 address 2001:db8:13::2/64
 no shutdown
 exit
ipv6 unicast-routing
end
copy running-config startup-config
```

### PC1・PC3

IOS 設定は存在しない（PC のため）。IP 設定は「3. PC/サーバ設定」のとおり投入済み。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボの手順1〜13をすべて実施し、`copy running-config startup-config` まで
完了させた**最終状態**（手順11の障害シミュレーションは手順12で `no shutdown` 済み、
R1-R3 直結の Gi0/2 は `up`/`up` に復旧している）のコンフィグを示す（採点・質問対応の
見本）。手順7 の R3 デフォルトルートは、観察レポート設問3（ロンゲストマッチの確認）で
引き続き参照するため最終状態にも残す。

### R1（最終状態）

```
enable
configure terminal
hostname R1
interface gigabitEthernet 0/0
 ip address 192.168.1.1 255.255.255.0
 ipv6 address 2001:db8:1::1/64
 no shutdown
 exit
interface gigabitEthernet 0/1
 ip address 10.0.12.1 255.255.255.252
 ipv6 address 2001:db8:12::1/64
 no shutdown
 exit
interface gigabitEthernet 0/2
 ip address 10.0.13.1 255.255.255.252
 ipv6 address 2001:db8:13::1/64
 no shutdown
 exit
ipv6 unicast-routing
ip route 192.168.3.0 255.255.255.0 10.0.13.2
ip route 192.168.3.0 255.255.255.0 10.0.12.2 5
ipv6 route 2001:db8:3::/64 2001:db8:13::2
ipv6 route 2001:db8:3::/64 2001:db8:12::2 5
end
copy running-config startup-config
```

### R2（最終状態）

```
enable
configure terminal
hostname R2
interface gigabitEthernet 0/0
 ip address 10.0.12.2 255.255.255.252
 ipv6 address 2001:db8:12::2/64
 no shutdown
 exit
interface gigabitEthernet 0/1
 ip address 10.0.23.1 255.255.255.252
 ipv6 address 2001:db8:23::1/64
 no shutdown
 exit
ipv6 unicast-routing
ip route 192.168.1.0 255.255.255.0 10.0.12.1
ip route 192.168.3.0 255.255.255.0 10.0.23.2
ipv6 route 2001:db8:1::/64 2001:db8:12::1
ipv6 route 2001:db8:3::/64 2001:db8:23::2
end
copy running-config startup-config
```

### R3（最終状態）

```
enable
configure terminal
hostname R3
interface gigabitEthernet 0/0
 ip address 10.0.23.2 255.255.255.252
 ipv6 address 2001:db8:23::2/64
 no shutdown
 exit
interface gigabitEthernet 0/1
 ip address 192.168.3.1 255.255.255.0
 ipv6 address 2001:db8:3::1/64
 no shutdown
 exit
interface gigabitEthernet 0/2
 ip address 10.0.13.2 255.255.255.252
 ipv6 address 2001:db8:13::2/64
 no shutdown
 exit
ipv6 unicast-routing
ip route 192.168.1.0 255.255.255.0 10.0.13.1
ip route 192.168.1.0 255.255.255.0 10.0.23.1 5
ip route 0.0.0.0 0.0.0.0 10.0.23.1
ipv6 route 2001:db8:1::/64 2001:db8:13::1
ipv6 route 2001:db8:1::/64 2001:db8:23::1 5
end
copy running-config startup-config
```

### PC1・PC3

IP 設定は「3. PC/サーバ設定」のまま変更なし。

- 完成状態での疎通確認の想定結果:
  - PC1 (192.168.1.10) → PC3 (192.168.3.10)：`ping`／`ping 2001:db8:3::10` とも成功
  - `tracert 192.168.3.10`（PC1）：`R1 Gi0/0 → R1 Gi0/2 → R3 Gi0/2`（R1-R3 直結の
    主経路のみ、R2 は経由しない）の順にホップ
  - R1 の `show ip route 192.168.3.0`：主経路（via 10.0.13.2、AD/メトリック `[1/0]`）
    のみ表示され、フローティング側（via 10.0.12.2、AD=5）は非表示
  - R1 の Gi0/2 を `shutdown` すると `show ip route 192.168.3.0` の表示先が
    via 10.0.12.2（フローティング側、`[5/0]`）に切り替わり、`no shutdown` で
    復旧すると via 10.0.13.2 に戻る
  - R3 の `show ip route`：`S* 0.0.0.0/0 [1/0] via 10.0.23.1` が
    `Gateway of last resort` として表示されつつ、`192.168.1.0/24` は
    ロンゲストマッチにより具体的な静的ルート（via 10.0.13.1）で転送される

## 6. 組み立て後チェック

- [ ] PC1-R1、R1-R2、R2-R3、R3-PC3、R1-R3（直結）の全リンクが緑
- [ ] R1・R2・R3 とも `hostname` が投入済み（プロンプトが `R1#`/`R2#`/`R3#`）で、
      `show ip interface brief` と `show ipv6 interface brief` を実行すると、
      IP アドレス表どおりの IPv4/IPv6 アドレスが設定され全インターフェースが
      `up`/`up` であることを確認
- [ ] 各ルータで `ipv6 unicast-routing` が有効（`show running-config | include ipv6 unicast-routing`
      が1行返る）ことを確認
- [ ] レベル A の指定どおり、`show ip route static` / `show ipv6 route static` が
      いずれも**何も表示しない**（静的ルート・デフォルトルート・フローティング
      スタティックが未投入）＝手順4以降が本題として残っていること
- [ ] PC1 の Command Prompt から `ping 192.168.1.1`（R1 Gi0/0、同一セグメント）は
      成功し、`ping 192.168.3.10`（PC3、未到達）は失敗する（`Request timed out.`）
      ことを確認 ＝手順3で受講者が観察する「隣接ネットワークのみ疎通」の状態が
      保たれていること
- [ ] PC1・PC3 の Desktop > IP Configuration に、3. の表のとおり IPv4/IPv6 の
      IP・マスク（プレフィックス長）・デフォルトゲートウェイが入力済み
- [ ] `day11_start.pkt` として保存し、再度開いて配線・ホスト名・インターフェース
      IP・PC の IP が保持され、静的ルート類は未投入のままであることを確認
