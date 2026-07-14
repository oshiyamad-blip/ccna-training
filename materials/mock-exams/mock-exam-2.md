# CCNA 模試②

> 配置先: 04_講師用。設問部のみ実施日に配布 / 100問・120分・教材参照なし / 解答はコメントに Q1: A 形式
> 複数選択問題は全正解で得点（部分点なし）

この模試は6つのドメインを本試験同様に連続した通し番号（Q1〜Q100）で構成し、ドメインの境目を意識させずに総合力を測るものです。

## 設問

**Q1.** 8ポートのL2スイッチに、PCが5台と4ポートのハブが1台、直接接続されている。さらにそのハブには追加でPCが3台接続されている（ルータは存在しない）。このネットワーク全体のコリジョンドメイン数とブロードキャストドメイン数の組み合わせとして正しいものはどれか。
- A. コリジョンドメイン6、ブロードキャストドメイン1
- B. コリジョンドメイン9、ブロードキャストドメイン1
- C. コリジョンドメイン4、ブロードキャストドメイン1
- D. コリジョンドメイン6、ブロードキャストドメイン2

**Q2.** `PC1 --- R1 --- R2 --- PC2` という経路で通信している。R1とR2の間のリンク上でキャプチャしたフレームの宛先MACアドレスとして正しいものはどれか。
- A. R1のインタフェースのMACアドレス
- B. R2のインタフェースのMACアドレス
- C. PC1のMACアドレス
- D. PC2のMACアドレス

**Q3.** サーバへのpingが失敗する障害を調査している。`show ip interface brief` ではStatus・Protocolともにupだったが、`show interfaces gi0/1` のカウンタでCRCエラーが急増していた。OSIモデルに基づく下位層からの切り分けの観点で、この症状が示す最も可能性の高い原因の層はどれか。
- A. L7 アプリケーション層の設定ミス
- B. L4 ポート番号の不一致
- C. L1 物理層（ケーブル・デュプレックスなど）の問題
- D. L3 ルーティングの誤り

**Q4.** ルータに次の設定のみが入っている状態で、リモートPCからTelnetで接続すると、パスワードの入力を求められずにそのままユーザEXECモードに入ってしまった。原因として正しいものはどれか。
```
line vty 0 4
 password Cisco123
end
```
- A. `enable secret` が設定されていないため
- B. `transport input` が未設定のため
- C. `password` の後に `login local` が必須で、`login` だけでは不十分なため
- D. `login` コマンドが設定されていないため、パスワード入力が要求されない

**Q5.** ホスト名を `R1` に変更済みのルータで、SSHを有効化しようとして次のコマンドを実行したところエラーになった。原因として正しいものはどれか。
```
R1(config)# crypto key generate rsa
% Please define a domain-name first.
```
- A. `ip domain-name` の設定
- B. `hostname` の設定（デフォルトのRouterのまま）
- C. `ip ssh version 2` の設定
- D. `enable secret` の設定

**Q6.** 管理者がルータの `hostname` と `banner motd` を設定した直後、`copy running-config startup-config` を実行しないまま停電で機器が再起動した。再起動後の状態として正しいものはどれか。
- A. running-configの内容がそのまま保持される
- B. startup-config（前回保存時点の内容）がrunning-configに読み込まれ、設定した変更は失われる
- C. 設定は失われるが、banner motdの設定だけは保持される
- D. NVRAMが初期化され、工場出荷時の状態に戻る

**Q7.** 次の `show ip interface brief` の出力から、PCとの通信ができない原因として最も可能性が高いものはどれか。
```
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.10.1    YES manual administratively down down
GigabitEthernet0/1     unassigned      YES unset   up                    up
Vlan1                  unassigned      YES unset   administratively down down
```
- A. IPアドレスの設定が誤っている
- B. デュプレックスの不一致が発生している
- C. `no shutdown` が実行されていない
- D. ケーブルが未接続である

**Q8.** IPアドレス `10.10.14.200`、プレフィックス長 `/22` が与えられたとき、このホストが属するネットワークアドレスはどれか。
- A. 10.10.13.0
- B. 10.10.8.0
- C. 10.10.14.0
- D. 10.10.12.0

**Q9.** ある部署の必要ホスト数が45台である場合、割り当てるべき最も無駄の少ないプレフィックス長はどれか。
- A. /26
- B. /25
- C. /27
- D. /28

**Q10.** `198.51.100.0/24` を使って、次の要件をVLSMで設計する。「必要数の多い順に、隙間なく連続して割り当てる」という原則に従った場合、開発部門に割り当てるべきネットワークアドレスはどれか。

| 部門 | 必要ホスト数 | プレフィックス | ネットワークアドレス |
|---|---|---|---|
| 営業部 | 50 | /26 | 198.51.100.0 |
| 開発部 | 20 | /27 | ? |
| ゲスト用 | 8 | /28 | 未定 |
| WANリンク | 2 | /30 | 未定 |

- A. 198.51.100.32
- B. 198.51.100.64
- C. 198.51.100.96
- D. 198.51.100.128

**Q11.** PC-A（`172.20.5.94/27`）とPC-B（`172.20.5.97/27`）が直接通信するために必要な条件として正しいものはどれか。
- A. 両者は同一サブネットのため、スイッチのみで直接通信できる
- B. サブネットマスクを `/24` に変更すれば、同一スイッチのみで通信できる
- C. 両者は異なるサブネットに属するため、ルータ（L3機器）を経由する必要がある
- D. マスクの値は異なるがネットワークアドレスは同じなので、直接通信できる

**Q12.** ルータで次の `show ipv6 interface brief` を実行した。Serial0/0/0にGUAが表示されていない理由として最も適切なものはどれか。
```
R1# show ipv6 interface brief
GigabitEthernet0/0 [up/up]
    FE80::A8BB:CCFF:FE00:100
    2001:DB8:0:10::1
Serial0/0/0        [up/up]
    FE80::A8BB:CCFF:FE00:101
Vlan1              [administratively down/down]
    unassigned
```
- A. インタフェースがダウンしているため
- B. IPv6がグローバルに有効化されていないため
- C. show コマンドの表示範囲外であるため
- D. リンクローカルアドレスは自動生成されるが、GUAは静的設定やSLAACで別途構成する必要があり、Serial0/0/0には設定されていないため

**Q13.** ホストのMACアドレスが `0090.2711.6234`、ルータが広告するプレフィックスが `2001:db8:acad:1::/64` のとき、SLAAC（EUI-64方式）によって生成されるグローバルユニキャストアドレスとして正しいものはどれか。
- A. 2001:db8:acad:1:0290:27ff:fe11:6234
- B. 2001:db8:acad:1:0090:27ff:fe11:6234
- C. 2001:db8:acad:1::90:2711:6234
- D. 2001:db8:acad:1:0290:2711:fffe:6234

**Q14.** ルータで次のコマンドを実行した場合の挙動として正しいものはどれか。
```
R1# ping fe80::212:34ff:fe56:789a
```
- A. 送信元アドレスの入力を求められる
- B. 出力インタフェース名の入力を求められる（`Output Interface:`）
- C. 即座に疎通確認が行われ、結果がそのまま表示される
- D. リンクローカルアドレス宛のpingはサポートされておらずエラーになる

**Q15.** 4ポートのL2スイッチ（Gi0/1〜Gi0/4）のMACアドレステーブルが次の状態である。Gi0/4に接続されたPCが、テーブルに存在しない宛先MACアドレス宛のフレームを送信した場合、フラッディングされるポートはどれか。
```
SW1# show mac address-table
Vlan    Mac Address       Type        Ports
----    -----------       ----        -----
   1    0011.2233.4455    DYNAMIC     Gi0/1
   1    0011.2233.6677    DYNAMIC     Gi0/2
   1    0011.2233.8899    DYNAMIC     Gi0/3
```
- A. Gi0/1のみ
- B. Gi0/1〜Gi0/4のすべて
- C. Gi0/1〜Gi0/3
- D. どのポートにも転送されない

**Q16.** クライアント(192.168.1.10)がWebサーバ(192.168.1.20:80)へHTTPアクセスする際、次の4つのイベントが観測された。TCPコネクション確立からHTTPリクエスト送信までの正しい順序はどれか。
```
① クライアントからサーバへ SYN パケットを送信
② サーバからクライアントへ SYN, ACK パケットを送信
③ クライアントからサーバへ ACK パケットを送信
④ クライアントからサーバへ HTTP GETリクエストを送信
```
- A. ① → ② → ③ → ④
- B. ① → ③ → ② → ④
- C. ② → ① → ③ → ④
- D. ① → ② → ④ → ③

**Q17.** あるPCで次の `netstat` の出力が得られた。この出力から読み取れる内容として正しいものを2つ選べ。
```
C:\> netstat -n
  Proto  Local Address        Foreign Address      State
  TCP    192.168.1.5:51022    203.0.113.10:443     ESTABLISHED
  TCP    192.168.1.5:51023    203.0.113.20:22      ESTABLISHED
  UDP    192.168.1.5:68       0.0.0.0:*
```
- A. ローカルポート51022の通信は宛先ポート443向け、すなわちHTTPSである
- B. ローカルポート51023の通信は宛先ポート22向け、すなわちSSHである
- C. UDPポート68の通信はTFTPクライアントの動作を示す
- D. 2つのTCP通信はいずれも同一の宛先ホストに対して行われている

**Q18.** `show interfaces gi0/1` の出力が次のとおりだった。この症状の原因として最も可能性が高いものはどれか。
```
GigabitEthernet0/1 is up, line protocol is up
  Half-duplex, 100Mb/s, media type is 10/100/1000BaseTX
     0 output errors
     1230 late collisions
```
- A. VLANの不一致
- B. 対向機器とのデュプレックスミスマッチ（対向がfull固定、自側がauto→halfへフォールバック）
- C. ケーブル不良によるリンクダウン
- D. PoEの電力不足

**Q19.** Auto-MDIXに対応していない旧世代の機器同士を接続する場合、クロスケーブルが必要になる組み合わせを2つ選べ。
- A. PC — L2スイッチ
- B. L2スイッチ — ルータ
- C. ルータ — ルータ
- D. L2スイッチ — L2スイッチ

**Q20.** `show power inline` の出力が次のとおりだった。
```
SW1# show power inline
Interface  Admin  Oper   Power(W)  Device       Class
Gi0/1      auto   on     6.3       AIR-AP        3
Gi0/2      auto   on     25.5      IP-Phone      4
Gi0/3      auto   off    0.0       n/a           n/a
```
PoE規格と最大給電電力（PSE側）の組み合わせとして正しいものはどれか。Gi0/2への給電（25.5W）を賄うために必要な規格を判断する材料としても参照すること。
- A. 802.3af＝15.4W、802.3at＝30W、802.3bt Type3/4＝60〜90W
- B. 802.3af＝30W、802.3at＝15.4W、802.3bt Type3/4＝60〜90W
- C. 802.3af＝15.4W、802.3at＝60W、802.3bt Type3/4＝30W
- D. 802.3af＝90W、802.3at＝30W、802.3bt Type3/4＝15.4W

**Q21.** あるスイッチで次のコマンドを実行した。

```
SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/1, Fa0/2
10   SALES                            active    Fa0/3, Fa0/4
30   VLAN0030                         inactive  Fa0/9, Fa0/10
```

Fa0/9・Fa0/10 が通信できない原因と、復旧のために行うべき操作の組み合わせとして最も適切なものはどれか。
- A. VLAN 30 が `no vlan 30` などで削除されたため、割り当て済みのポートが非アクティブになっている。`vlan 30` を再作成すれば通信が復旧する
- B. VLAN 30 が自動作成された直後の状態であり、特に対処は不要である
- C. Fa0/9、Fa0/10 が物理的にリンクダウンしているため、ケーブルを交換する必要がある
- D. VLAN 30 がネイティブ VLAN として設定されているため、タグなしフレームしか通らない

**Q22.** IP 電話配下に PC を接続したポートで、次の出力が得られた。

