# day12 .pktビルドシート

- **対象ラボ**: `materials/week3/day12-lab.md`（OSPFv2 シングルエリアの構成と経路制御 —
  R1・R2・R3 の三角形 + R4・PC1・PC2 がぶら下がる構成。エリア 0 の OSPFv2、
  Router ID の明示設定、passive-interface、コストによる経路制御、priority による
  DR 変更）
- **作り込みレベル**: **A（配線済み・IP済み）** — `pkt-build-spec.md` の day12 行の指定
  「ルータ3〜4台の配線・インターフェースIP済み。OSPF設定は空」に従う。汎用の A 定義
  （ルータは未設定＝ホスト名すら未設定の初期状態）ではなく、day11 と同様の個別指定を
  優先する。具体的には、ラボ手順書の**手順1（トポロジ作成・ホスト名・GigabitEthernet
  インターフェースの IPv4 設定）までを投入済み**にし、**手順2（ループバック作成）
  以降 〜 手順9（DR 変更）はすべて受講者が入力する**空の状態で保存する。ループバックは
  Router ID 安定化という OSPF の学習項目そのものであり、手順1（物理インターフェースの
  IP 設定）とは別工程として手順書に独立掲載されているため、あえて未投入のまま残す。
- **保存ファイル名**: `day12_start.pkt`

> 参考画像: `materials/images/day12-topology.svg` を確認済み。結線（R1 Gi0/0-R2 Gi0/0、
> R1 Gi0/1-R3 Gi0/0、R2 Gi0/1-R3 Gi0/1、R1 Gi0/2-R4 Gi0/0、R2 Gi0/2-PC2、R4 Gi0/1-PC1）・
> インターフェース名・各セグメントの IP は、いずれも本シートおよび `day12-lab.md` の
> IP アドレス表・「事前準備メモ」と完全一致している。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| ルータ | Cisco 2911 | 4 | R1, R2, R3, R4 |
| PC | 汎用 PC（PC-PT） | 2 | PC1, PC2 |

- 2911 はオンボードで `GigabitEthernet0/0`〜`0/2` の 3 ポートを持つ（ラボ手順書の
  「事前準備メモ」のとおり、2 ポートのみの 2901 ではなく 2911 を使うこと）。
  R1・R2 は 3 ポート（Gi0/0〜0/2）、R3・R4 は 2 ポート（Gi0/0〜0/1）を使用し、
  いずれもオンボード範囲内に収まるため拡張モジュール（HWIC）の追加は不要。
- ラボ手順書 手順1「Router **2911** を 4 台（R1〜R4）、PC を 2 台（PC1・PC2）配置する」
  と一致させている。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| R1 GigabitEthernet0/0 | ストレート | R2 GigabitEthernet0/0 |
| R1 GigabitEthernet0/1 | ストレート | R3 GigabitEthernet0/0 |
| R2 GigabitEthernet0/1 | ストレート | R3 GigabitEthernet0/1 |
| R1 GigabitEthernet0/2 | ストレート | R4 GigabitEthernet0/0 |
| R2 GigabitEthernet0/2 | ストレート | PC2 FastEthernet0 |
| R4 GigabitEthernet0/1 | ストレート | PC1 FastEthernet0 |

- ラボ手順書 手順1の指定どおり**全リンクがストレートケーブル**（GigabitEthernet
  ポートは auto-mdix のためルータ同士でもストレートで結線可能）。Packet Tracer の
  「自動選択（Automatically Choose Connection Type）」でも同じ結線になるが、赤リンクに
  なった場合は上表のとおり手動でストレートを選び直すこと。
- R1・R2・R3 が三角形（R1-R2、R1-R3、R2-R3）を形成し、そこから R1-R4（支線）、
  R2-PC2（LAN）、R4-PC1（LAN）がぶら下がる構成。取り違えないよう配線後に
  `show cdp neighbors` や結線図で必ず確認する。
- 全リンクが緑になるまで待ってから次に進む。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.4.10 | 255.255.255.0 | 192.168.4.1 | DNS: 未設定（本ラボでは不使用） |
| PC2 | 192.168.2.10 | 255.255.255.0 | 192.168.2.1 | DNS: 未設定（本ラボでは不使用） |

