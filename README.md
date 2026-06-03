# LAMMPS Workbench

LAMMPS Workbench は、共通コアから LAMMPS case 定義と input を生成し、用途に応じて Web Safe Mode と Local Runner Mode に分けて使うワークベンチです。

## Modes

### Web Safe Mode

静的Webアプリです。公開デモ条件による `case.json`、`in.lammps`、実行手順書の生成だけを行います。

Web Safe Mode では次を行いません。

- LAMMPS実行
- 自動実行
- ファイルアップロード
- 外部保存
- 外部API通信
- 結果解析
- runner、subprocess、shell実行、Python実行

注意:

本Web版は公開デモ条件によるLAMMPS入力ファイル作成・操作確認用です。社内材料名、顧客情報、未公開試験条件、開発テーマに紐づく条件は入力しないでください。本Web版は解析実行、ファイルアップロード、外部保存を行いません。社内条件を扱う場合は、所属組織の情報管理ルールに従い、会社管理下のローカル版または社内版を使用してください。

起動:

```powershell
start apps/web/index.html
```

### Local Runner Mode

個人利用または承認済み環境で使うローカル実行版です。Web Safe Mode と同じ `core/` の case 定義、テンプレート、input 生成ロジックを使い、実行機能は `runners/` と既存ローカルサービス層に隔離します。

注意:

Local Runner Mode はLAMMPS実行および結果ファイル生成を行います。個人利用または承認済み環境で使用してください。社内条件や非公開情報を扱う場合は、所属組織の情報管理ルールに従い、会社管理下のPC・保存領域で使用してください。

起動:

```powershell
npm start
```

Dry-run:

```powershell
node runners/localRunner.js --case examples/public/lj_fluid.case.json --out runs/lj_fluid --dry-run
```

LAMMPS実行:

```powershell
node runners/localRunner.js --case examples/public/lj_fluid.case.json --out runs/lj_fluid --lammps lmp
```

## Shared Core

`core/` に以下を集約します。

- case schema
- validators
- templates
- LAMMPS input generator

Web版とローカル版でテンプレート、case定義、input生成結果がズレないよう、両方が同じ `core/lammpsCase.js` を使います。

## Repository Layout

- `core/`: 共通 case 定義、検証、テンプレート、input 生成。
- `apps/web/`: Web Safe Mode の静的UI。
- `runners/`: Local Runner Mode の実行層。
- `examples/public/`: 公開・仮想・一般デモのみ。
- `docs/`: モード説明、情報管理、アーキテクチャ、配布手順。
- `public/`, `server.js`, `routes/`, `services/`, `python/`: 既存ローカルGUIと互換サービス。

## Packaging

```powershell
npm run package
```

出力:

- `dist/lammps-workbench-web.zip`: Web Safe Mode 用。実行機能なし。
- `dist/lammps-workbench-local.zip`: Local Runner Mode 用。runner付き。

URL公開用の静的成果物:

```powershell
npm run build:web-public
```

`dist/pages` を GitHub Pages などの静的ホスティングに置くと、URLから Web Safe Mode を使えます。GitHub Pages では Pages の Source を `GitHub Actions` にして、`Deploy Web Safe Mode` workflow を実行します。

## Checks

```powershell
npm test
npm run test:mode-split
npm run audit:public
```

確認内容:

- 同一 case 定義から Web Safe Mode と Local Runner Mode で同じ LAMMPS input が生成される。
- Web Safe Mode の配布対象に runner や実行用コードが含まれない。
- `examples/public/` に公開デモ以外の文言や結果ファイルが混入しない。
- `.gitignore` が結果ファイルやローカル設定を除外する。
- Local Runner Mode が公開デモケースで dry-run できる。

## Data Policy

リポジトリには、社内材料名、顧客名、未公開試験条件、実験結果、解析結果、dump、trajectory、log、画像、動画、個人PCのパス、APIキー、トークン、`.env`、会社テーマを連想させるケース名を含めないでください。

現行履歴には古い実行結果や研究テーマ名が残っている可能性があります。公開配布が必要な場合は、この作業ツリーを履歴ごと公開するのではなく、`dist/` から作るクリーンな配布物または新規クリーンリポジトリを使ってください。

## Documentation

- [Architecture](docs/architecture.md)
- [Web Safe Requirements](docs/web_safe_requirements.md)
- [Web Safe Mode](docs/web_safe_mode.md)
- [Local Runner Mode](docs/local_runner_mode.md)
- [Local Installation Guide](docs/local_installation_guide.md)
- [Company PC Smoke Test](docs/company_pc_smoke_test.md)
- [Data Policy](docs/data_policy.md)
- [Install And Usage](docs/install_or_usage.md)
- [Company Safe Mode Explanation](docs/company_safe_mode.md)
- [Common Core Inventory](docs/common_core_inventory.md)
- [Web Safe / Common Core Status](docs/web_safe_common_core_status.md)