```
SW1# show interfaces fastEthernet 0/5 switchport
Name: Fa0/5
Switchport: Enabled
Administrative Mode: static access
Operational Mode: static access
Access Mode VLAN: 10 (DATA)
Voice VLAN: 20 (VOICE)
```

このポートに設定されているコマンドの組み合わせとして正しいものはどれか。
- A. `switchport mode trunk` / `switchport trunk native vlan 10`
- B. `switchport mode access` / `switchport access vlan 10` / `switchport voice vlan 20`
- C. `switchport mode access` / `switchport access vlan 20` / `switchport voice vlan 10`
- D. `switchport access vlan 10` のみ（`switchport mode access` は不要）

**Q23.** 管理者が新しいスイッチで VLAN 4000 を作成しようとしたところ、正常に作成できた。この VLAN 4000 が属する範囲として正しいものはどれか。
- A. ノーマルレンジ(標準範囲)VLAN
- B. 予約 VLAN(FDDI/トークンリング用)
- C. エクステンデッドレンジ(拡張範囲)VLAN
- D. プライベート VLAN

**Q24.** トランクポートで次の出力が得られた。

```
SW1# show interfaces trunk

Port      Mode    Encapsulation  Status      Native vlan
Gi0/1     on      802.1q         trunking    1

Port      Vlans allowed on trunk
Gi0/1     1-4094

Port      Vlans allowed and active in management domain
Gi0/1     1,10,20,30

Port      Vlans in spanning tree forwarding state and not pruned
Gi0/1     1,10,20
```

VLAN30 が「active in management domain」には含まれているのに、最後の「spanning tree forwarding」の一覧には含まれていない理由として最も適切なものはどれか。
- A. VLAN30 がこのポートの許可 VLAN リストから除外されているため
- B. VLAN30 がまだ VLAN データベースに作成されていないため
- C. VLAN30 がこのトランクのネイティブ VLAN に設定されているため
- D. VLAN30 がこのトランクポート上で STP によりブロッキング状態になっているため

**Q25.** SW1 の Gi0/1 に `switchport mode trunk` を設定し、対向の SW2 の Gi0/1 は既定のまま（`dynamic auto`）にしてある。この 2 台の間のトランクの成立状況として正しいものはどれか。
- A. トランクが成立する
- B. トランクは成立せず、両方ともアクセスポートのままになる
- C. DTP の不整合により両ポートが err-disable になる
- D. SW2 側だけトランクになり、SW1 はアクセスポートのままになる

**Q26.** SW1 のログに次のメッセージが出力された。

```
%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1 (10), with SW2 GigabitEthernet0/1 (1).
```

原因と対処として最も適切なものはどれか。
- A. SW1 の Gi0/1 がアクセスモードになっている。`switchport mode trunk` に変更する
- B. SW1 と SW2 で Gi0/1 のネイティブ VLAN がそれぞれ 10 と 1 に設定されており不一致になっている。両端を同じネイティブ VLAN に揃える
- C. SW1 と SW2 で許可 VLAN リストが異なっている。`switchport trunk allowed vlan add` で揃える
- D. CDP のバージョンが SW1 と SW2 で異なっている。`lldp run` で LLDP に切り替える

**Q27.** VLAN ホッピング攻撃のうち「ダブルタギング」の手法に関する記述として正しいものはどれか。
- A. 攻撃者が DTP のネゴシエーションフレームを送りつけ、自分の接続ポートをスイッチにトランクと誤認識させる手法である
- B. 対策として `switchport nonegotiate` の設定が最も有効である
- C. 外側にネイティブ VLAN のタグ、内側に標的 VLAN のタグを二重に付与したフレームを送信する手法で、仕組み上、攻撃者からスイッチへ向かう片方向のみで成立する
- D. 標的 VLAN 側との間で双方向の通信が成立し、応答パケットも攻撃者に返ってくる

**Q28.** L3 スイッチで VLAN10・VLAN20 の SVI をそれぞれ設定したが、VLAN 間の通信ができない。次の出力が得られた。

```
L3SW# show ip interface brief
Interface        IP-Address       Status    Protocol
Vlan10            192.168.10.1     up        up
Vlan20            192.168.20.1     up        up

L3SW# show ip route
Codes: L - local, C - connected, S - static
Gateway of last resort is not set

L3SW#
```

VLAN10 の PC から自分のデフォルトゲートウェイ（192.168.10.1）への ping は成功するが、VLAN20 の PC への ping は失敗する。原因として最も可能性が高いものはどれか。
- A. VLAN20 の SVI に `no shutdown` が設定されていない
- B. VLAN20 が許可 VLAN リストから除外されている
- C. VLAN20 に所属するポートがすべてダウンしている
- D. グローバルコンフィギュレーションで `ip routing` が有効化されていない

**Q29.** Router-on-a-Stick 構成で、ネイティブ VLAN 用のサブインタフェースに次の設定を行った。

```
Router(config)# interface gigabitEthernet0/0.1
Router(config-subif)# encapsulation dot1Q 1 native
Router(config-subif)# ip address 192.168.1.1 255.255.255.0
```

`native` キーワードを付与する理由として正しいものはどれか。
- A. このサブインタフェースがトランクのネイティブ VLAN に対応することを明示し、タグなしフレームを正しく処理させるため
- B. VLAN1 をエクステンデッドレンジ VLAN として扱うため
- C. ルータ側で DTP を有効化するため
- D. VLAN1 を音声 VLAN として使用するため

**Q30.** L3 スイッチで次の出力が得られた。

```
L3SW# show ip interface brief
Interface   IP-Address       Status                  Protocol
Vlan10      192.168.10.1     up                      up
Vlan20      192.168.20.1     administratively down   down

L3SW# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- ---------------
20   SALES2                           active    Fa0/5, Fa0/6
```

Vlan20 が administratively down になっている原因として最も適切なものはどれか。
- A. VLAN20 に所属するポートがすべてダウンしている
- B. `interface vlan 20` に `no shutdown` が設定されていない
- C. VLAN20 が VLAN データベースに存在しない
- D. `ip routing` が無効になっている

**Q31.** L3 スイッチのポートに次の設定を行った。

```
L3SW1(config)# interface gigabitEthernet0/1
L3SW1(config-if)# no switchport
L3SW1(config-if)# ip address 10.1.1.1 255.255.255.252
L3SW1(config-if)# no shutdown
```

このインタフェースの説明として正しいものはどれか。
- A. VLAN に所属し、トランクポートとして動作する
- B. SVI として機能し、複数 VLAN 分のデフォルトゲートウェイになる
- C. VLAN に依存しない、ルータの物理インタフェースと同様に扱われるルーテッドポートである
- D. アクセスポートとして自動的に VLAN1 に割り当てられる

**Q32.** 次のトポロジで、SWroot はすでにルートブリッジに選出されている。

```
        SWroot
       /       \
 10Mbps(コスト100)  100Mbps(コスト19)
     /               \
   SW-A ──1Gbps(コスト4)── SW-B
```

SW-A のポート選出について正しいものはどれか。
- A. SWroot 直結ポートがルートポートになり、SW-B 経由のポートがブロッキングになる
- B. SWroot 直結ポートと SW-B 経由のポートの両方がフォワーディング状態になる
- C. SWroot 直結ポートが指定ポート(DP)になる
- D. SW-B 経由のポート（SW-B から SWroot までのコスト19に、SW-A~SW-B間のコスト4を加えた合計23）がルートポートになり、SWroot 直結ポート（コスト100）は非指定(ブロッキング)になる

**Q33.** SW2 で次の出力が得られた。

```
SW2# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     0011.2233.4455
             Cost        19
             Port        24 (GigabitEthernet0/1)

  Bridge ID  Priority    32778 (priority 32768 sys-id-ext 10)
             Address     00aa.bbcc.ddee
```

この出力から読み取れる内容として正しいものはどれか。
- A. SW2 はルートブリッジではない(Root ID と Bridge ID のアドレスが異なるため)。Gi0/1 がルートポートとして機能している
- B. SW2 自身が VLAN10 のルートブリッジである(Root ID と Bridge ID が一致するため)
- C. Root ID のコストが 19 であることから、SW2 はルートブリッジに直結している
- D. SW2 のブリッジプライオリティは 24586 である

**Q34.** あるトポロジで、SW1-SW2 間のリンク障害を SW3 が直接検知できず、Max Age のタイムアウトを待ってから新しいトポロジへ収束した。このとき、SW3 の該当ポートが Blocking から最終的に Forwarding に至るまでに経由する状態の順序として正しいものはどれか。
- A. Blocking → Listening → Learning → Forwarding
- B. Blocking → Learning → Listening → Forwarding
- C. Blocking → Forwarding（Listening・Learning を経ない）
- D. Listening → Blocking → Learning → Forwarding

**Q35.** LACP で構成した EtherChannel で次の出力が得られた。

```
SW1# show etherchannel summary
Flags: D - down  P - bundled in port-channel  I - stand-alone  S - suspended
       U - in use  f - failed to allocate aggregator

Group  Port-channel  Protocol   Ports
------+-------------+-----------+-----------------------------------------
1      Po1(SU)          LACP    Fa0/1(P)  Fa0/2(I)
```

Fa0/2 が `(I)`（スタンドアロン）と表示され、EtherChannel にバンドルされていない。考えられる原因として適切なものを2つ選べ。
- A. Fa0/1 と Fa0/2 で回線速度（speed）の設定が一致していないため
- B. Fa0/1 と Fa0/2 でデュプレックスの設定が一致していないため
- C. Po1 インタフェースが `shutdown` されているため
- D. LACP ではなく PAgP を使用しているため

**Q36.** L3 スイッチで L3 EtherChannel を構成したい。次の設定の空欄に入るべきコマンドはどれか。

```
L3SW(config)# interface range gigabitEthernet0/1-2
L3SW(config-if-range)# no switchport
L3SW(config-if-range)# channel-group 5 mode active
L3SW(config-if-range)# exit
L3SW(config)# interface port-channel 5
L3SW(config-if)# ［　　　　　］
L3SW(config-if)# ip address 10.5.5.1 255.255.255.252
```

- A. `switchport mode trunk`
- B. `switchport access vlan 5`
- C. `encapsulation dot1q 5`
- D. `no switchport`

**Q37.** WLC 上で VLAN30 に所属する無線クライアントを収容する WLAN を作成したい。事前に用意しておく必要があるインタフェース種別はどれか。
- A. dynamic インタフェース
- B. management インタフェース
- C. virtual インタフェース
- D. native インタフェース

**Q38.** WAN 回線越しの支店に AP を設置する。本社の WLC との CAPWAP 接続が切れても、支店内の無線クライアント同士の通信をローカルスイッチングで継続させたい場合に設定すべき AP モードはどれか。
- A. Local
- B. FlexConnect
- C. Monitor
- D. Sniffer

**Q39.** SW1 で次のコマンドを実行した。

```
SW1# show cdp neighbors detail
-------------------------
Device ID: SW2
Entry address(es):
  IP address: 192.168.1.2
Platform: cisco WS-C2960-24TT-L,  Capabilities: Switch IGMP
Interface: GigabitEthernet0/1,  Port ID (outgoing port): GigabitEthernet0/2
Holdtime : 156 sec
Version :
Cisco IOS Software, C2960 Software...
```

この出力から読み取れないものを2つ選べ。
- A. 隣接機器の IP アドレス
- B. 隣接機器の VTP モード
- C. 隣接機器の機種(プラットフォーム)
- D. 隣接機器のインタフェースの MAC アドレス

**Q40.** ある企業が無線 LAN を WPA2-Personal から WPA3-Personal へ移行することにした。その主な理由として正しいものを2つ選べ。
- A. PSK の鍵交換方式を 4-way ハンドシェイクから SAE(Simultaneous Authentication of Equals) に置き換えるため
- B. SAE の採用により、辞書攻撃への耐性と前方秘匿性(Forward Secrecy)が向上するため
- C. 暗号化方式を TKIP から CCMP(AES) に変更するため
- D. 802.1X/EAP による RADIUS 認証を必須にするため

**Q41.** Router-on-a-Stick構成のルータで `show running-config` を確認したところ、次のように表示された。

