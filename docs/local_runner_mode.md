# Local Runner Mode

Local Runner Mode is for personal use or approved environments where LAMMPS execution and result files are allowed.

It can:

- Use the same `core/` case definitions and input generator as Web Safe Mode.
- Create result folders.
- Write generated `case.json`, `in.lammps`, and `procedure.md`.
- Run LAMMPS when configured.
- Collect runner logs.
- Create simple CSV summaries from `log.lammps`.

Notice:

Local Runner Mode はLAMMPS実行および結果ファイル生成を行います。個人利用または承認済み環境で使用してください。社内条件や非公開情報を扱う場合は、所属組織の情報管理ルールに従い、会社管理下のPC・保存領域で使用してください。

Dry-run smoke check:

```powershell
node runners/localRunner.js --case examples/public/lj_fluid.case.json --out runs/lj_fluid --dry-run
```

LAMMPS run:

```powershell
node runners/localRunner.js --case examples/public/lj_fluid.case.json --out runs/lj_fluid --lammps lmp
```
