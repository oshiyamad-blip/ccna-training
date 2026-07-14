# day20 .pktビルドシート

- **対象ラボ**: `materials/week4/day20-lab.md`（総合演習 — 小規模企業ネットワークの構築）
- **作り込みレベル**: C（大規模・要注意）— `pkt-build-spec.md` の day20 行に従う
- **保存ファイル名**: `day20_start.pkt`

## レベル解釈の注意（このシート特有の判断）

`pkt-build-spec.md` の day20 行は「C」と表記されているが、特記事項には
「機器配置+配線+PC/サーバIPまでを済ませ、**すべてのIOS設定は空**（VLAN/OSPF/HSRP/
DHCP/NAT/ACL/SSH/ポートセキュリティを受講者がゼロから）」と明記されている。これは
通常のレベルC（前日までの設定や前半の完成状態を投入済み）とは異なり、**実質はレベルA
（IOS設定なし）を機器3台・スイッチ2台という大規模構成に適用したもの**である。

したがって本シートでは、

- **事前投入する**: 機器配置・全ケーブル・PC/サーバの IP（後述）
- **事前投入しない**: R1・R2・R-ISP・SW1・SW2 の IOS 設定は**すべて**ゼロ（`hostname` も
  含めて工場出荷状態のまま）。VLAN 作成〜ポートセキュリティまでの手順1〜11すべてが受講者の作業

という方針で組み立てる。

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| ルータ（社内・HSRP冗長） | Router 2911（オンボード GigabitEthernet0/0〜0/2 を使用） | 2 | R1, R2 |
| ルータ（ISP模擬） | Router 2911（GigabitEthernet0/0・0/1 のみ使用、0/2 は未使用） | 1 | R-ISP |
| L2スイッチ | Switch 2960（FastEthernet0/1-0/24 + GigabitEthernet0/1-0/2） | 2 | SW1, SW2 |
| PC | PC-PT | 4 | PC1, PC2, PC3, PC4 |
| サーバ | Server-PT | 1 | Server（SRV） |

補足: R1 は Gi0/0（トランク）・Gi0/1（R1-R2リンク）・Gi0/2（WAN）の3ポートすべてを使用する。
R2 は Gi0/0（トランク）・Gi0/1（R1-R2リンク）の2ポートのみ使用し、Gi0/2 は未使用のまま
（ラボ手順書に記載なし）。R-ISP は Gi0/0（WAN・R1向け）・Gi0/1（模擬インターネットセグメント・
Server向け）の2ポートを使用する。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R-ISP GigabitEthernet0/1 | 自動選択（銅線ストレート相当） | Server FastEthernet0 |
| R-ISP GigabitEthernet0/0 | 自動選択（銅線ストレート相当） | R1 GigabitEthernet0/2 |
| R1 GigabitEthernet0/1 | 自動選択（銅線ストレート相当） | R2 GigabitEthernet0/1 |
| R1 GigabitEthernet0/0 | 自動選択（銅線ストレート相当） | SW1 GigabitEthernet0/1 |
| R2 GigabitEthernet0/0 | 自動選択（銅線ストレート相当） | SW2 GigabitEthernet0/1 |
| SW1 GigabitEthernet0/2 | 自動選択（銅線ストレート相当） | SW2 GigabitEthernet0/2 |
| SW1 FastEthernet0/1 | 自動選択（銅線ストレート） | PC1 FastEthernet0 |
| SW1 FastEthernet0/2 | 自動選択（銅線ストレート） | PC2 FastEthernet0 |
| SW2 FastEthernet0/1 | 自動選択（銅線ストレート） | PC3 FastEthernet0 |
| SW2 FastEthernet0/2 | 自動選択（銅線ストレート） | PC4 FastEthernet0 |

