"use strict";
(() => {
  const course = document.querySelector("#course");
  if (!course) return;

  function expandAsSection(detail, tagName) {
    const element = document.createElement(tagName);
    element.className = detail.className;
    element.id = detail.id;
    const summary = detail.querySelector(":scope > summary");
    const header = document.createElement("header");
    header.className = "course-panel-header";
    while (summary.firstChild) header.append(summary.firstChild);
    header.querySelector(".detail-cue")?.remove();
    element.append(header);
    Array.from(detail.children).filter(child => child !== summary).forEach(child => element.append(child));
    detail.replaceWith(element);
    return element;
  }

  function createTabs(panels, labels, name, id, variant = "") {
    if (!panels.length) return;
    const list = document.createElement("div");
    list.className = "selection-tabs " + variant;
    list.id = id;
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", name);
    const buttons = panels.map((panel, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.id = "tab-" + panel.id.replace(/^panel-/, "");
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panel.id);
      labels[index].forEach((text, line) => {
        const span = document.createElement(line === labels[index].length - 1 ? "small" : "span");
        span.textContent = text;
        button.append(span);
      });
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.tabIndex = 0;
      list.append(button);
      return button;
    });
    panels[0].before(list);
    function select(index, focus = false) {
      panels.forEach((panel, position) => {
        const selected = index === position;
        panel.hidden = !selected;
        buttons[position].setAttribute("aria-selected", String(selected));
        buttons[position].tabIndex = selected ? 0 : -1;
      });
      if (focus) buttons[index].focus({ preventScroll: true });
    }
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => select(index));
      button.addEventListener("keydown", event => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
        if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = buttons.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
      });
    });
    function selectHash() {
      const index = panels.findIndex(panel => location.hash === "#" + panel.id);
      if (index >= 0) select(index);
    }
    select(0);
    selectHash();
    addEventListener("hashchange", selectHash);
    // Opening a panel directly from another part of the page selects its tab first.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      const index = panels.findIndex(panel => link.hash === "#" + panel.id);
      if (index >= 0) link.addEventListener("click", () => select(index));
    });
  }

  const panels = Array.from(course.querySelectorAll(":scope > details.course-detail"))
    .map(detail => expandAsSection(detail, "article"));
  createTabs(panels, [
    ["プロ整体", "セラピストコース", "初級"],
    ["プロ整体師", "マスターコース", "初級＋中級"],
    ["上級プロ整体師", "コース", "初級＋中級＋上級"]
  ], "コースを選択", "course-tabs");

  const detail = course.querySelector("details.seminar-group");
  if (detail) {
    const seminar = expandAsSection(detail, "section");
    const items = Array.from(seminar.querySelectorAll(".seminar-item"));
    createTabs(items, [
      ["基本テクニック", "初めに受講"],
      ["筋筋膜リリース", "テクニック"],
      ["頭痛・首肩痛・上肢", "シビレアプローチ"],
      ["腰痛・下肢", "シビレアプローチ"],
      ["アクチベータ", "テクニック"]
    ], "セミナーコースを選択", "license-course-tabs", "seminar-selection-tabs");
  }
})();
