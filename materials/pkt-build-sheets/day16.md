# day16 .pktビルドシート

- **対象ラボ**: `materials/week4/day16-lab.md`（デバイス堅牢化 — SSH 管理とログイン保護の実装。Telnet 無効化、ローカル AAA、`login block-for`、未使用ポート閉塞）
- **作り込みレベル**: **A（配線済み・IP済み）** — `pkt-build-spec.md` の Week4 指定どおり。理由: SSH・ローカル AAA・ログイン保護という「デバイス堅牢化」そのものが本日の学習対象なので、R1/SW1/SW2 は工場出荷の初期状態（ホスト名すら未設定）のまま渡す。PC 側（IP設定・配線）は本題ではないため作り込み済みにする。R1 の `GigabitEthernet0/0` への IP アドレス設定はラボ手順書「手順1」で受講者自身が行う操作として明記されているため、開始ファイルでは設定しない。
- **保存ファイル名**: `day16_start.pkt`
- **参照した図**: `materials/images/day16-topology.svg`（本文の結線・IP・機器と完全一致を確認済み。管理セグメント 192.168.10.0/24、SW1 未使用ポート Fa0/3〜Fa0/22 の注記も本文の手順10と一致）

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名（Device Name） |
|---|---|---|---|
| ルータ | Router **2911**（Gi0/0 を標準搭載。オンボードのみで手順書のインタフェース名 `GigabitEthernet0/0` と一致、追加モジュール不要） | 1 | R1 |
| スイッチ | Switch **2960**（2960-24TT 等の標準テンプレート。Fa0/1〜Fa0/24 を使用） | 1 | SW1 |
| スイッチ | Switch **2960** | 1 | SW2 |
| PC | PC-PT（汎用 PC。管理端末として使用。Telnet/SSH 接続確認をここから行う） | 1 | PC-Admin |
| PC | PC-PT（汎用 PC） | 1 | PC1 |
| PC | PC-PT（汎用 PC） | 1 | PC2 |

> ルータは Gi0/0 のみ使用するため、2911 の代わりに 1941 でも代替可（どちらもオンボードに GigabitEthernet0/0 を持つ）。PC-PT はデフォルトで FastEthernet0 を標準搭載しているため追加モジュールは不要。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 / GigabitEthernet0/0 | ストレートケーブル | SW1 / FastEthernet0/24 |
| SW1 / FastEthernet0/1 | ストレートケーブル | PC-Admin / FastEthernet0 |
| SW1 / FastEthernet0/2 | ストレートケーブル | PC1 / FastEthernet0 |
| SW1 / FastEthernet0/23 | クロスオーバーケーブル | SW2 / FastEthernet0/24 |
| SW2 / FastEthernet0/1 | ストレートケーブル | PC2 / FastEthernet0 |

- ケーブルは「自動選択（Automatically Choose Connection Type）」で可（Packet Tracer の 2960 は auto-MDIX 対応のためストレートでもリンクアップする）。ただし手順書は「同種機器同士はクロス」の原則に沿って SW1⟷SW2 間を明示的にクロスオーバーケーブルで結線するよう指定しているため、この開始ファイルでも上表のとおりクロスオーバーケーブルを明示的に選ぶこと。
- SW1 の Fa0/3〜Fa0/22 は本ラボ全体で未使用（手順10で受講者が `shutdown` する対象）。開始ファイルではこれらのポートには一切結線しない。
- 配線後、アクセスポートは起動直後は橙 → 約30秒でSTP収束し緑になる。**全リンクが緑になるまで待ってから保存する。**

## 3. PC/サーバ設定

開始ファイル（`day16_start.pkt`）では、下表の値をあらかじめ Desktop > IP Configuration に入力済みにして保存する（レベル A のため PC 側は完成済み）。本ラボはルーティングを扱わず全機器が同一の管理セグメント（192.168.10.0/24）上にいる前提のため、デフォルトゲートウェイは**設定不要**（手順書に明記）。

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC-Admin | 192.168.10.10 | 255.255.255.0 | 未設定（本ラボはルーティング非対象） | DNS 未使用 |
| PC1 | 192.168.10.11 | 255.255.255.0 | 未設定 | DNS 未使用 |
| PC2 | 192.168.10.12 | 255.255.255.0 | 未設定 | DNS 未使用 |

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