リンクが赤いままの場合は「自動選択」をやめ、上記どおり銅線ストレートケーブルで明示的に結線する。
ルータ間（R1-R2、R1-R-ISP）・ルータ-スイッチ間もすべて銅線ストレートで問題ない
（Packet Tracer 9.x はオートMDI-X対応のため、実機のようにクロスケーブルを意識する必要はない）。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | DHCP（自動取得を選択） | DHCP（自動取得を選択） | DHCP（自動取得を選択） | VLAN10営業・SW1 Fa0/1。[Desktop]→[IP Configuration]で **DHCP** ボタンを選ぶだけ。保存時点ではDHCPサーバ未設定のため 0.0.0.0 のままで正常 |
| PC2 | 同上 | 同上 | 同上 | VLAN20経理・SW1 Fa0/2。同上 |
| PC3 | 同上 | 同上 | 同上 | VLAN10営業・SW2 Fa0/1。同上 |
| PC4 | 同上 | 同上 | 同上 | VLAN20経理・SW2 Fa0/2。同上 |
| Server（SRV） | 198.51.100.8 | 255.255.255.0 | 198.51.100.1 | [Desktop]→[IP Configuration]で **Static** を選択しこの値を入力。さらに [Desktop]→[Services]→**HTTP** を **On** にする |

PC1〜4 は「その日の学習対象」である DHCP サーバ構築（手順7）が本題のため、クライアント側は
DHCP モードに設定するだけで IP は入力しない（ルータ未設定のうちは取得できないのが正常）。
Server のみ静的 IP とし、模擬インターネット側のゴール（`ping 198.51.100.8` 等）の対象として
機能させる。

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

R1・R2・R-ISP・SW1・SW2 のすべてが、`hostname` すら設定していない Packet Tracer の工場出荷
コンフィグのまま。day20 は総合演習であり、VLAN/トランク/Router-on-a-Stick/HSRP/OSPF/DHCP/
NAT/拡張ACL/SSH/ポートセキュリティの**すべて**が本日の学習対象（ラボ手順1〜11）のため、
IOS 設定は一切投入しない。開始ファイルに投入するのは「1. 機器リスト」の配置と「2. 結線表」の
配線、「3. PC/サーバ設定」の値のみ。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボを完成させた状態（手順1〜11すべて投入済み）の全機器コンフィグ。採点・質問対応用の
見本であり、開始ファイル（`day20_start.pkt`）には含めない。`crypto key generate rsa` は
実機の対話プロンプトのため、コードブロック中は応答としての `1024` を次行に記載している。

### SW1（完成）

```
enable
configure terminal
hostname SW1
vlan 10
 name EIGYO
vlan 20
 name KEIRI
vlan 99
 name MGMT
exit
interface FastEthernet0/1
 switchport mode access
 switchport access vlan 10
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address sticky
 switchport port-security violation shutdown
 exit
interface FastEthernet0/2
 switchport mode access
 switchport access vlan 20
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address sticky
 switchport port-security violation shutdown
 exit
interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,99
 exit
interface GigabitEthernet0/2
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,99
 exit
end
copy running-config startup-config
```

### SW2（完成）

```
enable
configure terminal
hostname SW2
vlan 10
 name EIGYO
vlan 20
 name KEIRI
vlan 99
 name MGMT
exit
interface FastEthernet0/1
 switchport mode access
 switchport access vlan 10
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address sticky
 switchport port-security violation shutdown
 exit
interface FastEthernet0/2
 switchport mode access
 switchport access vlan 20
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address sticky
 switchport port-security violation shutdown
 exit
interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,99
 exit
interface GigabitEthernet0/2
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,99
 exit
end
copy running-config startup-config
```

### R1（完成）