```
interface GigabitEthernet0/0.10
 ip address 192.168.10.1 255.255.255.0
!
interface GigabitEthernet0/0.20
 encapsulation dot1q 20
 ip address 192.168.20.1 255.255.255.0
```

VLAN20の端末はゲートウェイに到達できるが、VLAN10の端末はゲートウェイ(192.168.10.1)に到達できない。原因として最も適切なものはどれか。
- A. VLAN10のサブインタフェースに`encapsulation dot1q`コマンドが設定されておらず、タグ付きフレームをVLAN10として処理できていない
- B. VLAN10のサブネットマスクがVLAN20と異なっている
- C. スイッチ側のポートがトランクになっていない
- D. ネイティブVLANの不一致が発生している

**Q42.** Catalyst 3560でRouter-on-a-Stick用のスイッチ側ポートに `switchport mode trunk` を投入したところ、次のエラーが表示された。

```
Command rejected: An interface whose trunk encapsulation is Auto
can not be configured to trunk mode
```

このエラーを解消するために、`switchport mode trunk` の前に実行すべきコマンドはどれか。
- A. `switchport nonegotiate`
- B. `switchport access vlan 1`
- C. `switchport trunk encapsulation dot1q`
- D. `switchport trunk native vlan 1`

**Q43.** L3スイッチでVLAN10・VLAN20を作成し、Gi0/1をルータへのトランクポートとして設定した。`show vlan brief` を実行したところ、VLAN10・VLAN20のいずれの行にもGi0/1が表示されなかった。この結果に対する説明として正しいものはどれか。
- A. トランクポートの設定に誤りがあり、実際にはアクセスポートのままになっている
- B. VLANデータベースにVLAN10・VLAN20が作成されていない
- C. スパニングツリーによりGi0/1がブロッキング状態になっている
- D. `show vlan brief` はトランクポートを表示しない仕様であり、トランクの状態確認には`show interfaces trunk`を使う

**Q44.** L3スイッチで `ip routing` を有効化し、`interface vlan 30` を作成して `ip address` と `no shutdown` を設定した。しかし `show ip interface brief` では Vlan30 が `down/down` のままである。`show vlan brief` を確認するとVLAN30自体は作成済みだが、所属するアクセスポートが1つも存在しなかった。この状況の説明として正しいものはどれか。
- A. SVIはVLANに所属するポートが1つ以上upしていないとup/upにならない
- B. `ip routing` の設定順序が誤っている
- C. SVIにはデフォルトゲートウェイの役割を持たせられない
- D. VLAN30のVLAN IDが拡張範囲であるため機能しない

**Q45.** L3スイッチ2台(SW1・SW2)を1対1でアップリンク接続する。SW1側のGi1/0/1に次の設定を行った。

```
interface GigabitEthernet1/0/1
 no switchport
 ip address 10.0.0.1 255.255.255.252
 no shutdown
```

SW2側のGi1/0/1には`switchport`設定のまま(アクセスポート、VLAN1所属)でIPアドレスを付与しようとしたが `ip address` コマンドが受け付けられなかった。SW2側の対処として正しいものはどれか。
- A. SW2側にVLAN1のSVIを作成しIPアドレスを付与する
- B. SW2側のGi1/0/1をトランクポートに変更する
- C. SW2側のGi1/0/1にも `no switchport` を実行してからIPアドレスを付与する
- D. SW2側で `ip routing` を無効化する

**Q46.** `show ip route 10.20.30.0` を実行したところ、次のように表示された。

```
Routing entry for 10.20.30.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.1.1.2

Routing entry for 10.20.30.0/24
  Known via "rip", distance 120, metric 2
  Routing Descriptor Blocks:
  * 10.1.1.6, from 10.1.1.6, 00:00:12 ago
```

同一プレフィックス長で複数の経路情報が存在するとき、ルーティングテーブルに実際に登録されるのはどちらか。
- A. RIP経由の経路。メトリックがより小さいため
- B. 両経路が等コストロードバランシングされる
- C. 後から学習された経路が優先される
- D. 静的ルート経由の経路。ADが1でRIPの120より小さいため

**Q47.** R1に次の静的ルートを設定した。

```
R1(config)# ip route 172.16.30.0 255.255.255.0 10.0.23.3
```

設定直後は `show ip route static` にこの経路が表示されていたが、ネクストホップ`10.0.23.3`へ至るリンクで障害が発生した後、`show ip route static` からこの経路が消えた。この現象の説明として正しいものはどれか。
- A. AD値が自動的に255へ変更されテーブル外になった
- B. ネクストホップ指定の静的ルートは再帰ルックアップに失敗するとルーティングテーブルから自動的に外れる
- C. 静的ルートは物理障害の影響を受けない設計のため、この現象は発生しない
- D. ルータが自動的にRIPへフォールバックした

**Q48.** プライマリ経路がEIGRP(内部、AD90)で学習されている宛先に対し、リンク障害時のみ有効になるフローティングスタティックのバックアップ経路を設定したい。AD値として適切なものはどれか。
- A. 90
- B. 1
- C. 95
- D. 255

**Q49.** 支店ルータ配下の `192.168.40.0/24` サブネットの大半は本社ルータR1経由(`ip route 192.168.40.0 255.255.255.0 <R1>`)で問題ないが、そのサブネット内のサーバ `192.168.40.50` だけはバックアップ回線経由のR2を通したい。この要件を実現する適切な静的ルート設定はどれか。
- A. `ip route 192.168.40.0 255.255.255.0 <R2>` を追加で設定する
- B. `ip route 192.168.40.0 255.255.254.0 <R2>` を設定する
- C. デフォルトルートを `<R2>` 向けに変更する
- D. `ip route 192.168.40.50 255.255.255.255 <R2>` というホストルートを追加で設定する

**Q50.** イーサネットセグメント(複数の対向機器が存在しうる)に対して、R1で次の静的ルートを設定した。

```
R1(config)# ip route 192.168.60.0 255.255.255.0 GigabitEthernet0/1
```

その後、宛先 `192.168.60.10` へのpingで応答が遅く不安定になり、`debug ip packet` でパケットごとにARP要求が繰り返し送出されていることが確認された。原因と対処として正しいものはどれか。
- A. ネクストホップIPが未指定のためプロキシARPに依存した非効率な処理が発生している。ネクストホップIPまたは完全指定に変更する
- B. サブネットマスクの指定が誤っている。/24を/25に修正する
- C. GigabitEthernet0/1がシャットダウンされている
- D. AD値が255になっているため経路がテーブルに登録されていない

**Q51.** `show ipv6 route` の抜粋は次のとおりである。

```
S*  ::/0 [1/0]
     via 2001:DB8:12::2
```

この経路について正しい説明はどれか。
- A. メトリックが1で、ADは0である
- B. ADは1で、IPv4の`0.0.0.0/0`に相当するIPv6デフォルトルートである
- C. この経路はOSPFv3から学習された
- D. `::/0`は特定のホスト1台のみを示すホストルートである

**Q52.** PC-A(R1配下、10.1.1.0/24)からPC-B(R2配下、10.2.2.0/24)へのpingは成功するが、PC-BからPC-Aへのpingは失敗する。R1・R2の設定抜粋は次のとおり。

```
R1(config)# ip route 10.2.2.0 255.255.255.0 10.0.12.2
R2(config)# ip route 10.3.3.0 255.255.255.0 10.0.12.1
```

この症状の原因として正しいものはどれか。
- A. R1のネクストホップIPアドレスの指定が誤っている
- B. R1・R2間のリンクがアクセスポートになっている
- C. R2に10.1.1.0/24宛の戻り経路の静的ルートが設定されていない(誤って10.3.3.0/24向けに設定されている)
- D. PC-AとPC-Bのサブネットマスクが異なっている

**Q53.** マルチアクセスセグメントに4台のルータ(R1・R2・R3・R4)が接続されている。R4で `show ip ospf neighbor` を実行すると次のとおり表示された。

```
Neighbor ID     Pri   State           Address
1.1.1.1           1   FULL/DR         10.0.1.1
2.2.2.2           1   FULL/BDR        10.0.1.2
3.3.3.3           1   2WAY/DROTHER    10.0.1.3
```

この出力から判断できる、R4自身の役割として最も適切なものはどれか。
- A. R4はDRである
- B. R4はBDRである
- C. この出力だけではR4の役割は判定できない
- D. R4はDROTHERである

**Q54.** `router-id`コマンドは未使用。ルータには次のインタフェースが稼働している。

```
Loopback0             1.1.1.1
Loopback1             2.2.2.2
GigabitEthernet0/0    10.0.0.1
GigabitEthernet0/1    10.0.1.1
```

OSPFプロセス起動時に採用されるRouter IDはどれか。
- A. 2.2.2.2
- B. 1.1.1.1
- C. 10.0.0.1
- D. 10.0.1.1

**Q55.** `10.5.6.8/29` をarea 0に参加させる場合のワイルドカードマスクとして正しいものはどれか。
- A. 0.0.0.3
- B. 0.0.0.7
- C. 0.0.0.15
- D. 255.255.255.248

**Q56.** R1からR4への経路として次の2つがOSPFで計算されている(参照帯域幅は既定値のまま)。

- 経路①: R1-R2間GigabitEthernet(コスト1) → R2-R4間FastEthernet(コスト1)
- 経路②: R1-R3間Serial回線(コスト64) → R3-R4間GigabitEthernet(コスト1)

R1が実際に採用する経路と総コストの組み合わせとして正しいものはどれか。
- A. 経路②、総コスト65
- B. 両経路で等コストロードバランシングされる
- C. 経路①、総コスト2
- D. 経路①、総コスト1

**Q57.** `show ip ospf interface brief` の抜粋は次のとおり。

```
Interface   PID  Area   IP Address    Cost  State  Nbrs F/C
Gi0/0        1    0     10.0.12.1     1     P2P    1/1
Gi0/2        1    0     192.168.10.1  1     DR     0/0
```

Gi0/2は端末を収容するLAN側インタフェースである。この出力とOSPFの仕様から判断できることとして正しいものはどれか。
- A. Gi0/2はpassive-interfaceに設定されており、192.168.10.0/24はOSPFで広告されない
- B. Gi0/2はOSPFプロセスに参加していない
- C. Gi0/2のエリア設定が誤っている
- D. Gi0/2はpassive-interfaceに設定されているが、192.168.10.0/24はOSPFで広告され続ける

**Q58.** `show ip protocols` の抜粋は次のとおり。

```
Routing Protocol is "ospf 1"
  Router ID 4.4.4.4
  ...
  Passive Interface(s):
    GigabitEthernet0/2
  Routing for Networks:
    10.0.12.0/24
    192.168.10.0/24
```

この出力から読み取れることとして正しいものはどれか。
- A. 192.168.10.0/24はOSPFに参加しているが、GigabitEthernet0/2経由でのネイバー形成は行われない
- B. GigabitEthernet0/2はOSPFに一切参加していないインタフェースである
- C. Router ID 4.4.4.4はGigabitEthernet0/2のIPアドレスから決定された
- D. 10.0.12.0/24はネイバーが存在しないため経路として広告されない

**Q59.** マルチアクセスセグメント上のR3に `ip ospf priority 0` を設定した。R1・R2はプライオリティを既定値のまま使用している。R3のRouter IDが3台の中で最も大きい場合、選出結果として正しいものはどれか。
- A. R3のRouter IDが最大のため、R3がDRに選出される
- B. R3はプライオリティ0のため選出対象から除外され、常にDROTHERになる
- C. R3はBDRに選出される
- D. プライオリティ0は無視され、既定値1として扱われる

**Q60.** `show ip ospf neighbor` を実行すると次のように表示され、数分待っても状態が変化しない。

```
Neighbor ID     Pri   State           Address
2.2.2.2           1   INIT/-          10.0.12.2
```

最も疑うべき原因はどれか。
- A. MTUの不一致
- B. エリアIDの不一致
- C. Hello/Deadタイマーの不一致
- D. 認証パスワードの不一致

