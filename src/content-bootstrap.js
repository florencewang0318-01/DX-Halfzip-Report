import {
  FEMALE_OPPORTUNITY_BRAND_GENDER,
  FUNCTION_GENDER_SPLIT,
  FUNCTION_OPPORTUNITY_MAP,
  GENDER_BREAKDOWN_PRICE_BUBBLES,
  MARKET_SCOPE_BRAND_COMPARE,
  SILHOUETTE_GROWTH_DATA,
  SILHOUETTE_MATRIX_DATA,
  SILHOUETTE_PAGE_DRAFT
} from "./content-data.js";
import {
  renderBrandCompareTable,
  renderFemaleOpportunityGenderMatrix
} from "./content-render.js";
import {
  renderGenderBreakdownPriceBubbleChart,
  renderFunctionGenderSplit,
  renderFunctionOpportunityMap,
  renderMarketScopeBubbleChart,
  renderSilhouetteGrowthChart,
  renderSilhouetteStructureChart
} from "./chart-app.js";

const SECTION_SELECTOR = ".report-section[id]";
const GENDER_BREAKDOWN_SELECTOR = "#female-opportunity";
const ALL_GENDERS = ["女", "男", "男女"];

function getTopbarHeight() {
  const topbar = document.querySelector("#topbar");
  return topbar ? topbar.offsetHeight : 0;
}

function scrollToSection(targetId) {
  const section = document.querySelector(targetId);
  if (!section) {
    return;
  }

  const topbarHeight = getTopbarHeight();
  const y = section.getBoundingClientRect().top + window.scrollY - topbarHeight - 12;
  window.scrollTo({
    top: Math.max(0, y),
    behavior: "smooth"
  });
}

function updateTopbarState() {
  const topbar = document.querySelector("#topbar");
  const progress = document.querySelector("#scrollProgress");
  if (!topbar || !progress) {
    return;
  }

  topbar.classList.toggle("scrolled", window.scrollY > 18);

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, ratio))}%`;
}

function updateActiveNavigation() {
  const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
  if (!sections.length) {
    return;
  }

  const threshold = getTopbarHeight() + 48;
  let activeSection = sections[0];

  sections.forEach((section) => {
    if (section.offsetTop <= window.scrollY + threshold) {
      activeSection = section;
    }
  });

  const activeId = `#${activeSection.id}`;

  document.querySelectorAll(".nav-link, .nav-dropdown-item").forEach((node) => {
    const isActive = node.getAttribute("href") === activeId;
    node.classList.toggle("active", isActive);
  });

  document.querySelectorAll(".nav-group").forEach((group) => {
    const toggle = group.querySelector(".nav-group-toggle");
    const items = Array.from(group.querySelectorAll(".nav-dropdown-item"));
    const groupIsActive = items.some((item) => item.classList.contains("active"));
    if (toggle) {
      toggle.classList.toggle("active", groupIsActive);
    }
  });
}

function setupNavigation() {
  const navTargets = document.querySelectorAll(".nav-link[href^='#'], .nav-dropdown-item[href^='#']");
  navTargets.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }

      event.preventDefault();
      scrollToSection(href);
    });
  });

  document.querySelectorAll(".nav-group-toggle[data-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target");
      if (!target) {
        return;
      }

      scrollToSection(target);
    });
  });
}