- R1: `Router>` プロンプトの工場出荷状態のまま配置・保存する（`GigabitEthernet0/0` の IP アドレス含め、hostname・enable secret・SSH 関連コマンドは一切入力しない）。IP アドレス設定は手順書「手順1」で受講者自身が行う操作としてラボの一部に組み込まれている。
- SW1 / SW2: `Switch>` プロンプトの工場出荷状態のまま配置・保存する（VLAN1 の SVI IP・ホスト名などは未設定。Fa0/3〜Fa0/22 も `shutdown` せず初期状態のまま）。
- これはレベル A の定義（機器配置＋全ケーブル＋PC/サーバのIP設定済み。ルータ/スイッチは未設定＝ホスト名すら未設定の初期状態）どおりであり、SSH・ローカル AAA・ログイン保護という「デバイス堅牢化」そのものが本日の学習対象であるため。

## 5. 完成コンフィグ（`day16_answer.pkt` 用・講師用）

ラボ手順書の手順1〜13を反映した、全手順完了後の最終状態。`copy running-config startup-config` まで実行済みとする。

> 注1: 手順4（`service password-encryption`）は手順書の本文中で **R1 のみ**にコマンドが示され、手順2・3・5・6のような「SW1・SW2 も同様に」という明示的な拡張指示が書かれていない。手順13の検証コマンドも R1 でのみ `show running-config | include (secret|password)` を確認する構成になっている。この非対称性は手順書の記述に忠実な講師用見本として、SW1・SW2 には適用しない。
> 注2: 手順8（`login block-for`）と手順9（`banner motd`）も手順書本文では R1 のみにコマンドが示され、SW1・SW2 への拡張指示がない（手順8の検証は PC-Admin → R1 の SSH 失敗を使う設計のため R1 前提）。よって講師用見本でも R1 のみに適用する。
> 注3: 手順10（Fa0/3〜Fa0/22 の閉塞）は SW1 のみが対象（手順書に明記）。
> 注4: hostname／ドメイン名／`enable secret`／ローカル AAA（`username ... secret` + `login local`）／SSHv2 有効化／VTY の `transport input ssh` + `exec-timeout`／`no ip domain-lookup` は手順書が明示的に「R1・SW1・SW2 それぞれで実施」「SW1・SW2 にも同様に」と指定しているため全3台に適用する。

### R1

```
enable
configure terminal
interface gigabitEthernet 0/0
ip address 192.168.10.1 255.255.255.0
no shutdown
exit
hostname R1
ip domain-name lab.local
enable secret Cisco@12345
username admin secret Admin@12345
line console 0
login local
exit
line vty 0 4
login local
password Vty@12345
exit
service password-encryption
crypto key generate rsa
```

（`How many bits in the modulus [512]:` と聞かれたら `1024` を入力）

```
ip ssh version 2
line vty 0 4
transport input ssh
exec-timeout 5 0
exit
login block-for 60 attempts 3 within 30
banner motd #
This system is for authorized use only.
Unauthorized access is prohibited and may be subject to legal action.
#
no ip domain-lookup
end
copy running-config startup-config
```

### SW1

```
enable
configure terminal
hostname SW1
ip domain-name lab.local
enable secret Cisco@12345
username admin secret Admin@12345
line console 0
login local
exit
line vty 0 4
login local
password Vty@12345
exit
crypto key generate rsa
```

（モジュラスは `1024`）

```
ip ssh version 2
line vty 0 4
transport input ssh
exec-timeout 5 0
exit
interface range fastEthernet 0/3-22
shutdown
exit
interface vlan 1
ip address 192.168.10.2 255.255.255.0
no shutdown
exit
no ip domain-lookup
end
copy running-config startup-config
```

