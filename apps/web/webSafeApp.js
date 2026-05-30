(function initWebSafeApp() {
  const core = window.LammpsCaseCore;
  const caseForm = document.querySelector("#caseForm");
  const outputs = {
    caseJson: document.querySelector("#caseOutput"),
    input: document.querySelector("#inputOutput"),
    procedure: document.querySelector("#procedureOutput"),
    status: document.querySelector("#status")
  };
  const state = {
    caseType: "lj_fluid",
    fields: []
  };

  document.querySelector("#versionBadge").textContent = `core ${core.VERSION}`;

  function createOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function createInput(field, value) {
    const input = document.createElement("input");
    input.id = `field-${field.key}`;
    input.name = field.key;
    input.value = value ?? field.default ?? "";
    input.dataset.fieldKey = field.key;
    if (field.type === "number" || field.type === "integer") {
      input.type = "number";
      if (field.min !== undefined) input.min = String(field.min);
      if (field.step !== undefined) input.step = String(field.step);
    } else {
      input.type = "text";
    }
    if (field.required) input.required = true;
    input.addEventListener("input", generate);
    return input;
  }

  function renderForm(caseType, currentValues = {}) {
    state.caseType = caseType;
    state.fields = core.getFieldsForCase(caseType);
    caseForm.replaceChildren();

    const caseTypeLabel = document.createElement("label");
    caseTypeLabel.textContent = "Case type";
    const select = document.createElement("select");
    select.id = "caseType";
    core.listCaseDefinitions()
      .filter((definition) => !Array.isArray(definition.modes) || definition.modes.includes("web_safe"))
      .forEach((definition) => {
      select.appendChild(createOption(definition.id, definition.label));
      });
    select.value = caseType;
    select.addEventListener("input", () => {
      const defaults = core.buildCaseFromFieldValues(select.value, {});
      renderForm(select.value, defaults);
      generate();
    });
    caseTypeLabel.appendChild(select);
    caseForm.appendChild(caseTypeLabel);

    const defaults = core.buildCaseFromFieldValues(caseType, currentValues);
    state.fields.forEach((field) => {
      const label = document.createElement("label");
      label.textContent = field.label;
      label.appendChild(createInput(field, defaults[field.key]));
      caseForm.appendChild(label);
    });
  }

  function fieldValue(field) {
    const input = document.querySelector(`#field-${field.key}`);
    if (!input) return field.default;
    if (field.type === "number" || field.type === "integer") {
      return Number(input.value);
    }
    return input.value;
  }

  function buildCaseFromForm() {
    const values = {};
    state.fields.forEach((field) => {
      values[field.key] = fieldValue(field);
    });
    return core.buildCaseFromFieldValues(state.caseType, values);
  }

  function generate() {
    const caseDefinition = buildCaseFromForm();
    const validation = core.validateCase(caseDefinition);
    outputs.caseJson.value = core.generateCaseJson(caseDefinition);
    outputs.input.value = validation.ok ? core.generateLammpsInput(caseDefinition) : "";
    outputs.procedure.value = core.generateProcedure(caseDefinition);
    outputs.status.textContent = validation.ok ? "生成しました。" : validation.errors.join(" ");
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  document.querySelector("#generateButton").addEventListener("click", generate);
  document.querySelector("#downloadCaseButton").addEventListener("click", () => downloadText("case.json", outputs.caseJson.value));
  document.querySelector("#downloadInputButton").addEventListener("click", () => downloadText("in.lammps", outputs.input.value));
  document.querySelector("#downloadProcedureButton").addEventListener("click", () => downloadText("procedure.md", outputs.procedure.value));

  renderForm(state.caseType, {});
  generate();
})();