**Q61.** R1-R2間のバックボーンリンク(10.0.12.0/30、R1側IP: 10.0.12.1)でOSPFネイバーが全く形成されない。R1の設定抜粋は次のとおり。

```
router ospf 1
 network 10.0.12.4 0.0.0.3 area 0
 network 192.168.1.0 0.0.0.255 area 0
```

`show ip ospf interface brief` を確認すると、Gi0/0(10.0.12.1)がOSPFインタフェース一覧に表示されていない。原因として正しいものはどれか。
- A. Gi0/0がpassive-interfaceに設定されている
- B. area 0の記述が誤っている
- C. Hello/Deadタイマーが不一致である
- D. `network`文のネットワークアドレスが誤っており、Gi0/0のIPアドレスと一致していない

**Q62.** ASBRの設定とルーティングテーブルは次のとおり。

```
ASBR(config)# router ospf 1
ASBR(config-router)# default-information originate
ASBR# show ip route static
(該当なし、静的デフォルトルートは設定されていない)
```

配下のルータで `show ip route` を確認しても `O*E2 0.0.0.0/0` が学習されていない。原因として正しいものはどれか。
- A. ASBR自身にデフォルトルートが存在せず、`always`キーワードも付けていないため広告されない
- B. `default-information originate`はEIGRPでのみ有効なコマンドである
- C. OSPFはデフォルトルートを配布できないプロトコルである
- D. 受信側ルータでOSPFプロセスが起動していない

**Q63.** R1(priority 105)とR2(priority 120、既定のプリエンプト無効のまま)がHSRPグループ1を構成している。R2にのみ `standby 1 preempt` を設定した。運用上、まずR1のみを起動してActiveにした後、しばらくしてR2を起動した。最終的にActiveになるルータはどれか。
- A. R1のまま(R2はプリエンプトを持つが自動的にActiveを奪わない)
- B. R2(プリエンプトが有効かつR1よりプライオリティが高いため)
- C. R1・R2ともにActiveになり二重化障害となる
- D. 起動順序に関わらず、常にプライオリティが低いR1がActiveになる

**Q64.** あるFHRPグループでは、クライアントのARP要求に対してクライアントごとに異なる仮想MACアドレスが返され、複数台のルータが同時にトラフィックを転送していることが `show` コマンドの出力から確認できた。この動作をしているプロトコルはどれか。
- A. HSRP
- B. VRRP
- C. GLBP
- D. STP

**Q65.** R1(Active、priority既定100、`standby 1 track GigabitEthernet0/1 30`設定済み)とR2(Standby、priority既定100のまま、トラッキングなし)がHSRPを構成している。R2には`standby 1 preempt`が設定されていない。R1のGigabitEthernet0/1(WAN側)がdownし、R1のプライオリティが70に下がった。この後の動作として正しいものはどれか。
- A. R2のプライオリティ(100)がR1(70)を上回るため、R2がプリエンプトなしでも自動的にActiveへ切り替わる
- B. R2にプリエンプトが設定されていないため、プライオリティが逆転してもR2は自動的にActiveへ切り替わらず、R1がActiveのままになる
- C. トラッキングの設定自体が無効なため、R1のプライオリティは70に変化しない
- D. HSRPではトラッキングとプリエンプトを併用できない

**Q66.** 支店ルータで次の設定が入っている。PC（192.168.10.100）が外部サーバ（198.51.100.20）へアクセスした際、`show ip nat translations` に記録される **inside global** アドレスはどれか。

```
interface GigabitEthernet0/0
 ip address 192.168.10.1 255.255.255.0
 ip nat inside
!
interface GigabitEthernet0/1
 ip address 203.0.113.1 255.255.255.0
 ip nat outside
!
access-list 1 permit 192.168.10.0 0.0.0.255
ip nat inside source list 1 interface GigabitEthernet0/1 overload
```
- A. 192.168.10.1
- B. 203.0.113.1（ポート番号付き）
- C. 192.168.10.100
- D. 198.51.100.20

**Q67.** ルータで `show ip nat statistics` を実行したところ、動的NAT（プール使用、overloadなし）で「Pool NATPOOL: total addresses 5, allocated 5 (100%), misses 12」という出力が得られた。この状況の解釈と対処として最も適切なものはどれか。
- A. missesはACLに一致しなかったパケット数であり、NATの動作には影響しない
- B. allocatedが100%でもoverloadなしのNATはポート番号で多重化されるため問題ない
- C. missesはTTL超過によるパケット破棄を意味し、NATの設定とは無関係である
- D. プールのアドレスがすべて使用中で新規の変換要求が失敗している。プールのアドレス数を増やすかoverloadに変更する

**Q68.** DHCPサーバとして稼働しているルータ配下で、ある固定IP設定のプリンタと、DHCPで自動割り当てされたPCのIPアドレスが偶然重複し、両者の通信が不安定になっていることが疑われる。この重複（コンフリクト）の検出履歴をルータ上で確認するために実行すべきコマンドはどれか。
- A. `show ip dhcp conflict`
- B. `show ip dhcp binding`
- C. `show ip dhcp pool`
- D. `show ip interface brief`

**Q69.** ルータの `show ip dhcp binding` を実行したところ、以下の出力が得られた。この出力から読み取れる内容として正しいものはどれか。

```
IP address       Client-ID/Hardware address    Lease expiration       Type
192.168.1.11     0063.6973.636f.2d31            Jul 20 2026 08:00 AM   Automatic
192.168.1.12     0063.6973.636f.2d32            Jul 20 2026 08:00 AM   Automatic
```
- A. このルータはDHCPリレーとしてのみ動作しており、実際のDHCPサーバは別の機器である
- B. 表示されているリースはすべて静的に手動割り当てされたものである
- C. 192.168.1.10以下のアドレスはDHCPプールの対象外として除外設定されている可能性が高い
- D. このプールのネットワークアドレスは192.168.1.11/24である

**Q70.** 社内のPCで `nslookup mail.example.com` を実行すると正しくAレコードが解決できるが、外部の取引先から自社宛にメールが送信されると宛先不明で戻ってくる（配送されない）。DNS設定の不備として最も疑われるものはどれか。
- A. mail.example.comのAレコードが未設定
- B. example.comドメインのMXレコードが未設定、または誤ったホストを指している
- C. mail.example.comのPTRレコードが未設定
- D. ルータの`ip domain-lookup`が無効化されている

**Q71.** ルータのVTY回線に次の設定のみを行った。

```
line vty 0 4
 transport input ssh
```

SSHクライアントから接続を試みると `% Password required, but none set` というメッセージが表示され、ログインできない。原因として最も適切なものはどれか。
- A. `crypto key generate rsa` を実行していないため、SSHセッション自体が確立できない
- B. `ip domain-name` が未設定のため
- C. `transport input ssh` ではなく `transport input all` にする必要があるため
- D. `login` または `login local` と、それに対応する認証情報（ローカルユーザ、またはVTYパスワード）が設定されていないため

**Q72.** ルータで `show ntp associations` を実行したところ、次の出力が得られた。この状態に関する説明として正しいものはどれか。

```
  address         ref clock       st   when   poll   reach   delay   offset   disp
  10.1.1.1        127.127.1.1      4     45     64     377    1.2     0.05    0.9
  10.1.1.2        .INIT.          16      -     64       0    0.0     0.0     0.0
```
- A. `10.1.1.1`はstratum 4で応答があり同期の候補になっているが、`10.1.1.2`はまだ到達・同期できていない
- B. 2台の候補のうち、`10.1.1.1`との同期は失敗しており、`10.1.1.2`と同期している
- C. stratumの値が大きい`10.1.1.2`の方が基準時刻源に近いため優先的に選ばれる
- D. 両方とも`reach`が0でないため、すでに同期が完了している

**Q73.** ネットワーク監視システム（NMS）がSNMPでルータを定期的にポーリングしているが、ある日を境にインタフェース障害の通知（Trap）だけが届かなくなった。ポーリングによる情報取得（Get）は引き続き成功している。この状況から最も疑われる原因を2つ選べ。
- A. ルータの`snmp-server community`が削除された
- B. NMS側でTrapを受信するUDP 162宛の通信がファイアウォールでブロックされた
- C. ルータの`snmp-server host`設定が失われた
- D. NMSとルータの時刻がずれてNTP同期が外れた

**Q74.** ルータの `show logging` を実行したところ、以下のような設定情報が表示された。このルータが外部Syslogサーバへ送信するメッセージの範囲として正しいものはどれか。

```
Syslog logging: enabled
    Console logging: level debugging, ...
    Trap logging: level warning, ...
        Logging to 192.168.1.50, ...
```
- A. severity 4（Warning）のメッセージのみを送信する
- B. severity 0（Emergency）から4（Warning）までのメッセージを送信する
- C. severity 4（Warning）から7（Debugging）までのメッセージを送信する
- D. severity 0から7まですべてのメッセージを送信する

**Q75.** 拠点間のWAN回線（契約帯域10Mbps）で、バースト的に送信されるデータ通信がリンクを一時的に飽和させ、同じリンクを使う音声通話にジッタが発生している。この状況で、データ通信の送出レートを10Mbps以下になめらかに平滑化し、バーストによる瞬間的な輻輳を緩和したい。適用すべきQoSの仕組みとして最も適切なものはどれか。
- A. ポリシング（Policing）で超過分を即座に破棄する
- B. マーキングでDSCPをすべてEF（46）に書き換える
- C. トラストバウンダリをコアスイッチまで拡張する
- D. シェーピング（Shaping）で超過分をバッファに貯めて送出を遅延させる

**Q76.** 総務部の正社員が、業務用の顧客名簿ファイルを誤って個人のフリーメールアドレスへ送信してしまった。悪意の有無に関わらず、この種の事案が「境界防御（ファイアウォールなど）だけでは検知・防止が難しい」とされる理由に最も関連する用語はどれか。
- A. 内部脅威（Insider Threat）
- B. 外部脅威
- C. DDoS攻撃
- D. リフレクション攻撃

**Q77.** 同一VLAN上にPC-A、PC-B、攻撃者端末が接続されている。攻撃者端末は「デフォルトゲートウェイのIPアドレスに対応するMACアドレスは自分である」という偽のARP応答を継続的に送信し、PC-AとPC-Bの通信を自分経由で中継しながら盗聴している。この攻撃の名称はどれか。
- A. DHCPスプーフィング
- B. ARPスプーフィング（ARPポイズニング）によるMITM
- C. MACフラッディング
- D. VLANホッピング

**Q78.** ノートPC ──（有線LAN）── アクセススイッチ ── RADIUSサーバ、という構成で802.1Xポートベース認証を導入した。ポートは認証が完了するまで通常のトラフィックを許可しない。この構成において、アクセススイッチが果たす役割の説明として正しいものを2つ選べ。
- A. 認証が完了するまで、そのポート経由の通常のトラフィックを制限するオーセンティケータとして機能する
- B. サプリカントとRADIUSサーバの間でEAPメッセージを中継するオーセンティケータとして機能する
- C. パスワード等の認証情報を保持し、認証の可否を最終的に判定する認証サーバとして機能する
- D. 認証情報を送信するサプリカントとして機能する

**Q79.** TACACS+サーバでAAAを構成したルータで、次の3つの事象が発生した。

```
① あるオペレータがユーザー名とパスワードを入力し、ログインに成功した
② そのオペレータが `configure terminal` を実行しようとしたところ、
   ルータから "Command authorization failed" と表示され拒否された
③ ログイン後にオペレータが実行したコマンド操作の記録が、
   一定間隔でTACACS+サーバへ送信されている
```

①〜③とAAAの要素（認証／認可／アカウンティング）の対応として正しい組み合わせはどれか。
- A. ①認証　②認可　③アカウンティング
- B. ①認可　②認証　③アカウンティング
- C. ①認証　②アカウンティング　③認可
- D. ①アカウンティング　②認可　③認証

**Q80.** あるWebサービスのログインで、パスワードの入力に加えて「合言葉（秘密の質問）」の回答を要求される。この構成に関する説明として正しいものはどれか。
- A. パスワードと秘密の質問はどちらも「知識」要素であるため、多要素認証（MFA）には該当しない
- B. 秘密の質問は「所持」要素に分類されるため、この構成はMFAに該当する
- C. 要求する要素の数が2つであるため、種類に関わらずMFAに該当する
- D. 秘密の質問は「生体」要素に分類されるため、この構成はMFAに該当する

