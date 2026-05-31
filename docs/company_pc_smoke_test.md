# Company PC Smoke Test

This smoke test checks a clean Local LAMMPS Workbench installation on a company-managed Windows PC. Run the steps in order. Stop at the first failing step and fix that layer before moving on.

## Test Data Policy

Use only public demo or synthetic cases during setup.

Recommended first case:

```text
examples/public/lj_fluid.case.json
```

Do not use company material names, customer information, unpublished test conditions, or project-linked conditions for installation smoke tests.

## Step 0: UI Startup Only

Goal: confirm that the Local GUI starts.

Run:

```powershell
npm start
```

Open:

```text
http://127.0.0.1:3210
```

Expected:

- browser opens the Local Workbench UI
- no JavaScript syntax errors are reported by startup
- environment / settings area is accessible
- project save location can be set to an approved local folder

If this fails, see "Startup Failures" below.

## Step 1: Generate `case.json` / `in.lammps` Only

Goal: confirm shared core generation without executing external tools.

Run:

```powershell
node runners/localRunner.js --case examples/public/lj_fluid.case.json --out runs/company_smoke_lj --dry-run
```

Expected:

- `runs/company_smoke_lj/case.json`
- `runs/company_smoke_lj/in.lammps`
- `runs/company_smoke_lj/procedure.md`
- no LAMMPS execution
- no dump or trajectory output

This confirms the Workbench core can generate the same type of files used by Local Runner Mode.

## Step 2: PACKMOL / Moltemplate Integration

Goal: confirm external structure-preparation tools are reachable.

In the Local GUI:

1. Configure the PACKMOL executable.
2. Configure the Moltemplate executable or script.
3. Use a small public or synthetic placement/scaffold workflow.
4. Generate a PACKMOL input draft.
5. Run PACKMOL only after confirming the output folder is approved.
6. Generate a Moltemplate scaffold or LT target.

Expected:

- PACKMOL command starts from Workbench.
- PACKMOL output file is written to the approved project folder.
- Moltemplate command starts or its scaffold file is generated.
- Any failure message identifies the missing executable, bad path, or invalid input.

If PACKMOL or Moltemplate is not installed yet, mark Step 2 as "not configured" and continue only with generation-only tests.

## Step 3: LAMMPS Syntax Check

Goal: confirm the configured LAMMPS executable can parse a small input.

Use the `in.lammps` generated in Step 1 or a small Local GUI-generated fixture.

Windows-native example:

```powershell
& "C:\Tools\LAMMPS\bin\lmp.exe" -in runs\company_smoke_lj\in.lammps
```

WSL example:

```powershell
wsl.exe -d Ubuntu -- /usr/bin/lmp -in /path/to/in.lammps
```

If the installed LAMMPS supports a no-run or preflight option in the configured workflow, use that first. Otherwise keep the fixture small and public.

Expected:

- LAMMPS executable is found.
- input syntax is accepted or errors are clear and fixture-related.
- no internal project data is used.

## Step 4: Small LAMMPS Execution

Goal: confirm a very small public fixture can run end-to-end.

Use:

```powershell
node runners/localRunner.js --case examples/public/lj_fluid.case.json --out runs/company_smoke_lj_run --lammps lmp
```

Replace `lmp` with the approved executable or command path. For Windows paths with spaces, quote the path:

```powershell
node runners/localRunner.js --case examples/public/lj_fluid.case.json --out runs/company_smoke_lj_run --lammps "C:\Tools\LAMMPS\bin\lmp.exe"
```

Expected:

- LAMMPS starts.
- output remains under `runs/company_smoke_lj_run` or another approved local folder.
- `log.lammps` or equivalent run log is generated.
- no result file is committed to the repository.

## Step 5: Python Analysis

Goal: confirm Python is available for local helper and analysis workflows.

Run:

```powershell
python --version
```

Then use a small public or synthetic result folder from Step 4 in the Local GUI analysis path.

Expected:

- Workbench can invoke the configured Python executable.
- analysis output is written only to approved local output folders.
- generated CSV, plot, summary, and analysis result files remain outside Git tracking.

If Python analysis tools are not installed, record the missing dependency and keep execution-only checks separate.

## Step 6: OVITO Dump Inspection, Optional

Goal: confirm visual inspection can be launched when OVITO is approved and installed.

In the Local GUI:

1. Configure the OVITO executable.
2. Select a small dump / trajectory file generated from a public fixture.
3. Open it in OVITO.

Expected:

- OVITO launches.
- selected dump opens.
- no private dump is copied into the repository.

This step is optional.

## Startup Failures

Node.js startup failure:

- Confirm `node --version` is Node.js 22 or newer.
- Run `npm install` in the Workbench root.
- Run `npm run check`.

Port `3210` conflict:

- Close the other app using port `3210`, or run:

```powershell
$env:PORT="3220"
npm start
```

Then open `http://127.0.0.1:3220`.

Python path failure:

- Confirm `python --version`.
- Configure the exact Python executable in the Local GUI.
- Avoid relying on a personal-user PATH if the company image uses managed Python installs.

LAMMPS path failure:

- Run the LAMMPS executable manually with `-h`.
- For WSL, confirm `wsl.exe -d <distro> -- <lammps-command> -h`.
- Confirm file paths are visible from the environment running LAMMPS.

PACKMOL / Moltemplate failure:

- Run each tool manually from PowerShell first.
- Confirm the Workbench setting points to the executable or script, not only to a folder.
- Confirm output folders are writable.

WSL command failure:

- Confirm the WSL distribution name.
- Confirm Linux-side executable path.
- Confirm Windows project paths map correctly into WSL.

Permission or save-location failure:

- Move the project save location to an approved writable folder.
- Avoid protected folders such as `Program Files`.
- Do not store project outputs inside the repository unless the folder is ignored and approved.

## Smoke Test Record

Record the result of each step:

| Step | Status | Notes |
| --- | --- | --- |
| Step 0 UI startup |  |  |
| Step 1 generation-only |  |  |
| Step 2 PACKMOL / Moltemplate |  |  |
| Step 3 LAMMPS syntax check |  |  |
| Step 4 small LAMMPS run |  |  |
| Step 5 Python analysis |  |  |
| Step 6 OVITO optional |  |  |