function setupRevealEffects() {
  const revealNodes = document.querySelectorAll(".reveal");
  if (!revealNodes.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealNodes.forEach((node) => {
    if (node.classList.contains("visible")) {
      return;
    }
    observer.observe(node);
  });
}

function setupScrollState() {
  const onScroll = () => {
    updateTopbarState();
    updateActiveNavigation();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

function bootstrapMarketScopePage() {
  const tableContainer = document.querySelector("#market-scope-brand-table");
  const bubbleContainer = document.querySelector("#market-scope-bubble-chart");

  renderBrandCompareTable(tableContainer, MARKET_SCOPE_BRAND_COMPARE);
  renderMarketScopeBubbleChart(bubbleContainer, MARKET_SCOPE_BRAND_COMPARE);
  setupMarketScopeInteractions();
}

function bootstrapFemaleOpportunityPage() {
  const matrixContainer = document.querySelector("#female-opportunity-gender-chart");
  const priceChartContainer = document.querySelector("#gender-breakdown-price-chart");
  renderFemaleOpportunityGenderMatrix(matrixContainer, FEMALE_OPPORTUNITY_BRAND_GENDER);
  renderGenderBreakdownPriceBubbleChart(priceChartContainer, GENDER_BREAKDOWN_PRICE_BUBBLES);
  setupGenderBreakdownInteractions();
}

function bootstrapSilhouettePage() {
  const structureContainer = document.querySelector("#silhouette-structure-chart");
  const growthContainer = document.querySelector("#silhouette-growth-chart");

  renderSilhouetteStructureChart(structureContainer, SILHOUETTE_MATRIX_DATA, SILHOUETTE_PAGE_DRAFT);
  renderSilhouetteGrowthChart(growthContainer, SILHOUETTE_GROWTH_DATA);
  setupSilhouetteInteractions();
}

function bootstrapFunctionPage() {
  const opportunityContainer = document.querySelector("#function-opportunity-map");
  const genderContainer = document.querySelector("#function-gender-split");

  renderFunctionOpportunityMap(opportunityContainer, FUNCTION_OPPORTUNITY_MAP);
  renderFunctionGenderSplit(genderContainer, FUNCTION_GENDER_SPLIT);
  setupFunctionInteractions();
}

function ensureGenderBreakdownTooltip() {
  let tooltip = document.querySelector("#genderBreakdownTooltip");
  if (tooltip) {
    return tooltip;
  }

  tooltip = document.createElement("div");
  tooltip.id = "genderBreakdownTooltip";
  tooltip.className = "gender-breakdown-tooltip";
  document.body.appendChild(tooltip);
  return tooltip;
}

function getGenderLegendCopy(gender) {
  if (gender === "女") {
    return "Female";
  }

  if (gender === "男") {
    return "Male";
  }

  return "Unisex";
}

function formatPriceLabel(value) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "n/a";
  }

  return `¥${Math.round(numeric).toLocaleString("en-US")}`;
}

function createBubbleTooltipContent(target) {
  const brand = (target.dataset.brand ?? "").split("/")[0];
  const gender = target.dataset.genderLabel ?? getGenderLegendCopy(target.dataset.gender);
  const yoy = target.dataset.yoy ?? "n/a";
  const price = formatPriceLabel(target.dataset.price);
  const yoyClass =
    yoy === "n/a" ? "is-neutral" : yoy.startsWith("+") ? "is-positive" : yoy.startsWith("-") ? "is-negative" : "is-neutral";

  return `
    <div class="gender-breakdown-tooltip-title">${brand} · ${gender}</div>
    <div class="gender-breakdown-tooltip-line">YOY% <strong class="${yoyClass}">${yoy}</strong></div>
    <div class="gender-breakdown-tooltip-line">成交价格 <strong>${price}</strong></div>
  `;
}

function createSegmentTooltipContent(target) {
  const brand = (target.dataset.brand ?? "").split("/")[0];
  const gender = target.dataset.genderLabel ?? getGenderLegendCopy(target.dataset.gender);
  const price = formatPriceLabel(target.dataset.price);

  return `
    <div class="gender-breakdown-tooltip-title">${brand} · ${gender}</div>
    <div class="gender-breakdown-tooltip-line">成交价格 <strong>${price}</strong></div>
  `;
}

function createSilhouetteTooltipContent(target) {
  const fit = target.dataset.fitLabel ?? "";
  const length = target.dataset.lengthLabel ?? "";
  const title = `${fit} X ${length}`;
  const lines = [];
  const buildLine = (label, share, yoy) => {
    const yoyClass =
      !yoy || yoy === "n/a"
        ? "is-neutral"
        : yoy === "new" || yoy.startsWith("+")
          ? "is-positive"
          : yoy.startsWith("-")
            ? "is-negative"
            : "is-neutral";

    return `
      <div class="gender-breakdown-tooltip-line">
        ${label} <strong>${share}</strong> <strong class="${yoyClass}">${yoy ?? ""}</strong>
      </div>
    `;
  };

  if (target.dataset.femaleShare) {
    lines.push(buildLine("Female", target.dataset.femaleShare, target.dataset.femaleYoy));
  }

  if (target.dataset.maleShare) {
    lines.push(buildLine("Male", target.dataset.maleShare, target.dataset.maleYoy));
  }

  if (target.dataset.unisexShare) {
    lines.push(buildLine("Unisex", target.dataset.unisexShare, target.dataset.unisexYoy));
  }

  return `
    <div class="gender-breakdown-tooltip-title">${title}</div>
    ${lines.join("")}
  `;
}

function placeTooltip(tooltip, x, y) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const tooltipRect = tooltip.getBoundingClientRect();
  const nextX = Math.min(x + 16, viewportWidth - tooltipRect.width - 16);
  const nextY = Math.min(y + 16, viewportHeight - tooltipRect.height - 16);

  tooltip.style.left = `${Math.max(12, nextX)}px`;
  tooltip.style.top = `${Math.max(12, nextY)}px`;
}