**Q81.** `show running-config` に次の行があった。
```
enable secret 9 $9$k3hN...(省略)...
```
この設定に関する説明として正しいものはどれか。
- A. Type 9はservice password-encryptionによるType 7の難読化であり、専用ツールで容易に復号できる
- B. Type 9はscryptベースの強いハッシュ方式であり、`enable secret`は依然として安全に保護されている
- C. `enable password`が優先されているため、このenable secretの行は無効である
- D. Type 9は平文保存を意味するため、ただちに再設定が必要である

**Q82.** メンテナンス作業中のエンジニアが、動作確認のためVTYへのログインをわざと3回失敗させたところ、`login block-for 60 attempts 3 within 30` の設定により以降60秒間、自分自身を含む全てのログインがブロックされ、リモートから一切操作できなくなった。今後同様の事故を避けるために事前に行っておくべき対策として最も適切なものはどれか。
- A. `login block-for` を削除し、ブルートフォース対策自体を無効化しておく
- B. `exec-timeout 0 0` を設定し、タイムアウトを無効化しておく
- C. `login quiet-mode access-class <管理用ACL>` を設定し、管理サブネットからのアクセスをブロック対象から除外しておく
- D. `service password-encryption` を設定し、パスワードを難読化しておく

**Q83.** 拡張ACL `SALES-TO-SRV` をルータのin方向に適用し、経理VLANからサーバへのHTTP通信のみを許可する設計にしたはずだが、経理VLANのユーザーから「サーバのWebページが開けない」と報告があった。`show access-lists SALES-TO-SRV` の出力は次のとおり。
```
Extended IP access list SALES-TO-SRV
    10 permit tcp 192.168.10.0 0.0.0.255 host 192.168.30.100 eq 80 (0 matches)
    20 deny ip any any log (48 matches)
```
この出力から読み取れる最も可能性の高い原因はどれか。
- A. ACLがそもそもインタフェースに適用されていない
- B. hit counterは参考情報であり、実際の通信可否とは無関係である
- C. deny any logの48 matchesは正常な動作であり対応不要である
- D. 経理VLANからの通信が10行目の条件に一致せず、20行目のdeny any logで破棄されている。送信元/宛先アドレスやポート指定に誤りがないか確認すべき

**Q84.** 支社ネットワークとして 192.168.4.0/24, 192.168.5.0/24, 192.168.6.0/24, 192.168.7.0/24 の4つのサブネットが使われている。これら4つをまとめて1行のACEで一致させたい場合、正しい送信元指定はどれか。
- A. 192.168.4.0 0.0.3.255
- B. 192.168.4.0 0.0.7.255
- C. 192.168.0.0 0.0.3.255
- D. 192.168.4.0 0.0.1.255

**Q85.** 「社内端末(192.168.10.0/24)からサーバVLAN(192.168.30.0/24)へのTelnetを拒否したい」という意図で、次のACEを作成し適用した。
```
access-list 110 deny tcp 192.168.30.0 0.0.0.255 192.168.10.0 0.0.0.255 eq 23
access-list 110 permit ip any any
```
適用後、社内端末からサーバVLANへのTelnetが拒否されず、そのまま通ってしまった。原因として正しいものはどれか。
- A. ACLの評価順序が誤っており、permit行を先に書くべきだった
- B. 送信元と宛先の指定が意図と逆になっている（送信元にサーバVLAN、宛先に社内端末を指定してしまっている）ため、社内端末発のTelnetには一致しない
- C. ワイルドカードマスクが誤っており、0.0.0.255ではなく255.255.255.0とすべきだった
- D. `eq 23`はUDPポート指定のためTCPには使用できない

**Q86.** ルータの管理面へのSSHアクセスを`192.168.99.0/24`のみに制限する設計とした。`show running-config` の該当部分は次のとおり。
```
line vty 0 4
 access-class MGMT-VTY in
 transport input ssh
line vty 5 15
 transport input ssh
```
このルータの管理アクセス制限の状態として正しいものはどれか。
- A. VTY 0〜15すべてに`access-class`が適用されており、問題はない
- B. `transport input ssh`が設定されている回線には自動的に`access-class`も継承されるため、問題はない
- C. VTY 0〜4は`MGMT-VTY`により送信元が制限されるが、VTY 5〜15には`access-class`が設定されておらず、192.168.99.0/24以外からもSSH接続が可能になってしまう
- D. VTY 5〜15は`access-class`が無いため、SSHそのものが利用できない

**Q87.** `show port-security interface fa0/5` の出力は次のとおり。
```
Port Security              : Enabled
Port Status                : Secure-shutdown
Violation Mode              : Shutdown
Maximum MAC Addresses       : 1
Total MAC Addresses         : 1
Security Violation Count    : 1
```
この状態に関する説明と復旧方法の組み合わせとして正しいものはどれか。
- A. ポートはリンクダウン状態（未接続）であり、ケーブルを接続すれば自動的に復旧する
- B. protectモードのため通信は継続しており、復旧作業は不要である
- C. Security Violation Countが1であることから、まだ違反は発生していない
- D. 許可数を超えるMACアドレスを検出しerr-disabledに遷移した状態であり、`shutdown`→`no shutdown`または`errdisable recovery`の設定で復旧させる必要がある

**Q88.** 攻撃者が偽の大量のDHCPDISCOVERメッセージをアクセスポートから送りつけ、DHCPサーバのアドレスプールを枯渇させようとしている（DHCP枯渇攻撃）。このポートに対してDHCPスヌーピングと併せて設定すべきものを2つ選べ。
- A. `ip dhcp snooping limit rate <pps>`
- B. `switchport port-security maximum 1`（適切な違反モードとあわせて設定）
- C. `ip dhcp snooping trust`
- D. `ip arp inspection trust`

**Q89.** DHCPスヌーピングとDAIを有効化したVLANに、DHCPを使わず静的IPアドレスを設定したファイルサーバを接続したところ、DAI有効化後にそのサーバとの通信が突然できなくなった。原因と対処として正しいものはどれか。
- A. DAIは静的IPアドレスのホストには適用されないため、原因はDAI以外にある
- B. 静的IPのホストはDHCPスヌーピングバインディングテーブルに情報が存在しないため、DAIにARPを破棄される。`ip arp inspection filter`によるARP ACLで個別に許可する必要がある
- C. ポートセキュリティのmaximumを2以上に増やせば解決する
- D. サーバ側のポートを`ip dhcp snooping trust`に設定すれば自動的に解決する

**Q90.** 拠点間VPNルータ間のWANリンクをパケットキャプチャしたところ、IPヘッダのプロトコル番号フィールドが50となっているパケットが継続的に観測された。プロトコル番号50はESP（Encapsulating Security Payload）を示す。ESPに関する説明として正しいものを2つ選べ。
- A. ESPはペイロードを暗号化し、機密性を提供する
- B. ESPはデータの完全性（改ざん検知）も提供できる
- C. ESPは暗号化を提供せず、認証機能のみを持つ
- D. プロトコル番号50はGREを示す

**Q91.** 次のJSONは、Cisco Catalyst CenterのREST APIがGETリクエストへの応答として返した抜粋である。

```json
{
  "devices": [
    { "hostname": "SW1", "role": "ACCESS", "reachabilityStatus": "REACHABLE", "managementIpAddress": "10.10.1.11" },
    { "hostname": "SW2", "role": "DISTRIBUTION", "reachabilityStatus": "UNREACHABLE", "managementIpAddress": "10.10.1.12" },
    { "hostname": "RT1", "role": "CORE", "reachabilityStatus": "REACHABLE", "managementIpAddress": "10.10.1.1" }
  ]
}
```

`devices` 配列に含まれる要素数と、`hostname` が `"SW2"` であるデバイスの `reachabilityStatus` の組み合わせとして正しいものはどれか。

- A. 要素数4、SW2はUNREACHABLE
- B. 要素数3、SW2はREACHABLE
- C. 要素数3、SW2はUNREACHABLE
- D. 要素数2、SW2はREACHABLE

**Q92.** 管理者がCisco Catalyst CenterのREST APIに対し、新規デバイスをネットワークへ登録するために次のリクエストを送信した。

```
curl -X POST https://dnac.example.com/dna/intent/api/v1/network-device \
  -H "X-Auth-Token: eyJhbGciOi..." \
  -H "Content-Type: application/json" \
  -d '{"ipAddress":["10.10.1.20"],"deviceType":"switch"}'
```

サーバーからステータスコード201が返された。この結果の解釈として最も適切なものはどれか。

- A. リクエストは受理されず、リソースは作成されなかった
- B. 新しいリソース（デバイス登録タスク）が正常に作成された
- C. 認証情報が無効だったため拒否された
- D. サーバー内部でエラーが発生した

**Q93.** 自動化スクリプトがCatalyst CenterのREST APIを定期的に呼び出しており、稼働開始から正常に動作していたが、およそ1時間後を境に、それ以降のすべてのリクエストでステータスコード401が返るようになった。リクエストのURIやメソッドは一切変更していない。この現象の原因として最も可能性が高いものはどれか。

- A. リクエストしたリソースが存在しない
- B. HTTPメソッドをGETからPOSTに変更してしまった
- C. 認証トークンの有効期限が切れた
- D. サーバー側でリソースの作成に成功した

**Q94.** 以下は、ある構成管理ツールで使われるコードの抜粋である。

```yaml
- name: Configure NTP on switches
  hosts: access_switches
  gather_facts: no
  tasks:
    - name: Set NTP server
      ios_ntp_global:
        config:
          servers:
            - server: 10.0.0.1
```

このコードに関する記述として正しいものはどれか。

- A. HCLで記述されたTerraformの構成ファイルであり、宣言的にインフラを定義する
- B. 対象機器に専用エージェントを事前インストールしておく必要がある
- C. Pullモデルで動作し、対象機器が定期的にサーバーへ設定を取得しに行く
- D. YAMLで記述されたAnsible Playbookであり、対象ホストへPushモデルで設定を配布する

**Q95.** 以下のコードに関する記述として最も適切なものはどれか。

```
resource "aws_instance" "web" {
  ami           = "ami-0123456789"
  instance_type = "t3.micro"
}
```

- A. これはYAML形式で記述されたAnsible Playbookである
- B. これはHCLで記述されたTerraformの構成ファイルであり、記述した最終状態を宣言的に維持しようとする
- C. このコードはPullモデルで動作し、エージェントが定期的に取得しに行く
- D. このコードは南向きインターフェースを介して機器を直接制御する

**Q96.** 大規模データセンターに、Spineスイッチ2台・Leafスイッチ4台からなるSpine-Leafファブリックが構築されている。全LeafスイッチはすべてのSpineスイッチとL3リンクで接続され、OSPFによりIP到達性が確保されている。その上でLeaf1とLeaf4の間にVXLANトンネルが構成されており、異なるラックにある2台のサーバーが同一L2セグメントにあるかのように通信している。

この記述において、OSPFによるIP到達性の確保とVXLANトンネルは、それぞれアンダーレイ・オーバーレイのどちらに分類されるか。

- A. OSPFはアンダーレイ、VXLANはオーバーレイ
- B. OSPFはオーバーレイ、VXLANはアンダーレイ
- C. どちらもアンダーレイに分類される
- D. どちらもオーバーレイに分類される

**Q97.** 自動化スクリプトがREST API経由でSDNコントローラに設定変更を要求し、コントローラはNETCONFを使って配下の数十台のスイッチへ実際の設定を配布した。この記述において、コントローラとスイッチの間のやり取りに使われているインターフェースの名称として正しいものはどれか。

- A. 北向きインターフェース(NBI)
- B. イーストウエストインターフェース
- C. 南向きインターフェース(SBI)
- D. アンダーレイインターフェース

