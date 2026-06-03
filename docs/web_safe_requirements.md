# Web Safe Mode Requirements

This document is the single-page requirement and goal summary for the public Web version of LAMMPS Workbench.

## Purpose

Web Safe Mode is the public, static, browser-based version of LAMMPS Workbench.

Its purpose is to let users:

- try the LAMMPS Workbench operation flow from a URL
- define public demo cases
- generate `case.json`
- generate `in.lammps`
- generate `procedure.md`
- copy or download generated files
- understand how to move the generated files to a local LAMMPS environment

Web Safe Mode is not a computation service and not a remote runner.

## Product Position

Web Safe Mode is designed as a restricted version of the Local Workbench, not as a separate application.

The intended structure is:

```text
shared core + shared UI foundation
  -> Local Workbench: full local execution, save/load, analysis
  -> Web Safe Mode: same basic workflow, execution-related controls locked
```

The Web UI should follow the Local UI as the baseline. Features that are unavailable in Web Safe Mode should generally remain visible as disabled or locked controls when that improves user understanding. This makes it clear that Web Safe Mode is a public-safe subset of the Local version.

## Users And Data Scope

Allowed use:

- public demo conditions
- synthetic examples
- general operation checks
- educational or evaluation workflows that do not contain private data

Do not enter:

- company material names
- customer names or customer identifiers
- unpublished test conditions
- internal project names
- development-theme-linked parameters
- experiment results
- proprietary structures or recipes

For company, customer, or unpublished conditions, use Local Workbench only in an approved environment and storage location.

## Functional Requirements

Web Safe Mode should support:

- case type selection from `core/caseDefinitions.js`
- dynamic form rendering from shared field definitions
- defaults from shared core definitions
- presets from shared core definitions
- validation from shared core definitions
- `case.json` serialization
- `in.lammps` generation
- `procedure.md` generation
- browser-side generated text display
- copy-to-clipboard
- browser download
- browser-side ZIP creation for generated text files
- Local-style workspace selector with unavailable workspaces locked
- Local-style main tabs:
  - model build
  - protocol
  - run / analysis, shown but locked
  - settings, shown but locked

Current public-enabled cases:

- `lj_fluid`
- `polymer_relaxation`
- `gas_diffusion`
- `interface_demo`
- `cg_scaffold` as generation-only scaffold

## Non-Functional Requirements

Web Safe Mode must:

- run as static HTML/CSS/JavaScript
- be deployable to GitHub Pages or equivalent static hosting
- work without installing Node.js on the user PC
- keep generation logic aligned with Local Workbench through `core/`
- keep UI foundation aligned with Local Workbench through `shared/ui/`
- keep public examples synthetic and general
- be auditable with `npm run audit:public`

## Prohibited Capabilities

Web Safe Mode must not include:

- LAMMPS execution
- automatic execution
- runner execution
- server execution
- subprocess, shell, or command execution
- Python execution
- PACKMOL execution
- Moltemplate execution
- OVITO launch
- local filesystem project save/load
- file upload
- external storage
- external API calls
- log parsing
- dump or trajectory analysis
- result folder analysis
- plot generation from results
- image or video result analysis

It may generate text that instructs the user how to run LAMMPS locally, but it must not run the command itself.

## Local Workbench Relationship

Everything Web Safe Mode can generate should also be possible in Local Workbench.

Local Workbench may additionally provide:

- project creation and project save/load
- local path configuration
- file browse dialogs
- LAMMPS/PACKMOL/Moltemplate/Python/OVITO integration
- execution
- result folder creation
- log/dump/trajectory organization
- analysis and plotting
- comparison workflows
- local-only routes and services

This asymmetry is intentional:

```text
Web generation features should be a subset of Local.
Local execution and analysis features must not move into Web Safe Mode.
```

## Commonization Requirements

Common source of truth:

- `core/caseDefinitions.js`
  - case definitions
  - fields
  - defaults
  - presets
  - mode visibility
- `core/lammpsCase.js`
  - normalization
  - validation
  - serialization
  - LAMMPS input generation
  - procedure generation
- `shared/ui/workbench-shell.css`
  - common visual foundation
- `shared/ui/workbenchUi.js`
  - common tab/card/active-state interaction primitives

Do not duplicate the same field meaning, default, validation, or template separately in Web and Local unless the difference is explicitly mode-specific.

## UI Requirements

The Web UI should look and behave like the Local Workbench baseline.

Required UI behavior:

- show Local-style workspace selector
- show CG workspace as active for current Web-safe scope
- show AA / Hybrid as locked when not available
- show Local-style main tabs
- show run / analysis controls as disabled, not removed
- show settings controls as disabled, not removed
- clearly explain why locked controls are unavailable
- keep Web-only actions such as download/copy/ZIP in the safe generation flow

## Build And Distribution

Build public static artifact:

```powershell
npm run build:web-public
```

Package distributions:

```powershell
npm run package
```

Expected outputs:

- `dist/pages`: GitHub Pages static artifact
- `dist/lammps-workbench-web.zip`: Web Safe distribution without runner code
- `dist/lammps-workbench-local.zip`: Local distribution with runner/local services

## Required Checks

Run after changes touching Web Safe Mode, common core, public build, or shared UI:

```powershell
npm run check
npm run test:mode-split
npm run audit:public
npm run build:web-public
npm run package
```

The checks should confirm:

- same case input produces the same shared generation result
- Web Safe UI exposes only `web_safe` cases
- public build contains required Web docs
- public build excludes runner/server/routes/services/python execution code
- public build excludes forbidden Web capabilities
- Web Safe Mode remains a static generation-only app

## Current Known Gaps

Known remaining gaps:

- Local GUI still has static HTML values and UI assembly not fully driven by shared core definitions.
- AA / interface / adhesion presets are not fully migrated into shared core.
- Web AA and Hybrid workspaces are currently locked display states, not active generators.
- Local and Web use a shared UI foundation, but full component-level rendering is still only partially commonized.

Recommended next work:

- continue migrating Local GUI form definitions to `core/caseDefinitions.js`
- define public-safe AA demo scope before enabling AA generation on Web
- keep Web locked controls visible while preventing execution capabilities
- move more tab/card/form rendering into `shared/ui/` once stable
