# day15 .pktビルドシート

- **対象ラボ**: `materials/week3/day15-lab.md`（DHCP リレー・NTP 同期・Syslog 収集の
  統合構成 — R1 が DHCP サーバ／NTP マスタ（stratum 3）、R2 が DHCP リレー
  （`ip helper-address`）／NTP クライアントを兼務する 2 セグメント構成）
- **作り込みレベル**: **A（配線済み・IP済み）** — `pkt-build-spec.md` の day15 行の指定
  「配線・IP済み。各サービス設定が本題」のとおり。具体的には、ラボ手順書の
  **手順1「基本ネットワーク構成」（R1・R2 のインターフェース IP・`no shutdown`・
  相互の静的ルート、Syslog サーバの IP）までを投入済み**にし、**手順2以降
  （DHCP 除外アドレス／プール、`ip helper-address`、NTP マスタ／クライアント、
  Syslog 送出設定）はすべて未設定のまま**保存する。day11／day12／day14 と同じ
  「配線・基本 IP は前提として済ませ、その日の本題（今回は DHCP・NTP・Syslog の
  各サービス）だけを空けておく」という Week3 の運用に合わせている。
- **保存ファイル名**: `day15_start.pkt`

> 参考画像: `materials/images/day15-topology.svg` を確認済み。結線
> （SW1: Fa0/1=R1 Gi0/0、Fa0/2=PC1、Fa0/3=PC2、Fa0/4=Syslog サーバ ／
> SW2: Fa0/1=R2 Gi0/0、Fa0/2=PC3、Fa0/3=PC4 ／ R1 Gi0/1 ⇔ R2 Gi0/1 が
> 10.0.0.0/30 の WAN リンク）・インターフェース名・IP は、いずれも本シートおよび
> `day15-lab.md` の IP アドレス表・手順1と完全一致している。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| PC（ローカル LAN・DHCP クライアント） | 汎用 PC（PC-PT） | 2 | PC1, PC2 |
| PC（リモート LAN・DHCP クライアント／リレー経由） | 汎用 PC（PC-PT） | 2 | PC3, PC4 |
| サーバ（Syslog サーバ役） | 汎用サーバ（Server-PT） | 1 | Syslog サーバ |
| L2 スイッチ（ローカル LAN） | Cisco 2960 | 1 | SW1 |
| L2 スイッチ（リモート LAN） | Cisco 2960 | 1 | SW2 |
| ルータ（DHCP サーバ／NTP マスタ） | Cisco 2911 | 1 | R1 |
| ルータ（DHCP リレー／NTP クライアント） | Cisco 2911 | 1 | R2 |

- 2911 はオンボードで `GigabitEthernet0/0`・`0/1` を持ち、ラボ手順書のコマンド
  （R1 は Gi0/0=ローカル LAN 側・Gi0/1=WAN 側、R2 は Gi0/1=WAN 側・Gi0/0=リモート
  LAN 側）とインターフェース名がそのまま一致する。追加の HWIC モジュールは不要。
- 2960 は Fa0/1〜Fa0/24 の標準構成。SW1 は 4 ポート（Fa0/1〜Fa0/4）、SW2 は
  3 ポート（Fa0/1〜Fa0/3）を使用し、いずれもラボ手順書の「L2 スイッチ、設定不要」
  のとおり初期状態のまま使う。
- Syslog サーバは Server-PT（`FastEthernet0` インターフェースを持つ標準構成）を
  使用。Desktop タブで IP を設定し、Services タブの **SYSLOG** を有効化する
  （Server-PT は既定で SYSLOG サービスが ON になっているが、開始ファイル作成時に
  一度 Services タブを開いて ON になっていることを目視確認しておくこと）。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| PC1 FastEthernet0 | ストレート | SW1 FastEthernet0/2 |
| PC2 FastEthernet0 | ストレート | SW1 FastEthernet0/3 |
| Syslog サーバ FastEthernet0 | ストレート | SW1 FastEthernet0/4 |
| SW1 FastEthernet0/1 | ストレート | R1 GigabitEthernet0/0 |
| R1 GigabitEthernet0/1 | ストレート | R2 GigabitEthernet0/1 |
| R2 GigabitEthernet0/0 | ストレート | SW2 FastEthernet0/1 |
| PC3 FastEthernet0 | ストレート | SW2 FastEthernet0/2 |
| PC4 FastEthernet0 | ストレート | SW2 FastEthernet0/3 |

- 全リンクがストレートケーブルで結線可能（Packet Tracer 9.x のスイッチ・
  ルータポートは auto-mdix のため、ルータ同士（R1 Gi0/1 ⇔ R2 Gi0/1）でも
  ストレートで問題ない）。「自動選択（Automatically Choose Connection Type）」
  でも同じ結線になるが、赤リンクになった場合は上表のとおり手動でストレートを
  選び直すこと。
- SW1 は Fa0/1〜Fa0/4 の 4 ポートすべて使用（ラボ手順書の IP アドレス表の
  「SW1 | Fa0/1〜Fa0/4」と一致）。SW2 は Fa0/1〜Fa0/3 の 3 ポート使用（同様に
  「SW2 | Fa0/1〜Fa0/3」と一致）。
