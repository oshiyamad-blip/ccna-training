# day18 .pktビルドシート

- **対象ラボ**: `materials/week4/day18-lab.md`（ポートセキュリティと DHCP スヌーピングによる L2 セキュリティ強化）
- **作り込みレベル**: **C（前提設定済み）** — レベル A（機器配置・全ケーブル・PC/サーバの IP 設定済み）に加えて、
  「その日の前半＝準備パート」である **手順1（R1 の DHCP サーバ設定）と手順2（Rogue Server の DHCP サービス
  有効化）を投入済み**にする（`pkt-build-spec.md` の day18 行の指定どおり）。**SW1 は完全な初期状態**
  （ホスト名すら未設定）のまま残し、本題である手順3〜6（ポートセキュリティ・DHCP スヌーピング）を
  受講者がゼロから設定する。
- **保存ファイル名**: `day18_start.pkt`

> 参考画像: `materials/images/day18-topology.svg` を確認済み。図中の色分け（trusted アップリンク・
  ポートセキュリティ適用ポート・untrusted）は**完成後の状態**を示す注記であり、開始ファイル自体には
  SW1 側の設定（ポートセキュリティ／DHCP スヌーピング）を反映しない。機器・ポート・IP のみを参照する。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| ルータ | Cisco 2911 | 1 | R1 |
| スイッチ | Cisco 2960 | 1 | SW1 |
| PC | 汎用 PC（PC-PT） | 3 | PC0, PC1, PC2 |
| サーバ | 汎用サーバ（Server-PT） | 1 | Rogue Server |

- ラボのコマンドは R1 側で `interface gi0/0` のみを使用するため、オンボードに Gi0/0・Gi0/1 を持つ
  2911 でポート名が一致する（Gi0/1 は本ラボでは未使用のまま空きポートでよい）。
- SW1 側は `fa0/1`・`fa0/2`・`fa0/23`・`gi0/1` を使用するため、Fa0/1〜24 ＋ Gi0/1・Gi0/2 の標準構成を持つ
  2960 でポート名が完全に一致する。
- PC2 は「違反試験用」端末で、手順4に入るまでケーブルを接続しない（下記 2. 参照）。それでも配置自体は
  最初から行い、ワークスペース上の空いている場所（SW1 の近く）に置いておく。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 GigabitEthernet0/0 | ストレート（自動選択で可） | SW1 GigabitEthernet0/1 |
| PC0 FastEthernet0 | ストレート | SW1 FastEthernet0/1 |
| PC1 FastEthernet0 | ストレート | SW1 FastEthernet0/2 |
| Rogue Server FastEthernet0 | ストレート | SW1 FastEthernet0/23 |
| PC2 FastEthernet0 | **未接続**（配置のみ、手順4で受講者が Fa0/1 に接続する） | — |

- R1-SW1 間、PC-SW1 間、Server-SW1 間はいずれもストレートケーブルで問題ない（Auto-MDIX により
  「自動選択」でも通る）。
- **PC2 は意図的にケーブルを接続しない。** 手順4（違反試験）で受講者が PC0 を Fa0/1 から取り外し、
  代わりに PC2 を Fa0/1 に接続する操作そのものが学習対象のため、開始時点で PC2 をつないでしまうと
  演習が成立しない。
- 接続済みの4本（R1-SW1、PC0-SW1、PC1-SW1、Rogue Server-SW1）のリンクが**全て緑**になるまで待つ。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC0 | DHCP（自動取得に設定） | DHCP（自動取得に設定） | DHCP（自動取得に設定） | Desktop > IP Configuration で **DHCP** を選択するのみ。手動入力しない |
| PC1 | DHCP（自動取得に設定） | DHCP（自動取得に設定） | DHCP（自動取得に設定） | 同上 |
| PC2 | DHCP（自動取得に設定） | DHCP（自動取得に設定） | DHCP（自動取得に設定） | 同上。ただし未接続のため実際に取得はできない（手順4で接続後に取得を試みる） |
| Rogue Server | 192.168.99.1 | 255.255.255.0 | （空欄） | Desktop > IP Configuration は **Static**。Gateway 欄・DNS 欄は空欄のまま |