**Q98.** 管理者がCatalyst Centerのダッシュボードを開いたところ、あるアクセススイッチでクライアント接続数が急増し、ヘルススコアが「低下」と表示され、根本原因の候補として該当ポートのエラーカウンタ増加が提示された。Catalyst Centerには次の4つのワークフローがある。

```
① Design    ② Policy    ③ Provision    ④ Assurance

ア. ネットワークの物理・論理設計（サイト階層、IPアドレッシングなど）を行う
イ. デバイスへ実際の設定を投入する
ウ. グループやSGTなどに基づくアクセス制御方針を定義する
エ. 稼働中のネットワークの健全性を可視化し、ヘルススコアや根本原因の候補を提示する
```

上記の事例（クライアント接続数急増によるヘルススコア低下と根本原因候補の提示）が該当するワークフローも踏まえ、①〜④とア〜エの対応として正しい組み合わせはどれか。

- A. ①ア　②ウ　③イ　④エ
- B. ①イ　②ウ　③ア　④エ
- C. ①ア　②エ　③イ　④ウ
- D. ①ウ　②ア　③エ　④イ

**Q99.** 以下のJSONには構文エラーが含まれている。

```json
{
  "hostname": "RT1"
  "interfaces": ["Gi0/0", "Gi0/1"]
}
```

このエラーの説明として正しいものはどれか。

- A. `"hostname"` の行の末尾にカンマが無く、次のキーとの区切りが欠けている
- B. キーがダブルクオートで囲まれていない
- C. 配列の要素数が多すぎる
- D. 数値がダブルクオートで囲まれている

**Q100.** 運用チームが2つのAIツールを試験導入した。ツールXは過去半年間のトラフィックログを学習し、来月のリンク使用率が閾値を超える確率を算出して警告を出す。ツールYはトラブルシューティングのログを要約し、対応手順の下書き文書を自動生成する。ツールXとツールYはそれぞれ何と呼ばれるAIに分類されるか。

- A. ツールX: 生成AI、ツールY: 予測AI
- B. 両方とも生成AI
- C. 両方とも予測AI
- D. ツールX: 予測AI、ツールY: 生成AI

## 解答・解説（講師用・実施後に公開）

