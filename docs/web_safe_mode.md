# Web Safe Mode

Web Safe Mode is a static browser app for public demo cases and operation checks.

It can:

- Edit public case parameters.
- Generate `case.json`.
- Generate `in.lammps`.
- Generate a short procedure note.

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

Open `apps/web/index.html` directly in a browser, or package it with `npm run package:web`.
