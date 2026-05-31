# Web Safe Mode / Common Core Status

This document records the current split between Web Safe Mode, Local Runner / Local GUI, and the shared common core. It is intended as a guardrail for future changes.

## Web Safe Mode Purpose

Web Safe Mode is the public demo and operation-checking version of LAMMPS Workbench.

- Runs as a static browser app.
- Stays within the browser.
- Generates public-demo `case.json`, `in.lammps`, and `procedure.md`.
- Provides preview and browser download.
- Does not execute LAMMPS or any local command.
- Does not upload files.
- Does not save to external services.
- Does not call external APIs.
- Does not analyze logs, dumps, trajectories, images, videos, or result folders.

Users must not enter company material names, customer information, unpublished test conditions, or development-theme-linked conditions into the public Web version.

## Web And Local Role Split

Web Safe Mode owns only static generation features:

- public-safe case selection
- dynamic form display from shared core definitions
- `case.json` generation
- `in.lammps` generation
- `procedure.md` generation
- preview
- browser download
- public demo documentation

Local Runner Mode and the existing Local GUI own local and execution features:

- LAMMPS execution
- PACKMOL integration
- Moltemplate integration
- Python helper workflows
- OVITO integration where available
- local filesystem access
- project save/load
- result folder creation
- log/dump/trajectory organization
- analysis and plotting
- local-only scaffold and runtime routes

Execution and analysis code must remain outside Web Safe Mode.

## Common Core Structure

The shared source of truth is centered on `core/`.

- `core/caseDefinitions.js`
  - case type definitions
  - field definitions
  - defaults
  - presets
  - mode visibility such as `web_safe`, `local_runner`, and `local_gui`
- `core/lammpsCase.js`
  - case normalization
  - serializer / deserializer
  - validation from field metadata
  - LAMMPS input generator for shared case types
  - `procedure.md` generator
  - preset helpers

Future changes should avoid adding duplicate defaults, validation, or template fragments in Web-only and Local-only code when the same meaning can live in `core/`.

## Core-Migrated Cases

The current shared case definitions include:

- `lj_fluid`
- `polymer_relaxation`
- `gas_diffusion`
- `interface_demo`
- `cg_scaffold`

The first four are public-safe demo cases. `cg_scaffold` is also available in Web Safe Mode as a file generator only, so users can prepare a simple CG molecule/protocol scaffold without installing Node.js. Web Safe Mode still does not run LAMMPS, PACKMOL, Moltemplate, Python, or OVITO.

## CG Scaffold Core Fields

The representative `cg_scaffold` path now reads these fields from `core/caseDefinitions.js`:

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

`services/cgScaffoldBuilder.js` uses shared defaults for the representative local scaffold path. Local GUI payload assembly builds a `cg_scaffold` case for this path before sending it to local routes. Web Safe Mode uses the same core definition to generate a self-contained handoff `in.lammps` for manual local execution.

## Fixed Regression Paths

`scripts/test-mode-split.js` fixes these representative paths:

- every core case definition must declare explicit `modes`
- Web Safe UI may expose only cases whose `modes` include `web_safe`
- `cg_scaffold` must remain generation-only in Web Safe Mode and execution-capable only in Local GUI / Local Runner
- default `cg_scaffold` case
- deformation with `deformAxis` / `deformRate`
- `pairStyle` / `pairCoeff` override
- `runSteps` / `thermo` / `timestep` override
- `beadCount` / `chainCount` / `repeatCountPerChain` override
- validation error case from core field metadata
- Web Safe Mode inclusion for `cg_scaffold` as a file generator only
- Local GUI startup normalization from core defaults
- Local GUI static CG scaffold values are either equal to core defaults or explicitly covered by legacy normalization
- `web_safe_common_core_status.md` is included in public build and distribution allowlists
- Web Safe Mode forbidden-capability audit
- shared Web / Local generation equality for representative public cases

These tests are the first line of defense against accidentally forking Web and Local definitions again.

## Public Audit Coverage

`npm run audit:public` checks source and, when present, the built `dist/pages` artifact for public hygiene.

The audit rejects public artifact contamination by:

- `server.js`
- `runners/`
- `routes/`
- `services/`
- `python/`
- local output folders and result artifacts
- `.env`
- LAMMPS dump/log media and generated binary media paths

For Web code files, the audit also rejects direct unsafe capabilities:

- `child_process`
- process spawning and command execution APIs
- filesystem write APIs
- `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, and beacon-style external communication
- file input / upload primitives
- Python command execution patterns
- LAMMPS executable command patterns
- MPI launcher patterns
- shell execution wording in code
- log/dump/trajectory analysis UI wording in code

The audit intentionally does not ban LAMMPS input text such as generated `dump` commands in `core/lammpsCase.js`; Web Safe Mode is allowed to generate input files, but not to execute or analyze them.

## Remaining Duplication

Known duplication remains in these areas:

- static form values in `public/index.html`
- topology, protocol, and UI assembly in `public/app.js`
- prompt-style defaults in `routes/inputDrafts.js`
- AA / interface / adhesion presets and builder defaults in local services
- CG scaffold topology-specific local UI wiring

These are intentionally left local or partially migrated until their contracts are stable enough to move into core without breaking existing Local GUI behavior.

## Recommended Next Work

Before fully dynamicizing `public/index.html`, strengthen mismatch detection between static HTML values and core defaults. This should catch drift while keeping the current Local GUI stable.

Maintain a `cg_scaffold` field correspondence table as new scaffold fields are migrated. The table should identify the core field, Local GUI element, route payload key, service default, and generated LAMMPS line where applicable.

Move AA / interface / adhesion field schema into core only after their public-safe and local-only boundaries are explicit. PACKMOL, Moltemplate, LAMMPS execution, Python workflows, and analysis must remain Local-only.

## Web Safe Mode Prohibited Changes

Do not add any of the following to Web Safe Mode:

- LAMMPS execution
- Python execution
- shell or subprocess execution
- server or runner execution
- file upload
- external save
- external API communication
- log analysis
- dump or trajectory analysis
- result folder analysis
- image or video result analysis
- execution-capable `cg_scaffold` workflows

If a future feature needs any of these capabilities, it belongs in Local Runner Mode, Local GUI, or another explicitly approved local / internal deployment, not the public static Web app.

## Confirmation Commands

Run these checks after changes touching Web Safe Mode, common core, or the representative CG scaffold path:

```sh
npm run check
npm run test:mode-split
npm run audit:public
npm run build:web-public
```
