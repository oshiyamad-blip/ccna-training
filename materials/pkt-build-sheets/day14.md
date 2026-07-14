# day14 .pktビルドシート

- **対象ラボ**: `materials/week3/day14-lab.md`（静的 NAT・動的 NAT・PAT（NAT Overload）の
  構成と変換テーブルの観察 — PC1〜PC3（内部）→ SW1 → R1（NAT 変換ルータ）→ R2（ISP 役）
  → Srv1（外部 Web サーバ役）の直列トポロジ）
- **作り込みレベル**: **A（配線済み・IP済み）** — `pkt-build-spec.md` の day14 行の指定
  「内部/外部セグメント配線・IP済み（外部サーバは 198.51.100.8）。NAT設定が本題」のとおり。
  具体的には、ラボ手順書の**手順1（PC/Srv1 の IP、R1・R2 のインターフェース IP・
  `no shutdown`、R1 のデフォルトルート）までを投入済み**にし、**手順2以降（`ip nat inside`/
  `ip nat outside` の指定、ACL、静的 NAT、動的 NAT プール、PAT/Overload）はすべて
  未設定のまま**保存する。これがこのラボの本題（NAT 3 方式）そのものであるため。
- **保存ファイル名**: `day14_start.pkt`

> 参考画像: `materials/images/day14-topology.svg` を確認済み。結線
> （PC1/PC2/PC3 → SW1 Fa0/1〜Fa0/3、SW1 Fa0/24 → R1 Gi0/0、R1 Gi0/1 → R2 Gi0/1、
> R2 Gi0/0 → Srv1 FastEthernet0）・インターフェース名・IP・inside/outside の区別は、
> いずれも本シートおよび `day14-lab.md` の IP アドレス表・手順1・手順2と完全一致している。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| PC | 汎用 PC（PC-PT） | 3 | PC1, PC2, PC3 |
| L2 スイッチ | Cisco 2960 | 1 | SW1 |
| ルータ（NAT 変換ルータ） | Cisco 2911 | 1 | R1 |
| ルータ（ISP 役） | Cisco 2911 | 1 | R2 |
| サーバ（外部 Web サーバ役） | 汎用サーバ（Server-PT） | 1 | Srv1 |

- 2911 はオンボードで `GigabitEthernet0/0`・`0/1` を持ち、ラボ手順書のコマンド
  （R1 は Gi0/0 = inside・Gi0/1 = outside、R2 は Gi0/1 = R1 側 WAN・Gi0/0 = Srv1 側）と
  インターフェース名がそのまま一致する。追加の HWIC モジュールは不要。
- 2960 は Fa0/1〜Fa0/24 の標準構成で、PC3 台分（Fa0/1〜Fa0/3）と R1 への
  アップリンク（Fa0/24）を賄える。L2 スイッチ設定は不要（初期状態のまま）。
- Srv1 は Server-PT（`FastEthernet0` インターフェースを持つ標準構成）を使用。
  Desktop タブから IP を設定するのみで、Services タブの設定は本ラボでは不要。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| PC1 FastEthernet0 | ストレート | SW1 FastEthernet0/1 |
| PC2 FastEthernet0 | ストレート | SW1 FastEthernet0/2 |
| PC3 FastEthernet0 | ストレート | SW1 FastEthernet0/3 |
| SW1 FastEthernet0/24 | ストレート | R1 GigabitEthernet0/0 |
| R1 GigabitEthernet0/1 | ストレート | R2 GigabitEthernet0/1 |
| R2 GigabitEthernet0/0 | ストレート | Srv1 FastEthernet0 |

- 全リンクがストレートケーブルで結線可能（GigabitEthernet ポートは auto-mdix の
  ため、ルータ同士（R1 Gi0/1 ⇔ R2 Gi0/1）でもストレートで問題ない）。Packet Tracer の
  「自動選択（Automatically Choose Connection Type）」でも同じ結線になるが、赤リンクに
  なった場合は上表のとおり手動でストレートを選び直すこと。
