# day17 .pktビルドシート

- **対象ラボ**: `materials/week4/day17-lab.md`（拡張 ACL によるアクセス制御と VTY 管理制限）
- **作り込みレベル**: C（前提設定済み）— `pkt-build-spec.md` の day17 行に従う
- **保存ファイル名**: `day17_start.pkt`

## レベルCの解釈（このシート特有の判断）

`pkt-build-spec.md` は day17 を「VLAN間ルーティングやサーバ配置など前提を完成済みにし、
ACL設計・適用のみを本題に残す」と指定しています。ラボ手順書の構成上、これは以下のように
落とし込みます。

- **事前投入する（本題ではない）**: 手順1（VLAN・スイッチポート）、手順2
  （Router-on-a-Stick サブインターフェース）、手順3（PC/SRV の IP・SRV の HTTP サービス）、
  手順7（SSH の基本設定 — 手順書内で明記のとおり「Day16 復習」であり ACL の本題ではないため）
- **受講者が行う（本題として残す）**: 手順4（KEI-TO-SRV 拡張ACL作成・適用）、手順5
  （EIG-BLOCK 拡張ACL作成・適用）、手順6（ヒットカウンタ確認＝コマンド操作のみで設定投入は
  不要）、手順8（MGMT-VTY 標準ACL作成・`access-class` 適用）、手順9（最終確認・保存）

この結果、開始ファイルでは VLAN 間 ping・HTTP・SSH（未制限）まではすべて成功する状態になり、
受講者はそこから 3 つの ACL を作って要件を満たす、という本題に集中できます。

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| ルータ（Router-on-a-Stick） | Router ISR 4331（オンボード GigabitEthernet0/0/0 使用） | 1 | R1 |
| L2スイッチ | Switch 2960（2960-24TT 相当、FastEthernet0/1-0/24 + GigabitEthernet0/1-0/2） | 1 | SW1 |
| サーバ | Server-PT | 1 | SRV |
| PC（経理 VLAN10） | PC-PT | 1 | PC-Kei |
| PC（営業 VLAN20） | PC-PT | 1 | PC-Eig |
| PC（管理 VLAN99） | PC-PT | 1 | PC-Adm |

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 GigabitEthernet0/0/0 | 自動選択（銅線ストレート相当） | SW1 GigabitEthernet0/1 |
| SW1 FastEthernet0/1 | 自動選択（銅線ストレート） | PC-Kei FastEthernet0 |
| SW1 FastEthernet0/2 | 自動選択（銅線ストレート） | PC-Eig FastEthernet0 |
| SW1 FastEthernet0/3 | 自動選択（銅線ストレート） | PC-Adm FastEthernet0 |
| SW1 FastEthernet0/10 | 自動選択（銅線ストレート） | SRV FastEthernet0 |

リンクが赤いままの場合は「自動選択」をやめ、上記どおり銅線ストレートケーブルで明示的に結線する。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC-Kei | 192.168.10.10 | 255.255.255.0 | 192.168.10.1 | — |
| PC-Eig | 192.168.20.10 | 255.255.255.0 | 192.168.20.1 | — |
| PC-Adm | 192.168.99.10 | 255.255.255.0 | 192.168.99.1 | — |
| SRV | 192.168.30.100 | 255.255.255.0 | 192.168.30.1 | Desktop > Services > HTTP を **On** にする |

すべて [Desktop] → [IP Configuration] から入力する（Static を選択）。

## 4. 貼り付け用コンフィグ（事前設定）

レベルCとして、以下を開始ファイルにあらかじめ投入する。ACL（KEI-TO-SRV / EIG-BLOCK /
MGMT-VTY と `access-class` 適用）は**投入しないこと**（本題として受講者が入力する）。

各ブロックは「グローバルコンフィグモードに入るところ」から記載しているので、CLI に
そのまま貼り付けてよい（`enable` → `configure terminal` の順で入る前提）。

### SW1（事前設定）

```
enable
configure terminal
hostname SW1
vlan 10
 name KEIRI
vlan 20
 name EIGYO
vlan 30
 name SERVER
vlan 99
 name MGMT
exit
interface FastEthernet0/1
 switchport mode access
 switchport access vlan 10
 exit
interface FastEthernet0/2
 switchport mode access
 switchport access vlan 20
 exit
interface FastEthernet0/3
 switchport mode access
 switchport access vlan 99
 exit
interface FastEthernet0/10
 switchport mode access
 switchport access vlan 30
 exit
interface GigabitEthernet0/1
 switchport mode trunk
 exit
end
copy running-config startup-config
```

### R1（事前設定）