| 問 | 解答 | 解説（1〜2文。関連する研修Dayを明記） |
|---|---|---|
| Q1 | A | 直接接続の5台は各ポート1コリジョンドメイン、ハブ配下の3台+ハブ接続ポートは共有media上のため合わせて1コリジョンドメイン。ルータが無いのでブロードキャストドメインは1。（→ Day1） |
| Q2 | B | L2ヘッダはホップごとに書き換わるため、R1-R2間では宛先MACは次ホップであるR2のインタフェースを指す。IPアドレス（宛先PC2）は変わらない。（→ Day1） |
| Q3 | C | CRCエラーの急増はL1（ケーブル不良・デュプレックスミスマッチなど）を示す典型的な症状で、Status/Protocolがupでも通信品質は劣化する。（→ Day1） |
| Q4 | D | `password` のみで `login` が設定されていないと、VTY回線は認証を要求せずそのまま接続を許可してしまう。（→ Day2） |
| Q5 | A | RSA鍵の名前にはホスト名とドメイン名が使われるため、ホスト名は設定済みでも `ip domain-name` が未設定だとこのエラーになる。（→ Day2） |
| Q6 | B | running-configはRAM上の揮発性データのため、保存前に再起動すると失われ、起動時にNVRAMのstartup-config（前回保存時点）が読み込まれる。（→ Day2） |
| Q7 | C | Gi0/0とVlan1はいずれもStatus/Protocolが administratively down であり、`no shutdown` が実行されていないことが原因と読み取れる。（→ Day2） |
| Q8 | D | /22（255.255.252.0）の第3オクテットのブロックサイズは4。`.14` は `.12`〜`.15` の範囲に属するため、ネットワークアドレスは10.10.12.0。（→ Day3） |
| Q9 | A | 2^6−2=62≥45を満たす最小のホスト部ビット数は6のため、プレフィックス長は32−6=/26。/27（2^5−2=30）では45台を収容できない。（→ Day3） |
| Q10 | B | 営業部（/26）は198.51.100.0〜.63を占有するため、次の開発部（/27、必要32ブロック）は隙間なく続く198.51.100.64から割り当てる。（→ Day3） |
| Q11 | C | /27（ブロックサイズ32）の境界は…64・96…であり、`.94` は `.64`ネットワーク、`.97` は `.96`ネットワークに属する異なるサブネットのため、ルータでの中継が必要。（→ Day3） |
| Q12 | D | リンクローカルは有効なインタフェースに必ず自動生成されるが、GUAは静的設定やSLAACで別途構成しない限り付与されない。Serial0/0/0はリンクローカルのみが表示されている。（→ Day4） |
| Q13 | A | MAC `00:90:27` と `11:62:34` の間に `fffe` を挿入し `0090:27ff:fe11:6234`、先頭バイトのU/Lビットを反転（00→02）して `0290:27ff:fe11:6234` をインタフェースIDとし、プレフィックスと結合する。（→ Day4） |
| Q14 | B | リンクローカルアドレスは複数のリンクで同じ値になり得るため、Cisco IOSのpingは宛先がリンクローカルの場合 `Output Interface:` の入力を対話的に要求する。（→ Day4） |
| Q15 | C | 宛先MACがMACアドレステーブルにない（unknown unicast）ため、受信ポート（Gi0/4）を除く全ポート、つまりGi0/1〜Gi0/3へフラッディングされる。（→ Day5） |
| Q16 | A | TCPの3ウェイハンドシェイクはSYN→SYN/ACK→ACKの順で完了し、その直後にHTTPのGETリクエストが送信される。この順序は常に固定であり入れ替わらない。（→ Day5） |
| Q17 | A,B | 宛先ポート443向けの通信はHTTPS、宛先ポート22向けの通信はSSH。UDPポート68はDHCPクライアントの動作を示しTFTP（ポート69）ではない（C誤り）。2つのTCP通信は宛先ホストが203.0.113.10と203.0.113.20で異なる（D誤り）。（→ Day5） |
| Q18 | B | half-duplex側でlate collisionが増加しているのは、対向がfull固定・自側がautoで半二重にフォールバックした典型的なデュプレックスミスマッチの症状。リンク自体はupのまま。（→ Day5） |
| Q19 | C,D | ストレート/クロスの判断は異種機器か同種機器かで決まる。ルータ同士・スイッチ同士はいずれも同種機器の組み合わせのためクロスケーブルが必要（PC-スイッチ、スイッチ-ルータは異種のためストレート）。（→ Day5） |
| Q20 | A | PoE規格ごとの最大給電電力は802.3af＝15.4W、802.3at（PoE+）＝30W、802.3bt Type3/4（PoE++）＝60〜90W。Gi0/2の25.5Wの給電には802.3af（15.4W）では不足し802.3at（30W）が最低限必要という点とも整合する。（→ Day5） |
| Q21 | A | `show vlan brief` で inactive と表示されるのは、割り当て済みの VLAN を `no vlan` 等で削除した場合が代表例。`VLAN0030` という自動生成名は以前 IOS が自動作成したことを示す。復旧には該当 VLAN の再作成が必要。(→ Day6) |
| Q22 | B | Access Mode VLAN(データVLAN)が10、Voice VLANが20と表示されているため、`switchport access vlan 10` と `switchport voice vlan 20` が設定されている。(→ Day6) |
| Q23 | C | ノーマルレンジは1〜1005、エクステンデッドレンジは1006〜4094。VLAN4000はエクステンデッドレンジに該当する。(→ Day6) |
| Q24 | D | 「Vlans allowed and active in management domain」は許可・存在・activeなVLANの一覧で、そこからさらにSTPでブロッキングされているVLANは「spanning tree forwarding」の一覧から外れる。(→ Day7) |
| Q25 | A | `trunk`(静的)対`dynamic auto`(受け身)の組み合わせはトランクが成立する。成立しないのは`auto`同士のみ。(→ Day7) |
| Q26 | B | `%CDP-4-NATIVE_VLAN_MISMATCH`はトランク両端のネイティブVLAN不一致で出力される。両端を同じネイティブVLANに揃えるのが対処。(→ Day7) |
| Q27 | C | ダブルタギングは外側にネイティブVLANタグ、内側に標的VLANタグを付与する手法で、最初のスイッチが外側タグのみ剥がすため片方向のみで成立する。Aはスイッチスプーフィングの説明。(→ Day7) |
| Q28 | D | 自分のSVIへのpingはL3スイッチ自身のIPスタックが応答するためip routing無効でも成功するが、VLAN間の転送にはip routingの有効化が必須。show ip routeにC経路が一切現れていない点も手がかり。(→ Day8) |
| Q29 | A | ネイティブVLAN用のサブインタフェースには`encapsulation dot1q <ID> native`を指定し、タグなしフレームをそのVLANとして処理させる。(→ Day8) |
| Q30 | B | Statusが「administratively down」はそのインタフェースに`shutdown`が設定されている(=`no shutdown`が入っていない)ことを示す。VLAN自体は存在しポートもactiveなので他の条件は満たされている。(→ Day8) |
| Q31 | C | `no switchport`を実行した物理ポートはVLANに依存しないルーテッドポートとなり、物理インタフェースに直接IPアドレスを割り当てる。(→ Day8) |
| Q32 | D | SW-Aから見てSWroot直結はコスト100、SW-B経由はSW-Bの最小パスコスト19に自リンクのコスト4を加えた23。コストが小さいSW-B経由がルートポートとなり、直結ポートは非指定(ブロッキング)になる。(→ Day9) |
| Q33 | A | Root IDのアドレス(0011.2233.4455)とBridge IDのアドレス(00aa.bbcc.ddee)が異なるためSW2はルートブリッジではない。Root IDのPortフィールドが自身のGi0/1を指しており、これがルートポート。(→ Day9) |
| Q34 | A | 802.1D STPのポート状態遷移は常にBlocking→Listening→Learning→Forwardingの順で進む。間接障害の場合はBlockingからの遷移開始がMax Age(20秒)のタイムアウト待ちとなる点が直接障害（即座に遷移開始）との違いだが、遷移後の状態順序自体は変わらない。収束時間は合計でMax Age(20秒)+Forward Delay×2(15秒×2)＝約50秒。(→ Day9) |
| Q35 | A,B | EtherChannelにバンドルされるには速度・デュプレックス・モード(access/trunk)・許可VLANが全ポートで一致している必要があり、速度不一致・デュプレックス不一致はいずれもスタンドアロン(I)のまま扱われる典型的な原因。Po1がshutdownならFa0/1も含め全ポートがdown表示になるはずでこの出力とは矛盾し（C誤り）、実際にLACPが使用されている（D誤り）。(→ Day9) |
| Q36 | D | L3 EtherChannelは論理インタフェース側にも`no switchport`を設定し、直接IPアドレスを割り当てる。L2 EtherChannelとの違いはswitchportの有無のみ。(→ Day9) |
| Q37 | A | クライアントを収容するVLANに対応するのはdynamicインタフェースで、WLAN作成前にController > Interfacesで用意しておく。(→ Day10) |
| Q38 | B | FlexConnectモードはWAN越し拠点向けで、WLCとの接続が切れてもローカルスイッチングによりその拠点内の通信を継続できる。(→ Day10) |
| Q39 | B,D | `show cdp neighbors detail`ではIPアドレス・プラットフォーム・IOSバージョン・接続ポートなどが確認できるが、隣接機器のVTPモード（Client/Server/Transparent）や、個々のインタフェースのMACアドレス（表示されるEntry addressはIPアドレスのみ）はCDPの通知情報に含まれない。(→ Day10) |
| Q40 | A,B | WPA3-PersonalはPSKの鍵交換をSAE(Simultaneous Authentication of Equals)に置き換え、通信を傍受しても総当たりされにくい辞書攻撃耐性と、セッション鍵が漏えいしても過去の通信に影響しない前方秘匿性を実現する。TKIP→CCMP(AES)化はWPA2の時点で既に行われており（C誤り）、802.1X/EAP必須化はWPA3-Enterpriseの話（D誤り）。(→ Day10) |
| Q41 | A | サブインタフェースは`encapsulation dot1q <VLAN-ID>`が設定されて初めてそのVLANのタグ付きフレームを扱えるようになる。VLAN10側にこの設定がなければ通信が成立しない。(→ Day8) |
| Q42 | C | ISLもサポートする機種ではトランクencapsulationが既定で`negotiate`(auto)になっており、先に`switchport trunk encapsulation dot1q`で方式を固定しないと`switchport mode trunk`が拒否される。(→ Day8) |
| Q43 | D | `show vlan brief`にはアクセスポートのみが表示され、トランクポートは表示されない。トランクの状態確認には`show interfaces trunk`を使う。(→ Day8) |
| Q44 | A | SVIがup/upになるには「対応VLANの存在」「そのVLANに所属するポートが1つ以上up」「no shutdown」の3条件が必要で、所属ポートが1つもないため2つ目の条件を満たしていない。(→ Day8) |
| Q45 | C | ルーテッドポート同士でL3直結リンクを組む場合、対向側にも`no switchport`を実行してVLANから切り離してからでないとIPアドレスを付与できない。(→ Day8) |
| Q46 | D | 同一プレフィックス長で複数の情報源から経路がある場合はADで比較され、静的ルートのAD 1がRIPのAD 120より小さいため静的ルートが優先される。(→ Day11) |
| Q47 | B | ネクストホップ指定の静的ルートは、ネクストホップへの到達性を再帰ルックアップで確認しており、その到達性が失われると経路情報そのものがルーティングテーブルから自動的に外れる。(→ Day11) |
| Q48 | C | フローティングスタティックのADは主経路(この場合EIGRP内部のAD 90)より大きい値にする必要があり、選択肢の中でAD 90より大きいのは95のみ。(→ Day11) |
| Q49 | D | ホストルート(`255.255.255.255`)を追加すれば、ロンゲストマッチにより`192.168.40.50`宛のみがR2経由となり、他のホストは既存の`/24`経路のままR1経由を維持できる。(→ Day11) |
| Q50 | A | イーサネットのようなマルチアクセス媒体で出力インタフェースのみを指定するとネクストホップが特定できず、宛先ごとにプロキシARPへ依存する非効率な処理が発生する。ネクストホップIPの指定または完全指定に変更するのが正しい対処。(→ Day11) |
| Q51 | B | `::/0`はIPv4の`0.0.0.0/0`に相当するIPv6のデフォルトルートで、静的ルートのADは1。`[1/0]`の1がAD、0がメトリックを表す。(→ Day11) |
| Q52 | C | R2に設定されている静的ルートの宛先が誤って`10.3.3.0/24`になっており、本来必要な`10.1.1.0/24`宛の戻り経路が存在しないため、往路のみ通り復路が失敗する非対称ルーティングになっている。(→ Day11) |
| Q53 | D | DRとBDRはセグメント上の全ルータとFULLになるが、DROTHER同士は2-Wayで停止する。R4はBDR(2.2.2.2)とはFULLだが別のDROTHER(3.3.3.3)とは2-Wayのため、R4自身もDROTHERと判定できる。(→ Day12) |
| Q54 | A | Router IDは明示指定がなければ稼働中のループバックインタフェースのうち最も高いIPアドレスが採用される。Loopback0(1.1.1.1)とLoopback1(2.2.2.2)のうち大きい2.2.2.2が選ばれ、物理インタフェースは優先順位が下がるため使われない。(→ Day12) |
| Q55 | B | `/29`のサブネットマスクは255.255.255.248であり、255.255.255.255から引き算するとワイルドカードマスクは0.0.0.7になる。(→ Day12) |
| Q56 | C | 既定の参照帯域幅ではGigabitEthernetとFastEthernetのコストがともに1になるため経路①の総コストは1+1=2。Serial回線は既定コスト64のため経路②は64+1=65となり、より小さい経路①が選ばれる。(→ Day12) |
| Q57 | D | passive-interfaceはHelloパケットの送信(ネイバー形成)のみを止め、そのインタフェースが属するネットワークの広告自体はLSAに含まれ続ける。出力のNbrs F/Cが0/0でネイバーがいないことがpassive設定を示唆する。(→ Day12) |
| Q58 | A | Passive Interface(s)に列挙されたインタフェースはHello送信を停止しネイバーを作らないが、Routing for NetworksにあるネットワークはOSPFに参加しており広告され続ける。(→ Day12・Day13) |
| Q59 | B | プライオリティを0に設定したインタフェースは、Router IDの大小に関わらずDR/BDRの選出対象から除外され常にDROTHERとなる。(→ Day12) |
| Q60 | C | Initで停滞するのはHello/Deadタイマーの不一致が典型的な原因。MTU不一致はExstart/Exchangeで停滞する原因であり、Initとは区別する必要がある。(→ Day13) |
| Q61 | D | `network`文のネットワークアドレスが`10.0.12.4`となっており、Gi0/0の実際のアドレス`10.0.12.1`と一致しないため、そのインタフェースはOSPFに参加できずインタフェース一覧にも表示されない。(→ Day13) |
| Q62 | A | `default-information originate`は既定では実行元ルータ自身のルーティングテーブルにデフォルトルートが存在する場合のみ広告される。この例では静的デフォルトルートも`always`キーワードもないため広告されない。(→ Day13) |
| Q63 | B | HSRPのプリエンプトは既定で無効なためR1が先に起動していればActiveのまま維持されるが、R2にはプリエンプトが設定されているため、後から起動してもR1より高いプライオリティを活かして自動的にActiveを奪い返す。(→ Day13) |
| Q64 | C | 複数のルータが同時にトラフィックを転送し、クライアントごとに異なる仮想MACアドレスが割り当てられるのはGLBPの特徴で、AVGが複数のAVFへ負荷を分散させることで実現される。(→ Day13) |
| Q65 | B | HSRPはプリエンプトが有効でない限り、後からプライオリティが逆転しても現在のActiveからStandbyへ自動的に交代しない。R2にpreemptが設定されていないため、プライオリティで上回ってもR1がActiveのまま残る。(→ Day13) |
| Q66 | B | `overload`付きのPATでは外部インタフェース（GigabitEthernet0/1）のアドレス203.0.113.1がポート番号と組み合わせてinside globalとして使われる。192.168.10.100はinside local、192.168.10.1はそのインタフェース自身のアドレスであり変換後アドレスではない。（→ Day14） |
| Q67 | D | allocated 100%はプールの全アドレスが使用中であることを示し、missesはこの状態で変換要求に失敗した回数。対処にはプールの拡張、またはポート番号で多重化できるoverload（PAT）への変更が有効。（→ Day14） |
| Q68 | A | `show ip dhcp conflict`は、DHCPサーバがアドレス割り当て前後の検査（ping等）で検出したアドレス重複の履歴を表示する専用コマンド。`show ip dhcp binding`は現在配布中のリース一覧、`show ip dhcp pool`はプールの使用状況を表示するだけで、重複検出の履歴そのものは確認できない。（→ Day15） |
| Q69 | C | .11と.12から始まっており.1〜.10が欠番のため、`ip dhcp excluded-address`等でその範囲が除外設定されている可能性が高い。Typeが Automatic なので動的リースであり静的割り当てではない。（→ Day15） |
| Q70 | B | 外部からの自社宛メールの配送先を決めるのはMXレコードであり、Aレコードが正しくてもMXが未設定・誤りだとメールは配送されない。PTRは逆引きであり「宛先不明で戻る」の直接原因としてはMXが最有力。（→ Day15） |
| Q71 | D | `transport input ssh`はSSHのみを許可する設定だが、実際にログインを完了させるには`login`（VTYパスワード）または`login local`（ローカルユーザ認証）とその認証情報も別途必要。どちらも設定されていないと、SSHで接続はできてもパスワード未設定を理由にログインが拒否される。（→ Day15） |
| Q72 | A | `10.1.1.1`はstratum 4でreach（到達履歴）が377（すべて成功）となっており同期候補になり得る状態、`10.1.1.2`はstratum 16（未同期を示す特別な値）かつreach 0でまだ到達できていない。（→ Day15） |
| Q73 | B,C | Trap（UDP 162、エージェントからマネージャへの自発的通知）だけが失われポーリング（UDP 161、Get）は正常なため、Trap経路であるUDP 162のファイアウォール遮断や、ルータの`snmp-server host`設定の消失に問題があると考えられる。`snmp-server community`が削除されていればGetも失敗するはずでありAは矛盾、NTPずれ自体はTrap配送を直接止めない（D誤り）。（→ Day15） |
| Q74 | B | `logging trap`のしきい値は「指定したseverity以上の重大度（＝数値がその値以下）のメッセージをすべて送信する」という意味で、`warning`（4）を指定すると severity 0（Emergency）〜4（Warning）が送信される。（→ Day15） |
| Q75 | D | シェーピングは超過分をバッファに貯めて送出タイミングを遅らせ、レートをなめらかに平滑化する。ポリシングは即座に破棄するためバーストの緩和にはならず、かえって再送増加を招きうる。（→ Day15） |
| Q76 | A | 正規のアクセス権を持つ人物による脅威は内部脅威（Insider Threat）で、悪意の有無を問わず誤操作も含まれ、境界防御だけでは防げない点が特徴。（→ Day16） |
| Q77 | B | 偽のARP応答でゲートウェイになりすまし通信を自分経由に迂回させるのはARPスプーフィング（ARPポイズニング）で、代表的なMITM攻撃の手口。（→ Day16, Day18） |
| Q78 | A,B | 802.1Xでは、認証が通るまでポートを制限しつつ端末とRADIUSサーバの間でEAPメッセージを仲介するスイッチ／APがオーセンティケータ。端末側ソフトはサプリカント（D誤り）、認証情報を検証するのはRADIUSサーバ＝認証サーバ（C誤り）であり、スイッチ自身はどちらでもない。（→ Day16） |
| Q79 | A | ①はユーザー名/パスワードでのログイン成功＝認証、②はログイン後の権限（コマンド実行可否）の判定＝認可、③は操作記録の送信＝アカウンティングに対応する。「何をすることを許すか」を決める認可（Authorization）で②が拒否されている点が本問の核心。（→ Day16） |
| Q80 | A | MFAは「異なる種類」の要素を2つ以上組み合わせて成立する。パスワードも秘密の質問もどちらも「知識」要素であり種類が同じため、数が2つでもMFAには該当しない。（→ Day16） |
| Q81 | B | Type 9はscryptによる強いハッシュ方式であり、平文復元は現実的に困難。Type 7（service password-encryptionによる難読化）とは強度が大きく異なる点に注意。（→ Day16） |
| Q82 | C | `login quiet-mode access-class`で管理サブネットをクワイエットモードの対象から除外しておけば、ブルートフォース対策を有効にしたまま管理者自身の締め出しを防げる。（→ Day16） |
| Q83 | D | permit行のmatchesが0でdeny any logだけがヒットしているため、意図した通信がpermit条件に一致せず暗黙でない明示denyで破棄されている。アドレス・ポート指定の誤りをまず疑うべき。（→ Day17） |
| Q84 | A | 4つの連続する/24（192.168.4.0〜7.0）をまとめるワイルドカードマスクは、対応する/22のサブネットマスク255.255.252.0を255.255.255.255から引いた0.0.3.255。（→ Day17） |
| Q85 | B | 拡張ACLの構文順序は「プロトコル→送信元→宛先→ポート」。このACEは送信元にサーバVLAN、宛先に社内端末を指定してしまっており、社内端末発（送信元=社内端末）のTelnetには一致しないため素通りしてしまう。（→ Day17） |
| Q86 | C | `access-class`は回線（line）単位の設定であり自動継承されない。VTY 0〜4にしか設定していなければVTY 5〜15は無制限のままとなり、想定外の送信元からもSSH接続できてしまう。（→ Day17） |
| Q87 | D | Port StatusがSecure-shutdownは、違反によりerr-disabledへ遷移した状態を示す。復旧には該当インタフェースで`shutdown`→`no shutdown`を行うか、`errdisable recovery`で自動復旧を設定する。（→ Day18） |
| Q88 | A,B | `ip dhcp snooping limit rate`はuntrustedポートから届くDHCPパケットのレート（pps）を制限し、大量の偽リクエストによるプール枯渇を防ぐ。port-securityで許可MACアドレス数を制限すれば、送信元MACを変えながら大量送信する攻撃も抑制できる。trust設定（C）は上流の正規サーバ側ポートに使う設定であり攻撃者が接続されたアクセスポートには不適切、DAIのtrust（D）もARP検証用で本件のDHCP枯渇対策とは別の話。（→ Day18） |
| Q89 | B | DAIはDHCPスヌーピングバインディングテーブルと照合してARPの正当性を判定するため、DHCPを使わない静的IPホストは情報が存在せず弾かれる。個別にARP ACL（`ip arp inspection filter`）で許可する必要がある。（→ Day18） |
| Q90 | A,B | ESPは暗号化によるペイロードの機密性保護に加え、認証データによる完全性（改ざん検知）も提供できる。暗号化を提供せず認証機能のみを持つのはAH（プロトコル番号51）の説明であり（C誤り）、プロトコル番号50はESPでありGRE（プロトコル番号47）ではない（D誤り）。（→ Day18） |
| Q91 | C | `devices` 配列の要素は `SW1`・`SW2`・`RT1` の3つで、SW2の `reachabilityStatus` は `"UNREACHABLE"`。JSONの配列 `[]` とオブジェクト `{}` の構造を正しく読み取る。（→ Day19） |
| Q92 | B | 201 CreatedはPOSTなどで新規リソースの作成に成功したことを示すステータスコード。400/401/500のような失敗系ではない。（→ Day19） |
| Q93 | C | Catalyst CenterのX-Auth-Tokenなどの認証トークンには有効期限（既定で約60分）があり、期限切れになると以降のリクエストが401（Unauthorized）で拒否される。URIやメソッドは変わっていないため404やメソッド起因ではない。（→ Day19） |
| Q94 | D | `hosts:` や `tasks:` を持つYAML形式でPlaybookが記述されており、AnsibleはエージェントレスでSSH経由、コントロールノードから対象ホストへ能動的に配布するPushモデルである。（→ Day19） |
| Q95 | B | `resource "aws_instance" ...` はHCL（HashiCorp Configuration Language）で、TerraformはIaCとして「最終的にどうあるべきか」を宣言的に記述しその状態を維持する。（→ Day19） |
| Q96 | A | OSPFは物理ネットワーク上でIP到達性を提供する土台であるためアンダーレイ、VXLANはその上にUDPカプセル化でL2接続を作る論理トンネルであるためオーバーレイに分類される。（→ Day19） |
| Q97 | C | コントローラが配下の機器（スイッチ）をNETCONFなどのプロトコルで直接制御するインターフェースは南向きインターフェース（SBI）。北向き（NBI）は上位のアプリ・自動化ツールとの連携に使う。（→ Day19） |
| Q98 | A | Designはサイト階層・IPアドレッシングなどの設計（ア）、Policyはグループ/SGTなどのアクセス制御方針の定義（ウ）、Provisionはデバイスへの実際の設定投入（イ）、Assuranceは機器・クライアントの健全性をダッシュボードで可視化し根本原因の候補を示す機能（エ）。本文の事例（ヘルススコア低下と根本原因候補の提示）はAssurance＝④エに該当する。（→ Day19） |
| Q99 | A | JSONではキー:値のペアをカンマで区切る必要があり、`"hostname": "RT1"` の後にカンマが無いため次の `"interfaces"` との区切りが欠け構文エラーになる。キーは正しくダブルクオートで囲まれている。（→ Day19） |
| Q100 | D | ツールXは過去のデータから将来の事象（リンク使用率超過）を予測しているため予測AI、ツールYはログを要約し新しい文書（対応手順案）を生成しているため生成AI。（→ Day19） |

