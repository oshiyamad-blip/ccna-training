# day09 .pktビルドシート

- **対象ラボ**: `materials/week2/day09-lab.md`（STP の動作観察とルートブリッジの変更、EtherChannel の構成）
- **作り込みレベル**: **A（配線済み・IP済み）** — 機器配置・全ケーブル・PC の IP 設定まで済ませ、
  SW1・SW2・SW3 はホスト名すら設定していない初期状態（`Switch>` のまま）で保存する。デフォルト状態の
  STP（ルートブリッジ選出・ブロッキングポート）を受講者自身に観察させることが手順3の目的のため、
  VLAN 作成・トランク化・`root primary`・RSTP 化・PortFast/BPDU Guard・EtherChannel は**すべて
  受講者が行う**（`pkt-build-spec.md` の day09 行の指定どおり）。
- **保存ファイル名**: `day09_start.pkt`

> 参考画像: `materials/images/day09-topology.svg` を確認済み。結線・ポート番号・IP は
> 本シートと一致している（SW1⇔SW2 は Gi0/1-Gi0/1 トランクに加え Fa0/1-2×2 を LACP で
> EtherChannel 化、SW2⇔SW3 は Gi0/2-Gi0/1、SW3⇔SW1 は Gi0/2-Gi0/2）。ラボ手順書冒頭が参照する
> `day09-topology.png` は本リポジトリの `images/` に存在するが、結線の正はラボ手順書の
> 「結線一覧」テキストであり、本シートもそれに従っている。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名 |
|---|---|---|---|
| スイッチ | Cisco 2960 | 3 | SW1, SW2, SW3 |
| PC | 汎用 PC（PC-PT） | 2 | PC1, PC2 |

- 手順書のコマンドは `gigabitEthernet 0/1`・`gigabitEthernet 0/2`・`fastEthernet 0/1`・
  `fastEthernet 0/2`・`fastEthernet 0/10` のみを使用するため、2960（Fa ポート24 + Gi アップリンク2
  の標準構成）でインターフェース名がそのまま一致する。ルータは登場しないラボである。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| SW1 GigabitEthernet0/1 | クロス（自動選択可） | SW2 GigabitEthernet0/1 |
| SW1 FastEthernet0/1 | クロス（自動選択可） | SW2 FastEthernet0/1 |
| SW1 FastEthernet0/2 | クロス（自動選択可） | SW2 FastEthernet0/2 |
| SW2 GigabitEthernet0/2 | クロス（自動選択可） | SW3 GigabitEthernet0/1 |
| SW3 GigabitEthernet0/2 | クロス（自動選択可） | SW1 GigabitEthernet0/2 |
| PC1 FastEthernet0 | ストレート | SW1 FastEthernet0/10 |
| PC2 FastEthernet0 | ストレート | SW3 FastEthernet0/10 |

- スイッチ同士は同種機器接続のため**クロスケーブル**、PC-スイッチ間は**ストレートケーブル**
  （手順書 手順1-1 の指定）。Packet Tracer の「自動選択（稲妻アイコン）」を使ってもよいが、
  リンクが赤くなった場合は上表のとおり手動でケーブル種別を選び直すこと。
- SW1⇔SW2 間だけ**3 本**（Gi0/1-Gi0/1 のトランク用リンク 1 本 + Fa0/1-Fa0/1・Fa0/2-Fa0/2 の
  EtherChannel 用リンク 2 本）を配線する点に注意。Gi0/1・Gi0/2 同士、Fa0/1・Fa0/2 同士を
  取り違えないこと（手順書 手順1-1 の注記）。
- SW2⇔SW3・SW3⇔SW1 はそれぞれ 1 本ずつで、3 台が三角形（トライアングル）を形成する。
- 全リンクが緑になるまで待ってから次に進む（初期状態では VLAN1 のフラット構成かつ
  トランク未設定のため、STP 収束後に緑になる）。

