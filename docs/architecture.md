# Architecture

LAMMPS Workbench is split into a shared core and two entry points.

```text
core/
  case schema, validation, templates, LAMMPS input generation
apps/web/
  static Web Safe Mode UI
runners/
  Local Runner Mode execution and result handling
public/ + server.js + routes/ + services/ + python/
  existing local GUI and compatibility services
examples/public/
  public synthetic demo cases only
```

Boundary rules:

- Web Safe Mode depends on `core/` only.
- Local Runner Mode depends on `core/` and may use `runners/`, `python/`, `server.js`, `routes/`, and `services/`.
- `core/` must not import runner, subprocess, shell, Python execution, external API, upload, or file-saving code.
- Web and local generation must be tested from the same case definition.

The previous remote execution path is not part of Web Safe Mode. Treat it as a Local Runner compatibility feature until a separate review decides whether to keep or remove it.