`crypto key generate rsa` は対話プロンプトです。「How many bits in the modulus [512]:」
と聞かれたら `1024` と入力して Enter を押してください（下記コードブロックでは
プロンプトへの応答として次行に `1024` を記載しています）。

```
enable
configure terminal
hostname R1
interface GigabitEthernet0/0/0
 no shutdown
 exit
interface GigabitEthernet0/0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
 exit
interface GigabitEthernet0/0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
 exit
interface GigabitEthernet0/0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
 exit
interface GigabitEthernet0/0/0.99
 encapsulation dot1Q 99
 ip address 192.168.99.1 255.255.255.0
 exit
ip domain-name ccna-lab.local
crypto key generate rsa
1024
username admin secret Cisco12345
line vty 0 4
 transport input ssh
 login local
 exit
end
copy running-config startup-config
```

投入後、`show ip interface brief` で 4 つのサブインターフェースが up/up、
`show vlan brief` で SW1 の各ポートが正しい VLAN に入っていることを確認する。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボを完成させた状態（手順1〜9すべて投入済み）の全機器コンフィグ。採点・質問対応用の
見本であり、開始ファイル（`day17_start.pkt`）には含めない。

### SW1（完成）

SW1 は事前設定（上記）から変更なし。ラボ手順に SW1 への追加操作はない。

```
enable
configure terminal
hostname SW1
vlan 10
 name KEIRI
vlan 20
 name EIGYO
vlan 30
 name SERVER
vlan 99
 name MGMT
exit
interface FastEthernet0/1
 switchport mode access
 switchport access vlan 10
 exit
interface FastEthernet0/2
 switchport mode access
 switchport access vlan 20
 exit
interface FastEthernet0/3
 switchport mode access
 switchport access vlan 99
 exit
interface FastEthernet0/10
 switchport mode access
 switchport access vlan 30
 exit
interface GigabitEthernet0/1
 switchport mode trunk
 exit
end
copy running-config startup-config
```

### R1（完成）

```
enable
configure terminal
hostname R1
interface GigabitEthernet0/0/0
 no shutdown
 exit
interface GigabitEthernet0/0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
 ip access-group KEI-TO-SRV in
 exit
interface GigabitEthernet0/0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
 ip access-group EIG-BLOCK in
 exit
interface GigabitEthernet0/0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
 exit
interface GigabitEthernet0/0/0.99
 encapsulation dot1Q 99
 ip address 192.168.99.1 255.255.255.0
 exit
ip access-list extended KEI-TO-SRV
 permit tcp 192.168.10.0 0.0.0.255 host 192.168.30.100 eq 80
 deny ip any any log
 exit
ip access-list extended EIG-BLOCK
 deny ip 192.168.20.0 0.0.0.255 host 192.168.30.100
 permit ip any any
 exit
ip access-list standard MGMT-VTY
 permit host 192.168.99.10
 exit
ip domain-name ccna-lab.local
crypto key generate rsa
1024
username admin secret Cisco12345
line vty 0 4
 transport input ssh
 login local
 access-class MGMT-VTY in
 exit
end
copy running-config startup-config
```

## 6. 組み立て後チェック

- [ ] R1—SW1、SW1—PC-Kei、SW1—PC-Eig、SW1—PC-Adm、SW1—SRV の全リンクが緑（STP収束済み）
- [ ] `show vlan brief`（SW1）で Fa0/1=VLAN10、Fa0/2=VLAN20、Fa0/3=VLAN99、Fa0/10=VLAN30、
      Gi0/1=trunk になっている
- [ ] `show ip interface brief`（R1）で Gi0/0/0.10・.20・.30・.99 がすべて up/up
- [ ] レベルCどおり、R1 に `show access-lists` を打っても ACL が **1つも存在しない**
      （KEI-TO-SRV / EIG-BLOCK / MGMT-VTY は未投入。本題として受講者が作成する）
- [ ] `show running-config | include access-class` で何も出力されない（VTY 制限も未適用）
- [ ] PC-Kei → SRV（192.168.30.100）へ ping が成功する（ACL 未適用なので全VLAN間で疎通可）
- [ ] PC-Kei の Web Browser から `http://192.168.30.100` にアクセスでき、既定ページが表示される
      （SRV の HTTP サービスが On になっていることの確認を兼ねる）
- [ ] PC-Adm から `ssh -l admin 192.168.99.1` を実行し、パスワード `Cisco12345` で
      R1 にログインできる（この時点では `access-class` 未適用のため、PC-Eig からも
      SSH 接続できてしまう状態が正しい＝レベルCの想定どおり）
- [ ] `File > Save As` で `day17_start.pkt` として保存し、一度閉じて再度開いても
      上記の状態（本題のACLが未設定）が保たれている
