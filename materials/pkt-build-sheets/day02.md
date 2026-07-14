# day02 .pktビルドシート

- **対象ラボ**: `materials/week1/day02-lab.md`（IOS の基本操作とデバイス初期設定 — ホスト名／enable secret／管理IP／SSHv2 有効化・Telnet 排除）
- **作り込みレベル**: **A（配線済み・IP済み）** — `pkt-build-spec.md` の Week1 指定どおり。理由: ホスト名・パスワード・管理IP・SSH設定という「IOS 初期設定」そのものが本日の学習対象なので、R1/SW1/SW2 は工場出荷の初期状態のまま渡す。PC 側（IP設定・配線）は本題ではないため作り込み済みにする
- **保存ファイル名**: `day02_start.pkt`
- **参照した図**: `materials/images/day02-topology.svg`（本文の結線・IP・機器と完全一致を確認済み）

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名（Device Name） |
|---|---|---|---|
| ルータ | Router **2911**（Gi0/0 を標準搭載。オンボードのみで手順書のインタフェース名と一致、追加モジュール不要） | 1 | R1 |
| スイッチ | Switch **2960**（2960-24TT 等の標準テンプレート。Fa0/1〜Fa0/24 を使用） | 1 | SW1 |
| スイッチ | Switch **2960** | 1 | SW2 |
| PC | PC-PT（汎用 PC） | 1 | PC1 |
| PC | PC-PT（汎用 PC） | 1 | PC2 |
| PC | PC-PT（汎用 PC。管理端末として使用） | 1 | Admin-PC |

> ルータは Gi0/0 のみ使用するため、2911 の代わりに 1941 でも代替可（どちらもオンボードに GigabitEthernet0/0 を持つ）。PC-PT はデフォルトで FastEthernet0 と RS232 ポートの両方を標準搭載しているため、Admin-PC 側のコンソール用モジュール追加は不要。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 / GigabitEthernet0/0 | ストレートケーブル | SW1 / FastEthernet0/24 |
| SW1 / FastEthernet0/1 | ストレートケーブル | PC1 / FastEthernet0 |
| SW1 / FastEthernet0/2 | ストレートケーブル | Admin-PC / FastEthernet0 |
| SW1 / FastEthernet0/23 | クロスケーブル | SW2 / FastEthernet0/23 |
| SW2 / FastEthernet0/1 | ストレートケーブル | PC2 / FastEthernet0 |

- ケーブルは「自動選択（Automatically Choose Connection Type）」で可。SW1⟷SW2 間（同一機種同士）が赤くなる場合は上表のとおり明示的に「クロスケーブル」を選び直す。
- **コンソール（ロールオーバー）ケーブルは、この開始ファイルには含めない（未結線のまま保存する）。** 理由: ラボ手順書の「手順1」で、Admin-PC の RS232 ポートと R1 の Console ポートをつなぐ操作自体を受講者に行わせる構成になっており（雷アイコン→ロールオーバーケーブル選択→クリック接続）、これは機械的な準備作業ではなく学習内容の一部として明記されている。さらにこのケーブルは手順7・手順10で R1→SW1→SW2 へと順次つなぎ替えて使う想定のため、特定の1台に固定結線しても意味がない。
- 配線後、SW1⟷SW2 間や各アクセスポートは起動直後は橙 → 約30秒でSTP収束し緑になる。**Ethernet系のリンクがすべて緑になるまで待ってから保存する。**（コンソールリンクは接続していないため対象外）

## 3. PC/サーバ設定

開始ファイル（`day02_start.pkt`）では、下表の値をあらかじめ Desktop > IP Configuration に入力済みにして保存する（レベル A のため PC 側は完成済み）。

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.1.101 | 255.255.255.0 | 192.168.1.1 | DNS 未使用 |
| PC2 | 192.168.1.102 | 255.255.255.0 | 192.168.1.1 | DNS 未使用 |
| Admin-PC | 192.168.1.100 | 255.255.255.0 | 192.168.1.1 | DNS 未使用 |

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

- R1: `Router>` プロンプトの工場出荷状態のまま配置・保存する（hostname・enable secret・IPアドレス・SSH 関連コマンドは一切入力しない）。
- SW1 / SW2: `Switch>` プロンプトの工場出荷状態のまま配置・保存する（VLAN1 の IP・ホスト名などは未設定）。
- これはレベル A の定義（機器配置＋全ケーブル＋PC/サーバのIP設定済み。ルータ/スイッチは未設定）どおりであり、ホスト名・パスワード・管理IP・SSHv2 有効化という「IOS 初期設定」そのものが本日の学習対象であるため。

## 5. 完成コンフィグ（`day02_answer.pkt` 用・講師用）

ラボ手順書の手順1〜15を反映した、全手順完了後の最終状態。`copy running-config startup-config` まで実行済みとする。

