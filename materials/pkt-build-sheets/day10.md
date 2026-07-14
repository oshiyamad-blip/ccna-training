# day10 .pktビルドシート

- **対象ラボ**: `materials/week2/day10-lab.md`（WLC と Lightweight AP による WLAN 構築、CDP/LLDP による隣接機器確認）
- **作り込みレベル**: **A（配線済み・IP済み）** — 機器配置・有線側の全ケーブル・PC/サーバの
  IP 設定まで済ませ、R1・SW1・WLC-3504 は**ホスト名すら設定していない工場出荷状態**で保存する。
  `pkt-build-spec.md` の day10 行「WLC+AP+クライアント配置・有線側配線済み。WLAN構築が本題」の
  指定どおり、手順1〜14 の IOS 設定・WLC セットアップウィザード・WLC GUI 設定（ダイナミック
  インタフェース／WLAN／セキュリティ）・無線 NIC への交換・SSID 接続は**すべて受講者が行う**。
- **保存ファイル名**: `day10_start.pkt`

> 参考画像: `materials/images/day10-topology.svg` を確認済み。結線（R1 Gi0/0 ─ SW1 Gi0/1
> トランク、SW1 Gi0/2 ─ WLC-3504 管理ポート トランク／ネイティブ VLAN100、SW1 Fa0/1 ─ LAP Gi0
> アクセス VLAN100、SW1 Fa0/24 ─ 管理用 PC Fa0 アクセス VLAN100）・IP アドレス・VLAN 番号は
> 本シートと一致している。ノート PC 2 台は SVG・ラボ手順書とも「完成後」は無線（点線）で
> LAP に接続されているが、これは手順11 で無線 NIC に交換した**後**の状態であり、開始時点
> （手順1-4）ではケーブル自体を接続しない、というのがラボ手順書自身の指定である。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| ルータ | Cisco 2911 | 1 | R1 |
| スイッチ | Cisco 2960（PoE 対応ポートを持つモデル） | 1 | SW1 |
| ワイヤレス LAN コントローラ | WLC-3504 | 1 | WLC-3504 |
| Lightweight AP | LAP-PT | 1 | LAP |
| PC（管理用・有線） | PC-PT | 1 | 管理用PC |
| ノート PC（無線） | Laptop-PT（標準の有線モジュールで配置。無線モジュール
  `PT-LAPTOP-NM-1W` への差し替えは手順11 で受講者が行うため、開始時点では**差し替えない**） | 2 | ノートPC1, ノートPC2 |

- R1（2911）は既定で GigabitEthernet0/0・0/1・0/2 を持ち、ラボが使う `interface
  gigabitEthernet 0/0` とサブインタフェース `0/0.100`・`0/0.10` にそのまま合致する。
  追加モジュールの装着は不要。
- SW1（2960）は Fa0/1・Fa0/24・Gi0/1・Gi0/2 を使用するため、標準の 2960（FastEthernet
  0/1-24 + GigabitEthernet 0/1-2）で足りる。`power inline auto` は Packet Tracer の
  2960 モデルで実行可能なことを配置後に確認する（実機の PoE 型番差は Packet Tracer では
  区別されない）。
- WLC-3504 は Network Devices > Wireless Devices（または Controllers）カテゴリから配置する。
  管理ポートの Packet Tracer 上の表示名は個体・バージョンにより異なる場合があるため、
  Physical タブでケーブルを挿す際に実際の表示を確認すること（ラボ手順書自体も物理ポート番号を
  指定せず「WLC-3504 の管理ポート」とのみ記載している）。
- LAP は「LAP-PT」（PoE 受電、Gi0 ポート）を配置する。電源ケーブルは不要（SW1 Fa0/1 からの
  PoE 給電を前提とするラボのため、電源アダプタは接続しない）。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 GigabitEthernet0/0 | ストレート（自動選択可） | SW1 GigabitEthernet0/1 |
| WLC-3504 管理ポート | ストレート（自動選択可） | SW1 GigabitEthernet0/2 |
| LAP GigabitEthernet0 | ストレート（自動選択可） | SW1 FastEthernet0/1 |
| 管理用PC FastEthernet0 | ストレート（自動選択可） | SW1 FastEthernet0/24 |

- ノートPC1・ノートPC2 は**この時点ではケーブルを接続しない**（ラボ手順書 手順1-4
  「ノート PC 2 台は、この時点では有線接続せず、後の手順で無線接続する」のとおり）。
  トポロジ上に配置だけしておき、Physical タブの無線モジュールへの差し替えと SSID 接続は
  受講者が手順11 で行う。
- ルータ・スイッチ・PC・WLC・AP はいずれも異種機器接続のため、Packet Tracer の
  「自動選択（稲妻アイコン）」でストレートケーブルが選ばれる。リンクが赤くなった場合は
  上表のとおり手動でストレートケーブルを選び直すこと。
