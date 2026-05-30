# Data Policy

Repository contents must be limited to source code, public synthetic examples, schemas, and documentation.

Do not commit:

- Internal material names.
- Third-party names or identifiers.
- Unpublished test conditions.
- Experiment results.
- Analysis results.
- Dumps, trajectories, restart files, or logs.
- Images or videos from analysis outputs.
- Personal PC paths.
- API keys, tokens, `.env`, credentials, or unlock procedures.
- Case names that imply company projects or private themes.

Use `examples/public/` for publishable demos. Use `app-data/`, `runs/`, or another ignored local workspace for generated results.

This working tree currently contains tracked history and filenames that may not be appropriate for a public repository. If public distribution is required, create a clean repository from the Web Safe Mode and Local Runner Mode package outputs rather than relying on history rewriting in place.
