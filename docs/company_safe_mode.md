# Company Safe Mode Explanation

LAMMPS Workbench is organized into two modes.

Web Safe Mode is a static public demo tool. It generates LAMMPS input files from public synthetic conditions only. It does not run LAMMPS, upload files, save externally, call external APIs, or analyze results. Users must not enter internal material names, third-party data, unpublished test conditions, or project-linked parameters.

Local Runner Mode is an execution-capable local tool. It uses the same shared core generator as Web Safe Mode, but runner functionality is isolated in `runners/` and the local app services. Use it only on personal or approved company-managed environments. Store generated logs, dumps, plots, and analysis outputs outside the source repository and according to the organization policy.

For public sharing, distribute `lammps-workbench-web.zip`. For approved local execution, distribute `lammps-workbench-local.zip`.