- R1 の Gi0/0（SW1 側）が **inside**、Gi0/1（R2 側）が **outside** となる区間。
  結線自体には inside/outside の区別は影響しないが、手順2 で受講者が設定する際に
  取り違えないよう、配置図上でも Gi0/0=LAN 側・Gi0/1=WAN 側であることを確認しておく。
- 全リンクが緑になるまで待ってから次に進む。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.1.10 | 255.255.255.0 | 192.168.1.1 | — |
| PC2 | 192.168.1.11 | 255.255.255.0 | 192.168.1.1 | — |
| PC3 | 192.168.1.12 | 255.255.255.0 | 192.168.1.1 | — |
| Srv1 | 198.51.100.8 | 255.255.255.0 | 198.51.100.1 | DNS 欄は空欄でよい（本ラボで DNS は不使用） |

- Desktop > IP Configuration で Static を選択し、上表のとおり入力済みにする
  （レベル A の指定どおり PC/サーバ側は投入済み）。
- Srv1 は Web サーバとして稼働している必要はない（ping 到達性の確認のみに使用）。
  Services タブは初期状態のままでよい。

## 4. 貼り付け用コンフィグ（事前設定）

ラボ手順書の**手順1「基本構成」**（インターフェース IP・`no shutdown`・R1 の
デフォルトルート）までを投入済みにする。`enable` → `configure terminal` から
開始する前提で、以下をそのまま各ルータの CLI に貼り付ける。**`ip nat inside`/
`ip nat outside`（手順2）、ACL・NAT プール・静的 NAT・動的 NAT・PAT（手順3〜5）は
一切含めない**——これらが day14 の本題であり、受講者が入力する部分として空のまま
残す。

### R1

```
enable
configure terminal
hostname R1
interface gigabitEthernet 0/0
 ip address 192.168.1.1 255.255.255.0
 no shutdown
 exit
interface gigabitEthernet 0/1
 ip address 203.0.113.1 255.255.255.0
 no shutdown
 exit
ip route 0.0.0.0 0.0.0.0 203.0.113.2
end
copy running-config startup-config
```

### R2

```
enable
configure terminal
hostname R2
interface gigabitEthernet 0/1
 ip address 203.0.113.2 255.255.255.0
 no shutdown
 exit
interface gigabitEthernet 0/0
 ip address 198.51.100.1 255.255.255.0
 no shutdown
 exit
end
copy running-config startup-config
```

- R2 には追加のルーティング設定は不要（ラボ手順書 手順1-4 のとおり、
  `203.0.113.0/24` と `198.51.100.0/24` の両方に直接つながる connected ルートと
  Proxy ARP により、静的・動的 NAT のグローバルアドレスへの戻り経路も揃っている）。

### SW1

事前設定なし（機器は初期状態のまま。L2 スイッチとして VLAN1 のデフォルト動作で
そのまま使用する。ラボ手順書のとおり設定不要）。

### PC1・PC2・PC3・Srv1

IOS 設定は存在しない（PC/サーバのため）。IP 設定は「3. PC/サーバ設定」のとおり
投入済み。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボの手順1〜6をすべて実施した**最終状態**（手順3 の静的 NAT、手順4 の動的
NAT はいずれも該当ステップ内で `no ip nat inside source static ...` /
`no ip nat inside source list 1 pool DYN` により撤去済み。手順5 の PAT/Overload は
撤去されないため最終状態でも有効。手順6 の `clear ip nat translation *` /
`debug ip nat` / `undebug all` は running-config に影響しない一時コマンドのため
反映不要）のコンフィグを示す（採点・質問対応の見本）。

### R1（最終状態）

```
enable
configure terminal
hostname R1
interface gigabitEthernet 0/0
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
 no shutdown
 exit
interface gigabitEthernet 0/1
 ip address 203.0.113.1 255.255.255.0
 ip nat outside
 no shutdown
 exit
ip route 0.0.0.0 0.0.0.0 203.0.113.2
access-list 1 permit 192.168.1.0 0.0.0.255
ip nat pool DYN 203.0.113.20 203.0.113.21 netmask 255.255.255.0
ip nat inside source list 1 interface GigabitEthernet0/1 overload
end
copy running-config startup-config
```

