# day19 .pktビルドシート

- **対象ラボ**: `materials/week4/day19-lab.md`（JSON データの読解と REST 的な GET/POST リクエストの観察 — Server-PT の HTTP／IoT サービスへの GET・POST 相当操作、L2/L3 疎通確認、`show ip interface brief` / `show running-config` と JSON の対比）
- **作り込みレベル**: **A（配線済み・IP済み）** — `pkt-build-spec.md` の Week4 指定どおり。機器配置＋全ケーブル＋PC/Server-PT の IP・GW 設定済みで渡す。ルータ（RT1）とスイッチ（SW1）はホスト名すら未設定の工場出荷状態のまま渡す（手順2 の IOS 設定一式が受講者作業）。加えて Server-PT の HTTP／IoT サービスも `Off`（未設定）のまま渡す（手順4・5 でのサービス有効化・認証情報設定が本題の一部のため）。
- **保存ファイル名**: `day19_start.pkt`
- **参照した図**: `materials/images/day19-topology.svg`（Router RT1(2911) — SW1(2960) — Server-PT/PC1/PC2/PC3、192.168.10.0/24、GW=192.168.10.1 の構成を確認済み。本文の結線・IP 表と完全一致）

> **spec との差異について（重要・要確認）**: `pkt-build-spec.md` の Week4 表では day19 を「自動化。ネットワークコントローラ+機器配置済み。REST API/JSON演習が本題（PT のコントローラ機能を使用）」と記載しているが、`week4/day19-lab.md` 本文にはネットワークコントローラ（Packet Tracer の Network/Registration Controller 機能）は一切登場しない。実際のラボは Router 2911 × 1、Switch 2960 × 1、Server-PT × 1（HTTP サービス＋ IoT Registration Server）、PC-PT × 3 という通常のトポロジで、GET/POST の疑似体験は Server-PT の Web ページ（HTTP）と IoT 登録画面（IoT サービス）を使って行う設計になっている。本ビルドシートは**ラボ手順書（`day19-lab.md`）を正**として作成しており、コントローラ機器は配置しない。spec 側の記述はおそらく旧版の構想（コントローラ機能を使う案）が残った誤記と思われるため、教材担当者は spec 側の記述更新も検討されたい。

---

## 1. 機器リスト

| 役割 | 機器モデル | 台数 | 配置名（Device Name） |
|---|---|---|---|
| ルータ | Router **2911**（オンボードで `GigabitEthernet0/0` を標準搭載。手順書のコマンド `interface GigabitEthernet0/0` と一致、追加モジュール不要） | 1 | RT1 |
| スイッチ | Switch **2960**（Fa0/1〜Fa0/24 を使用。Fa0/1〜0/4 は端末収容、Fa0/24 はルータ接続） | 1 | SW1 |
| サーバ | **Server-PT**（HTTP サービス＋ IoT Registration Server を使用。標準搭載の FastEthernet0 のみで可） | 1 | Server-PT |
| PC | PC-PT（汎用 PC。手順4 で Web Browser から HTTP アクセス） | 1 | PC1 |
| PC | PC-PT（汎用 PC。手順5 で IoT ログイン・新規デバイス登録） | 1 | PC2 |
| PC | PC-PT（汎用 PC。管理端末。SSH で RT1 に接続、手順7 で `show` コマンド確認） | 1 | PC3 |

> Server-PT・PC-PT は Packet Tracer 9.x のデフォルトテンプレートで FastEthernet0 を標準搭載しているため、追加モジュールの取り付けは不要。

## 2. 結線表

| 機器A・ポート | ケーブル種別 | 機器B・ポート |
|---|---|---|
| Server-PT / FastEthernet0 | ストレートケーブル | SW1 / FastEthernet0/1 |
| PC1 / FastEthernet0 | ストレートケーブル | SW1 / FastEthernet0/2 |
| PC2 / FastEthernet0 | ストレートケーブル | SW1 / FastEthernet0/3 |
| PC3 / FastEthernet0 | ストレートケーブル | SW1 / FastEthernet0/4 |
| RT1 / GigabitEthernet0/0 | ストレートケーブル | SW1 / FastEthernet0/24 |

- ラボ手順書「手順1」の指定どおり全リンクをストレートケーブルで結線する。ケーブルは「自動選択（Automatically Choose Connection Type）」でも同じ結果になるが、手順書がストレートケーブルを明示しているため上表のとおり明示的に選ぶこと。
- SW1 の Fa0/5〜Fa0/23 は本ラボ全体で未使用。開始ファイルではこれらのポートには一切結線しない。
- 配線後、STP 収束を待って全リンクが緑になってから保存する。