- 配線直後は R1・SW1・WLC-3504 とも未設定（VLAN1・トランク未設定・R1 インタフェースは
  管理上ダウンの初期状態）のため、リンクの物理層（緑/赤の状態表示）は Packet Tracer の
  ケーブル挿抜アニメーションが終われば緑になる（IOS 側の `no shutdown` 未実施でも物理リンク
  灯自体は多くの場合点灯する。R1 Gi0/0 のリンクランプが暗いままの場合は、初期状態としては
  正常であり、受講者が手順4-1 の `no shutdown` を投入して初めて完全にアップする）。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| 管理用PC | 192.168.100.10 | 255.255.255.0 | 192.168.100.1 | Desktop > IP Configuration で Static。SW1 Fa0/24 接続。手順6 の WLC GUI ログイン（`https://192.168.100.2`）に使用 |
| ノートPC1 | （未設定・DHCP） | — | — | 手順11 で無線 NIC に交換後、SSID `MC-STAFF` に接続すると VLAN10 の DHCP プールから自動取得（例 192.168.10.101）。開始ファイルでは IP Configuration を DHCP のままにしておく（無線 NIC 未装着のため取得はできない） |
| ノートPC2 | （未設定・DHCP） | — | — | ノートPC1 と同様。SSID 接続後に自動取得（例 192.168.10.102） |

- 管理用PC の IP はラボ手順書の IP アドレス表・手順6-1 と完全一致させる（192.168.100.10/24、
  GW 192.168.100.1）。DNS 欄は空欄でよい。
- LAP は DHCP クライアントのため IP 設定不要（R1 の DHCP プール `VLAN100-MGMT` から取得。
  受講者が手順4 を完了させるまでは IP を取得できないのが正しい初期状態）。

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

レベル A の指定どおり、R1・SW1・WLC-3504 はいずれもホスト名すら設定していない工場出荷状態
で保存する。

- **R1**: `hostname` 未設定（`Router>` のまま）。GigabitEthernet0/0 は初期状態（管理上
  シャットダウン）。サブインタフェース `0/0.100`・`0/0.10`、DHCP プール（`VLAN100-MGMT`・
  `VLAN10-CLIENT`、オプション43 を含む）はすべて未投入。手順4 で受講者が入力する。
- **SW1**: `hostname` 未設定（`Switch>` のまま）。VLAN10・VLAN100 は未作成、Fa0/1・Fa0/24
  はアクセスポート化未実施（VLAN1 のまま）、Gi0/1・Gi0/2 のトランク化・ネイティブ VLAN
  設定・`power inline auto`・`lldp run` はいずれも未投入。手順2〜3・14 で受講者が入力する。
- **WLC-3504**: 未設定（工場出荷状態）で保存する。Packet Tracer 上で WLC-3504 をクリックし
  [CLI] タブを開くと、手順5 のセットアップウィザード（System Name・管理者アカウント・
  Management Interface IP/Netmask/Default Router/VLAN Identifier・DHCP Server IP の入力）が
  自動的に開始する状態にしておくこと。開始ファイルの保存前にウィザードへ**一切値を
  入力しない**（誤って完了させてしまった場合は、WLC を一度削除して再配置するか、
  工場出荷状態にリセットしてから保存し直す）。
- **LAP**: 設定不要（CAPWAP・DHCP により自動的に WLC に join する。工場出荷状態のまま）。

**重要**: 手順3 の Gi0/2 ネイティブ VLAN 設定と、手順5 の WLC Management Interface VLAN
Identifier（`0`）の対応関係がこのラボの山場（手順書 手順3 冒頭のコメント参照）。開始ファイルで
どちらか一方だけを先取りして設定してしまうと、受講者がこの対応関係を自分で組み立てる機会が
失われるため、両方とも未設定のまま残すこと。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボの手順1〜14 をすべて実施した**最終状態**のコンフィグ・設定値を示す
（採点・質問対応の見本）。R1・SW1 は CLI コンフィグ、WLC-3504 は GUI/ウィザードの
入力値として示す（WLC は手順書自体が GUI 操作を指示しているため、CLI 貼り付け用の
コンフィグとしては提示しない）。

### R1

```
enable
configure terminal
hostname R1
!
interface gigabitEthernet 0/0
 no shutdown
 exit
!
interface gigabitEthernet 0/0.100
 encapsulation dot1Q 100
 ip address 192.168.100.1 255.255.255.0
 exit
!
interface gigabitEthernet 0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
 exit
!
ip dhcp excluded-address 192.168.100.1 192.168.100.10
ip dhcp excluded-address 192.168.10.1 192.168.10.10
!
ip dhcp pool VLAN100-MGMT
 network 192.168.100.0 255.255.255.0
 default-router 192.168.100.1
 option 43 hex f104.c0a8.6402
 exit
!
ip dhcp pool VLAN10-CLIENT
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 exit
!
end
copy running-config startup-config
```

### SW1

