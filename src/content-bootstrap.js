import {
  FEMALE_OPPORTUNITY_BRAND_GENDER,
  GENDER_BREAKDOWN_PRICE_BUBBLES,
  MARKET_SCOPE_BRAND_COMPARE
} from "./content-data.js";
import {
  renderBrandCompareTable,
  renderFemaleOpportunityGenderMatrix
} from "./content-render.js";
import {
  renderGenderBreakdownPriceBubbleChart,
  renderMarketScopeBubbleChart
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
      history.replaceState(null, "", href);
      scrollToSection(href);
    });
  });

  document.querySelectorAll(".nav-group-toggle[data-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target");
      if (!target) {
        return;
      }

      history.replaceState(null, "", target);
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
}

function bootstrapFemaleOpportunityPage() {
  const matrixContainer = document.querySelector("#female-opportunity-gender-chart");
  const priceChartContainer = document.querySelector("#gender-breakdown-price-chart");
  renderFemaleOpportunityGenderMatrix(matrixContainer, FEMALE_OPPORTUNITY_BRAND_GENDER);
  renderGenderBreakdownPriceBubbleChart(priceChartContainer, GENDER_BREAKDOWN_PRICE_BUBBLES);
  setupGenderBreakdownInteractions();
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

  return `
    <div class="gender-breakdown-tooltip-title">${brand} · ${gender}</div>
    <div class="gender-breakdown-tooltip-line">YOY% <strong>${yoy}</strong></div>
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
  };

  const applyActiveState = () => {
    const segments = getSegments();
    const nodes = getNodes();
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
  setupNavigation();
  setupRevealEffects();
  bootstrapMarketScopePage();
  bootstrapFemaleOpportunityPage();
  setupScrollState();

  if (window.location.hash && document.querySelector(window.location.hash)) {
    window.requestAnimationFrame(() => scrollToSection(window.location.hash));
  }
});