## 3. PC/サーバ設定

開始ファイル（`day19_start.pkt`）では、下表の値をあらかじめ Desktop > IP Configuration に入力済みにして保存する（レベル A のため PC/Server 側は完成済み。ラボ手順書の IP アドレス表と完全一致）。

| デバイス | IPアドレス | サブネットマスク | デフォルトGW | その他 |
|---|---|---|---|---|
| Server-PT | 192.168.10.10 | 255.255.255.0 | 192.168.10.1 | DNS 未使用。Config タブの `FastEthernet0` にも同じ IP を設定（Desktop の IP Configuration と同期）。**Services タブの HTTP・IoT はいずれも `Off` のまま**（手順4・5 で受講者が `On` にする） |
| PC1 | 192.168.10.11 | 255.255.255.0 | 192.168.10.1 | DNS 未使用。Desktop > Text Editor に `device_info.json`（手順3 の配布ファイル。内容は本シート「6. 完成コンフィグ」節を参照）を作成・保存済みにしておく |
| PC2 | 192.168.10.12 | 255.255.255.0 | 192.168.10.1 | DNS 未使用。PC1 と同様に `device_info.json` を Text Editor に作成・保存済みにしておく |
| PC3（管理端末） | 192.168.10.13 | 255.255.255.0 | 192.168.10.1 | DNS 未使用。PC1 と同様に `device_info.json` を Text Editor に作成・保存済みにしておく。手順7 で RT1 に SSH 接続する端末 |

> `device_info.json` は「手順3: JSON データの読解」がネットワーク接続不要で行える設計のため、配布の手間を省く目的で 3 台の PC すべての Text Editor にあらかじめ同一内容を保存しておく（本題は JSON の構造を読み解くことであり、ファイルの入手方法自体は学習対象ではないため、レベル A の「本題以外は作り込む」方針に沿って事前配置する）。
> SW1 の VLAN1 SVI（192.168.10.2）と RT1 の `GigabitEthernet0/0`（192.168.10.1）は CLI（IOS）側の設定であり、上表の対象外。レベル A の定義どおり**未設定のまま**残す（下記「4. 貼り付け用コンフィグ」を参照）。

## 4. 貼り付け用コンフィグ（事前設定）

**事前設定なし（機器は初期状態）。**

- RT1: `Router>` プロンプトの工場出荷状態のまま配置・保存する。hostname／`enable secret`／`GigabitEthernet0/0` の IP アドレス／`ip domain-name`／`crypto key`／`username`／VTY 関連コマンドは一切入力しない。これらはラボ手順書「手順2」で受講者自身が入力する操作。
- SW1: `Switch>` プロンプトの工場出荷状態のまま配置・保存する。hostname／VLAN1 SVI の IP アドレス／`ip default-gateway` は未設定。これもラボ手順書「手順2」の受講者作業。
- Server-PT: Services タブの **HTTP** と **IoT（Registration Server）** はいずれも `Off` のまま保存する。Username/Password も未入力。これらはラボ手順書「手順4」「手順5」で受講者自身が `On` にし、認証情報（`admin` / `Cisco12345`）を入力する操作であるため、開始ファイルでは投入しない。
- 上記はレベル A の定義（機器配置＋全ケーブル＋PC/サーバの IP・GW 設定済み。ルータ/スイッチは未設定＝ホスト名すら未設定の初期状態）どおりであり、かつ本ラボの本題（Router/Switch の基本設定と、Server-PT の HTTP/IoT サービスを使った GET/POST 相当操作の体験）を受講者に残すための措置。

## 5. 完成コンフィグ（`day19_answer.pkt` 用・講師用）

ラボ手順書の手順1〜7を反映した、全手順完了後の最終状態。`write memory` まで実行済みとする。

### RT1

```
enable
configure terminal
hostname RT1
enable secret cisco12345
interface GigabitEthernet0/0
 ip address 192.168.10.1 255.255.255.0
 no shutdown
 exit
ip domain-name lab19.local
crypto key generate rsa
```

（`How many bits in the modulus [512]:` と聞かれたら `1024` を入力）

```
username admin secret Admin12345
line vty 0 4
 login local
 transport input ssh
 exit
end
write memory
```

### SW1

```
enable
configure terminal
hostname SW1
interface vlan 1
 ip address 192.168.10.2 255.255.255.0
 no shutdown
 exit
ip default-gateway 192.168.10.1
end
write memory
```

### Server-PT（Services タブでの GUI 設定・講師用メモ）

```
[Services] > [HTTP]        : On
[Services] > [IoT]         : Registration Server = On
  Server Username: admin
  Server Password: Cisco12345
```

