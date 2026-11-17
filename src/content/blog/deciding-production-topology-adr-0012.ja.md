---
title: Pelway の本番構成を単一ホストに決めた（ADR 0012）
description: 個人開発サービス Pelway の本番トポロジを、Docker Compose＋リバースプロキシ＋systemd タイマーの単一ホスト構成に定めた記録。
date: 2026-11-18
---

個人開発中のサービス Pelway の本番構成を決めました。Docker Compose とリバースプロキシ（Caddy）と systemd タイマーで構成する単一ホストです。決定は ADR 0012 として記録し、変更は [Pelway の PR #429](https://github.com/hatai/Pelway/pull/429) にまとめています。

Pelway は、タスクごとに Linux コンテナの sandbox を立ててジョブを実行し、LLM への通信はゲートウェイ経由に絞る設計のサービスです。まだ本番に置くものはありませんが、配置の前提を先に固めました。

## なぜ今決めるのか

Pelway は設計とプロトタイプの段階です。それでも配置の前提は後の設計を縛ります。ネットワークをどこで切るか、バックアップをどこに置くか、外部への出口をどこに絞るか。これらは仕様書の中の境界線と対応しているので、曖昧なまま進めると後から大きく書き直すことになります。規模が小さいうちに決める方が安いので、ADR として先に記録しました。

## 決めた構成

単一ホストの上に、Docker Compose のプロジェクトとして全部を載せます。構成要素は次のとおりです。

- リバースプロキシ（Caddy）: ホスト唯一の公開入口。TLS の終端、API への転送、ブラウザ UI の静的資産の配信、認証ヘッダやトークンを落とすアクセスログのマスキングを担当します。
- API（axum）: 認証と承認、状態・監査・outbox の操作。
- ワーカー: DB キューのジョブ実行。lease の取得と手順の再開もここです。
- Postgres: 状態・監査・outbox・DB キューの正本。
- サンドボックス管理: タスクごとの Linux コンテナ sandbox を起動・管理する controller。task sandbox 本体は秘密情報を持たず、外部への出口は連携 gateway だけにします。
- 定期ジョブ: systemd タイマー。毎日 02:00 JST のバックアップ（スナップショットは作成から14日保持）、ホストのヘルスチェック、セキュリティ更新を回します。

コンテナには共通の守りを付けます。

```yaml
restart: unless-stopped
no-new-privileges: true
cap_drop: ALL
```

これに pids と memory のリソース制限とログ上限を足す形です。本番用の compose ファイル自体はまだありません。この ADR で決めたのは構成要素と配置、守りの方針までで、ファイルの作成は別 Issue に分けています。

## 比較した方式

雛形として 3 つの構成を見ました。

- **Rakazo のセルフホスト構成（採用）**: [elie222/rakazo](https://github.com/elie222/rakazo)。本番用 Compose、Caddy、ホスト堅牢化スクリプト（harden-host・firewall・apt-security）、systemd の定期チェックまでをリポジトリで管理していて、単一ホストに全部が載ります。この「インフラをリポジトリのコードとして持つ」形を取ります。
- **OpenBot の Kubernetes 既定（不採用）**: 初期規模には過剰でした。単一ホストで足りる間は、クラスタ自身の管理・監視・更新というオーケストレータの運用負担を負いません。規模が必要になった時点で移行設計を別に立てます。
- **CircleChat の最小 Compose（参照のみ）**: Postgres＋Redis＋MinIO の3サービス。Pelway は Redis の代わりに DB キュー（ADR 0006）を選んでいて、添付と成果物はオブジェクトストレージではなくホストのローカルボリュームに置くので、下限の実例として参照するだけに留めました。

## ネットワーク分離で守りたかったもの

ネットワークは 4 つに切ります。`edge` はリバースプロキシと API の間、`app` は API・ワーカー・各 gateway・制御面、`data` は API・ワーカーと Postgres の間、`sandbox` は controller と task sandbox の間です。

Postgres は `data` にだけ置いて `ports` を持たせません。task sandbox は `sandbox` にだけ置いて `data` には参加させないので、sandbox から Postgres への到達経路がそもそも存在しません。task sandbox はタスクごとに作る信用しない境界なので、ここが一番守りたかったところです。マイグレーションは owner 接続を持つワンショットの migrate サービスで当てて、適用したら終わります。

## ホスト側もコードにする

手作業でホストを堅牢化しない、という方針も ADR に書きました。対象は、ファイアウォール（nftables または ufw、公開するのは SSH と HTTP と HTTPS だけ）、unattended-upgrades、SSH の硬直化（root ログイン禁止・鍵認証のみ・ログイン可能ユーザの限定）、fail2ban と apparmor と auditd、それに backup と host-check の systemd ユニットファイルです。全部リポジトリに置きます。

前提は国内ホスティング（国内 VPS または国内リージョン。選定そのものは未決）で、マネージド DB・マネージドメッセージング・オブジェクトストレージのようなクラウド固有サービスには依存しません。外向き通信は、テナントが有効化した LLM 提供元への接続（BYOK、LLM ゲートウェイ経由）と、利用者が許可した連携 gateway の transport の 2 つだけに絞ります。

## ADR として残す運用

決定は `docs/adr/` に Markdown で置き、技術仕様書からリンクします。今回は ADR の実在とリンク解決を検査する構造テスト（`production-topology-docs.test.sh`）も一緒に入れました。判断そのもののレビューは人間がやるので、テストは存在とリンクの機械的な検査だけを担う分担です。

「決めたこと」と「これからやること」を ADR の Consequences に分けて書いておくと、後で読んだときにどこまで決まっていたかが一目で分かります。配置作業と compose ファイルの作成は別 Issue です。

Pelway 自体については、形になったらまた書きます。質問があれば [me@hatai.dev](mailto:me@hatai.dev) へどうぞ。