function showGenderBreakdownTooltip(tooltip, html, x, y) {
  tooltip.innerHTML = html;
  tooltip.classList.add("is-visible");
  placeTooltip(tooltip, x, y);
}

function hideGenderBreakdownTooltip(tooltip) {
  tooltip.classList.remove("is-visible");
}

function createMarketScopeTooltipContent(target) {
  const rawBrand = target.dataset.brand ?? "";
  const brand = rawBrand.includes("SALOMON") ? "SALOMON*" : rawBrand.split("/")[0];
  const share = target.dataset.share ?? "n/a";
  const yoy = target.dataset.yoy ?? "n/a";
  const yoyClass =
    yoy === "n/a" ? "is-neutral" : yoy.startsWith("+") ? "is-positive" : yoy.startsWith("-") ? "is-negative" : "is-neutral";
  const note = rawBrand.includes("SALOMON")
    ? `<div class="gender-breakdown-tooltip-line">SALOMON 为低基数高增长的离群点</div>`
    : "";

  return `
    <div class="gender-breakdown-tooltip-title">${brand}</div>
    <div class="gender-breakdown-tooltip-line">% in inner TTL <strong>${share}</strong></div>
    <div class="gender-breakdown-tooltip-line">Half-zip YOY <strong class="${yoyClass}">${yoy}</strong></div>
    ${note}
  `;
}

function createFunctionTooltipContent(target) {
  const functionName = target.dataset.function ?? "";
  const functionNameEn = target.dataset.functionEn ?? "";
  const share = target.dataset.share ?? "n/a";
  const yoy = target.dataset.yoy ?? "n/a";
  const yoyClass =
    yoy === "n/a" ? "is-neutral" : yoy === "new" || yoy.startsWith("+") ? "is-positive" : yoy.startsWith("-") ? "is-negative" : "is-neutral";
  const title = functionNameEn ? `${functionName} / ${functionNameEn}` : functionName;

  return `
    <div class="gender-breakdown-tooltip-title">${title}</div>
    <div class="gender-breakdown-tooltip-line">Sales Share <strong>${share}</strong></div>
    <div class="gender-breakdown-tooltip-line">YOY% <strong class="${yoyClass}">${yoy}</strong></div>
  `;
}