- HTTP を `On` にすると `http://192.168.10.10` へのアクセスで初期 HTML ページ（200 相当）が返り、存在しないパス（例: `/nopage.html`）は 404 Not Found が返る。
- IoT の Registration Server を `On` にし、Username/Password を設定すると、未入力ログインは拒否（401 相当）、`admin`/`Cisco12345` でのログイン成功後に [Register a New IoT Device] から新規デバイス登録（POST/201 相当）ができる。

### PC1 / PC2 / PC3（Desktop > IP Configuration、参考・開始ファイルの時点で入力済み）

```
PC1   IP: 192.168.10.11   Mask: 255.255.255.0   GW: 192.168.10.1
PC2   IP: 192.168.10.12   Mask: 255.255.255.0   GW: 192.168.10.1
PC3   IP: 192.168.10.13   Mask: 255.255.255.0   GW: 192.168.10.1
```

### device_info.json（PC1〜PC3 の Text Editor に事前保存する内容。手順3 で使用）

```json
{
  "devices": [
    {
      "hostname": "SW1",
      "managementIp": "192.168.10.2",
      "role": "access-switch",
      "interfaces": [
        { "name": "FastEthernet0/1", "status": "up" },
        { "name": "FastEthernet0/2", "status": "up" },
        { "name": "FastEthernet0/3", "status": "up" },
        { "name": "FastEthernet0/4", "status": "up" },
        { "name": "FastEthernet0/24", "status": "up" }
      ],
      "isActive": true
    },
    {
      "hostname": "RT1",
      "managementIp": "192.168.10.1",
      "role": "gateway-router",
      "interfaces": [
        { "name": "GigabitEthernet0/0", "status": "up" }
      ],
      "isActive": true
    }
  ]
}
```

### 確認用コマンド（講師が動作確認する際の参考。手順6・7に対応）

PC1（または PC2・PC3）の Command Prompt から:

```
ping 192.168.10.10
tracert 192.168.10.10
arp -a
```

PC3 から RT1 へ SSH:

```
ssh -l admin 192.168.10.1
```

（パスワード `Admin12345` でログイン成功）

RT1 の CLI から:

```
show ip interface brief
show running-config
```

- `show ip interface brief` の `GigabitEthernet0/0` の IP（192.168.10.1）とステータス（up/up）が、`device_info.json` の `RT1.managementIp` と `interfaces[0].status` に一致することを確認する。

## 6. 組み立て後チェック

- [ ] Server-PT–SW1（Fa0/1）、PC1–SW1（Fa0/2）、PC2–SW1（Fa0/3）、PC3–SW1（Fa0/4）、RT1–SW1（Gi0/0⟷Fa0/24）の全リンクが緑
- [ ] `day19_start.pkt` では RT1・SW1 が初期状態（ホスト名未設定、`Router>` / `Switch>` プロンプト、IP・SSH 設定なし）＝レベル A どおり本題（Router/Switch の基本設定）が未設定で残っている
- [ ] `day19_start.pkt` では Server-PT の Services（HTTP・IoT）がいずれも `Off`、Username/Password 未入力＝手順4・5の本題が未設定で残っている
- [ ] Server-PT・PC1〜PC3 の IP Configuration が「3. PC/サーバ設定」表のとおり入力済み（IP・マスク・GW すべて 192.168.10.0/24、GW=192.168.10.1）
- [ ] PC1〜PC3 の Desktop > Text Editor に `device_info.json` が保存済みで、Text Editor から開ける（ネットワーク未接続でも手順3が単体で行える状態）
- [ ] 講師用 `day19_answer.pkt` を別途作成し、「5. 完成コンフィグ」を RT1・SW1・Server-PT に投入した状態で、PC1〜PC3 → Server-PT（192.168.10.10）への `ping` が全て成功することを確認
- [ ] `day19_answer.pkt` で PC1 のブラウザから `http://192.168.10.10` が 200 相当（初期ページ表示）、`http://192.168.10.10/nopage.html` が 404 Not Found になることを確認
- [ ] `day19_answer.pkt` で PC2 のブラウザから IoT ログイン画面に未入力でログイン → 拒否（401相当）、`admin`/`Cisco12345` でログイン → 成功、新規デバイス登録 → 一覧に反映（POST/201相当）されることを確認
- [ ] `day19_answer.pkt` で PC3 から `ssh -l admin 192.168.10.1` が `Admin12345` で成功することを確認
- [ ] `.pkt` として保存後、一度閉じて再度開き、配線・状態（未設定/設定済み、サービス On/Off）が保たれていることを確認
- [ ] ファイル名が `day19_start.pkt`（開始用）/ `day19_answer.pkt`（完成見本）になっている