## 採点とドメイン別集計（講師用）

- 配点: 1問1点、100点満点
- 受験GO基準（再掲）: 2回連続で総合85%以上、かつ全ドメインで70%以上

### ドメイン別の設問範囲と正答率記入欄

| ドメイン | 範囲 | 問題数 | 正答数 | 正答率 |
|---|---|---|---|---|
| D1: ネットワーク基礎 | Q1-20 | 20 | ___ | ___% |
| D2: ネットワークアクセス | Q21-40 | 20 | ___ | ___% |
| D3: IPコネクティビティ | Q41-65 | 25 | ___ | ___% |
| D4: IPサービス | Q66-75 | 10 | ___ | ___% |
| D5: セキュリティ基礎 | Q76-90 | 15 | ___ | ___% |
| D6: 自動化とプログラマビリティ | Q91-100 | 10 | ___ | ___% |
| 合計 | Q1-100 | 100 | ___ | ___% |

## シムレット演習（実技代替・本編 100 問とは別枠）

> この演習は本試験の**シミュレーション/シムレット問題**（実機を模した環境で show 出力や
> 構成を読み解き、複数の設問に連続して答える形式）に慣れるための実技代替演習です。
> **本編 100 問の採点には含めません**（別枠）。目安 10〜15 分。show 出力・構成を丁寧に
> 読み、「原因の切り分け → 対処 → 結果予測」の流れを練習してください。

### シナリオ: R2–R3 間のネイバーが FULL にならず、R3 配下の LAN 経路が届かない

R1–R2–R3 の 3 台を数珠つなぎに接続したシングルエリア（area 0）の OSPFv2 構成です。
すべてのリンクはギガビットイーサネット（既定のネットワークタイプ broadcast）で、
OSPF プロセス ID・エリア・参照帯域幅はすべて既定のまま統一されています。各ルータには
Router ID 安定化のためのループバック（Lo0）を設定済みです。

構築直後、R1 から R3 配下の LAN（`192.0.2.0/24`）へ ping が通らないという申告があり、
切り分けのため以下の出力を採取しました。

```
[トポロジ]
         Gi0/0        Gi0/0   Gi0/1        Gi0/1        Gi0/1
  R1 ───────────── R2 ───────────── R3 ───────── LAN 192.0.2.0/24
    10.1.12.0/30       10.1.23.0/30

  Router ID:  R1 = 10.0.0.1   R2 = 10.0.0.2   R3 = 10.0.0.3
  IP:  R1 Gi0/0 10.1.12.1/30   R2 Gi0/0 10.1.12.2/30   R2 Gi0/1 10.1.23.2/30
       R3 Gi0/0 10.1.23.3/30   R3 Gi0/1 192.0.2.1/24
```

```
R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address       Interface
10.0.0.1          1   FULL/BDR        00:00:34    10.1.12.1     GigabitEthernet0/0
10.0.0.3          1   EXSTART/DR      00:00:31    10.1.23.3     GigabitEthernet0/1
```

（数分間、繰り返し観察しても `10.0.0.3` の State は EXSTART と EXCHANGE の間を
行き来するだけで FULL に到達しません。）

```
R2# show ip ospf interface brief

Interface    PID   Area   IP Address/Mask     Cost  State Nbrs F/C
Gi0/0        1     0      10.1.12.2/30        1     DR    1/1
Gi0/1        1     0      10.1.23.2/30        1     BDR   0/1
Lo0          1     0      10.0.0.2/32         1     LOOP  0/0
```

```
R1# show ip route ospf

      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O        10.0.0.2/32 [110/2] via 10.1.12.2, 00:14:03, GigabitEthernet0/0
O        10.1.23.0/30 [110/2] via 10.1.12.2, 00:14:03, GigabitEthernet0/0
```

（R1 のルーティングテーブルには `192.0.2.0/24` も `10.0.0.3/32`（R3 の Lo0）も
学習されていません。）

```
R2# show interfaces GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Hardware is ..., address is ....
  Internet address is 10.1.23.2/30
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,

R3# show interfaces GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Hardware is ..., address is ....
  Internet address is 10.1.23.3/30
  MTU 1400 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
```

**S1.** この出力から読み取れる状態として正しいものを **2 つ選べ**。
- A. R2 と R3 のネイバーは検出されているが、EXSTART で停滞し FULL に到達していない
- B. R2 と R3 の間ではネイバーがそもそも 1 つも検出されていない
- C. R1 のルーティングテーブルに R3 配下の LAN（`192.0.2.0/24`）が学習されていない
- D. R1 と R2 のネイバーも同時に Down しており、区間全体で隣接が形成されていない

**S2.** ネイバーが FULL に到達しない原因として最も可能性が高いものはどれか。
- A. Hello / Dead タイマーの不一致
- B. R2 Gi0/1（1500）と R3 Gi0/0（1400）の MTU 不一致により、DBD 交換が完了できず停滞している
- C. R2 Gi0/1 と R3 Gi0/0 のエリア ID が不一致になっている
- D. R3 Gi0/0 が誤って passive-interface に設定されている

**S3.** この障害を根本から解消するために R3 で実行すべきコマンドはどれか。
- A. `R3(config)# router ospf 1` → `R3(config-router)# passive-interface GigabitEthernet0/0`
- B. `R3(config)# interface GigabitEthernet0/0` → `R3(config-if)# ip ospf hello-interval 30`
- C. `R3(config)# interface GigabitEthernet0/0` → `R3(config-if)# mtu 1500`
- D. `R3(config)# router ospf 1` → `R3(config-router)# router-id 10.0.0.2`

**S4.** S3 の対処を正しく行った後に予測される結果として最も適切なものはどれか。
- A. R2–R3 のネイバーが EXSTART から EXCHANGE・Loading を経て FULL へ遷移し、R1 が
  `192.0.2.0/24` を `via 10.1.12.2` で学習して LAN への ping が通るようになる
- B. MTU を揃えても状態は EXSTART のままで、追加で全ルータの Router ID を振り直す必要がある
- C. ネイバーは FULL になるが、`192.0.2.0/24` は R3 側で passive のため永久に広告されない
- D. R1–R2 間のネイバーが一度 Down し、区間全体の再構築に約 50 秒かかる

### シムレット演習 解答・解説（講師用・実施後に公開）

| 問 | 解答 | 解説（→ Day） |
|---|---|---|
| S1 | A, C | `show ip ospf neighbor` に `10.0.0.3` が EXSTART で表示されている＝ネイバー自体は検出済みで、FULL 手前で停滞している（A 正・B 誤）。EXSTART/EXCHANGE 停滞では LSDB 同期が完了せず R3 の LSA が伝播しないため、R3 発の経路（`192.0.2.0/24`、`10.0.0.3/32`）が R1 に載らない。一方 R2 の直結である `10.1.23.0/30` は R2 自身の LSA に含まれ R1 に学習される点も出力と整合（C 正）。R1–R2 は FULL/BDR で正常（D 誤）。（→ Day12・Day13） |
| S2 | B | ネイバーが「現れるが FULL にならず EXSTART/EXCHANGE で停滞」するのは MTU 不一致の典型症状。`show interfaces` で R2 Gi0/1＝1500、R3 Gi0/0＝1400 と食い違っている。タイマー／エリア ID 不一致や passive 誤設定は「ネイバーがそもそも現れない（表示されない／Init 止まり）」原因であり、EXSTART 停滞とは切り分けられる。（→ Day12・Day13） |
| S3 | C | 対処は両端の MTU を一致させること。R3 Gi0/0 の MTU を 1500 に戻せば DBD 交換が完了し隣接が進む。passive 設定（A）はかえって Hello を止めネイバーを消す誤り、hello-interval 変更（B）は不要な不一致を作り込む誤り、Router ID を R2 と同一値（D）にするのは重複を招く誤り。（→ Day12・Day13） |
| S4 | A | MTU を揃えると停滞が解消し、EXSTART→EXCHANGE→Loading→FULL と進む。FULL 到達後は R3 の LSA が伝播し、R1 が `192.0.2.0/24` を `via 10.1.12.2`（R1 の唯一の OSPF ネクストホップ）で学習して LAN へ疎通する。Router ID の振り直し（B）や passive（C）は不要・無関係で、正常な R1–R2 隣接は Down しない（D）。（→ Day12・Day13） |
