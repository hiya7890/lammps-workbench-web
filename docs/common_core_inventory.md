# Common Core Inventory

This inventory separates shared definitions from mode-specific behavior.

## Current Case Types

Shared public core:

- `lj_fluid`
- `polymer_relaxation`
- `gas_diffusion`
- `interface_demo`

Existing Local Runner / legacy local GUI also contains broader workflow families:

- CG scaffold input generation from mapping objects.
- Prompt-style input draft generation.
- AA polymer and interface scaffold generation.
- Moltemplate / PACKMOL / LAMMPS runtime routes.
- Analysis, rerun, comparison, and remote/HPC compatibility routes.

Those local-only workflows are not yet represented as shared Web Safe Mode case definitions.

## Current Shared Fields

The first shared field-definition pass covers the public representative case path:

- `title`
- `temperature`
- `density`
- `steps`
- `thermo`
- `timestep`
- `seed`

The Web UI now renders these from `core/caseDefinitions.js`. Local Runner Mode also records and validates against the same definitions through `core/lammpsCase.js`.

## Defaults And Presets

Shared defaults and presets now live in `core/caseDefinitions.js`.

Current presets:

- `lj_fluid_public`
- `polymer_relaxation_public`
- `gas_diffusion_public`
- `interface_demo_public`

## Validation

Shared validation lives in `core/lammpsCase.js` and reads field metadata from `core/caseDefinitions.js`.

Current checks:

- required fields
- positive numeric fields
- integer lower bounds
- box dimension positivity
- species mass and LJ parameter positivity

Local-only validation remains in services such as `services/lammpsPreflight.js`, path safety services, runner request resolution, and tool-specific builders.

## Generation Locations

Shared:

- `core/lammpsCase.js`: `case.json`, `in.lammps`, `procedure.md`

Web Safe Mode:

- `apps/web/webSafeApp.js`: dynamic form, preview, browser downloads

Local Runner Mode:

- `runners/localRunner.js`: output folder, generated files, optional LAMMPS execution, simple log summary

Existing local GUI / compatibility:

- `routes/inputDrafts.js`: prompt-style draft input
- `services/cgScaffoldBuilder.js`: CG scaffold data and input generation
- `services/aaPolymerBuilder.js`, `services/aaInterfaceBuilder.js`, `services/aaAdhesionBuilder.js`: local AA scaffold generation
- `python/workbench_runner.py`: workflow execution and analysis helpers

## Duplicate Or Partially Duplicate Areas

Already reduced:

- Web case-type labels and field controls are no longer hardcoded in `apps/web/index.html`.
- Web and Local Runner Mode use the same serializer, validator, procedure generator, and input generator for public case definitions.

Still duplicated:

- Legacy CG scaffold defaults in `services/cgScaffoldBuilder.js`.
- Prompt-style LAMMPS draft defaults in `routes/inputDrafts.js`.
- AA and interface preset definitions in local service/UI code.
- Existing local GUI form definitions in `public/app.js`.

## Classification

Move or keep in `core/`:

- case schema
- case type definitions
- field definitions
- public presets
- validation
- LAMMPS input generator
- `procedure.md` generator
- `case.json` serializer/deserializer

Keep in Web Safe Mode:

- static UI
- dynamic form display from `core/`
- preview
- browser download
- future browser-only zip download

Keep in Local Runner Mode:

- runner
- LAMMPS / PACKMOL / Moltemplate / Python / OVITO integration
- local filesystem access
- project save/load
- execution and analysis features

## Next Migration Target

Next, migrate the CG scaffold representative path from `services/cgScaffoldBuilder.js` into a shared case definition. Keep data-file generation and execution local-only, but move the editable field schema and LAMMPS input template into `core/`.