- PC0・PC1・PC2 はいずれも **Static ではなく DHCP** を選択しておく（IP アドレス欄が自動取得表示に
  なることを確認する）。開始時点では SW1 側の DHCP リレーやポート設定が未完了のため、PC0・PC1 は
  保存前の時点ではまだ正式な IP を取得できていなくてよい（受講者が手順3実施後に `ipconfig /renew`
  で取得する）。
- Rogue Server の Desktop > IP Configuration には **Gateway を入力しない**（ラボ手順書どおり、
  静的 IP とマスクのみ）。

### Rogue Server の DHCP サービス（GUI 設定・CLI 貼り付け不可）

Rogue Server は IOS 機器ではなく Server-PT のため、以下は **CLI コンフィグではなく GUI の Services
タブ**で設定する。手順2の内容そのものであり、事前設定としてここまで済ませておく。

1. Rogue Server をクリック → [Desktop] → IP Configuration → 上記のとおり Static / 192.168.99.1 /
   255.255.255.0 を入力（Gateway は空欄）
2. [Services] タブ → **DHCP** を選択 → **On** にする
3. Default Gateway: `192.168.99.1`
4. Start IP Address: `192.168.99.2`
5. Subnet Mask: `255.255.255.0`
6. **Save** を押してプールを保存する

保存後、DHCP サービスが Pool 一覧に表示されていることを確認する。

## 4. 貼り付け用コンフィグ（事前設定）

レベル C の指定どおり、**R1 のみ**手順1（DHCP サーバ設定）を投入済みにする。**SW1 は完全な初期状態**
（ホスト名も含めて一切設定しない）のまま残す。CLI タブを開き、`enable` → `configure terminal` から
以下をそのまま貼り付ける。

### R1（貼り付け用）

```
enable
configure terminal
interface gigabitEthernet 0/0
ip address 192.168.10.1 255.255.255.0
no shutdown
exit
ip dhcp excluded-address 192.168.10.1
ip dhcp pool LAN
network 192.168.10.0 255.255.255.0
default-router 192.168.10.1
exit
end
copy running-config startup-config
```

### SW1

**事前設定なし（機器は初期状態）。** ホスト名・VLAN・ポートセキュリティ・DHCP スヌーピングのいずれも
未設定のまま、工場出荷時の running-config（`Switch>` プロンプトのまま）で保存する。ポート Fa0/1・
Fa0/2 も `switchport mode dynamic auto`（既定値）のままにしておくこと（手順3-1 で受講者が
`switchport mode access` に固定する操作自体が学習対象）。

- 貼り付け後、R1 で `show ip interface brief` を実行し、Gi0/0 が `192.168.10.1` / `up/up` に
  なっていることを確認してから保存する。

## 5. 完成コンフィグ（`_answer.pkt`用・講師用）

このラボの手順1〜6をすべて実施し、**手順6の最後（trust 設定を元に戻し
`copy running-config startup-config` まで完了した最終状態**のコンフィグを示す（採点・質問対応の見本）。
手順4（違反試験・err-disabled化）と手順6前半（trust を一時的に外す対比実験）は一時的な演習状態であり
最終状態には残らないため、以下は「復旧・統一後」の状態とする。

### R1

```
enable
configure terminal
interface gigabitEthernet 0/0
ip address 192.168.10.1 255.255.255.0
no shutdown
exit
ip dhcp excluded-address 192.168.10.1
ip dhcp pool LAN
network 192.168.10.0 255.255.255.0
default-router 192.168.10.1
exit
end
copy running-config startup-config
```

### SW1

```
enable
configure terminal
interface range fastEthernet 0/1 - 2
switchport mode access
exit
interface fastEthernet 0/1
switchport port-security
switchport port-security maximum 1
switchport port-security mac-address sticky
switchport port-security violation shutdown
exit
interface fastEthernet 0/2
switchport port-security
switchport port-security maximum 1
switchport port-security mac-address sticky
switchport port-security violation shutdown
exit
ip dhcp snooping
ip dhcp snooping vlan 1
no ip dhcp snooping information option
interface gigabitEthernet 0/1
ip dhcp snooping trust
exit
end
copy running-config startup-config
```

