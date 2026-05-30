# Install And Usage

Web Safe Mode:

```powershell
npm run package:web
```

Open `dist/lammps-workbench-web-<version>/apps/web/index.html`, or unzip `dist/lammps-workbench-web.zip`.

Local Runner Mode:

```powershell
npm install
npm start
```

Open:

```text
http://127.0.0.1:3210
```

Dry-run Local Runner smoke check:

```powershell
node runners/localRunner.js --case examples/public/lj_fluid.case.json --out runs/lj_fluid --dry-run
```

Build both distributables:

```powershell
npm run package
```

Outputs:

- `dist/lammps-workbench-web.zip`
- `dist/lammps-workbench-local.zip`

GitHub Pages artifact:

```powershell
npm run build:web-public
```

Publish `dist/pages` with GitHub Pages or another static hosting service. On GitHub, enable Pages with "GitHub Actions" as the source and run the `Deploy Web Safe Mode` workflow.
