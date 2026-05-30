(function initLammpsCaseCore(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LammpsCaseCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createCore() {
  const VERSION = "0.3.0";

  const SUPPORTED_CASE_TYPES = {
    lj_fluid: "Lennard-Jones fluid",
    polymer_relaxation: "Simple polymer relaxation",
    gas_diffusion: "Gas diffusion demo",
    interface_demo: "Generic interface demo"
  };

  const DEFAULTS = {
    schemaVersion: "1.0",
    caseType: "lj_fluid",
    title: "Public LJ fluid demo",
    units: "lj",
    atomStyle: "atomic",
    boundary: "p p p",
    timestep: 0.005,
    steps: 1000,
    thermo: 100,
    temperature: 1.0,
    density: 0.75,
    seed: 12345,
    box: { x: 20, y: 20, z: 20 },
    species: [{ name: "A", mass: 1.0, epsilon: 1.0, sigma: 1.0 }],
    output: {
      log: "log.lammps",
      dump: "dump.demo.lammpstrj"
    }
  };

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function toNumber(value, fallback) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  function normalizeCase(input) {
    const source = isPlainObject(input) ? input : {};
    const normalized = deepClone(DEFAULTS);
    Object.keys(source).forEach((key) => {
      if (key === "box" && isPlainObject(source.box)) {
        normalized.box = Object.assign({}, normalized.box, source.box);
      } else if (key === "output" && isPlainObject(source.output)) {
        normalized.output = Object.assign({}, normalized.output, source.output);
      } else if (key === "species" && Array.isArray(source.species)) {
        normalized.species = source.species.map((item) => Object.assign({}, item));
      } else {
        normalized[key] = source[key];
      }
    });

    normalized.schemaVersion = String(normalized.schemaVersion || DEFAULTS.schemaVersion);
    normalized.caseType = SUPPORTED_CASE_TYPES[normalized.caseType] ? normalized.caseType : DEFAULTS.caseType;
    normalized.title = String(normalized.title || DEFAULTS.title).trim();
    normalized.units = String(normalized.units || DEFAULTS.units).trim();
    normalized.atomStyle = String(normalized.atomStyle || DEFAULTS.atomStyle).trim();
    normalized.boundary = String(normalized.boundary || DEFAULTS.boundary).trim();
    normalized.timestep = toNumber(normalized.timestep, DEFAULTS.timestep);
    normalized.steps = Math.max(0, Math.floor(toNumber(normalized.steps, DEFAULTS.steps)));
    normalized.thermo = Math.max(1, Math.floor(toNumber(normalized.thermo, DEFAULTS.thermo)));
    normalized.temperature = toNumber(normalized.temperature, DEFAULTS.temperature);
    normalized.density = toNumber(normalized.density, DEFAULTS.density);
    normalized.seed = Math.max(1, Math.floor(toNumber(normalized.seed, DEFAULTS.seed)));
    normalized.box = {
      x: toNumber(normalized.box.x, DEFAULTS.box.x),
      y: toNumber(normalized.box.y, DEFAULTS.box.y),
      z: toNumber(normalized.box.z, DEFAULTS.box.z)
    };
    normalized.species = normalized.species.length ? normalized.species : deepClone(DEFAULTS.species);
    normalized.species = normalized.species.map((species, index) => ({
      name: String(species.name || `T${index + 1}`).trim(),
      mass: toNumber(species.mass, 1.0),
      epsilon: toNumber(species.epsilon, 1.0),
      sigma: toNumber(species.sigma, 1.0)
    }));
    normalized.output = {
      log: String(normalized.output.log || DEFAULTS.output.log).trim(),
      dump: String(normalized.output.dump || DEFAULTS.output.dump).trim()
    };
    return normalized;
  }

  function validateCase(caseDefinition) {
    const current = normalizeCase(caseDefinition);
    const errors = [];
    if (!current.title) errors.push("title is required.");
    if (current.timestep <= 0) errors.push("timestep must be positive.");
    if (current.steps < 0) errors.push("steps must be zero or positive.");
    if (current.thermo <= 0) errors.push("thermo must be positive.");
    if (current.temperature <= 0) errors.push("temperature must be positive.");
    if (current.density <= 0) errors.push("density must be positive.");
    ["x", "y", "z"].forEach((axis) => {
      if (current.box[axis] <= 0) errors.push(`box.${axis} must be positive.`);
    });
    current.species.forEach((species, index) => {
      if (!species.name) errors.push(`species[${index}].name is required.`);
      if (species.mass <= 0) errors.push(`species[${index}].mass must be positive.`);
      if (species.epsilon <= 0) errors.push(`species[${index}].epsilon must be positive.`);
      if (species.sigma <= 0) errors.push(`species[${index}].sigma must be positive.`);
    });
    return { ok: errors.length === 0, errors, case: current };
  }

  function formatNumber(value) {
    if (Number.isInteger(value)) return String(value);
    return Number(value).toPrecision(8).replace(/\.?0+$/, "");
  }

  function generateLammpsInput(caseDefinition) {
    const validation = validateCase(caseDefinition);
    if (!validation.ok) {
      throw new Error(validation.errors.join(" "));
    }
    const current = validation.case;
    const lines = [
      `# LAMMPS Workbench ${VERSION}`,
      `# ${current.title}`,
      `# Case type: ${current.caseType} (${SUPPORTED_CASE_TYPES[current.caseType]})`,
      "",
      `units ${current.units}`,
      `atom_style ${current.atomStyle}`,
      `boundary ${current.boundary}`,
      "",
      `region simbox block 0 ${formatNumber(current.box.x)} 0 ${formatNumber(current.box.y)} 0 ${formatNumber(current.box.z)}`,
      "create_box 1 simbox",
      `create_atoms 1 random 400 ${current.seed} simbox`,
      "",
      `mass 1 ${formatNumber(current.species[0].mass)}`,
      `pair_style lj/cut ${formatNumber(2.5 * current.species[0].sigma)}`,
      `pair_coeff 1 1 ${formatNumber(current.species[0].epsilon)} ${formatNumber(current.species[0].sigma)}`,
      "",
      `velocity all create ${formatNumber(current.temperature)} ${current.seed} mom yes rot no dist gaussian`,
      "fix nvt_all all nvt temp ${TEMP} ${TEMP} 1.0".replace(/\$\{TEMP\}/g, formatNumber(current.temperature)),
      `timestep ${formatNumber(current.timestep)}`,
      `thermo ${current.thermo}`,
      "thermo_style custom step temp pe ke etotal press density",
      `dump demo_dump all atom ${current.thermo} ${current.output.dump}`,
      "",
      `run ${current.steps}`,
      "",
      "undump demo_dump",
      "unfix nvt_all"
    ];

    if (current.caseType === "polymer_relaxation") {
      lines.splice(2, 0, "# Public demo placeholder: add bonded topology in Local Runner preparation if needed.");
    }
    if (current.caseType === "gas_diffusion") {
      lines.splice(2, 0, "# Public demo placeholder: use tracer groups in Local Runner analysis if needed.");
    }
    if (current.caseType === "interface_demo") {
      lines.splice(2, 0, "# Public demo placeholder: define generic wall or slab geometry in approved local workflows.");
    }
    return `${lines.join("\n")}\n`;
  }

  function generateCaseJson(caseDefinition) {
    return `${JSON.stringify(normalizeCase(caseDefinition), null, 2)}\n`;
  }

  function generateProcedure(caseDefinition) {
    const current = normalizeCase(caseDefinition);
    return [
      `# ${current.title}`,
      "",
      "1. Review the generated case.json and in.lammps files.",
      "2. In Web Safe Mode, stop here and download/copy the files for manual review.",
      "3. In Local Runner Mode, run the generated input only in an approved local environment.",
      "4. Keep log, dump, trajectory, plots, and analysis outputs outside the source repository.",
      "",
      `Case type: ${current.caseType}`,
      `Steps: ${current.steps}`,
      `Thermo interval: ${current.thermo}`
    ].join("\n");
  }

  return {
    VERSION,
    SUPPORTED_CASE_TYPES,
    DEFAULTS,
    normalizeCase,
    validateCase,
    generateLammpsInput,
    generateCaseJson,
    generateProcedure
  };
});