> 補足1（sticky MAC について）: `switchport port-security mac-address sticky` は
  PC0・PC1 が実際に通信（`ipconfig /release` → `ipconfig /renew`）した時点で学習した MAC アドレスを
  自動的に running-config へ書き込む。学習後の running-config には
  `switchport port-security mac-address sticky xxxx.xxxx.xxxx`（実際の16進MACアドレス）という行が
  Fa0/1・Fa0/2 それぞれに追加される。この MAC 値は PT インスタンスごとに異なる自動生成値のため、
  上記コンフィグ例には含めていない。**`copy running-config startup-config` を実行しないと sticky
  学習結果は保存されない**ことを受講者に念押しすること。
>
> 補足2（`no ip dhcp snooping information option` について）: ラボ手順書の手順5-4は「Packet Tracer
  上で疎通しない場合は」という条件付きだが、PT 9.x では Option 82 挿入によりリレーなし構成で
  DHCP パケットが破棄される事例が多いため、講師用の完成コンフィグでは標準的に投入済みとしている。
>
> 補足3（演習手順の再現・講師用）: 手順4では Fa0/1 に PC2（未登録 MAC）を接続して違反を発火させ、
  `show interfaces fa0/1 status` の Status が `err-disabled` になることを確認したのち、
  `interface fastEthernet 0/1` → `shutdown` → `no shutdown` で復旧させ、PC2 を外して PC0 を
  Fa0/1 に戻す。手順6前半では `interface gigabitEthernet 0/1` → `no ip dhcp snooping trust` を
  一時投入して正規クライアントの DHCP 取得が失敗することを確認したのち、`ip dhcp snooping trust`
  を再投入して上記の最終状態に戻す。いずれも最終状態には影響しない。

### Rogue Server

IOS 設定なし。「3. PC/サーバ設定」の表および「Rogue Server の DHCP サービス」の手順のとおり
（ラボ全体を通じて変更なし）。

### PC0・PC1・PC2

IOS 設定なし。Desktop > IP Configuration は DHCP のまま。手順5完了後、PC0・PC1 は
`192.168.10.0/24`（正規レンジ）のアドレスを取得している状態が最終形。PC2 は違反試験終了後に
Fa0/1 から取り外され、未接続の状態に戻す（開始時点と同じ）。

## 6. 組み立て後チェック

- [ ] R1・SW1・PC0・PC1・Rogue Server の4本のリンクが全て緑（PC2 は未接続のままでよい）
- [ ] R1 で `show ip interface brief` → Gi0/0 が `192.168.10.1` / `up/up`
- [ ] R1 で `show run | section dhcp` 相当（`show running-config` 内）に `ip dhcp pool LAN` が
      存在することを確認
- [ ] **SW1 は完全な初期状態**であることを確認する — `show running-config` にホスト名変更・
      `switchport port-security`・`ip dhcp snooping` のいずれも一切現れないこと
      （本題である手順3〜6が未着手であることの確認）
- [ ] PC0・PC1 の Desktop > IP Configuration が **DHCP** モードになっている（Static で固定 IP を
      入れていないこと）。保存時点では取得済みアドレスが空、または前回テスト時の残留アドレスが
      入っていても構わないが、受講者が最初に行う `ipconfig /release` → `ipconfig /renew` で
      正しく学習し直せることを確認しておく
- [ ] Rogue Server の Desktop > IP Configuration が `192.168.99.1` / `255.255.255.0`（Gateway 空欄）、
      Services > DHCP が **On** になっており、Default Gateway `192.168.99.1` / Start IP
      `192.168.99.2` / Subnet Mask `255.255.255.0` が保存されている
- [ ] PC2 は配置されているが **SW1 とケーブルで接続されていない**こと
- [ ] `.pkt` で保存後、一度閉じて再度開き、上記の状態（SW1 未設定・R1 は DHCP サーバ設定済み・
      Rogue Server は DHCP サービス On）が保たれていることを確認
- [ ] `day18_start.pkt` として保存する
