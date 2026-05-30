(function initLammpsCaseCore(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./caseDefinitions"));
  } else {
    root.LammpsCaseCore = factory(root.LammpsCaseDefinitions);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createCore(caseDefinitions) {
  const VERSION = "0.3.0";

  const definitions = caseDefinitions || {};
  const SUPPORTED_CASE_TYPES = Object.fromEntries(
    (definitions.listCaseDefinitions ? definitions.listCaseDefinitions() : [
      { id: "lj_fluid", label: "Lennard-Jones fluid" },
      { id: "polymer_relaxation", label: "Simple polymer relaxation" },
      { id: "gas_diffusion", label: "Gas diffusion demo" },
      { id: "interface_demo", label: "Generic interface demo" }
    ]).map((definition) => [definition.id, definition.label])
  );

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

  function fieldFallbackValue(caseType, key, fallback) {
    const field = definitions.getFieldsForCase
      ? definitions.getFieldsForCase(caseType).find((candidate) => candidate.key === key)
      : null;
    return field && Object.prototype.hasOwnProperty.call(field, "default") ? field.default : fallback;
  }

  function defaultCaseForType(caseType) {
    const safeCaseType = SUPPORTED_CASE_TYPES[caseType] ? caseType : DEFAULTS.caseType;
    return Object.assign(
      {},
      DEFAULTS,
      definitions.defaultValuesForCase ? definitions.defaultValuesForCase(safeCaseType) : {},
      { caseType: safeCaseType }
    );
  }

  function normalizeCase(input) {
    const source = isPlainObject(input) ? input : {};
    const requestedCaseType = SUPPORTED_CASE_TYPES[source.caseType] ? source.caseType : DEFAULTS.caseType;
    const normalized = deepClone(defaultCaseForType(requestedCaseType));
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
    normalized.caseType = SUPPORTED_CASE_TYPES[normalized.caseType] ? normalized.caseType : requestedCaseType;
    normalized.title = String(normalized.title || fieldFallbackValue(normalized.caseType, "title", DEFAULTS.title)).trim();
    normalized.units = String(normalized.units || DEFAULTS.units).trim();
    normalized.atomStyle = String(normalized.atomStyle || DEFAULTS.atomStyle).trim();
    normalized.boundary = String(normalized.boundary || DEFAULTS.boundary).trim();
    normalized.timestep = toNumber(normalized.timestep, fieldFallbackValue(normalized.caseType, "timestep", DEFAULTS.timestep));
    normalized.steps = Math.floor(toNumber(normalized.steps, fieldFallbackValue(normalized.caseType, "steps", DEFAULTS.steps)));
    normalized.thermo = Math.floor(toNumber(normalized.thermo, fieldFallbackValue(normalized.caseType, "thermo", DEFAULTS.thermo)));
    normalized.temperature = toNumber(normalized.temperature, fieldFallbackValue(normalized.caseType, "temperature", DEFAULTS.temperature));
    normalized.density = toNumber(normalized.density, fieldFallbackValue(normalized.caseType, "density", DEFAULTS.density));
    normalized.seed = Math.floor(toNumber(normalized.seed, fieldFallbackValue(normalized.caseType, "seed", DEFAULTS.seed)));
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
    const fields = definitions.getFieldsForCase ? definitions.getFieldsForCase(current.caseType) : [];
    fields.forEach((field) => {
      const value = current[field.key];
      if (field.required && (value === "" || value === null || value === undefined)) {
        errors.push(`${field.key} is required.`);
      }
      if (field.validation?.positive && !(Number(value) > 0)) {
        errors.push(`${field.key} must be positive.`);
      }
      if (field.validation?.min !== undefined && Number(value) < Number(field.validation.min)) {
        errors.push(`${field.key} must be at least ${field.validation.min}.`);
      }
    });
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
    return `${JSON.stringify(serializeCase(caseDefinition), null, 2)}\n`;
  }

  function serializeCase(caseDefinition) {
    return normalizeCase(caseDefinition);
  }

  function deserializeCase(caseJson) {
    const parsed = typeof caseJson === "string" ? JSON.parse(caseJson) : caseJson;
    return normalizeCase(parsed);
  }

  function listCaseDefinitions() {
    return definitions.listCaseDefinitions ? definitions.listCaseDefinitions() : [];
  }

  function getCaseDefinition(caseType) {
    return definitions.getCaseDefinition ? definitions.getCaseDefinition(caseType) : null;
  }

  function getFieldsForCase(caseType) {
    return definitions.getFieldsForCase ? definitions.getFieldsForCase(caseType) : [];
  }

  function listPresets(caseType) {
    return definitions.listPresets ? definitions.listPresets(caseType) : [];
  }

  function buildCaseFromFieldValues(caseType, values) {
    return normalizeCase(Object.assign({}, definitions.defaultValuesForCase ? definitions.defaultValuesForCase(caseType) : {}, values, { caseType }));
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
    listCaseDefinitions,
    getCaseDefinition,
    getFieldsForCase,
    listPresets,
    buildCaseFromFieldValues,
    normalizeCase,
    validateCase,
    serializeCase,
    deserializeCase,
    generateLammpsInput,
    generateCaseJson,
    generateProcedure
  };
});