### SW2

```
enable
configure terminal
hostname SW2
ip domain-name lab.local
enable secret Cisco@12345
username admin secret Admin@12345
line console 0
login local
exit
line vty 0 4
login local
password Vty@12345
exit
crypto key generate rsa
```

（モジュラスは `1024`）

```
ip ssh version 2
line vty 0 4
transport input ssh
exec-timeout 5 0
exit
interface vlan 1
ip address 192.168.10.3 255.255.255.0
no shutdown
exit
no ip domain-lookup
end
copy running-config startup-config
```

### PC-Admin / PC1 / PC2（Desktop > IP Configuration、参考・開始ファイルの時点で入力済み）

```
PC-Admin   IP: 192.168.10.10  Mask: 255.255.255.0  GW: 未設定
PC1        IP: 192.168.10.11  Mask: 255.255.255.0  GW: 未設定
PC2        IP: 192.168.10.12  Mask: 255.255.255.0  GW: 未設定
```

### 確認用コマンド（講師が動作確認する際の参考。手順7・8・13に対応）

```
R1# show ip ssh
R1# show running-config | include transport
R1# show running-config | include (secret|password)
R1# show login
SW1# show interfaces status
```

PC-Admin の Command Prompt から：

```
telnet 192.168.10.1
ssh -l admin 192.168.10.1
```

- `telnet 192.168.10.1` は `transport input ssh` により拒否される（接続確立しない）ことを確認する。
- `ssh -l admin 192.168.10.1` はユーザ名 `admin` / パスワード `Admin@12345` で成功する。
- ブルートフォース緩和の確認は、誤ったパスワードで `ssh -l admin 192.168.10.1` を30秒以内に3回連続失敗させ、60秒以内に `R1# show login` を実行して Quiet-Mode（ブロック中）の表示を確認する。60秒経過後は自動的に解除され通常状態に戻る。

## 6. 組み立て後チェック

- [ ] R1-SW1（Gi0/0⟷Fa0/24）、SW1-PC-Admin（Fa0/1）、SW1-PC1（Fa0/2）、SW1-SW2（Fa0/23⟷Fa0/24）、SW2-PC2（Fa0/1）の全 Ethernet リンクが緑
- [ ] `day16_start.pkt` では R1・SW1・SW2 が初期状態（ホスト名未設定、`Router>` / `Switch>` プロンプト、IP・SSH・AAA設定なし）＝レベル A どおり本題（堅牢化）が未設定で残っている
- [ ] `day16_start.pkt` では SW1 の Fa0/3〜Fa0/22 が `shutdown` されていない（手順10で受講者が行う操作のため未実施のまま）
- [ ] PC-Admin / PC1 / PC2 の IP Configuration が上記の値で入力済み、デフォルトゲートウェイは空欄
- [ ] 講師用 `day16_answer.pkt` を別途作成し、上記「完成コンフィグ」を R1・SW1・SW2 に投入した状態で、PC-Admin → R1（192.168.10.1）、PC-Admin → SW1 の SVI（192.168.10.2）、PC-Admin → SW2 の SVI（192.168.10.3）への ping が全て成功することを確認
- [ ] `day16_answer.pkt` で PC-Admin → R1 の `telnet 192.168.10.1` が拒否され、`ssh -l admin 192.168.10.1`（パスワード `Admin@12345`）が成功することを確認
- [ ] `day16_answer.pkt` の `SW1# show interfaces status` で Fa0/3〜Fa0/22 が `disabled` になっていることを確認
- [ ] `day16_answer.pkt` の R1 で `show ip ssh` により SSH バージョン2が有効であることを確認
- [ ] `.pkt` として保存後、一度閉じて再度開き、配線・状態（未設定/設定済み）が保たれていることを確認
- [ ] ファイル名が `day16_start.pkt`（開始用）/ `day16_answer.pkt`（完成見本）になっている