```
enable
configure terminal
hostname R1
interface GigabitEthernet0/0
 no shutdown
 exit
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.2 255.255.255.0
 standby 10 ip 192.168.10.1
 standby 10 priority 110
 standby 10 preempt
 ip nat inside
 exit
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.2 255.255.255.0
 standby 20 ip 192.168.20.1
 standby 20 priority 110
 standby 20 preempt
 ip nat inside
 ip access-group KEIRI-TO-SRV in
 exit
interface GigabitEthernet0/0.99
 encapsulation dot1Q 99 native
 ip address 192.168.99.2 255.255.255.0
 ip nat inside
 exit
interface GigabitEthernet0/1
 ip address 10.0.0.1 255.255.255.252
 no shutdown
 ip nat inside
 exit
interface GigabitEthernet0/2
 ip address 203.0.113.1 255.255.255.252
 no shutdown
 ip nat outside
 exit
router ospf 1
 router-id 1.1.1.1
 network 10.0.0.0 0.0.0.3 area 0
 network 192.168.10.0 0.0.0.255 area 0
 network 192.168.20.0 0.0.0.255 area 0
 network 192.168.99.0 0.0.0.255 area 0
 passive-interface GigabitEthernet0/0.10
 passive-interface GigabitEthernet0/0.20
 passive-interface GigabitEthernet0/0.99
 default-information originate
 exit
ip route 0.0.0.0 0.0.0.0 203.0.113.2
ip dhcp excluded-address 192.168.10.1 192.168.10.3
ip dhcp excluded-address 192.168.10.129 192.168.10.254
ip dhcp excluded-address 192.168.20.1 192.168.20.3
ip dhcp excluded-address 192.168.20.129 192.168.20.254
ip dhcp excluded-address 192.168.99.1 192.168.99.3
ip dhcp pool VLAN10-EIGYO
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 198.51.100.8
 exit
ip dhcp pool VLAN20-KEIRI
 network 192.168.20.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 198.51.100.8
 exit
access-list 1 permit 192.168.0.0 0.0.255.255
ip nat inside source list 1 interface GigabitEthernet0/2 overload
ip access-list extended KEIRI-TO-SRV
 permit udp any host 255.255.255.255 eq 67
 permit tcp 192.168.20.0 0.0.0.255 host 198.51.100.8 eq 80
 deny ip any any log
 exit
ip domain-name ccna-lab.local
crypto key generate rsa
1024
username admin secret Cisco12345
enable secret Cisco12345
line vty 0 4
 transport input ssh
 login local
 exit
end
copy running-config startup-config
```

### R2（完成）

```
enable
configure terminal
hostname R2
interface GigabitEthernet0/0
 no shutdown
 exit
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.3 255.255.255.0
 standby 10 ip 192.168.10.1
 exit
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.3 255.255.255.0
 standby 20 ip 192.168.20.1
 ip access-group KEIRI-TO-SRV in
 exit
interface GigabitEthernet0/0.99
 encapsulation dot1Q 99 native
 ip address 192.168.99.3 255.255.255.0
 exit
interface GigabitEthernet0/1
 ip address 10.0.0.2 255.255.255.252
 no shutdown
 exit
router ospf 1
 router-id 2.2.2.2
 network 10.0.0.0 0.0.0.3 area 0
 network 192.168.10.0 0.0.0.255 area 0
 network 192.168.20.0 0.0.0.255 area 0
 network 192.168.99.0 0.0.0.255 area 0
 passive-interface GigabitEthernet0/0.10
 passive-interface GigabitEthernet0/0.20
 passive-interface GigabitEthernet0/0.99
 exit
ip dhcp excluded-address 192.168.10.1 192.168.10.3
ip dhcp excluded-address 192.168.10.4 192.168.10.128
ip dhcp excluded-address 192.168.20.1 192.168.20.3
ip dhcp excluded-address 192.168.20.4 192.168.20.128
ip dhcp excluded-address 192.168.99.1 192.168.99.3
ip dhcp pool VLAN10-EIGYO
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 198.51.100.8
 exit
ip dhcp pool VLAN20-KEIRI
 network 192.168.20.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 198.51.100.8
 exit
ip access-list extended KEIRI-TO-SRV
 permit udp any host 255.255.255.255 eq 67
 permit tcp 192.168.20.0 0.0.0.255 host 198.51.100.8 eq 80
 deny ip any any log
 exit
ip domain-name ccna-lab.local
crypto key generate rsa
1024
username admin secret Cisco12345
enable secret Cisco12345
line vty 0 4
 transport input ssh
 login local
 exit
end
copy running-config startup-config
```

