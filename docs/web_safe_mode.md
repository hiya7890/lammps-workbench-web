# Web Safe Mode

Web Safe Mode is a static browser app for public demo cases and operation checks. It is designed as the safety-restricted version of the Local GUI, not as a separate UI.

The UI should follow the Local GUI baseline:

- same broad workspace concept
- same main operation order
- same model build / protocol / run-analysis / settings structure
- unavailable execution and local-integration controls shown as disabled or locked controls
- short explanations for why locked controls are unavailable and what the manual alternative is

It can:

- Edit public case parameters.
- Generate `case.json`.
- Generate `in.lammps`.
- Generate a short procedure note.
- Generate safe text scaffolds such as `packmol.inp` or Moltemplate `.lt` drafts when generated fully in the browser.
- Show manual local command examples.
- Preview and download generated files.

It must not:

- Run LAMMPS.
- Auto-run any command.
- Upload files.
- Save to external storage.
- Call external APIs.
- Parse or analyze results.
- Include runner, subprocess, shell, Python execution, or remote execution code.

Notice shown in the UI:

本Web版は公開デモ条件によるLAMMPS入力ファイル作成・操作確認用です。社内材料名、顧客情報、未公開試験条件、開発テーマに紐づく条件は入力しないでください。本Web版は解析実行、ファイルアップロード、外部保存を行いません。社内条件を扱う場合は、所属組織の情報管理ルールに従い、会社管理下のローカル版または社内版を使用してください。

Local GUI should also provide a Prepare Only / Web-Compatible mode. In that mode, Local GUI behaves like Web Safe Mode: generation and handoff are allowed, while execution, local browse, project save/load, external tool launching, and result analysis are locked. Switching to Local Runner Mode re-enables approved local execution features.

Open `apps/web/index.html` directly in a browser, or package it with `npm run package:web`.
