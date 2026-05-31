# Local Installation Guide For Company PCs

This guide is for installing and checking the Local version of LAMMPS Workbench on a company-managed Windows PC. It is not for the public Web Safe Mode.

## Scope

Target environment:

- Windows 10 or Windows 11
- Local version of LAMMPS Workbench
- Company-managed PC and approved storage location when handling internal or non-public conditions

Out of scope:

- Public Web Safe Mode deployment
- GitHub Pages deployment
- Browser-only public demos
- Carrying over personal `app-data/projects` or local result folders from another PC

## Required And Optional Tools

Required for Workbench startup:

- Node.js 22 or newer
- Python 3

Required for actual local simulation workflows:

- LAMMPS executable or WSL LAMMPS command
- PACKMOL executable for packing workflows
- Moltemplate executable or script for Moltemplate workflows

Optional:

- OVITO for visual inspection of dump / trajectory files
- Git for cloning or updating the repository

Git is optional. A zip extraction of the approved Local package is acceptable when that is the company-approved distribution route.

## Native Windows Or WSL

Windows-native mode:

- Use Windows paths for executables.
- Example LAMMPS executable: `C:\Tools\LAMMPS\bin\lmp.exe`
- Example PACKMOL executable: `C:\Tools\packmol\packmol.exe`
- Example Python executable: `C:\Tools\Python312\python.exe`

WSL mode:

- Use a WSL command for LAMMPS when LAMMPS is installed inside Linux.
- Example command: `wsl.exe -d Ubuntu -- /usr/bin/lmp`
- Keep project paths in a location that both Windows and WSL can access reliably.
- Confirm path translation before using internal or long-running cases.

Do not mix Windows-native and WSL paths in one run unless the workflow explicitly supports it.

## Install The Local Package

Option A: approved zip package

1. Obtain `lammps-workbench-local.zip` from the approved internal distribution location.
2. Extract it into an approved local folder, for example `C:\Tools\lammps-workbench`.
3. Open PowerShell in that folder.
4. Run:

```powershell
npm install
```

Option B: approved Git checkout

1. Clone the approved repository into a company-managed local folder.
2. Open PowerShell in the repository root.
3. Run:

```powershell
npm install
```

Do not copy another user's `app-data/` folder into the new installation.

## Start The Local Workbench

Run:

```powershell
npm start
```

Open:

```text
http://127.0.0.1:3210
```

The default port is `3210`. If the port is already in use, stop the other process or start Workbench with a different port:

```powershell
$env:PORT="3220"
npm start
```

Then open `http://127.0.0.1:3220`.

## First Configuration

In the Local GUI:

1. Open the environment / settings area.
2. Set the project save location to a company-approved folder.
3. Configure tool paths:
   - LAMMPS executable or WSL LAMMPS command
   - PACKMOL executable
   - Moltemplate executable or script
   - Python executable
   - OVITO executable, optional
4. Save the settings.

Local settings are stored per PC under:

```text
app-data/config.json
```

This file is local runtime configuration. Do not commit it, and do not copy a personal-PC configuration into a company PC without review.

## Tool Path Checks

Run these manually in PowerShell before connecting tools in the GUI.

Node.js:

```powershell
node --version
npm --version
```

Python:

```powershell
python --version
```

LAMMPS, Windows-native example:

```powershell
& "C:\Tools\LAMMPS\bin\lmp.exe" -h
```

LAMMPS, WSL example:

```powershell
wsl.exe -d Ubuntu -- /usr/bin/lmp -h
```

PACKMOL:

```powershell
& "C:\Tools\packmol\packmol.exe"
```

Moltemplate:

```powershell
moltemplate.sh -h
```

OVITO, optional:

```powershell
& "C:\Program Files\OVITO Basic\ovito.exe" --help
```

Adjust paths to match the approved company installation.

## Local Runner Dry-Run

This check uses the shared public demo case and does not require LAMMPS execution:

```powershell
node runners/localRunner.js --case examples/public/lj_fluid.case.json --out runs/lj_fluid_dry_run --dry-run
```

Expected result:

- output folder is created under `runs/lj_fluid_dry_run`
- `case.json` is written
- `in.lammps` is written
- `procedure.md` is written
- LAMMPS is not executed

## Repository Checks

Use these after installation or before distributing an updated Local package:

```powershell
npm run check
npm test
```

If the full test suite is not available on the company PC, run the available minimum checks:

```powershell
npm run check
npm run test:mode-split
npm run audit:public
```

## Company PC Rules

- Create `app-data/config.json` separately on each PC.
- Do not bring personal `app-data/projects` into a company PC.
- Keep generated outputs in approved local storage, not in the repository.
- Do not add external installers, large result files, dumps, trajectories, movies, or private data to the repository.
- The Web Safe public version has no execution features. Use the Local version for approved execution workflows.
