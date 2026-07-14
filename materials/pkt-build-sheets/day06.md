# day06 .pktビルドシート

- **対象ラボ**: `materials/week2/day06-lab.md`（VLAN の作成とブロードキャストドメインの分離検証）
- **作り込みレベル**: **A（配線済み・IP済み）** — 機器配置・全ケーブル・PC の IP 設定まで済ませ、SW1 は
  ホスト名すら設定していない初期状態（`Switch>` のまま）で保存する。本日のテーマ（VLAN 10/20 の作成、
  アクセスポートへの割り当て）はすべて受講者が行う。
- **保存ファイル名**: `day06_start.pkt`

> 参考画像: `materials/images/day06-topology.svg` は現状リポジトリに存在しない
> （ラボ手順書が参照する `day06-topology.png` も未配置）。本シートは
> `day06-lab.md` の「IP アドレス表」および手順1の結線指示を正として作成している。
> 画像が後日追加された場合は、結線がこのシートと食い違っていないか確認すること。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| スイッチ | Cisco 2960 | 1 | SW1 |
| PC | 汎用 PC（PC-PT） | 4 | PC1, PC2, PC3, PC4 |

- 手順書のコマンドは `interface range fastEthernet 0/1 - 2` のように `FastEthernet0/1`〜`0/4`
  のみを使用するため、2960（標準 Fa ポート構成）でインターフェース名がそのまま一致する。
  ルータは登場しないラボである。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| PC1 FastEthernet0 | ストレート | SW1 FastEthernet0/1 |
| PC2 FastEthernet0 | ストレート | SW1 FastEthernet0/2 |
| PC3 FastEthernet0 | ストレート | SW1 FastEthernet0/3 |
| PC4 FastEthernet0 | ストレート | SW1 FastEthernet0/4 |

- 手順書の指定どおり、全リンクを**ストレートケーブル**で結線する。Packet Tracer の
  「自動選択（Automatically Choose Connection Type）」でも同じ結線になるが、赤リンクに
  なった場合は上表のとおり明示的にストレートを選び直すこと。
- SW1 側の Fa0/5〜0/24 など未使用ポートには何も接続しない。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.10.11 | 255.255.255.0 | （空欄・未設定） | DNS 設定不要 |
| PC2 | 192.168.10.12 | 255.255.255.0 | （空欄・未設定） | DNS 設定不要 |
| PC3 | 192.168.20.21 | 255.255.255.0 | （空欄・未設定） | DNS 設定不要 |
| PC4 | 192.168.20.22 | 255.255.255.0 | （空欄・未設定） | DNS 設定不要 |

- Desktop > IP Configuration で Static を選択し、上記の IP / マスクのみ入力する
  （Gateway 欄・DNS 欄は空のままでよい）。手順書の注記のとおり、本ラボでは VLAN 間
  ルーティングを扱わないため、デフォルトゲートウェイは意図的に未設定とする。
- PC1・PC2 は 192.168.10.0/24（後に VLAN 10 = SALES に収容）、PC3・PC4 は
  192.168.20.0/24（後に VLAN 20 = IT に収容）である。ただし **VLAN 自体は受講者が
  作成する部分なので、開始ファイルの SW1 には VLAN 10/20 も、Fa0/1〜0/4 への
  access vlan 割り当ても一切投入しない**（全ポートは初期状態の VLAN 1 のまま）。

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

レベル A の指定どおり、SW1 はホスト名も設定していない工場出荷状態
（`Switch con0 is now available` のプロンプトのまま、`Switch>`）で保存する。
`vlan 10` / `vlan 20` の作成、`switchport access vlan` によるポート割り当てなど、
ラボ本編（手順3・手順4）で扱う設定はすべて受講者が入力する部分であり、
ビルドシートには含めない。手順書の手順2（`show vlan brief` で全ポートが
VLAN 1 のままであることの確認）が成立するよう、必ず SW1 を初期状態のまま保存すること。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボの手順1〜7をすべて実施し、`copy running-config startup-config` まで
完了させた**最終状態**のコンフィグを示す（採点・質問対応の見本）。

### SW1

```
enable
configure terminal
hostname SW1
!
vlan 10
 name SALES
 exit
!
vlan 20
 name IT
 exit
!
interface range fastEthernet 0/1 - 2
 switchport mode access
 switchport access vlan 10
 exit
!
interface range fastEthernet 0/3 - 4
 switchport mode access
 switchport access vlan 20
 exit
!
end
copy running-config startup-config
```

- 確認コマンド（設定には影響しないが、講師が採点時に使う想定）:
  `show vlan brief`／`show interfaces fastEthernet 0/1 switchport`／
  `show mac address-table`

### PC1〜PC4

IOS 設定なし。IP 設定は「3. PC/サーバ設定」の表のとおり（ラボ全体を通じて変更なし）。

- 完成状態での疎通確認の想定結果:
  - PC1 (192.168.10.11) → PC2 (192.168.10.12)：成功（同一 VLAN 10）
  - PC3 (192.168.20.21) → PC4 (192.168.20.22)：成功（同一 VLAN 20）
  - PC1 (192.168.10.11) → PC3 (192.168.20.21)：`Destination host unreachable.`
    （異なる VLAN・異なるサブネットかつデフォルトゲートウェイ未設定のため失敗）

## 6. 組み立て後チェック

- [ ] PC1〜PC4・SW1 間の全リンクが緑
- [ ] SW1 は `hostname` 未設定（プロンプトが `Switch>` のまま）で、`show vlan brief` を
      実行すると Fa0/1〜Fa0/4 を含む全ポートが **VLAN 1（default）** のままであることを
      確認 ＝レベル A どおり本題（VLAN 10/20 の作成とポート割り当て）が未着手であること
- [ ] SW1 に `vlan 10`／`vlan 20` がまだ作成されていない（`show vlan brief` の
      一覧に SALES・IT が出てこない）
- [ ] PC1〜PC4 の Desktop > IP Configuration に、3. の表のとおり IP/マスクが
      入力済み、Gateway 欄は空欄
- [ ] 保存前の動作確認として PC1 の Command Prompt から `ping 192.168.10.12` を
      実行し、スイッチが初期状態（VLAN 1 一括のフラットネットワーク）でも
      疎通すること自体は確認してよいが、確認後は SW1 で
      `clear mac address-table dynamic`、各 PC で ARP キャッシュをクリア
      （または一度再配置）してから保存し、汚れのない状態で `day06_start.pkt` を残す
- [ ] `day06_start.pkt` として保存し、再度開いて上記の状態（配線・PC IP 済み、
      SW1 初期状態）が保たれていることを確認