> 注: `service password-encryption` は手順11でラボが明示的に **SW1 のみ**に実行させている（enable secret / password の表示比較が目的の観察課題）。R1・SW2 には手順書上の指示がないため適用しない。この非対称性は意図的なものなので、講師用見本でもそのまま再現する。

### R1

```
enable
configure terminal
hostname R1
enable secret cisco123
enable password cisco456
banner motd #Authorized access only#
line console 0
password consolepw
login
logging synchronous
exit
interface gigabitEthernet 0/0
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
ip domain-name example.local
crypto key generate rsa
```

（`How many bits in the modulus [512]:` と聞かれたら `1024` を入力）

```
ip ssh version 2
username admin privilege 15 secret adminpw
line vty 0 4
transport input ssh
login local
exit
end
copy running-config startup-config
```

### SW1

```
enable
configure terminal
hostname SW1
enable secret cisco123
enable password cisco456
banner motd #Authorized access only#
line console 0
password consolepw
login
logging synchronous
exit
interface vlan 1
ip address 192.168.1.11 255.255.255.0
no shutdown
exit
ip default-gateway 192.168.1.1
ip domain-name example.local
crypto key generate rsa
```

（モジュラスは `1024`）

```
ip ssh version 2
username admin privilege 15 secret adminpw
line vty 0 4
transport input ssh
login local
exit
end
copy running-config startup-config
configure terminal
service password-encryption
end
copy running-config startup-config
```

### SW2

```
enable
configure terminal
hostname SW2
enable secret cisco123
enable password cisco456
banner motd #Authorized access only#
line console 0
password consolepw
login
logging synchronous
exit
interface vlan 1
ip address 192.168.1.12 255.255.255.0
no shutdown
exit
ip default-gateway 192.168.1.1
ip domain-name example.local
crypto key generate rsa
```

（モジュラスは `1024`）

```
ip ssh version 2
username admin privilege 15 secret adminpw
line vty 0 4
transport input ssh
login local
exit
end
copy running-config startup-config
```

### PC1 / PC2 / Admin-PC（Desktop > IP Configuration、参考・開始ファイルの時点で入力済み）

```
PC1        IP: 192.168.1.101  Mask: 255.255.255.0  GW: 192.168.1.1
PC2        IP: 192.168.1.102  Mask: 255.255.255.0  GW: 192.168.1.1
Admin-PC   IP: 192.168.1.100  Mask: 255.255.255.0  GW: 192.168.1.1
```

### 確認用コマンド（講師が動作確認する際の参考）

```
R1# show ip ssh
R1# show ip interface brief
SW1# show ip interface brief
SW1# show ssh
SW1# show mac address-table
SW1# show version
```

Admin-PC の Command Prompt から：

```
ping 192.168.1.1
ping 192.168.1.11
ping 192.168.1.12
ssh -l admin 192.168.1.11
telnet 192.168.1.1
```

- `ssh -l admin 192.168.1.11` はパスワード `adminpw` で成功する。
- `telnet 192.168.1.1` は `transport input ssh` により拒否される（接続確立しない）ことを確認する。

## 6. 組み立て後チェック

- [ ] R1-SW1（Gi0/0⟷Fa0/24）、SW1-PC1（Fa0/1）、SW1-Admin-PC（Fa0/2）、SW1-SW2（Fa0/23⟷Fa0/23）、SW2-PC2（Fa0/1）の全 Ethernet リンクが緑
- [ ] `day02_start.pkt` では R1・SW1・SW2 が初期状態（ホスト名未設定、`Router>` / `Switch>` プロンプト、IP・SSH設定なし）＝レベル A どおり本題が未設定で残っている
- [ ] `day02_start.pkt` では Admin-PC の RS232 ⟷ R1/SW1/SW2 の Console ポートに、コンソールケーブルが**一切接続されていない**（手順1で受講者自身が接続する学習内容のため）
- [ ] PC1 / PC2 / Admin-PC の IP Configuration が上記の値で入力済み
- [ ] 講師用 `day02_answer.pkt` を別途作成し、上記「完成コンフィグ」を R1・SW1・SW2 に投入した状態で、Admin-PC から `ping 192.168.1.1` / `ping 192.168.1.11` / `ping 192.168.1.12` が全て成功することを確認
- [ ] `day02_answer.pkt` で Admin-PC → SW1 への `ssh -l admin 192.168.1.11`（パスワード `adminpw`）が成功し、`SW1# show ip interface brief` が実行できることを確認
- [ ] `day02_answer.pkt` で Admin-PC → R1 への `telnet 192.168.1.1` が拒否される（`transport input ssh` の効果）ことを確認
- [ ] `day02_answer.pkt` の SW1 のみ `service password-encryption` が適用済み（R1・SW2 には適用しない、手順11の指示どおりの非対称性を再現）
- [ ] `.pkt` として保存後、一度閉じて再度開き、配線・状態（未設定/設定済み）が保たれていることを確認
- [ ] ファイル名が `day02_start.pkt`（開始用）/ `day02_answer.pkt`（完成見本）になっている
