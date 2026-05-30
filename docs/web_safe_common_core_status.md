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

The first four are public-safe cases available in Web Safe Mode. `cg_scaffold` is currently local-only and must not appear in Web Safe Mode case selection.

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

`services/cgScaffoldBuilder.js` uses shared defaults for the representative local-only scaffold path. Local GUI payload assembly builds a `cg_scaffold` case for this path before sending it to local routes.

## Fixed Regression Paths

`scripts/test-mode-split.js` fixes these representative paths:

- default `cg_scaffold` case
- deformation with `deformAxis` / `deformRate`
- `pairStyle` / `pairCoeff` override
- `runSteps` / `thermo` / `timestep` override
- `beadCount` / `chainCount` / `repeatCountPerChain` override
- validation error case from core field metadata
- Web Safe Mode exclusion for `cg_scaffold`
- Local GUI startup normalization from core defaults
- Web Safe Mode forbidden-capability audit
- shared Web / Local generation equality for representative public cases

These tests are the first line of defense against accidentally forking Web and Local definitions again.

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
- Local GUI-only `cg_scaffold` case selection

If a future feature needs any of these capabilities, it belongs in Local Runner Mode, Local GUI, or another explicitly approved local / internal deployment, not the public static Web app.

## Confirmation Commands

Run these checks after changes touching Web Safe Mode, common core, or the representative CG scaffold path:

```sh
npm run check
npm run test:mode-split
npm run audit:public
npm run build:web-public
```