function setupFunctionInteractions() {
  const section = document.querySelector("#function-scene");
  if (!section) {
    return;
  }

  const tooltip = ensureGenderBreakdownTooltip();
  let activeNode = null;

  const clearActiveNode = () => {
    if (activeNode) {
      activeNode.classList.remove("is-active");
      activeNode = null;
    }
    hideGenderBreakdownTooltip(tooltip);
  };

  const getFunctionTarget = (startNode) => {
    if (!(startNode instanceof Element)) {
      return null;
    }

    return startNode.closest(".function-map-node[data-function], .function-map-bubble[data-function]");
  };

  const activateNode = (target, event) => {
    const node = target.closest(".function-map-node[data-function]") ?? target;
    if (activeNode && activeNode !== node) {
      activeNode.classList.remove("is-active");
    }
    activeNode = node;
    activeNode.classList.add("is-active");
    showGenderBreakdownTooltip(tooltip, createFunctionTooltipContent(target), event.clientX, event.clientY);
  };

  section.addEventListener("pointerover", (event) => {
    const target = getFunctionTarget(event.target);
    if (!target) {
      clearActiveNode();
      return;
    }
    activateNode(target, event);
  });

  section.addEventListener("pointermove", (event) => {
    const target = getFunctionTarget(event.target);
    if (!target) {
      clearActiveNode();
      return;
    }

    if (!activeNode) {
      activateNode(target, event);
      return;
    }

    placeTooltip(tooltip, event.clientX, event.clientY);
  });

  section.addEventListener("pointerout", (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Element && getFunctionTarget(nextTarget)) {
      return;
    }
    clearActiveNode();
  });

  section.addEventListener("pointerleave", clearActiveNode);
}

function setupMarketScopeInteractions() {
  const section = document.querySelector("#competitor-scope");
  if (!section) {
    return;
  }

  const tooltip = ensureGenderBreakdownTooltip();
  let activeBrand = null;

  const getRows = () => Array.from(section.querySelectorAll(".market-scope-row[data-brand]"));
  const getBubbles = () =>
    Array.from(section.querySelectorAll(".bubble-point-group[data-brand], .bubble-point[data-brand]"));
  const getLabels = () =>
    Array.from(section.querySelectorAll(".market-scope-brand-label[data-brand], .market-scope-annotation[data-brand]"));

  const applyActiveState = () => {
    const rows = getRows();
    const bubbles = getBubbles();
    const labels = getLabels();
    const hasActive = Boolean(activeBrand);

    rows.forEach((row) => {
      const isMatch = row.dataset.brand === activeBrand;
      row.classList.toggle("is-active", isMatch);
      row.classList.toggle("is-dimmed", hasActive && !isMatch);
    });

    bubbles.forEach((bubble) => {
      const isMatch = bubble.dataset.brand === activeBrand;
      bubble.classList.toggle("is-active", isMatch);
      bubble.classList.toggle("is-dimmed", hasActive && !isMatch);
    });

    labels.forEach((label) => {
      const isMatch = label.dataset.brand === activeBrand;
      label.classList.toggle("is-active", isMatch);
      label.classList.toggle("is-dimmed", hasActive && !isMatch);
    });
  };

  const clearActiveState = () => {
    activeBrand = null;
    applyActiveState();
    hideGenderBreakdownTooltip(tooltip);
  };

  const activateItem = (target, event) => {
    activeBrand = target.dataset.brand ?? null;
    applyActiveState();
    showGenderBreakdownTooltip(
      tooltip,
      createMarketScopeTooltipContent(target),
      event?.clientX ?? target.getBoundingClientRect().right,
      event?.clientY ?? target.getBoundingClientRect().top
    );
  };

  const getInteractiveTarget = (startNode) => {
    if (!(startNode instanceof Element)) {
      return null;
    }

    return startNode.closest(
      ".market-scope-row[data-brand], .bubble-point[data-brand], .bubble-point-group[data-brand]"
    );
  };

  section.addEventListener("pointerover", (event) => {
    const target = getInteractiveTarget(event.target);
    if (!target) {
      clearActiveState();
      return;
    }

    if (activeBrand !== target.dataset.brand) {
      activateItem(target, event);
    }
  });

  section.addEventListener("pointermove", (event) => {
    const target = getInteractiveTarget(event.target);
    if (!target) {
      clearActiveState();
      return;
    }

    if (!activeBrand || activeBrand !== target.dataset.brand) {
      activateItem(target, event);
      return;
    }

    if (!activeBrand) {
      return;
    }

    placeTooltip(tooltip, event.clientX, event.clientY);
  });

  section.addEventListener("pointerout", (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Element && getInteractiveTarget(nextTarget)) {
      return;
    }

    clearActiveState();
  });

  section.addEventListener("pointerleave", clearActiveState);

  applyActiveState();
}