- Desktop > IP Configuration で Static を選択し、IP アドレス・サブネットマスク・
  デフォルトゲートウェイを入力済みにする（レベル A の指定どおり PC 側は投入済み）。

## 4. 貼り付け用コンフィグ（事前設定）

ラボ手順書の**手順1（ホスト名・GigabitEthernet インターフェースの IPv4 設定・
`no shutdown`）までを投入済み**にする。`enable` → `configure terminal` から開始する
前提で、以下をそのまま各ルータの CLI に貼り付ける。**Loopback0 の作成（手順2）、
`router ospf 1` 以降のすべて（Router ID、network 文、passive-interface、コスト変更、
priority 変更。手順2〜9）は一切含めない**——これが day12 の本題であり、受講者が
入力する部分として空のまま残す。

### R1

```
enable
configure terminal
hostname R1
interface GigabitEthernet0/0
 ip address 10.0.12.1 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/1
 ip address 10.0.13.1 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/2
 ip address 10.0.14.1 255.255.255.0
 no shutdown
 exit
end
copy running-config startup-config
```

### R2

```
enable
configure terminal
hostname R2
interface GigabitEthernet0/0
 ip address 10.0.12.2 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/1
 ip address 10.0.23.2 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/2
 ip address 192.168.2.1 255.255.255.0
 no shutdown
 exit
end
copy running-config startup-config
```

### R3

```
enable
configure terminal
hostname R3
interface GigabitEthernet0/0
 ip address 10.0.13.3 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/1
 ip address 10.0.23.3 255.255.255.0
 no shutdown
 exit
end
copy running-config startup-config
```

### R4

```
enable
configure terminal
hostname R4
interface GigabitEthernet0/0
 ip address 10.0.14.4 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/1
 ip address 192.168.4.1 255.255.255.0
 no shutdown
 exit
end
copy running-config startup-config
```

### PC1・PC2

IOS 設定は存在しない（PC のため）。IP 設定は「3. PC/サーバ設定」のとおり投入済み。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボの手順1〜9をすべて実施し、`copy running-config startup-config` まで
完了させた**最終状態**（手順8のコスト変更・手順9の DR 変更を反映済み）のコンフィグを
示す（採点・質問対応の見本）。

> 注意: `clear ip ospf process`（手順9で R1・R2 双方に実行）は**特権 EXEC モードの
> 一時的な動作コマンド**であり、`running-config`/`startup-config` には残らない。
> 下記コンフィグを投入したあと、別途 R1・R2 で実行して DR 再選出を発生させること。

### R1（最終状態）

```
enable
configure terminal
hostname R1
interface GigabitEthernet0/0
 ip address 10.0.12.1 255.255.255.0
 ip ospf cost 50
 ip ospf priority 200
 no shutdown
 exit
interface GigabitEthernet0/1
 ip address 10.0.13.1 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/2
 ip address 10.0.14.1 255.255.255.0
 no shutdown
 exit
interface Loopback0
 ip address 1.1.1.1 255.255.255.255
 exit
router ospf 1
 router-id 1.1.1.1
 network 10.0.12.0 0.0.0.255 area 0
 network 10.0.13.0 0.0.0.255 area 0
 network 10.0.14.0 0.0.0.255 area 0
 network 1.1.1.1 0.0.0.0 area 0
 exit
end
copy running-config startup-config
```

このあと特権 EXEC モードで `clear ip ospf process`（`yes` で確認）を実行する。

### R2（最終状態）

```
enable
configure terminal
hostname R2
interface GigabitEthernet0/0
 ip address 10.0.12.2 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/1
 ip address 10.0.23.2 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/2
 ip address 192.168.2.1 255.255.255.0
 no shutdown
 exit
interface Loopback0
 ip address 2.2.2.2 255.255.255.255
 exit
router ospf 1
 router-id 2.2.2.2
 network 10.0.12.0 0.0.0.255 area 0
 network 10.0.23.0 0.0.0.255 area 0
 network 192.168.2.0 0.0.0.255 area 0
 network 2.2.2.2 0.0.0.0 area 0
 passive-interface GigabitEthernet0/2
 exit
end
copy running-config startup-config
```