- 全リンクが緑になるまで待ってから保存する。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | DHCP 取得（未取得のまま保存でよい） | DHCP 取得 | DHCP 取得 | Desktop > IP Configuration で **DHCP** を選択済みにしておく（R1 の DHCP サーバが未設定のため、保存時点ではアドレス取得に失敗した状態のままでよい） |
| PC2 | 同上 | 同上 | 同上 | 同上 |
| PC3 | DHCP 取得（未取得のまま保存でよい） | DHCP 取得 | DHCP 取得 | Desktop > IP Configuration で **DHCP** を選択済みにしておく（リレー未設定・R1 の DHCP サーバも未設定のため同様） |
| PC4 | 同上 | 同上 | 同上 | 同上 |
| Syslog サーバ | 192.168.1.10 | 255.255.255.0 | 192.168.1.1 | Desktop > IP Configuration で **Static** を選択し入力。Services タブ > **SYSLOG** が ON になっていることを確認 |

- レベル A の指定どおり、PC/サーバの「IP 設定モード」自体は投入済みにする
  （Syslog サーバは固定 IP を入力済み、PC1〜PC4 は DHCP モードを選択済み）。
  実際のアドレス払い出しは R1・R2 の DHCP／リレー設定（本題）が完了して
  初めて行われるため、開始ファイルの時点では PC1〜PC4 は「IP アドレス未取得」の
  状態のままで正しい。
- DNS サーバ欄は Syslog サーバでは使用しないため空欄でよい。

## 4. 貼り付け用コンフィグ（事前設定）

ラボ手順書の**手順1「基本ネットワーク構成」**（インターフェース IP・
`no shutdown`・相互の静的ルート）までを投入済みにする。`enable` →
`configure terminal` から開始する前提で、以下をそのまま各ルータの CLI に
貼り付ける。**手順2（DHCP 除外アドレス・プール）、手順4（`ip helper-address`）、
手順6（NTP マスタ／クライアント）、手順7（`service timestamps` /
`logging host` / `logging trap`）は一切含めない**——これらが day15 の本題
（DHCP・NTP・Syslog の各サービス設定）であり、受講者が入力する部分として
空のまま残す。

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
 ip address 10.0.0.1 255.255.255.252
 no shutdown
 exit
ip route 192.168.2.0 255.255.255.0 10.0.0.2
end
copy running-config startup-config
```

### R2

```
enable
configure terminal
hostname R2
interface gigabitEthernet 0/1
 ip address 10.0.0.2 255.255.255.252
 no shutdown
 exit
interface gigabitEthernet 0/0
 ip address 192.168.2.1 255.255.255.0
 no shutdown
 exit
ip route 192.168.1.0 255.255.255.0 10.0.0.1
end
copy running-config startup-config
```

- 手順1の最後（手順1-5）で R1 から `ping 10.0.0.2` と `ping 192.168.1.10` を
  実行して疎通確認する内容は、開始ファイル作成時にも同様に確認しておくと
  結線・IP 設定のミスを事前に潰せる（Syslog サーバの IP が入っていれば両方とも
  成功するはず）。

### SW1・SW2

事前設定なし（機器は初期状態のまま。ラボ手順書のとおり L2 スイッチとして
VLAN1 のデフォルト動作で使用し、設定は不要）。

### PC1・PC2・PC3・PC4・Syslog サーバ

IOS 設定は存在しない（PC/サーバのため）。IP 設定は「3. PC/サーバ設定」の
とおり投入済み。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボの手順1〜7をすべて実施した**最終状態**のコンフィグを示す
（採点・質問対応の見本）。手順8の `show` 系コマンドは検証のみで
running-config に影響しないため含めない。手順7-2 の
`shutdown` → `no shutdown`（R2 Gi0/0）はログ発生のための一時操作であり、
最終的にインターフェースは `no shutdown` のまま変化しないため、最終
コンフィグには反映不要。

### R1（最終状態）

`clock set` は特権 EXEC コマンド（`config` モードではない）なので、
`configure terminal` に入る**前**に実行する。

```
enable
clock set 10:00:00 13 July 2026
configure terminal
hostname R1
interface gigabitEthernet 0/0
 ip address 192.168.1.1 255.255.255.0
 no shutdown
 exit
interface gigabitEthernet 0/1
 ip address 10.0.0.1 255.255.255.252
 no shutdown
 exit
ip route 192.168.2.0 255.255.255.0 10.0.0.2
ip dhcp excluded-address 192.168.1.1 192.168.1.10
ip dhcp excluded-address 192.168.2.1 192.168.2.1
ip dhcp pool LAN1
 network 192.168.1.0 255.255.255.0
 default-router 192.168.1.1
 dns-server 192.168.1.10
 lease 0 8 0
 exit
ip dhcp pool LAN2
 network 192.168.2.0 255.255.255.0
 default-router 192.168.2.1
 dns-server 192.168.1.10
 exit
