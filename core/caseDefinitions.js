(function initLammpsCaseDefinitions(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LammpsCaseDefinitions = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createDefinitions() {
  const COMMON_FIELDS = [
    {
      key: "title",
      label: "Title",
      type: "text",
      required: true,
      default: "Public LJ fluid demo",
      section: "case"
    },
    {
      key: "temperature",
      label: "Temperature",
      type: "number",
      default: 1.0,
      min: 0.001,
      step: 0.1,
      required: true,
      validation: { positive: true },
      section: "simulation"
    },
    {
      key: "density",
      label: "Density",
      type: "number",
      default: 0.75,
      min: 0.001,
      step: 0.05,
      required: true,
      validation: { positive: true },
      section: "simulation"
    },
    {
      key: "steps",
      label: "Steps",
      type: "integer",
      default: 1000,
      min: 0,
      step: 100,
      required: true,
      validation: { min: 0 },
      section: "simulation"
    },
    {
      key: "thermo",
      label: "Thermo interval",
      type: "integer",
      default: 100,
      min: 1,
      step: 10,
      required: true,
      validation: { min: 1 },
      section: "output"
    },
    {
      key: "timestep",
      label: "Timestep",
      type: "number",
      default: 0.005,
      min: 0.0001,
      step: 0.001,
      required: true,
      validation: { positive: true },
      section: "simulation"
    },
    {
      key: "seed",
      label: "Seed",
      type: "integer",
      default: 12345,
      min: 1,
      step: 1,
      required: true,
      validation: { min: 1 },
      section: "simulation"
    }
  ];

  const CASE_TYPES = [
    {
      id: "lj_fluid",
      label: "LJ fluid",
      description: "Public Lennard-Jones fluid input generation demo.",
      fields: COMMON_FIELDS,
      presetIds: ["lj_fluid_public"]
    },
    {
      id: "polymer_relaxation",
      label: "Simple polymer relaxation",
      description: "Public placeholder for a simple polymer relaxation workflow.",
      fields: COMMON_FIELDS.map((field) => (
        field.key === "title"
          ? { ...field, default: "Public simple polymer relaxation demo" }
          : field.key === "density"
            ? { ...field, default: 0.7 }
            : field.key === "steps"
              ? { ...field, default: 1500 }
              : field.key === "seed"
                ? { ...field, default: 24680 }
                : field
      )),
      presetIds: ["polymer_relaxation_public"]
    },
    {
      id: "gas_diffusion",
      label: "Gas diffusion demo",
      description: "Public gas diffusion input generation demo.",
      fields: COMMON_FIELDS.map((field) => (
        field.key === "title"
          ? { ...field, default: "Public gas diffusion demo" }
          : field.key === "temperature"
            ? { ...field, default: 1.2 }
            : field.key === "density"
              ? { ...field, default: 0.35 }
              : field.key === "steps"
                ? { ...field, default: 1200 }
                : field.key === "seed"
                  ? { ...field, default: 13579 }
                  : field
      )),
      presetIds: ["gas_diffusion_public"]
    },
    {
      id: "interface_demo",
      label: "Generic interface demo",
      description: "Public generic interface input generation demo.",
      fields: COMMON_FIELDS.map((field) => (
        field.key === "title"
          ? { ...field, default: "Public generic interface demo" }
          : field.key === "density"
            ? { ...field, default: 0.65 }
            : field.key === "seed"
              ? { ...field, default: 97531 }
              : field
      )),
      presetIds: ["interface_demo_public"]
    }
  ];

  const PRESETS = [
    {
      id: "lj_fluid_public",
      caseType: "lj_fluid",
      label: "Public LJ fluid demo",
      values: {
        schemaVersion: "1.0",
        caseType: "lj_fluid",
        title: "Public LJ fluid demo",
        temperature: 1.0,
        density: 0.75,
        steps: 1000,
        thermo: 100,
        timestep: 0.005,
        seed: 12345
      }
    },
    {
      id: "polymer_relaxation_public",
      caseType: "polymer_relaxation",
      label: "Public simple polymer relaxation demo",
      values: {
        schemaVersion: "1.0",
        caseType: "polymer_relaxation",
        title: "Public simple polymer relaxation demo",
        temperature: 1.0,
        density: 0.7,
        steps: 1500,
        thermo: 100,
        timestep: 0.005,
        seed: 24680
      }
    },
    {
      id: "gas_diffusion_public",
      caseType: "gas_diffusion",
      label: "Public gas diffusion demo",
      values: {
        schemaVersion: "1.0",
        caseType: "gas_diffusion",
        title: "Public gas diffusion demo",
        temperature: 1.2,
        density: 0.35,
        steps: 1200,
        thermo: 100,
        timestep: 0.005,
        seed: 13579
      }
    },
    {
      id: "interface_demo_public",
      caseType: "interface_demo",
      label: "Public generic interface demo",
      values: {
        schemaVersion: "1.0",
        caseType: "interface_demo",
        title: "Public generic interface demo",
        temperature: 1.0,
        density: 0.65,
        steps: 1000,
        thermo: 100,
        timestep: 0.005,
        seed: 97531
      }
    }
  ];

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getCaseDefinition(caseType) {
    return deepClone(CASE_TYPES.find((definition) => definition.id === caseType) || CASE_TYPES[0]);
  }

  function listCaseDefinitions() {
    return deepClone(CASE_TYPES);
  }

  function getFieldsForCase(caseType) {
    return getCaseDefinition(caseType).fields;
  }

  function getPreset(presetId) {
    const preset = PRESETS.find((candidate) => candidate.id === presetId);
    return preset ? deepClone(preset) : null;
  }

  function getDefaultPresetForCase(caseType) {
    const definition = getCaseDefinition(caseType);
    return getPreset(definition.presetIds[0]);
  }

  function listPresets(caseType) {
    const presets = caseType ? PRESETS.filter((preset) => preset.caseType === caseType) : PRESETS;
    return deepClone(presets);
  }

  function defaultValuesForCase(caseType) {
    const preset = getDefaultPresetForCase(caseType);
    if (preset) return deepClone(preset.values);
    const values = { schemaVersion: "1.0", caseType };
    getFieldsForCase(caseType).forEach((field) => {
      values[field.key] = deepClone(field.default);
    });
    return values;
  }

  return {
    CASE_TYPES,
    PRESETS,
    getCaseDefinition,
    listCaseDefinitions,
    getFieldsForCase,
    getPreset,
    getDefaultPresetForCase,
    listPresets,
    defaultValuesForCase
  };
});