このあと特権 EXEC モードで `clear ip ospf process`（`yes` で確認）を実行する。

### R3（最終状態）

```
enable
configure terminal
hostname R3
interface GigabitEthernet0/0
 ip address 10.0.13.3 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/1
 ip address 10.0.23.3 255.255.255.0
 no shutdown
 exit
interface Loopback0
 ip address 3.3.3.3 255.255.255.255
 exit
router ospf 1
 router-id 3.3.3.3
 network 10.0.13.0 0.0.0.255 area 0
 network 10.0.23.0 0.0.0.255 area 0
 network 3.3.3.3 0.0.0.0 area 0
 exit
end
copy running-config startup-config
```

### R4（最終状態）

```
enable
configure terminal
hostname R4
interface GigabitEthernet0/0
 ip address 10.0.14.4 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/1
 ip address 192.168.4.1 255.255.255.0
 no shutdown
 exit
interface Loopback0
 ip address 4.4.4.4 255.255.255.255
 exit
router ospf 1
 router-id 4.4.4.4
 network 10.0.14.0 0.0.0.255 area 0
 network 192.168.4.0 0.0.0.255 area 0
 network 4.4.4.4 0.0.0.0 area 0
 passive-interface GigabitEthernet0/1
 exit
end
copy running-config startup-config
```

### PC1・PC2

IP 設定は「3. PC/サーバ設定」のまま変更なし。

- 完成状態での確認結果の想定（`clear ip ospf process` を R1・R2 双方で実行済みの後）:
  - 各ルータの `show ip ospf neighbor`：R1 は R2・R3・R4 の 3 台と、R2・R3 は互いに、
    R2 は R1 と、R4 は R1 とそれぞれ **FULL** でネイバー確立
  - `10.0.12.0/24`（R1-R2 間）の DR/BDR：R1（priority 200、Router ID 1.1.1.1）が
    **DR**、R2（既定 priority 1、Router ID 2.2.2.2）が **BDR**
  - `show ip route ospf`：各ルータで他ルータのループバック（`1.1.1.1/32`〜
    `4.4.4.4/32`）と LAN（`192.168.2.0/24`、`192.168.4.0/24`）が `O` で学習される
  - PC1（192.168.4.10）→ PC2（192.168.2.10）の `ping`：成功
  - R4 から `traceroute 192.168.2.10`：`ip ospf cost 50` を R1 Gi0/0 に投入後は
    **R1 → R3 → R2** の迂回経路（総コスト: R1-R2 直結 = 50+1=51 相当に対し、
    R1-R3-R2 経由 = 1+1+1=3 相当と迂回側が低コストになるため）を経由する
  - `show ip protocols`：各ルータで Router ID・参加ネットワーク・AD（110）が表示され、
    R2・R4 で `passive-interface` に該当インターフェースが表示される

## 6. 組み立て後チェック

- [ ] R1-R2、R1-R3、R2-R3、R1-R4、R2-PC2、R4-PC1 の全リンク（6本）が緑
- [ ] R1〜R4 とも `hostname` が投入済み（プロンプトが `R1#`〜`R4#`）で、
      `show ip interface brief` を実行すると、IP アドレス表どおりの IPv4 アドレスが
      設定され、接続済みの GigabitEthernet インターフェースがすべて `up`/`up`
      であることを確認
- [ ] レベル A の指定どおり、`show running-config | section router ospf` が
      **何も表示しない**、かつ `show ip interface brief` に `Loopback0` が
      表示されない（Loopback 未作成・OSPF プロセス未起動）＝手順2以降が本題として
      残っていること
- [ ] PC1・PC2 の Desktop > IP Configuration に、3. の表のとおり IP・マスク・
      デフォルトゲートウェイが入力済み
- [ ] この時点では OSPF 未構成のため、PC1 (192.168.4.10) → PC2 (192.168.2.10) の
      `ping` は失敗する（`Request timed out.`）ことを確認 ＝手順3以降で OSPF を
      構成して初めて疎通する状態が保たれていること
- [ ] `day12_start.pkt` として保存し、再度開いて配線・ホスト名・インターフェース IP・
      PC の IP が保持され、Loopback・OSPF 設定は未投入のままであることを確認
