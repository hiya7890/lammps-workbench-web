(function initWebSafeApp() {
  const core = window.LammpsCaseCore;
  const caseForm = document.querySelector("#caseForm");
  const presetSelect = document.querySelector("#presetSelect");
  const caseSummary = document.querySelector("#caseSummary");
  const fileChecklist = document.querySelector("#fileChecklist");
  const outputs = {
    caseJson: document.querySelector("#caseOutput"),
    input: document.querySelector("#inputOutput"),
    procedure: document.querySelector("#procedureOutput"),
    packmol: document.querySelector("#packmolOutput"),
    moltemplate: document.querySelector("#moltemplateOutput"),
    handoff: document.querySelector("#handoffOutput"),
    runCommand: document.querySelector("#runCommandOutput"),
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
    const input = field.type === "select" ? document.createElement("select") : document.createElement("input");
    input.id = `field-${field.key}`;
    input.name = field.key;
    input.dataset.fieldKey = field.key;
    if (field.type === "select") {
      (field.options || []).forEach((optionValue) => {
        input.appendChild(createOption(optionValue, optionValue));
      });
      input.value = value ?? field.default ?? "";
    } else if (field.type === "number" || field.type === "integer") {
      input.type = "number";
      input.value = value ?? field.default ?? "";
      if (field.min !== undefined) input.min = String(field.min);
      if (field.step !== undefined) input.step = String(field.step);
    } else {
      input.type = "text";
      input.value = value ?? field.default ?? "";
    }
    if (field.required) input.required = true;
    input.addEventListener("input", generate);
    return input;
  }

  function renderForm(caseType, currentValues = {}) {
    state.caseType = caseType;
    state.fields = core.getFieldsForCase(caseType);
    caseForm.replaceChildren();
    renderPresets(caseType);

    const caseTypeLabel = document.createElement("label");
    const caseTypeText = document.createElement("span");
    caseTypeText.textContent = "Case type";
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
    caseTypeLabel.appendChild(caseTypeText);
    caseTypeLabel.appendChild(select);
    caseForm.appendChild(caseTypeLabel);

    const defaults = core.buildCaseFromFieldValues(caseType, currentValues);
    const sections = new Map();
    state.fields.forEach((field) => {
      const sectionKey = field.section || "case";
      if (!sections.has(sectionKey)) {
        const group = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = sectionLabel(sectionKey);
        group.appendChild(legend);
        const grid = document.createElement("div");
        grid.className = "field-grid";
        group.appendChild(grid);
        sections.set(sectionKey, grid);
        caseForm.appendChild(group);
      }
      const label = document.createElement("label");
      const text = document.createElement("span");
      text.textContent = field.label;
      label.appendChild(text);
      label.appendChild(createInput(field, defaults[field.key]));
      sections.get(sectionKey).appendChild(label);
    });
  }

  function renderPresets(caseType) {
    const presets = core.listPresets(caseType).filter((preset) => {
      const definition = core.getCaseDefinition(preset.caseType);
      return definition?.modes?.includes("web_safe");
    });
    presetSelect.replaceChildren();
    presets.forEach((preset) => {
      presetSelect.appendChild(createOption(preset.id, preset.label));
    });
    if (!presets.length) {
      presetSelect.appendChild(createOption("", "No preset"));
    }
  }

  function sectionLabel(sectionKey) {
    return {
      case: "Case",
      molecule: "Molecule build",
      potential: "Force field",
      simulation: "Simulation",
      protocol: "Protocol",
      output: "Output"
    }[sectionKey] || sectionKey;
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
    outputs.packmol.value = core.generatePackmolInput(caseDefinition);
    outputs.moltemplate.value = core.generateMoltemplateLt(caseDefinition);
    outputs.handoff.value = buildHandoffText(caseDefinition, validation);
    outputs.runCommand.textContent = buildRunCommandText(currentRunFolder(caseDefinition));
    renderCaseSummary(caseDefinition);
    renderFileChecklist(caseDefinition);
    outputs.status.textContent = validation.ok ? "生成しました。コピーまたはダウンロードできます。" : validation.errors.join(" ");
  }

  function renderCaseSummary(caseDefinition) {
    const current = core.serializeCase(caseDefinition);
    const items = [
      ["Case", current.caseType],
      ["Steps", current.steps ?? current.runSteps],
      ["Timestep", current.timestep],
      ["Thermo", current.thermo]
    ];
    if (current.caseType === "cg_scaffold") {
      items.push(["Beads", current.beadCount]);
      items.push(["Chains", `${current.chainCount} x ${current.repeatCountPerChain}`]);
      items.push(["Pair", current.pairStyle]);
    }
    caseSummary.replaceChildren(...items.map(([label, value]) => {
      const item = document.createElement("div");
      const key = document.createElement("span");
      key.textContent = label;
      const val = document.createElement("strong");
      val.textContent = String(value ?? "");
      item.append(key, val);
      return item;
    }));
  }

  function renderFileChecklist(caseDefinition) {
    const current = core.serializeCase(caseDefinition);
    const files = [
      ["case.json", "条件の保存・再現用"],
      ["in.lammps", "LAMMPSで実行する入力"],
      ["procedure.md", "実行手順メモ"],
      ["README_run.md", "作業フォルダと実行コマンドのメモ"]
    ];
    if (current.caseType === "cg_scaffold") {
      files.push(["packmol.inp", "PACKMOL配置の下書き"]);
      files.push(["system.lt", "Moltemplate LTの下書き"]);
    }
    fileChecklist.replaceChildren(...files.map(([name, description]) => {
      const item = document.createElement("div");
      const code = document.createElement("code");
      code.textContent = name;
      const span = document.createElement("span");
      span.textContent = description;
      item.append(code, span);
      return item;
    }));
  }

  function currentRunFolder(caseDefinition) {
    const current = core.serializeCase(caseDefinition);
    const safeName = String(current.caseType || "case").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
    return `C:\\lammps-demo\\${safeName}`;
  }

  function buildHandoffText(caseDefinition, validation) {
    const current = core.serializeCase(caseDefinition);
    const folder = currentRunFolder(caseDefinition);
    const handoffFiles = ["case.json", "in.lammps", "procedure.md"];
    if (current.caseType === "cg_scaffold") {
      handoffFiles.push("packmol.inp", "system.lt");
    }
    const lines = [
      `LAMMPS Workbench Web Safe Mode 受け渡しメモ`,
      ``,
      `1. 作業フォルダを作成`,
      folder,
      ``,
      `2. このファイルを同じフォルダへ保存`,
      ...handoffFiles,
      ``,
      `3. LAMMPSで実行`,
      `cd ${folder}`,
      `lmp -in in.lammps`,
      ``
    ];
    if (validation.ok) {
      lines.push(`4. 実行後に確認するファイル`);
      lines.push(`log.lammps`);
      lines.push(`dump.demo.lammpstrj`);
      lines.push(``);
      lines.push(`5. 可視化する場合`);
      lines.push(`OVITOで dump.demo.lammpstrj を開く`);
    } else {
      lines.push(`入力値にエラーがあります: ${validation.errors.join(" ")}`);
    }
    return `${lines.join("\n")}\n`;
  }

  function buildRunCommandText(folder) {
    return `cd ${folder}\nlmp -in in.lammps`;
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

  function generatedFiles() {
    const caseDefinition = buildCaseFromForm();
    const current = core.serializeCase(caseDefinition);
    const files = [
      ["case.json", outputs.caseJson.value],
      ["in.lammps", outputs.input.value],
      ["procedure.md", outputs.procedure.value],
      ["README_run.md", outputs.handoff.value]
    ];
    if (current.caseType === "cg_scaffold") {
      files.push(["packmol.inp", outputs.packmol.value]);
      files.push(["system.lt", outputs.moltemplate.value]);
    }
    return files.filter(([, content]) => String(content || "").trim());
  }

  function crc32(bytes) {
    let crc = -1;
    for (let i = 0; i < bytes.length; i += 1) {
      crc ^= bytes[i];
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function writeUint16(buffer, value) {
    buffer.push(value & 0xff, (value >>> 8) & 0xff);
  }

  function writeUint32(buffer, value) {
    buffer.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
  }

  function createZip(files) {
    const encoder = new TextEncoder();
    const chunks = [];
    const central = [];
    let offset = 0;
    files.forEach(([filename, content]) => {
      const nameBytes = encoder.encode(filename);
      const contentBytes = encoder.encode(content);
      const crc = crc32(contentBytes);
      const local = [];
      writeUint32(local, 0x04034b50);
      writeUint16(local, 20);
      writeUint16(local, 0);
      writeUint16(local, 0);
      writeUint16(local, 0);
      writeUint16(local, 0);
      writeUint32(local, crc);
      writeUint32(local, contentBytes.length);
      writeUint32(local, contentBytes.length);
      writeUint16(local, nameBytes.length);
      writeUint16(local, 0);
      chunks.push(new Uint8Array(local), nameBytes, contentBytes);

      const header = [];
      writeUint32(header, 0x02014b50);
      writeUint16(header, 20);
      writeUint16(header, 20);
      writeUint16(header, 0);
      writeUint16(header, 0);
      writeUint16(header, 0);
      writeUint16(header, 0);
      writeUint32(header, crc);
      writeUint32(header, contentBytes.length);
      writeUint32(header, contentBytes.length);
      writeUint16(header, nameBytes.length);
      writeUint16(header, 0);
      writeUint16(header, 0);
      writeUint16(header, 0);
      writeUint16(header, 0);
      writeUint32(header, 0);
      writeUint32(header, offset);
      central.push(new Uint8Array(header), nameBytes);
      offset += local.length + nameBytes.length + contentBytes.length;
    });
    const centralSize = central.reduce((sum, item) => sum + item.length, 0);
    const end = [];
    writeUint32(end, 0x06054b50);
    writeUint16(end, 0);
    writeUint16(end, 0);
    writeUint16(end, files.length);
    writeUint16(end, files.length);
    writeUint32(end, centralSize);
    writeUint32(end, offset);
    writeUint16(end, 0);
    return new Blob([...chunks, ...central, new Uint8Array(end)], { type: "application/zip" });
  }

  function downloadZip() {
    const files = generatedFiles();
    if (!files.length) {
      outputs.status.textContent = "ZIPに入れるファイルがありません。先に生成してください。";
      return;
    }
    const blob = createZip(files);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.caseType || "lammps-case"}_web_safe_files.zip`;
    link.click();
    URL.revokeObjectURL(url);
    outputs.status.textContent = "生成ファイルをZIPにまとめました。";
  }

  async function copyText(text, label) {
    if (!text) {
      outputs.status.textContent = `${label} が空です。先に生成してください。`;
      return;
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const scratch = document.createElement("textarea");
      scratch.value = text;
      scratch.setAttribute("readonly", "readonly");
      scratch.style.position = "fixed";
      scratch.style.left = "-9999px";
      document.body.appendChild(scratch);
      scratch.select();
      document.execCommand("copy");
      scratch.remove();
    }
    outputs.status.textContent = `${label} をコピーしました。`;
  }

  function resetToDefaults() {
    renderForm(state.caseType, core.buildCaseFromFieldValues(state.caseType, {}));
    generate();
  }

  function applySelectedPreset() {
    const preset = core.listPresets(state.caseType).find((candidate) => candidate.id === presetSelect.value);
    if (!preset) return;
    renderForm(state.caseType, preset.values);
    generate();
  }

  function showTab(targetId) {
    document.querySelectorAll(".tab-view").forEach((view) => {
      view.classList.toggle("is-active", view.id === targetId);
    });
    document.querySelectorAll("[data-tab-target]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tabTarget === targetId);
    });
  }

  document.querySelector("#generateButton").addEventListener("click", generate);
  document.querySelector("#resetButton").addEventListener("click", resetToDefaults);
  document.querySelector("#applyPresetButton").addEventListener("click", applySelectedPreset);
  document.querySelectorAll("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => showTab(button.dataset.tabTarget));
  });
  document.querySelector("#copyCaseButton").addEventListener("click", () => copyText(outputs.caseJson.value, "case.json"));
  document.querySelector("#copyInputButton").addEventListener("click", () => copyText(outputs.input.value, "in.lammps"));
  document.querySelector("#copyInputFromPanelButton").addEventListener("click", () => copyText(outputs.input.value, "in.lammps"));
  document.querySelector("#copyProcedureButton").addEventListener("click", () => copyText(outputs.procedure.value, "procedure.md"));
  document.querySelector("#copyPackmolButton").addEventListener("click", () => copyText(outputs.packmol.value, "packmol.inp"));
  document.querySelector("#copyMoltemplateButton").addEventListener("click", () => copyText(outputs.moltemplate.value, "system.lt"));
  document.querySelector("#copyHandoffButton").addEventListener("click", () => copyText(outputs.handoff.value, "受け渡し文"));
  document.querySelector("#copyRunCommandButton").addEventListener("click", () => copyText(outputs.runCommand.textContent, "実行コマンド"));
  document.querySelector("#downloadCaseButton").addEventListener("click", () => downloadText("case.json", outputs.caseJson.value));
  document.querySelector("#downloadInputButton").addEventListener("click", () => downloadText("in.lammps", outputs.input.value));
  document.querySelector("#downloadPackmolButton").addEventListener("click", () => downloadText("packmol.inp", outputs.packmol.value));
  document.querySelector("#downloadMoltemplateButton").addEventListener("click", () => downloadText("system.lt", outputs.moltemplate.value));
  document.querySelector("#downloadProcedureButton").addEventListener("click", () => downloadText("procedure.md", outputs.procedure.value));
  document.querySelector("#downloadZipButton").addEventListener("click", downloadZip);

  renderForm(state.caseType, {});
  generate();
})();
