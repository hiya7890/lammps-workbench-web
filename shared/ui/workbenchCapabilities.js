(function initWorkbenchCapabilities(global) {
  const MODES = {
    web_safe: {
      label: "Web Safe Mode",
      allowed: new Set(["generate", "copy", "download", "zip", "manualCommand"])
    },
    local_prepare_only: {
      label: "Local Prepare Only",
      allowed: new Set(["generate", "copy", "download", "zip", "manualCommand"])
    },
    local_runner: {
      label: "Local Runner Mode",
      allowed: new Set([
        "generate",
        "copy",
        "download",
        "zip",
        "manualCommand",
        "localBrowse",
        "projectIo",
        "lammpsRun",
        "packmolRun",
        "moltemplateRun",
        "pythonRun",
        "ovitoLaunch",
        "resultAnalysis"
      ])
    }
  };

  const REASONS = {
    localBrowse: "Web Safe / Prepare Onlyではローカルフォルダ参照を使いません。必要なファイルは手動で作業フォルダへ置いてください。",
    projectIo: "Web Safe / Prepare Onlyではproject保存・読込を使いません。生成したcase.jsonを手動で保管してください。",
    lammpsRun: "Web Safe / Prepare OnlyではLAMMPSを実行できません。生成したin.lammpsをPC上のLAMMPSで手動実行してください。",
    packmolRun: "Web Safe / Prepare OnlyではPACKMOLを実行できません。生成したpackmol.inpをPC側で手動実行してください。",
    moltemplateRun: "Web Safe / Prepare OnlyではMoltemplateを実行できません。生成した.lt雛形をPC側で手動処理してください。",
    pythonRun: "Web Safe / Prepare OnlyではPythonを実行できません。解析はLocal Runner Modeで行ってください。",
    ovitoLaunch: "Web Safe / Prepare OnlyではOVITOを起動できません。結果ファイルをPC側のOVITOで手動で開いてください。",
    resultAnalysis: "Web Safe / Prepare Onlyではlog/dump/trajectory/result folder解析を行いません。解析はLocal Runner Modeで行ってください."
  };

  function mode(modeName) {
    return MODES[modeName] || MODES.web_safe;
  }

  function isAllowed(modeName, capability) {
    return mode(modeName).allowed.has(capability);
  }

  function reason(capability) {
    return REASONS[capability] || "この機能は現在のモードでは使用できません。";
  }

  function lockElement(element, capability, modeName) {
    const allowed = isAllowed(modeName, capability);
    element.disabled = !allowed;
    element.classList.toggle("is-capability-locked", !allowed);
    if (!allowed) {
      element.setAttribute("aria-disabled", "true");
      element.title = reason(capability);
    } else {
      element.removeAttribute("aria-disabled");
      if (element.title === reason(capability)) element.removeAttribute("title");
    }
  }

  function applyLocks(modeName, root = document) {
    root.querySelectorAll("[data-capability]").forEach((element) => {
      lockElement(element, element.dataset.capability, modeName);
    });
  }

  global.WorkbenchCapabilities = {
    MODES,
    applyLocks,
    isAllowed,
    lockElement,
    reason
  };
})(window);