## 3. PC/サーバ設定

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| PC1 | 192.168.10.11 | 255.255.255.0 | （空欄・未設定） | SW1 Fa0/10 接続、VLAN10 は受講者が作成 |
| PC2 | 192.168.10.12 | 255.255.255.0 | （空欄・未設定） | SW3 Fa0/10 接続、VLAN10 は受講者が作成 |

- Desktop > IP Configuration で Static を選択し、IP アドレスとサブネットマスクのみ入力する
  （Gateway 欄・DNS 欄は空のまま）。本ラボは L2（STP/EtherChannel）が対象で VLAN 間ルーティングを
  扱わないため、デフォルトゲートウェイは意図的に未設定とする。
- ラボ手順書の IP アドレス表にある SW1〜SW3 の「VLAN10（管理用・任意）」IP（192.168.10.1〜.3）は
  手順書上も**任意**扱いであり、受講者が手順1〜2 の中で自身で設定する部分である。開始ファイルの
  スイッチには一切投入しない（後述「4. 貼り付け用コンフィグ」参照）。

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

レベル A の指定どおり、SW1・SW2・SW3 はホスト名も設定していない工場出荷状態
（`Switch con0 is now available` のプロンプトのまま、`Switch>`）で保存する。
`vlan 10` の作成、Fa0/10 のアクセスポート化、3 本のトランク設定、`root primary`、
`spanning-tree mode rapid-pvst`、PortFast/BPDU Guard、`channel-group 1 mode active`、
Port-channel 1 のトランク化など、ラボ本編（手順1〜7）で扱う設定はすべて受講者が入力する
部分であり、ビルドシートには含めない。

**重要**: 手順3（デフォルト状態の STP 観察）は、3 台の Bridge ID がすべて既定値
（プライオリティ 32768 + VLAN ID、MAC アドレスのみで優劣が決まる状態）であることが前提の
演習である。事前にどれか 1 台にでも `spanning-tree vlan 10 priority` や `hostname` 以外の
STP 関連設定を投入してしまうと、この観察が成立しなくなるため、開始ファイルは必ず
3 台とも完全な初期状態のまま保存すること。

## 5. 完成コンフィグ（`_answer.pkt` 用・講師用）

このラボの手順1〜8をすべて実施し、`copy running-config startup-config` まで完了させた
**最終状態**（手順9のリンク障害試験は `no shutdown` で復旧済み）のコンフィグを示す
（採点・質問対応の見本）。

### SW1

```
enable
configure terminal
hostname SW1
!
vlan 10
 name DATA
 exit
!
interface fastEthernet 0/10
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 spanning-tree bpduguard enable
 exit
!
interface gigabitEthernet 0/1
 switchport mode trunk
 exit
!
interface gigabitEthernet 0/2
 switchport mode trunk
 exit
!
interface range fastEthernet 0/1 - 2
 channel-group 1 mode active
 exit
!
interface port-channel 1
 switchport mode trunk
 exit
!
spanning-tree mode rapid-pvst
!
interface vlan 10
 ip address 192.168.10.1 255.255.255.0
 no shutdown
 exit
!
end
copy running-config startup-config
```

### SW2

```
enable
configure terminal
hostname SW2
!
vlan 10
 name DATA
 exit
!
interface gigabitEthernet 0/1
 switchport mode trunk
 exit
!
interface gigabitEthernet 0/2
 switchport mode trunk
 exit
!
interface range fastEthernet 0/1 - 2
 channel-group 1 mode active
 exit
!
interface port-channel 1
 switchport mode trunk
 exit
!
spanning-tree mode rapid-pvst
spanning-tree vlan 10 root primary
!
interface vlan 10
 ip address 192.168.10.2 255.255.255.0
 no shutdown
 exit
!
end
copy running-config startup-config
```

### SW3

```
enable
configure terminal
hostname SW3
!
vlan 10
 name DATA
 exit
!
interface fastEthernet 0/10
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 spanning-tree bpduguard enable
 exit
!
interface gigabitEthernet 0/1
 switchport mode trunk
 exit
!
interface gigabitEthernet 0/2
 switchport mode trunk
 exit
!
spanning-tree mode rapid-pvst
!
interface vlan 10
 ip address 192.168.10.3 255.255.255.0
 no shutdown
 exit
!
end
copy running-config startup-config
```