### R-ISP（完成・インターネット模擬。要件6項目の対象外だが疎通確認のため設定する）

```
enable
configure terminal
hostname R-ISP
interface GigabitEthernet0/0
 ip address 203.0.113.2 255.255.255.252
 no shutdown
 exit
interface GigabitEthernet0/1
 ip address 198.51.100.1 255.255.255.0
 no shutdown
 exit
end
copy running-config startup-config
```

## 6. 組み立て後チェック

開始ファイル（`day20_start.pkt`）は IOS 設定が一切ないため、IP 到達性に関するチェックは
「物理層・PC/サーバ側の設定」のみが対象になる。IP 疎通・DHCP・HSRP 等の確認は完成ファイル
（`_answer.pkt`）側で行う。

### 開始ファイル（`day20_start.pkt`）のチェック

- [ ] 「2. 結線表」の10本すべてのリンクが緑（デフォルトVLAN1上でSTP収束済み。VLANやトランクは
      未設定でも物理リンクは緑になる）
- [ ] R1・R2・R-ISP の `show running-config` で `hostname` が既定（`Router`）のまま
      （＝IOS設定が本当に空であることの確認）
- [ ] SW1・SW2 の `show running-config` で `hostname` が既定（`Switch`）のまま、
      `show vlan brief` が VLAN1のみ（VLAN10/20/99が存在しない）
- [ ] PC1〜4 の [Desktop]→[IP Configuration] が **DHCP** に設定されている（IPは 0.0.0.0 のままで正常。
      DHCPサーバ未構築のため取得できないのが意図した状態）
- [ ] Server（SRV）が 198.51.100.8/24・GW 198.51.100.1 の静的設定になっており、
      [Desktop]→[Services]→HTTP が **On**
- [ ] `File > Save As` で `day20_start.pkt` として保存し、一度閉じて再度開いても
      上記の状態（IOS設定が空、PC/サーバ設定のみ投入済み）が保たれている

### 完成ファイル（`day20_answer.pkt`）のチェック（講師用見本の検収）

- [ ] `show ip ospf neighbor`（R1・R2）で相互に Full 状態のネイバーが1つ確認できる
- [ ] `show standby brief`（R1・R2）で VLAN10・VLAN20 とも R1 が Active、R2 が Standby
- [ ] PC1・PC3（VLAN10）、PC2・PC4（VLAN20）が DHCP でアドレスを取得できている（`ipconfig`）
- [ ] PC1 ⇔ PC3、PC2 ⇔ PC4（同一VLAN内）で ping 成功
- [ ] `PC1> ping 198.51.100.8` が成功（営業VLANはACLの制限を受けない）
- [ ] `PC2> ping 198.51.100.8` は失敗するが、Web Browser から `http://198.51.100.8` へのアクセスは成功
      （拡張ACL「KEIRI-TO-SRV」がHTTP以外を拒否している状態が正しい）
- [ ] `show ip nat translations`（R1）でPCの通信がポート番号付きで変換されている（PATの動作）
- [ ] `show access-lists`（R1・R2）でKEIRI-TO-SRVの permit/deny 行にヒットカウンタが記録されている
- [ ] `show port-security interface FastEthernet0/1`（SW1・SW2）が Secure-up、学習したMACアドレスが1件
- [ ] PC-Adm相当の端末が無いため、SSHは `PC1`または`PC3`（VLAN10、ACL制限なし）から
      `ssh -l admin 192.168.99.2` あるいは `192.168.10.1`（HSRP仮想IP経由ではなく実IP宛て）で接続確認
      （Telnetでは接続できない＝`transport input ssh` が効いていることも合わせて確認）