function setupSilhouetteInteractions() {
  const section = document.querySelector("#silhouette");
  if (!section) {
    return;
  }

  const tooltip = ensureGenderBreakdownTooltip();
  let activeCell = null;

  const clearActiveCell = () => {
    if (activeCell) {
      activeCell.classList.remove("is-active");
      activeCell = null;
    }
    hideGenderBreakdownTooltip(tooltip);
  };

  const getInteractiveCell = (startNode) => {
    if (!(startNode instanceof Element)) {
      return null;
    }

    return startNode.closest(".silhouette-matrix-cell[data-interactive='true']");
  };

  section.addEventListener("pointerover", (event) => {
    const cell = getInteractiveCell(event.target);

    if (!cell) {
      clearActiveCell();
      return;
    }

    if (activeCell !== cell) {
      if (activeCell) {
        activeCell.classList.remove("is-active");
      }
    }

    activeCell = cell;
    activeCell.classList.add("is-active");
    showGenderBreakdownTooltip(
      tooltip,
      createSilhouetteTooltipContent(cell),
      event.clientX ?? cell.getBoundingClientRect().right,
      event.clientY ?? cell.getBoundingClientRect().top
    );
  });

  section.addEventListener("pointermove", (event) => {
    const cell = getInteractiveCell(event.target);
    if (!cell) {
      clearActiveCell();
      return;
    }

    if (activeCell !== cell) {
      if (activeCell) {
        activeCell.classList.remove("is-active");
      }
      activeCell = cell;
      activeCell.classList.add("is-active");
      showGenderBreakdownTooltip(
        tooltip,
        createSilhouetteTooltipContent(cell),
        event.clientX ?? cell.getBoundingClientRect().right,
        event.clientY ?? cell.getBoundingClientRect().top
      );
      return;
    }

    placeTooltip(tooltip, event.clientX, event.clientY);
  });

  section.addEventListener("pointerout", (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Element && getInteractiveCell(nextTarget)) {
      return;
    }

    clearActiveCell();
  });

  section.addEventListener("pointerleave", clearActiveCell);
}

