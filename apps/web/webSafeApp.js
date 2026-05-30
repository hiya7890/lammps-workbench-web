(function initWebSafeApp() {
  const core = window.LammpsCaseCore;
  const fields = {
    caseType: document.querySelector("#caseType"),
    title: document.querySelector("#title"),
    temperature: document.querySelector("#temperature"),
    density: document.querySelector("#density"),
    steps: document.querySelector("#steps"),
    thermo: document.querySelector("#thermo"),
    timestep: document.querySelector("#timestep"),
    seed: document.querySelector("#seed")
  };
  const outputs = {
    caseJson: document.querySelector("#caseOutput"),
    input: document.querySelector("#inputOutput"),
    procedure: document.querySelector("#procedureOutput"),
    status: document.querySelector("#status")
  };

  document.querySelector("#versionBadge").textContent = `core ${core.VERSION}`;

  function buildCaseFromForm() {
    return core.normalizeCase({
      caseType: fields.caseType.value,
      title: fields.title.value,
      temperature: Number(fields.temperature.value),
      density: Number(fields.density.value),
      steps: Number(fields.steps.value),
      thermo: Number(fields.thermo.value),
      timestep: Number(fields.timestep.value),
      seed: Number(fields.seed.value)
    });
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
  Object.values(fields).forEach((field) => field.addEventListener("input", generate));
  generate();
})();
