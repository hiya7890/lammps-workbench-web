(function initWorkbenchUi(global) {
  function nodes(selectorOrNodes, root = document) {
    if (!selectorOrNodes) return [];
    if (typeof selectorOrNodes === "string") return Array.from(root.querySelectorAll(selectorOrNodes));
    return Array.from(selectorOrNodes);
  }

  function setActiveByDataset(selectorOrNodes, datasetKey, activeValue, options = {}) {
    const activeClass = options.activeClass || "is-active";
    nodes(selectorOrNodes, options.root).forEach((node) => {
      node.classList.toggle(activeClass, node.dataset?.[datasetKey] === activeValue);
    });
  }

  function setTabState(options) {
    const activeClass = options.activeClass || "is-active";
    const hiddenClass = options.hiddenClass || "is-hidden";
    const targetId = options.targetId;
    nodes(options.buttons, options.root).forEach((button) => {
      const key = options.buttonDataset || "tabTarget";
      const attributeMatch = options.buttonAttribute ? button.getAttribute(options.buttonAttribute) === targetId : false;
      button.classList.toggle(activeClass, button.dataset?.[key] === targetId || attributeMatch);
    });
    nodes(options.panes, options.root).forEach((pane) => {
      const paneKey = options.paneDataset || null;
      const paneId = paneKey ? pane.dataset?.[paneKey] : pane.id;
      const visible = paneId === targetId && (!options.paneVisible || options.paneVisible(pane));
      if (options.useActivePane !== false) pane.classList.toggle(activeClass, visible);
      if (hiddenClass) pane.classList.toggle(hiddenClass, !visible);
    });
  }

  function bindTabs(options) {
    const buttons = nodes(options.buttons, options.root);
    const getTarget = options.getTarget || ((button) => button.dataset?.[options.buttonDataset || "tabTarget"]);
    const setActive = (targetId) => {
      setTabState({ ...options, buttons, targetId });
      if (typeof options.onChange === "function") options.onChange(targetId);
    };
    buttons.forEach((button) => {
      button.addEventListener("click", () => setActive(getTarget(button)));
    });
    return { setActive };
  }

  function createOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function createWorkflowCard(options) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `workflow-card${options.active ? " is-active" : ""}`;
    if (options.value) card.dataset.workflowValue = options.value;
    const kind = document.createElement("span");
    kind.textContent = options.kind || "Workflow";
    const title = document.createElement("strong");
    title.textContent = options.title || "";
    const description = document.createElement("small");
    description.textContent = options.description || "";
    card.append(kind, title, description);
    if (typeof options.onClick === "function") card.addEventListener("click", options.onClick);
    return card;
  }

  global.WorkbenchUi = {
    bindTabs,
    createOption,
    createWorkflowCard,
    setActiveByDataset,
    setTabState
  };
})(window);
