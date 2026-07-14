# day07 .pktビルドシート

- **対象ラボ**: `materials/week2/day07-lab.md`（トランクの構築とネイティブ VLAN 不一致のトラブルシューティング）
- **作り込みレベル**: **C（前提設定済み）** — レベル A（機器配置・全ケーブル・PC の IP 設定済み）に加えて、
  「その日の前半の完成状態」として **両スイッチに VLAN10（SALES）・VLAN20（DEV）の作成とアクセスポートへの
  割り当てを投入済み**にする（`pkt-build-spec.md` の day07 行の指定どおり）。SW1-SW2 間の
  **Fa0/24 はまだトランク化しない**（既定の `dynamic auto` のまま）。受講者は手順3（トランク未設定での
  疎通確認＝失敗を観察）から着手し、手順4〜8（トランク化・許可 VLAN・ネイティブ VLAN・DTP 無効化）を行う。
- **保存ファイル名**: `day07_start.pkt`

> 参考画像: `materials/images/day07-topology.svg` を確認済み。ただしこの図は
  **手順6・7完了後の最終状態**（ネイティブ VLAN 99・許可 VLAN 10,20 のトランク）を示しており、
  本ビルドシートが作る開始ファイルの状態（Fa0/24 は未トランク）とは異なる。結線・IP・ポート番号のみを
  参照し、トランク関連の描画（紫色のトランクリンク・Native VLAN 99 ラベル）は開始ファイルには反映しない。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| スイッチ | Cisco 2960 | 2 | SW1, SW2 |
| PC | 汎用 PC（PC-PT） | 4 | PC1, PC2, PC3, PC4 |

- 手順書のコマンドは `fastEthernet 0/1`・`fastEthernet 0/2`・`fastEthernet 0/24` のみを使用するため、
  2960（Fa ポート24＋Gi アップリンク2 の標準構成）でポート名が完全に一致する。
- スイッチ間トランクにも `Fa0/24`（10/100 の FastEthernet）を使う点に注意（Gi ポートではない）。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| PC1 | ストレート | SW1 FastEthernet0/1 |
| PC2 | ストレート | SW1 FastEthernet0/2 |
| PC3 | ストレート | SW2 FastEthernet0/1 |
| PC4 | ストレート | SW2 FastEthernet0/2 |
| SW1 FastEthernet0/24 | **クロス**（手順書 手順1-4 の指定） | SW2 FastEthernet0/24 |

- PC-スイッチ間はすべてストレートケーブル。
- **SW1-SW2 間のみクロスケーブルを明示的に選択する**こと（手順書に「クロスケーブルで接続する」と
  明記されている）。Packet Tracer の「自動選択」を使うとストレートが選ばれ Auto-MDIX で通信自体は
  成立してしまう場合があるが、手順書の記述と一致させるため必ずクロスケーブルを手動選択する。
- 全リンクが緑になるまで待ってから次に進む。

## 3. PC/サーバ設定

デフォルトゲートウェイは**全 PC とも空欄**（本ラボは L2 のみが対象のため）。

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.10.11 | 255.255.255.0 | （空欄） | VLAN10（SALES）／ SW1 Fa0/1 |
| PC2 | 192.168.20.21 | 255.255.255.0 | （空欄） | VLAN20（DEV）／ SW1 Fa0/2 |
| PC3 | 192.168.10.13 | 255.255.255.0 | （空欄） | VLAN10（SALES）／ SW2 Fa0/1 |
| PC4 | 192.168.20.22 | 255.255.255.0 | （空欄） | VLAN20（DEV）／ SW2 Fa0/2 |

Desktop > IP Configuration で Static を選択し、IP アドレスとサブネットマスクのみ入力する
（Gateway 欄・DNS 欄は空のまま）。PC2 の IP は `192.168.20.21`（VLAN20 側）である点に注意
（PC1・PC3 が VLAN10 の `192.168.10.x`、PC2・PC4 が VLAN20 の `192.168.20.x`）。

## 4. 貼り付け用コンフィグ（事前設定）

レベル C の指定どおり、**両スイッチとも「VLAN 作成＋アクセスポート割り当て」までを投入済み**にする
（手順書の手順1・手順2に相当）。**Fa0/24 には一切手を加えない**（既定の `dynamic auto`、
`switchport mode trunk` 等は未設定のまま）。ホスト名を変更するコマンドは手順書中に一度も
登場しないため、**ホスト名は初期値 `Switch` のまま**にする（配置名 SW1/SW2 は Packet Tracer
上のデバイスラベルのみで、IOS の hostname とは別物）。

CLI タブを開き、`enable` → `configure terminal` から以下をそのまま貼り付ける。

### SW1（貼り付け用）

