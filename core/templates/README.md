# Templates

The executable template logic currently lives in `../lammpsCase.js` so the same code can run in Node.js and a static browser page.

When adding richer templates, keep them data-only or pure functions and make Web Safe Mode consume exactly the same template source as Local Runner Mode.
