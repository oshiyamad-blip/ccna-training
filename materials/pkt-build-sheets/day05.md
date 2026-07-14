# day05 .pktビルドシート

- **対象ラボ**: `materials/week1/day05-lab.md`（MAC アドレステーブルと ARP の観察、デュプレックス不一致の障害切り分け）
- **作り込みレベル**: **A（配線済み・IP済み）** — 機器配置・全ケーブル・PC の IP 設定まで済ませ、SW1/SW2 は
  ホスト名すら設定していない初期状態（`Switch>` のまま）で保存する。本日のテーマ（MAC/ARP 観察、
  duplex/speed 障害切り分け）はすべて受講者が行う。
- **保存ファイル名**: `day05_start.pkt`

> 参考画像: `materials/images/day05-topology.svg` は現状リポジトリに存在しない
  （ラボ手順書が参照する `day05-topology.png` も未配置）。本シートは
  `day05-lab.md` の「完成トポロジ」節のテキスト記述と IP アドレス割り当て表を
  正として作成している。画像が後日追加された場合は、結線がこのシートと
  食い違っていないか確認すること。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| スイッチ | Cisco 2960 | 2 | SW1, SW2 |
| PC | 汎用 PC（PC-PT） | 4 | PC1, PC2, PC3, PC4 |

- スイッチ間リンクは `GigabitEthernet0/1` を使用するため、2960（Gi0/1 を持つ標準構成）で
  ラボ手順書のコマンド（`interface gigabitEthernet0/1`）とインターフェース名が一致する。
- PC ポート側は `FastEthernet0/1`・`FastEthernet0/2` を使用するため、2960 の Fa ポート数
  （24 ポート）で問題なく足りる。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| PC1 | ストレート | SW1 FastEthernet0/1 |
| PC2 | ストレート | SW1 FastEthernet0/2 |
| PC3 | ストレート | SW2 FastEthernet0/1 |
| PC4 | ストレート | SW2 FastEthernet0/2 |
| SW1 GigabitEthernet0/1 | ストレート（Auto-MDIX） | SW2 GigabitEthernet0/1 |

- 手順書の指定どおり、全リンクを**ストレートケーブル**で結線する（スイッチ間リンクも
  Auto-MDIX によりストレートで可）。Packet Tracer の「自動選択」でも同じ結線になるが、
  赤リンクになった場合は上表のとおり明示的にストレートを選び直すこと。
- PC の物理ポートは自動選択（FastEthernet）でよい。

## 3. PC/サーバ設定

全ノードは同一サブネット `192.168.10.0/24`。**デフォルトゲートウェイは空欄でよい**
（ラボ手順書の指定どおり）。

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.10.11 | 255.255.255.0 | （空欄） | DNS 設定不要 |
| PC2 | 192.168.10.12 | 255.255.255.0 | （空欄） | DNS 設定不要 |
| PC3 | 192.168.10.13 | 255.255.255.0 | （空欄） | DNS 設定不要 |
| PC4 | 192.168.10.14 | 255.255.255.0 | （空欄） | DNS 設定不要 |

Desktop > IP Configuration で Static を選択し、上記の IP / マスクのみ入力する
（Gateway 欄・DNS 欄は空のままでよい）。

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

レベル A の指定どおり、SW1・SW2 はホスト名も設定していない工場出荷状態
（`Switch con0 is now available` のプロンプトのまま）で保存する。手順書の
手順1にあるとおり、`hostname SW1` / `hostname SW2` を含むすべての IOS 設定は
受講者が入力する部分としてビルドシートには含めない。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボの手順1〜9をすべて実施し、**手順9で復旧まで完了させた最終状態**の
コンフィグを示す（採点・質問対応の見本）。障害演習（手順7/7'）は一時的な状態
であり最終状態には残らないため、以下は「復旧後・auto/auto に統一された」
状態のコンフィグとする。

### SW1

```
enable
configure terminal
hostname SW1
!
interface gigabitEthernet0/1
 speed auto
 duplex auto
 exit
!
end
write memory
```

### SW2

```
enable
configure terminal
hostname SW2
!
interface gigabitEthernet0/1
 speed auto
 duplex auto
 exit
!
end
write memory
```

> 補足（講師用・障害演習の再現手順）: 手順7では上記に加えて SW1 側のみ
> 一時的に `interface gigabitEthernet0/1` → `speed 100` → `duplex full` を投入し、
> SW2 側は auto のまま不一致状態を作る。手順7'（発展）では SW1 に `speed 1000`、
> SW2 に `speed 100` を投入してリンクダウンを再現する。いずれも手順9で
> 両端 `speed auto` / `duplex auto` に戻して最終状態（上記コンフィグ）に復旧する。

### PC1〜PC4

IOS 設定なし。IP 設定は「3. PC/サーバ設定」の表のとおり（ラボ全体を通じて
変更なし）。

## 6. 組み立て後チェック

- [ ] SW1・SW2・PC1〜PC4 の全リンクが緑（Auto-MDIX 経由のスイッチ間リンクも含む）
- [ ] SW1・SW2 は `hostname` 未設定（プロンプトが `Switch>` のまま）で、
      `show running-config` に interface 設定などが一切追加されていない
      ＝レベル A どおり本題（MAC/ARP 観察・duplex/speed 設定）が未着手であることを確認
- [ ] PC1〜PC4 の Desktop > IP Configuration に、3. の表のとおり IP/マスクが
      入力済み、Gateway 欄は空欄
- [ ] PC1 の Command Prompt から `ping 192.168.10.12`（同一スイッチ配下）と
      `ping 192.168.10.13`（スイッチ間リンク経由）がともに成功する
      （スイッチが初期状態でも、フラッディング＋学習により疎通は成立する想定）
- [ ] `arp -a`（各 PC）・`show mac address-table`（SW1/SW2）が、保存前の
      通信テストで汚れていないこと（テストで ping した場合は、保存前に
      SW1/SW2 で `clear mac address-table dynamic` を実行し、PC 側の ARP
      キャッシュもクリア、または一度再配置して汚れのない状態で保存する）
- [ ] `day05_start.pkt` として保存し、再度開いて上記の状態が保たれていることを確認
