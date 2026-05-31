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

The second pass adds the representative Local GUI CG scaffold path:

- `units`
- `atomStyle`
- `pairStyle`
- `pairCoeff`
- `thermo`
- `runSteps`
- `timestep`
- `temperature`
- `density`
- `beadCount`
- `chainCount`
- `repeatCountPerChain`
- `deformAxis`
- `deformRate`

The Web UI now renders these from `core/caseDefinitions.js`. Local Runner Mode also records and validates against the same definitions through `core/lammpsCase.js`.

## CG Scaffold Regression Cases

The representative `cg_scaffold` path now has regression coverage for:

- default case: core defaults for units, atom style, pair style, pair coefficient, thermo, and run steps
- deformation: `deformAxis` / `deformRate` producing the expected local-only deform scaffold line
- pair settings: overridden `pairStyle` and `pairCoeff`
- run controls: overridden `runSteps`, `thermo`, and `timestep`
- bead and chain counts: overridden `beadCount`, `chainCount`, and `repeatCountPerChain`
- validation error case: invalid thermo, run steps, timestep, temperature, density, bead count, chain count, and repeat count

These tests compare Local GUI-equivalent payloads and core case payloads through the same `case.json` and `in.lammps` generation path where the representative scaffold is already migrated.

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
- The representative Local GUI CG scaffold path now builds a `cg_scaffold` case from `core/caseDefinitions.js`.
- `services/cgScaffoldBuilder.js` and `routes/cgMapping.js` now use shared `cg_scaffold` defaults for units, atom style, pair settings, thermo, timestep, run steps, and bead/chain counts.
- `services/cgScaffoldBuilder.js` now emits `timestep` from the shared CG scaffold field definition into the generated local-only scaffold input.

Still duplicated:

- Prompt-style LAMMPS draft defaults in `routes/inputDrafts.js`.
- AA and interface preset definitions in local service/UI code.
- Existing local GUI form definitions and static HTML defaults in `public/index.html` / `public/app.js`.
- Detailed CG template UI copy and local-only template rows in `public/app.js`.
- CG scaffold topology-specific UI wiring, protocol widgets, and local-only execution payload assembly remain in Local GUI code by design.

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

Exclude from Web Safe Mode:

- `cg_scaffold` execution, local file writes, and local service routes
- LAMMPS execution
- Python or shell execution
- file upload
- external save or external API communication
- log, dump, trajectory, image, video, or result analysis

Keep in Local Runner Mode:

- runner
- LAMMPS / PACKMOL / Moltemplate / Python / OVITO integration
- local filesystem access
- project save/load
- execution and analysis features

## Next Migration Target

Next, migrate one of these bounded paths:

- prompt-style input draft defaults in `routes/inputDrafts.js`
- polyethylene CG template rows and topology defaults in `public/app.js`
- AA/interface public-safe field schema only, without moving PACKMOL, Moltemplate, LAMMPS execution, or analysis into Web Safe Mode

Keep data-file generation, local filesystem access, and execution local-only, but continue moving editable field schema and defaults into `core/`.