ntp master 3
service timestamps log datetime msec
logging host 192.168.1.10
logging trap informational
end
copy running-config startup-config
```

- `clock set` は running-config に残らない（時刻はデバイスの動作状態であり
  コンフィグ項目ではない）ため、`_answer.pkt` を開き直した際は毎回
  再実行が必要になる点に注意（採点時は日時がズレていても NTP マスタとしての
  動作自体には影響しない）。

### R2（最終状態）

```
enable
configure terminal
hostname R2
interface gigabitEthernet 0/1
 ip address 10.0.0.2 255.255.255.252
 no shutdown
 exit
interface gigabitEthernet 0/0
 ip address 192.168.2.1 255.255.255.0
 ip helper-address 10.0.0.1
 no shutdown
 exit
ip route 192.168.1.0 255.255.255.0 10.0.0.1
ntp server 10.0.0.1
service timestamps log datetime msec
logging host 192.168.1.10
logging trap informational
end
copy running-config startup-config
```

- 手順7-2 の `interface GigabitEthernet0/0` → `shutdown` → `no shutdown` は
  Syslog イベント（`%LINK-3-UPDOWN` / `%LINEPROTO-5-UPDOWN`）を発生させる
  ための操作で、最終状態のインターフェースは上記のとおり `no shutdown`
  （up/up）のままでよい。

### SW1・SW2（最終状態）

設定変更なし（初期状態のまま。ラボ全体を通じて L2 スイッチの設定は不要）。

### PC1・PC2・PC3・PC4・Syslog サーバ（最終状態）

- PC1・PC2: DHCP により `192.168.1.11` 以降のアドレスを LAN1 プールから取得
  （デフォルト GW `192.168.1.1`、DNS `192.168.1.10`）。
- PC3・PC4: R2 の `ip helper-address` 経由のリレーにより `192.168.2.2` 以降の
  アドレスを LAN2 プールから取得（デフォルト GW `192.168.2.1`、DNS
  `192.168.1.10`）。
- Syslog サーバ: 「3. PC/サーバ設定」のまま変更なし（192.168.1.10/24）。
  Services > SYSLOG 画面に R1・R2 からのログ（`%LINK`/`%LINEPROTO` を含む）が
  記録されている。

- 完成状態での確認結果の想定（手順8 の検証）:
  - R1 の `show ip dhcp pool`: `LAN1`・`LAN2` の 2 プールが表示される。
  - R1 の `show ip dhcp binding`: PC1〜PC4 の **4 台分**のリースが表示される。
  - R2 の `show ntp status`: `Clock is synchronized`、stratum **4**。
  - R2 の `show ntp associations`: `10.0.0.1` の行の先頭に `*`。
  - R1・R2 の `show logging`: バッファに `%LINK-3-UPDOWN` /
    `%LINEPROTO-5-UPDOWN` を含むメッセージが記録されている。
  - Syslog サーバの Services > SYSLOG 画面にも同様のメッセージが記録されている。

## 6. 組み立て後チェック

- [ ] PC1-SW1、PC2-SW1、Syslog サーバ-SW1、SW1-R1、R1-R2、R2-SW2、PC3-SW2、
      PC4-SW2 の全リンクが緑
- [ ] R1・R2 とも `hostname` が投入済み（プロンプトが `R1#`/`R2#`）で、
      `show ip interface brief` を実行すると、IP アドレス表どおりの IPv4
      アドレス（R1: Gi0/0=192.168.1.1、Gi0/1=10.0.0.1／R2: Gi0/1=10.0.0.2、
      Gi0/0=192.168.2.1）が設定され、全インターフェースが `up`/`up` であることを
      確認
- [ ] R1・R2 とも `show ip route static` に相手側サブネットへの静的ルートが
      1 件ずつ表示され、R1 の CLI から `ping 10.0.0.2` と
      `ping 192.168.1.10`（Syslog サーバ）がいずれも成功することを確認
- [ ] レベル A の指定どおり、本題（DHCP・NTP・Syslog）が未設定のまま残って
      いることを確認する:
      - R1 の `show running-config | include dhcp` が**何も表示しない**
        （`ip dhcp excluded-address`／`ip dhcp pool` 未投入）
      - R2 の `show running-config | include helper` が**何も表示しない**
        （`ip helper-address` 未投入）
      - R1・R2 の `show running-config | include ntp` が**何も表示しない**
        （`ntp master`／`ntp server` 未投入）
      - R1・R2 の `show running-config | include logging` が**何も表示しない**
        （`logging host`／`logging trap` 未投入）
- [ ] PC1〜PC4 の Desktop > IP Configuration が **DHCP** 選択済みで、この時点
      では IP アドレスを取得できていない（本題未設定のため想定どおりの状態）
- [ ] Syslog サーバの Desktop > IP Configuration に `192.168.1.10` /
      `255.255.255.0` / GW `192.168.1.1` が入力済みで、Services > SYSLOG が
      ON になっている
- [ ] `day15_start.pkt` として保存し、再度開いて配線・ホスト名・インターフェース
      IP・静的ルート・Syslog サーバの IP が保持され、DHCP／NTP／Syslog 関連設定
      （DHCP プール・`ip helper-address`・`ntp master`/`ntp server`・
      `logging host`/`logging trap`）が未投入のままであることを確認