function setupGenderBreakdownInteractions() {
  const section = document.querySelector(GENDER_BREAKDOWN_SELECTOR);
  if (!section) {
    return;
  }

  const tooltip = ensureGenderBreakdownTooltip();
  const visibleGenders = new Set(ALL_GENDERS);
  let activeKey = null;

  const getSegments = () => Array.from(section.querySelectorAll(".gender-segment[data-brand][data-gender]"));
  const getNodes = () => Array.from(section.querySelectorAll(".gender-price-node[data-brand][data-gender]"));
  const getLabelOverlays = () => Array.from(section.querySelectorAll(".gender-price-label-overlay[data-brand][data-gender]"));
  const getLegendButtons = () => Array.from(section.querySelectorAll(".gender-legend-toggle[data-gender]"));

  const applyGenderVisibility = () => {
    getLegendButtons().forEach((button) => {
      const isVisible = visibleGenders.has(button.dataset.gender);
      button.classList.toggle("is-muted", !isVisible);
      button.setAttribute("aria-pressed", String(isVisible));
    });

    getSegments().forEach((segment) => {
      segment.classList.toggle("is-hidden", !visibleGenders.has(segment.dataset.gender));
    });

    getNodes().forEach((node) => {
      node.classList.toggle("is-hidden", !visibleGenders.has(node.dataset.gender));
    });

    getLabelOverlays().forEach((label) => {
      label.classList.toggle("is-hidden", !visibleGenders.has(label.dataset.gender));
    });
  };

  const applyActiveState = () => {
    const segments = getSegments();
    const nodes = getNodes();
    const labels = getLabelOverlays();
    const hasActive = Boolean(activeKey);

    segments.forEach((segment) => {
      const key = `${segment.dataset.brand}__${segment.dataset.gender}`;
      const isMatch = activeKey === key;
      segment.classList.toggle("is-active", isMatch);
      segment.classList.toggle("is-dimmed", hasActive && !isMatch);
    });

    nodes.forEach((node) => {
      const key = `${node.dataset.brand}__${node.dataset.gender}`;
      const isMatch = activeKey === key;
      node.classList.toggle("is-active", isMatch);
      node.classList.toggle("is-dimmed", hasActive && !isMatch);
    });

    labels.forEach((label) => {
      const key = `${label.dataset.brand}__${label.dataset.gender}`;
      const isMatch = activeKey === key;
      label.classList.toggle("is-active", isMatch);
      label.classList.toggle("is-dimmed", hasActive && !isMatch);
    });
  };

  const clearActiveState = () => {
    activeKey = null;
    applyActiveState();
    hideGenderBreakdownTooltip(tooltip);
  };

  const activateItem = (target, sourceType, event) => {
    activeKey = `${target.dataset.brand}__${target.dataset.gender}`;
    applyActiveState();

    if (sourceType === "bubble") {
      showGenderBreakdownTooltip(
        tooltip,
        createBubbleTooltipContent(target),
        event?.clientX ?? target.getBoundingClientRect().right,
        event?.clientY ?? target.getBoundingClientRect().top
      );
      return;
    }

    const rect = target.getBoundingClientRect();
    showGenderBreakdownTooltip(
      tooltip,
      createSegmentTooltipContent(target),
      event?.clientX ?? rect.left + rect.width / 2,
      event?.clientY ?? rect.top
    );
  };

  getLegendButtons().forEach((button) => {
    button.addEventListener("click", () => {
      const gender = button.dataset.gender;
      if (!gender) {
        return;
      }

      if (visibleGenders.has(gender)) {
        if (visibleGenders.size === 1) {
          return;
        }
        visibleGenders.delete(gender);
      } else {
        visibleGenders.add(gender);
      }

      clearActiveState();
      applyGenderVisibility();
    });
  });

  getSegments().forEach((segment) => {
    segment.addEventListener("mouseenter", (event) => activateItem(segment, "segment", event));
    segment.addEventListener("mousemove", (event) => placeTooltip(tooltip, event.clientX, event.clientY));
    segment.addEventListener("mouseleave", clearActiveState);
    segment.addEventListener("focus", (event) => activateItem(segment, "segment", event));
    segment.addEventListener("blur", clearActiveState);
  });

  getNodes().forEach((node) => {
    node.addEventListener("mouseenter", (event) => activateItem(node, "bubble", event));
    node.addEventListener("mousemove", (event) => placeTooltip(tooltip, event.clientX, event.clientY));
    node.addEventListener("mouseleave", clearActiveState);
    node.addEventListener("focus", (event) => activateItem(node, "bubble", event));
    node.addEventListener("blur", clearActiveState);
  });

  applyGenderVisibility();
  applyActiveState();
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  setupNavigation();
  setupRevealEffects();
  bootstrapMarketScopePage();
  bootstrapFemaleOpportunityPage();
  bootstrapSilhouettePage();
  bootstrapFunctionPage();
  setupScrollState();
});