```
enable
configure terminal
hostname SW1
!
vlan 10
 name WIRELESS-CLIENT
 exit
!
vlan 100
 name MGMT
 exit
!
interface fastEthernet 0/1
 switchport mode access
 switchport access vlan 100
 power inline auto
 exit
!
interface fastEthernet 0/24
 switchport mode access
 switchport access vlan 100
 exit
!
interface gigabitEthernet 0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,100
 exit
!
interface gigabitEthernet 0/2
 switchport mode trunk
 switchport trunk allowed vlan 10,100
 switchport trunk native vlan 100
 exit
!
lldp run
!
end
copy running-config startup-config
```

### WLC-3504（GUI／セットアップウィザードの入力値）

```
[CLI タブ・初回セットアップウィザード]
System Name:                              WLC1
管理者ユーザー名 / パスワード:              admin / Cisco123
Management Interface IP Address:          192.168.100.2
Management Interface Netmask:             255.255.255.0
Management Interface Default Router:      192.168.100.1
Management Interface VLAN Identifier:     0（タグなし）
DHCP Server IP Address:                   192.168.100.1

[Web GUI: https://192.168.100.2 にログイン後]

Controller > Interfaces > New（ダイナミックインタフェース）
  Interface Name:   client-vlan10
  VLAN Identifier:  10
  IP Address:       192.168.10.2
  Netmask:          255.255.255.0
  Gateway:          192.168.10.1

WLANs > Create New
  SSID:             MC-STAFF

WLAN編集 > General タブ
  Status:                          Enabled
  Interface/Interface Group(G):    client-vlan10

WLAN編集 > Security > Layer 2 タブ
  Layer 2 Security:                    WPA2
  暗号方式:                            AES
  Authentication Key Management:       PSK
  パスフレーズ:                        MoodCinema2026
  （Apply して保存）
```

### LAP

設定なし（CAPWAP により自動 join）。完成状態では WLC GUI の Wireless メニューで
Status が **Registered**、AP モードが **Local** になっている。

### 管理用PC・ノートPC1・ノートPC2

IOS 設定なし。IP 設定は「3. PC/サーバ設定」の表のとおり。ノートPC1・ノートPC2 は
手順11 完了後、無線モジュール `PT-LAPTOP-NM-1W` を装着し SSID `MC-STAFF`
（WPA2-PSK、パスフレーズ `MoodCinema2026`）に接続、VLAN10 の DHCP プールから
IP（例 192.168.10.101 / .102）を取得済みの状態。

- 完成状態での疎通確認の想定結果:
  - ノートPC1 → ノートPC2（192.168.10.102）: 成功
  - ノートPC1 → R1（192.168.10.1）: 成功
  - SW1 `show cdp neighbors` / `show cdp neighbors detail`: R1（Gi0/1 側）・
    WLC-3504（Gi0/2 側）が表示され、デバイス ID・ローカルポート・接続先ポート・
    プラットフォーム・IP アドレス・IOS バージョンが確認できる
  - SW1 `show lldp neighbors`（`lldp run` 投入後）: CDP と同じ隣接機器が表示され、
    項目・取得数の違いを比較できる

## 6. 組み立て後チェック

- [ ] R1-SW1、WLC-3504-SW1、LAP-SW1、管理用PC-SW1 の 4 本のリンクがすべて配線済み
- [ ] ノートPC1・ノートPC2 は配置のみでケーブル未接続（ラボ手順書 手順1-4 の指定どおり）
- [ ] レベル A の指定どおり、R1・SW1 とも `hostname` 未設定（プロンプトが `Router>`・
      `Switch>` のまま）で、SW1 `show vlan brief` を実行すると Fa0/1・Fa0/24・Gi0/1・Gi0/2
      を含む全ポートが **VLAN1（default）** のままであること（VLAN10・VLAN100 未作成）
- [ ] WLC-3504 は [CLI] タブを開くとセットアップウィザードの最初の質問（System Name 等）
      から始まる、未設定の状態であること（ウィザードを最後まで進めて保存していないこと）
- [ ] R1 の GigabitEthernet0/0 が初期状態（`no shutdown` 未実施）であること
      （`show ip interface brief` で `administratively down` と表示される）
- [ ] 管理用PC の Desktop > IP Configuration に「3. PC/サーバ設定」表のとおり
      192.168.100.10/24、GW 192.168.100.1 が入力済み
- [ ] ノートPC1・ノートPC2 は有線モジュール（Copper）のまま、IP 設定は DHCP のまま
      （無線モジュールへの差し替え・SSID 接続は受講者作業のため未実施）
- [ ] この時点では VLAN・トランク・DHCP・WLC 設定のいずれも未投入のため、管理用PC から
      他の機器への ping は疎通しない（同一セグメント内 ping チェックは対象外。静的 IP を
      持つ端末が管理用PC 1 台のみのため、そもそも比較先が存在しない）
- [ ] `day10_start.pkt` として保存し、再度開いて上記の状態
      （4本の有線配線済み・管理用PC の IP のみ設定済み・R1/SW1/WLC-3504 は初期状態、
      ノートPC1/2 は未接続）が保たれていることを確認