```
enable
configure terminal
vlan 10
name SALES
exit
vlan 20
name DEV
exit
interface range fastEthernet 0/1 - 2
switchport mode access
exit
interface fastEthernet 0/1
switchport access vlan 10
exit
interface fastEthernet 0/2
switchport access vlan 20
exit
end
```

### SW2（貼り付け用）

```
enable
configure terminal
vlan 10
name SALES
exit
vlan 20
name DEV
exit
interface range fastEthernet 0/1 - 2
switchport mode access
exit
interface fastEthernet 0/1
switchport access vlan 10
exit
interface fastEthernet 0/2
switchport access vlan 20
exit
end
```

- 貼り付け後、両スイッチで `show vlan brief` を実行し、Fa0/1 が VLAN10、Fa0/2 が VLAN20 に
  正しく入っていることを確認してから保存する。
- `write memory` は不要（`.pkt` は現在の running-config をそのまま保存するため）。ただし
  誤操作防止のため保存前に `copy running-config startup-config` を実行しておいてもよい。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボの手順1〜8をすべて実施し、**手順8完了・`copy running-config startup-config` まで終えた
最終状態**のコンフィグを示す（採点・質問対応の見本）。手順6のVLAN20一時遮断や手順7のネイティブVLAN
不一致は一時的な演習状態であり最終状態には残らないため、以下は「復旧・統一後」の状態とする。

### SW1

```
enable
configure terminal
vlan 10
name SALES
exit
vlan 20
name DEV
exit
vlan 99
name NATIVE
exit
interface range fastEthernet 0/1 - 2
switchport mode access
exit
interface fastEthernet 0/1
switchport access vlan 10
exit
interface fastEthernet 0/2
switchport access vlan 20
exit
interface fastEthernet 0/24
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 10,20
switchport nonegotiate
exit
end
copy running-config startup-config
```

### SW2

```
enable
configure terminal
vlan 10
name SALES
exit
vlan 20
name DEV
exit
vlan 99
name NATIVE
exit
interface range fastEthernet 0/1 - 2
switchport mode access
exit
interface fastEthernet 0/1
switchport access vlan 10
exit
interface fastEthernet 0/2
switchport access vlan 20
exit
interface fastEthernet 0/24
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 10,20
switchport nonegotiate
exit
end
copy running-config startup-config
```

> 補足（講師用・演習手順の再現）: 手順3ではトランク化前（上記から `interface fastEthernet 0/24`
> 以下の4行（`switchport mode trunk` / `switchport trunk native vlan 99` /
> `switchport trunk allowed vlan 10,20` / `switchport nonegotiate`）を除いた状態）で
> PC1→PC3 の ping が失敗することを確認させる。手順6では SW1 の Fa0/24 に
> 一時的に `switchport trunk allowed vlan 10`（`add` なし）を投入して VLAN20 を遮断し、
> `switchport trunk allowed vlan add 20` で `10,20` に復旧させる（結果は上記の最終状態と同じ）。
> 手順7では SW1 のみ先に `switchport trunk native vlan 99` を投入し、SW2 が VLAN1 のままの間
> `%CDP-4-NATIVE_VLAN_MISMATCH` を発生させたのち、SW2 にも同じコマンドを投入して解消させる。

### PC1〜PC4

IOS 設定なし。IP 設定は「3. PC/サーバ設定」の表のとおり（ラボ全体を通じて変更なし）。

## 6. 組み立て後チェック

- [ ] SW1・SW2・PC1〜PC4 の全リンクが緑（SW1-SW2 間のクロスケーブルも含む）
- [ ] レベル C の指定どおり、両スイッチで `show vlan brief` に VLAN10（SALES: Fa0/1）・
      VLAN20（DEV: Fa0/2）が正しく表示され、かつ **`show interfaces trunk` は何も表示しない**
      （Fa0/24 がまだ `access`/`dynamic auto` のままで、トランク関連コマンドが一切未投入＝
      本題である手順4〜8が未着手であることを確認）
- [ ] PC1〜PC4 の Desktop > IP Configuration に、3. の表のとおり IP/マスクが入力済み、
      Gateway 欄は空欄
- [ ] **この時点ではスイッチをまたぐ ping（例: PC1→PC3、PC2→PC4）は失敗するのが正解**
      （手順3で受講者が観察する内容そのものであり、Fa0/24 が未トランクのため）。誤って
      保存前に手順4以降まで進めてしまっていないか、`show interfaces trunk` が空であることで
      再確認する
- [ ] 保存前のテストで PC の ARP キャッシュや `show mac address-table` が汚れていないか確認し、
      汚れていれば SW1/SW2 で `clear mac address-table dynamic` を実行してから保存する
      （汚れが残っていても手順3の学習効果を大きく損なうものではないが、クリーンな状態が望ましい）
- [ ] `day07_start.pkt` として保存し、再度開いて上記の状態（VLAN・アクセスポートは投入済み、
      トランクは未設定）が保たれていることを確認
