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