> 補足（講師用・演習手順の再現）:
> - 手順3の観察対象は上記コンフィグ**投入前**（`spanning-tree vlan 10 root primary` と
>   `spanning-tree mode rapid-pvst` 抜き、Fa0/10 の PortFast/BPDU Guard 抜き、トランク・VLAN・
>   EtherChannel のみ設定済みの状態）である。デフォルトでは 3 台とも Bridge ID の優劣は
>   MAC アドレスのみで決まるため、実機・PT 双方で最小 MAC アドレスを持つスイッチ
>   （配置順・シミュレーション実行環境により SW1/SW2/SW3 のいずれにもなり得る）が
>   ルートブリッジとなる。採点時は受講者の `show spanning-tree vlan 10` 出力の Root ID と
>   3 台の Bridge ID を突き合わせて判定すること（本シートでは特定のスイッチをルートブリッジと
>   決め打ちしない）。
> - 手順4で `spanning-tree vlan 10 root primary` を SW2 に投入した後は、SW2 の優先度が
>   24576 に下がり Root ID が SW2 の Bridge ID に変わる。これは決め打ちで再現できるため、
>   上記の完成コンフィグでは SW2 にのみ `root primary` を記載している。
> - 手順9（Fa0/1 の shutdown → 復旧確認）は一時的な障害試験であり、最終状態には残らない。
>   上記コンフィグは `no shutdown` 済みの状態（Fa0/1・Fa0/2 とも Po1 に収容され `up`）である。

### PC1・PC2

IOS 設定なし。IP 設定は「3. PC/サーバ設定」の表のとおり（ラボ全体を通じて変更なし）。

- 完成状態での疎通確認の想定結果:
  - PC1 (192.168.10.11) → PC2 (192.168.10.12)：成功（同一 VLAN10、STP 収束後）
  - `show etherchannel summary`（SW1・SW2）：`Po1(SU)`、メンバー `Fa0/1(P)`・`Fa0/2(P)`
  - `show spanning-tree vlan 10`（SW1・SW2）：Po1 が単一の論理ポートとして表示され、
    Fa0/1・Fa0/2 は個別ポートとしては表示されない

## 6. 組み立て後チェック

- [ ] SW1・SW2・SW3・PC1・PC2 間の全リンクが緑（SW1-SW2 間の 3 本＝Gi0/1-Gi0/1 と
      Fa0/1-Fa0/1・Fa0/2-Fa0/2 を含む）
- [ ] レベル A の指定どおり、SW1・SW2・SW3 とも `hostname` 未設定（プロンプトが `Switch>` の
      まま）で、`show vlan brief` を実行すると Fa0/1・Fa0/2・Fa0/10・Gi0/1・Gi0/2 を含む
      全ポートが **VLAN1（default）** のままであることを確認 ＝本題（VLAN10 の作成、トランク化、
      `root primary`、RSTP 化、PortFast/BPDU Guard、EtherChannel）が未着手であること
- [ ] `show spanning-tree vlan 10` を実行しようとしても VLAN10 が存在せずエラーになること
      （＝ VLAN10 が事前投入されていないことの確認）
- [ ] `show etherchannel summary` を実行しても Po1 が存在しないこと（Fa0/1・Fa0/2 は
      個別ポートのまま）
- [ ] PC1・PC2 の Desktop > IP Configuration に、3. の表のとおり IP/マスクが入力済み、
      Gateway 欄は空欄
- [ ] 保存前のテストとして、スイッチ初期状態（VLAN1 一括のフラットネットワーク）でも
      PC1-PC2 間の ping が疎通すること自体は確認してよいが、確認後は各スイッチで
      `clear mac address-table dynamic`、各 PC で ARP キャッシュをクリア（または一度再配置）
      してから保存し、汚れのない状態で `day09_start.pkt` を残す
- [ ] `day09_start.pkt` として保存し、再度開いて上記の状態（配線・PC IP 済み、
      SW1/SW2/SW3 は初期状態）が保たれていることを確認
