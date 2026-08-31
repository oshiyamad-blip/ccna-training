# Exercise 14 小テスト: IP サービス総合（DHCP・DNS・NTP・Syslog・SNMP・QoS）

> 運用: 設問部分を小テスト課題の本文（またはドキュメント）に掲載。
> 「解答・解説」は講師用フォルダに保管し、**次の Exercise の開始時**に受講者へ公開する。
> ルール: 10 問 / 30 分 / 教材参照なし。解答はコメントに「Q1: A」形式で提出。

---

## 設問

**Q1.** DHCP の DORA プロセスにおいて、Discover の次に送信されるメッセージと、
DHCP サーバが使用する UDP ポート番号の組み合わせとして正しいものはどれか。

- A. Offer、UDP 67
- B. Request、UDP 68
- C. Ack、UDP 67
- D. Offer、UDP 68

**Q2.** クライアントと DHCP サーバが異なるサブネットにある場合、
クライアント側インターフェースに設定する必要があるコマンドはどれか。

- A. ip nat inside
- B. ip helper-address <DHCP サーバの IP アドレス>
- C. ip dhcp relay enable
- D. ip forward-protocol dhcp

**Q3.** 次は R1 の `show running-config` の一部（DHCP プール設定）である。
クライアントへ配布するネットワーク範囲を規定している行はどれか。

```
ip dhcp pool LAN1
 network 192.168.1.0 255.255.255.0
 default-router 192.168.1.1
 dns-server 192.168.1.10
 lease 0 8 0
```

- A. default-router 192.168.1.1
- B. network 192.168.1.0 255.255.255.0
- C. dns-server 192.168.1.10
- D. lease 0 8 0

**Q4.** IP アドレスからホスト名を求める逆引き（Reverse Lookup）に使用する
DNS レコード種別はどれか。

- A. A
- B. AAAA
- C. CNAME
- D. PTR

**Q5.** NTP の stratum（階層）に関する記述として正しいものはどれか。

- A. stratum の数値が大きいほど、基準時刻に近く精度が高い
- B. stratum 0 は原子時計や GPS などの基準時刻源そのものを指し、それに直結した
  サーバが stratum 1 になる
- C. stratum は 1〜3 の 3 段階しかない
- D. Cisco ルータを NTP サーバにする場合、stratum は必ず 0 に設定する

**Q6.** 次の Syslog メッセージがルータに出力された。

```
%SYS-5-CONFIG_I: Configured from console by vty0
```

このメッセージの severity 番号と名称の組み合わせとして正しいものはどれか。
また `logging trap warning` を設定している場合、このメッセージはサーバへ
送出されるか。

- A. severity 3（Error）、送出される
- B. severity 4（Warning）、送出される
- C. severity 5（Notification）、送出されない
- D. severity 6（Informational）、送出されない

**Q7.** SNMPv3 のセキュリティレベルのうち、認証は行うが暗号化は行わない
ものはどれか。

- A. noAuthNoPriv
- B. authNoPriv
- C. authPriv
- D. community-based

**Q8.** QoS において、超過トラフィックをバッファに貯めて送出を遅延させる
ことでレートを平滑化する処理はどれか。

- A. ポリシング
- B. マーキング
- C. シェーピング
- D. キューイング

**Q9.** SSH を有効化するために必要な設定の組み合わせとして正しいものは
どれか。

- A. telnet enable → crypto key generate rsa
- B. ip nat inside → username 作成のみ
- C. ip domain-name の設定 → crypto key generate rsa → username 作成 →
  line vty での transport input ssh（login local は設定しない）
- D. ip domain-name の設定 → crypto key generate rsa → username 作成 →
  line vty での login local と transport input ssh

**Q10.**（記述）離れたサブネットの PC が DHCP アドレスを取得できるように
するため、なぜ `ip helper-address`（DHCP リレー）が必要かを、DHCP Discover が
ブロードキャストであることと、ルータがブロードキャストを転送しない点を
踏まえて説明せよ。

---

## 解答・解説（次の Exercise の開始時に公開・講師用）

| 問 | 解答 | 解説 |
|---|---|---|
| Q1 | A | DORA の順序は Discover → Offer → Request → Ack。DHCP サーバは UDP 67 を使用する |
| Q2 | B | `ip helper-address <DHCPサーバIP>` をクライアント側インターフェースに設定すると、ブロードキャストの DHCP リクエストをユニキャストに変換してサーバへ転送する |
| Q3 | B | `network` の行が DHCP プールの配布対象ネットワーク範囲を規定する。他の行はゲートウェイ・DNS・リース時間の指定 |
| Q4 | D | 逆引き（IP アドレス → ホスト名）には PTR レコードを使用する。A/AAAA は正引き、CNAME は別名の対応 |
| Q5 | B | stratum 0 は原子時計・GPS などの基準時刻源そのもの、それに直結したサーバが stratum 1、その配下が 2、3… と続く。数値が**小さい**ほど基準に近く精度が高い（A は逆）。stratum は 0〜15 まであり（16 は未同期）、C は誤り。D も誤りで、Cisco ルータで `ntp master <番号>` を設定する場合の既定は stratum 8 |
| Q6 | C | メッセージ中の `%SYS-5-CONFIG_I` の `5` が severity（Notification）。`logging trap warning` はしきい値 4 のため、severity 5 のこのメッセージは送出されない |
| Q7 | B | 認証あり・暗号化なしは authNoPriv。noAuthNoPriv は認証・暗号化とも無し、authPriv は両方あり |
| Q8 | C | シェーピングは超過分をバッファに貯めて遅延させ送出レートを平滑化する。ポリシングは即時に破棄・再マークしバッファしない |
| Q9 | D | SSH 有効化には ip domain-name の設定、crypto key generate rsa による鍵生成、username によるローカルアカウント作成に加え、line vty で `login local`（ローカルユーザデータベースでの認証）と `transport input ssh` の両方が必要。C は `login local` が抜けており、これだけでは username/secret による認証が有効にならず SSH ログインが成立しない |
| Q10 | 例 | 「DHCP の Discover メッセージは宛先を `255.255.255.255` とするブロードキャストであり、ルータは既定でブロードキャストを他のセグメントへ転送しないため、クライアントと DHCP サーバが別サブネットにある場合、Discover はサーバまで届かない。クライアント側インターフェースに `ip helper-address <サーバIP>` を設定すると、ルータが受信したブロードキャストを DHCP サーバ宛のユニキャストに変換して転送するため、サブネットをまたいでも DHCP による配布が可能になる」という趣旨で、ブロードキャストが転送されない点とユニキャスト変換の役割に触れていれば正解 |

**採点**: 1 問 10 点、70 点未満は次の Exercise の冒頭で再テスト。Q10 は
ブロードキャストが転送されない点と `ip helper-address` によるユニキャスト
変換の役割に触れていれば 10 点。