- `ip nat pool DYN ...` は手順4で作成したプール定義自体（`ip nat pool` 文）で、
  手順4-8 の `no` は「ACL とプールを結び付ける」関連付け文（`ip nat inside source
  list 1 pool DYN`）のみを撤去するため、プール定義そのものは running-config に
  残る（未使用のまま）。これは実機・PT の挙動として正しい状態であり、意図的に
  残している。
- `ip nat inside source static 192.168.1.10 203.0.113.10`（手順3）は手順3-4 で
  完全に撤去済みのため、最終状態には残らない。
- 最終的に有効な変換方式は **PAT（手順5 の `... interface GigabitEthernet0/1
  overload`）のみ**であることを確認する。

### R2（最終状態）

```
enable
configure terminal
hostname R2
interface gigabitEthernet 0/1
 ip address 203.0.113.2 255.255.255.0
 no shutdown
 exit
interface gigabitEthernet 0/0
 ip address 198.51.100.1 255.255.255.0
 no shutdown
 exit
end
copy running-config startup-config
```

- R2 はラボ全体を通じて手順1以降の変更なし（ISP 役のため NAT 関連設定は一切
  不要）。

### SW1

設定変更なし（初期状態のまま）。

### PC1・PC2・PC3・Srv1

IP 設定は「3. PC/サーバ設定」のまま変更なし。

- 完成状態での疎通確認の想定結果（手順5 の PAT が有効な最終状態）:
  - PC1・PC2・PC3 → Srv1（198.51.100.8）：いずれも `ping` 成功
  - R1 の `show ip nat translations`：3 台とも Inside global が同一
    （`203.0.113.1`、Gi0/1 のアドレス）で、`Pro` 列が `icmp`、内部・グローバル
    双方にクエリ識別子が付与された行が表示される
  - R1 の `show ip nat statistics`：`Dynamic mappings` の項目に
    `Serving flags: interface`（インターフェースオーバーロード）が表示される

## 6. 組み立て後チェック

- [ ] PC1-SW1、PC2-SW1、PC3-SW1、SW1-R1、R1-R2、R2-Srv1 の全リンクが緑
- [ ] R1・R2 とも `hostname` が投入済み（プロンプトが `R1#`/`R2#`）で、
      `show ip interface brief` を実行すると、IP アドレス表どおりの IPv4
      アドレス（R1: Gi0/0=192.168.1.1、Gi0/1=203.0.113.1／R2: Gi0/1=203.0.113.2、
      Gi0/0=198.51.100.1）が設定され、全インターフェースが `up`/`up` であることを
      確認
- [ ] R1 で `show ip route static` に `0.0.0.0/0 via 203.0.113.2` の
      デフォルトルートが1件だけ表示されることを確認
- [ ] レベル A の指定どおり、R1 の `show running-config | include nat` が
      **何も表示しない**（`ip nat inside`/`ip nat outside`、ACL 1、NAT プール、
      静的/動的/PAT のいずれも未投入）＝手順2以降が本題として丸ごと残っていること
- [ ] R1 の CLI から `ping 198.51.100.8` を実行すると**成功する**（NAT 未設定
      でも、R1 自身の送信元アドレスは connected な `203.0.113.0/24` のため、
      手順1時点の基本疎通確認として成立する）
- [ ] PC1（またはPC2/PC3）の Command Prompt から `ping 198.51.100.8` を実行すると
      **失敗する**（`Request timed out.`）ことを確認 ＝ NAT 未設定のため
      プライベートアドレスのままでは外部に到達できない、という本題着手前の
      状態が正しく保たれていること
- [ ] PC1・PC2・PC3・Srv1 の Desktop > IP Configuration に、3. の表のとおり
      IP・マスク・デフォルトゲートウェイが入力済み
- [ ] `day14_start.pkt` として保存し、再度開いて配線・ホスト名・インターフェース
      IP・デフォルトルート・PC/Srv1 の IP が保持され、NAT 関連設定
      （inside/outside・ACL・プール・静的/動的/PAT）が未投入のままであることを確認
