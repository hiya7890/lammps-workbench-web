# LAMMPS Workbench Core

`core/` contains the shared case definition, field metadata, presets, validation, templates, and LAMMPS input generation used by both Web Safe Mode and Local Runner Mode.

Design rules:

- Keep case schema, validation, and input generation here.
- Do not add subprocess, shell, Python, upload, external API, or file-system execution logic here.
- Both web and local entry points must call the same generator.
- Templates and public demo case definitions must remain generic and publishable.

Current public demo case types:

- `lj_fluid`
- `polymer_relaxation`
- `gas_diffusion`
- `interface_demo`

Files:

- `caseDefinitions.js`: case type definitions, field definitions, and public presets.
- `lammpsCase.js`: normalization, validation, `case.json` serialization, LAMMPS input generation, and procedure generation.
- `case.schema.json`: portable JSON schema reference for the shared case format.
