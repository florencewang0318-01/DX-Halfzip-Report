import {
  COMPETITOR_BRAND_SEGMENT_METRICS,
  COMPETITOR_BRAND_SEGMENT_FIT_LENGTH,
  COMPETITOR_BRAND_SEGMENT_TOP_FUNCTIONS,
  COMPETITOR_BRAND_FABRIC_RADARS,
  COMPETITOR_BRAND_FUNCTION_RADARS,
  COMPETITOR_BRAND_SNAPSHOT,
  FABRIC_CATEGORY_DEFINITIONS,
  FABRIC_FUNCTION_MATRIX_COLUMNS,
  FABRIC_FUNCTION_MATRIX_DATA,
  FABRIC_WARMTH_OVERVIEW_DATA,
  FABRIC_OVERVIEW_DATA,
  FABRIC_WARMTH_BUBBLE_DATA,
  FEMALE_OPPORTUNITY_BRAND_GENDER,
  FUNCTION_GENDER_SPLIT,
  FUNCTION_OPPORTUNITY_MAPS,
  FUNCTION_OPPORTUNITY_META,
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
  renderFabricFunctionMatrix,
  renderFabricOverviewChart,
  renderFabricWarmthBubbleChart,
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

  renderFunctionOpportunityMap(opportunityContainer, FUNCTION_OPPORTUNITY_MAPS, FUNCTION_OPPORTUNITY_META);
  renderFunctionGenderSplit(genderContainer, FUNCTION_GENDER_SPLIT);
  setupFunctionInteractions();
}

function bootstrapFabricOverviewPage() {
  const chartContainer = document.querySelector("#fabric-overview-chart");
  const definitionContainer = document.querySelector("#fabric-overview-definitions");
  const fabricImageLightbox = ensureFabricImageLightbox();

  renderFabricOverviewChart(chartContainer, FABRIC_OVERVIEW_DATA);

  if (definitionContainer) {
    const openFabricAccordionCard = (cards, targetCard) => {
      cards.forEach((otherCard) => {
        const otherTrigger = otherCard.querySelector(".fabric-accordion-trigger");
        const shouldOpen = otherCard === targetCard;
        otherCard.classList.toggle("is-open", shouldOpen);
        if (otherTrigger) {
          otherTrigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
        }
      });
    };

    definitionContainer.innerHTML = FABRIC_CATEGORY_DEFINITIONS.map((item, index) => {
      const sampleCount = item.sampleCount ?? 4;
      const sampleClass = sampleCount >= 5 ? "is-five" : "is-four";
      const sampleCards = Array.from({ length: sampleCount }, (_, sampleIndex) => {
        const imageSrc = item.sampleImages?.[sampleIndex];
        const brandLabel = item.sampleBrands?.[sampleIndex];
        if (imageSrc) {
          return `
            <button
              class="fabric-sample-photo-frame"
              type="button"
              data-fabric-image-trigger="true"
              data-image-src="${imageSrc}"
              data-image-alt="${item.label} 示例图 ${sampleIndex + 1}"
              data-image-brand="${brandLabel ?? ""}"
            >
              <img class="fabric-sample-photo" src="${imageSrc}" alt="${item.label} 示例图 ${sampleIndex + 1}">
              ${brandLabel ? `<div class="fabric-sample-brand">${brandLabel}</div>` : ""}
            </button>
          `;
        }

        return `<div class="fabric-sample-placeholder">图片占位<br>4:3比例</div>`;
      }).join("");

      return `
        <article class="fabric-accordion-card${index === 0 ? " is-open" : ""}" data-fabric-key="${item.key}" style="--fabric-open-tint:${item.color}22; --fabric-open-border:${item.color}66;">
          <button class="fabric-accordion-trigger" type="button" aria-expanded="${index === 0 ? "true" : "false"}">
            <div class="fabric-accordion-title">
              <span class="fabric-definition-dot" style="background:${item.color};"></span>
              <strong>
                <span class="fabric-accordion-title-cn">${item.label}</span>
                <span class="fabric-accordion-title-en">${item.labelEn ?? ""}</span>
              </strong>
            </div>
            <span class="fabric-accordion-icon" aria-hidden="true"></span>
          </button>
          <div class="fabric-accordion-panel">
            <div class="fabric-accordion-panel-inner">
              <div class="fabric-accordion-copy">
                <div class="fabric-accordion-copy-block">
                  <p><em>Textile:</em><span>${item.textile}</span></p>
                </div>
                <div class="fabric-accordion-copy-block">
                  <p><em>Positioning:</em><span>${item.positioning}</span></p>
                </div>
              </div>
              <div class="fabric-accordion-samples ${sampleClass}">
                ${sampleCards}
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    const cards = Array.from(definitionContainer.querySelectorAll(".fabric-accordion-card"));
    cards.forEach((card) => {
      const trigger = card.querySelector(".fabric-accordion-trigger");
      if (!trigger) {
        return;
      }

      trigger.addEventListener("click", () => {
        openFabricAccordionCard(cards, card);
      });
    });

    chartContainer?.addEventListener("fabricoverviewselect", (event) => {
      const fabricKey = event.detail?.key;
      if (!fabricKey) {
        return;
      }

      const targetCard = cards.find((card) => card.dataset.fabricKey === fabricKey);
      if (!targetCard) {
        return;
      }

      openFabricAccordionCard(cards, targetCard);
    });

    definitionContainer.addEventListener("click", (event) => {
      const imageTrigger = event.target instanceof Element
        ? event.target.closest("[data-fabric-image-trigger='true']")
        : null;
      if (!(imageTrigger instanceof HTMLElement)) {
        return;
      }

      fabricImageLightbox.open({
        src: imageTrigger.dataset.imageSrc ?? "",
        alt: imageTrigger.dataset.imageAlt ?? "",
        brand: imageTrigger.dataset.imageBrand ?? ""
      });
    });
  }
}

function bootstrapFabricWarmthFunctionPage() {
  const warmthContainer = document.querySelector("#fabric-warmth-bubble-chart");
  const functionContainer = document.querySelector("#fabric-function-matrix");

  renderFabricWarmthBubbleChart(warmthContainer, FABRIC_WARMTH_OVERVIEW_DATA, FABRIC_WARMTH_BUBBLE_DATA);
  renderFabricFunctionMatrix(functionContainer, FABRIC_FUNCTION_MATRIX_DATA, FABRIC_FUNCTION_MATRIX_COLUMNS);
}

function bootstrapCompetitorBrandSnapshotCards() {
  const snapshotCards = Array.from(document.querySelectorAll(".competitor-board.snapshot[data-brand]"));
  if (!snapshotCards.length) {
    return;
  }

  const snapshotLookup = new Map(COMPETITOR_BRAND_SNAPSHOT.map((item) => [item.brand, item]));

  snapshotCards.forEach((snapshotCard) => {
    const brand = snapshotCard.dataset.brand;
    if (!brand) {
      return;
    }

    const snapshotData = snapshotLookup.get(brand);
    if (!snapshotData) {
      return;
    }

    const valueByKpi = {
      "inner-share": snapshotData.innerShareLabel,
      "halfzip-yoy": snapshotData.halfZipYoyLabel,
      "avg-deal-price": snapshotData.avgDealPrice25Label
    };

    snapshotCard.querySelectorAll(".competitor-kpi-card[data-kpi]").forEach((kpiCard) => {
      const kpiKey = kpiCard.dataset.kpi;
      const valueNode = kpiCard.querySelector("strong");
      if (!kpiKey || !(valueNode instanceof HTMLElement)) {
        return;
      }

      valueNode.textContent = valueByKpi[kpiKey] ?? "--";

      if (kpiKey !== "halfzip-yoy") {
        return;
      }

      kpiCard.classList.remove("is-positive", "is-negative", "is-neutral");

      if (snapshotData.halfZipYoy > 0) {
        kpiCard.classList.add("is-positive");
      } else if (snapshotData.halfZipYoy < 0) {
        kpiCard.classList.add("is-negative");
      } else {
        kpiCard.classList.add("is-neutral");
      }
    });
  });
}

function bootstrapCompetitorSegmentMetricCards() {
  const segmentCards = Array.from(document.querySelectorAll(".competitor-board.segment[data-brand][data-gender]"));
  if (!segmentCards.length) {
    return;
  }

  segmentCards.forEach((segmentCard) => {
    const brand = segmentCard.dataset.brand;
    const gender = segmentCard.dataset.gender;
    if (!brand || !gender) {
      return;
    }

    const segmentData = COMPETITOR_BRAND_SEGMENT_METRICS[`${brand}__${gender}`];
    if (!segmentData) {
      return;
    }

    const pills = Array.from(segmentCard.querySelectorAll(".competitor-segment-metrics .competitor-metric-pill"));
    const sharePill = pills[0];
    const yoyPill = pills[1];

    if (sharePill) {
      const valueNode = sharePill.querySelector("strong");
      if (valueNode instanceof HTMLElement) {
        valueNode.textContent = segmentData.shareLabel ?? "--";
      }
      sharePill.classList.add("is-filled");
    }

    if (yoyPill) {
      const valueNode = yoyPill.querySelector("strong");
      if (valueNode instanceof HTMLElement) {
        valueNode.textContent = segmentData.yoyLabel ?? "--";
      }

      yoyPill.classList.remove("positive", "negative", "neutral");
      yoyPill.classList.add("is-filled");

      if (segmentData.yoyLabel === "n/a") {
        yoyPill.classList.add("neutral");
      } else if ((segmentData.yoy ?? 0) > 0) {
        yoyPill.classList.add("positive");
      } else if ((segmentData.yoy ?? 0) < 0) {
        yoyPill.classList.add("negative");
      } else {
        yoyPill.classList.add("neutral");
      }
    }
  });
}

function bootstrapCompetitorSegmentTopFunctionCards() {
  const lists = Array.from(document.querySelectorAll(".competitor-function-list[data-top-functions='true']"));
  if (!lists.length) {
    return;
  }

  lists.forEach((list) => {
    const segmentCard = list.closest(".competitor-board.segment[data-brand][data-gender]");
    if (!(segmentCard instanceof HTMLElement)) {
      return;
    }

    const brand = segmentCard.dataset.brand;
    const gender = segmentCard.dataset.gender;
    if (!brand || !gender) {
      return;
    }

    const functionData = COMPETITOR_BRAND_SEGMENT_TOP_FUNCTIONS[`${brand}__${gender}`];
    if (!functionData?.rows?.length) {
      return;
    }

    const rowsMarkup = functionData.rows
      .map((row) => {
        const yoyClass =
          row.yoyLabel === "n/a"
            ? "neutral"
            : row.yoy === null || row.yoy === undefined || Number.isNaN(row.yoy)
              ? "neutral"
              : row.yoy > 0
                ? "positive"
                : row.yoy < 0
                  ? "negative"
                  : "neutral";

        return `
          <div class="competitor-function-row">
            <label>
              <span class="competitor-function-label-cn">${row.label}</span>
              ${row.labelEn ? `<span class="competitor-function-label-en">${row.labelEn}</span>` : ""}
            </label>
            <div class="competitor-function-track">
              <span style="width:${Math.max(0, Math.min(100, row.share ?? 0))}%;"></span>
            </div>
            <em>${row.shareLabel}</em>
            <b class="${yoyClass}">${row.yoyLabel}</b>
          </div>
        `;
      })
      .join("");

    list.classList.add("is-filled");
    list.innerHTML = `
      <div class="competitor-function-title">Top Function</div>
      <div class="competitor-function-conclusion">${functionData.conclusion ?? ""}</div>
      ${rowsMarkup}
    `;
  });
}

function bootstrapCompetitorSegmentFitLengthCards() {
  const cards = Array.from(document.querySelectorAll(".competitor-fit-list[data-fit-length='true']"));
  if (!cards.length) {
    return;
  }

  cards.forEach((card) => {
    const segmentCard = card.closest(".competitor-board.segment[data-brand][data-gender]");
    if (!(segmentCard instanceof HTMLElement)) {
      return;
    }

    const brand = segmentCard.dataset.brand;
    const gender = segmentCard.dataset.gender;
    if (!brand || !gender) {
      return;
    }

    const fitLengthData = COMPETITOR_BRAND_SEGMENT_FIT_LENGTH[`${brand}__${gender}`];
    if (!fitLengthData?.rows?.length) {
      return;
    }

    const rowsMarkup = fitLengthData.rows
      .map((row) => {
        const yoyClass =
          row.yoyLabel === "n/a"
            ? "neutral"
            : row.yoy === null || row.yoy === undefined || Number.isNaN(row.yoy)
              ? "neutral"
              : row.yoy > 0
                ? "positive"
                : row.yoy < 0
                  ? "negative"
                  : "neutral";

        return `
          <div class="competitor-function-row">
            <label>
              <span class="competitor-function-label-cn">${row.labelEn}</span>
            </label>
            <div class="competitor-function-track">
              <span style="width:${Math.max(0, Math.min(100, row.share ?? 0))}%;"></span>
            </div>
            <em>${row.shareLabel}</em>
            <b class="${yoyClass}">${row.yoyLabel}</b>
          </div>
        `;
      })
      .join("");

    card.classList.add("is-filled");
    card.innerHTML = `
      <div class="competitor-function-title">Fit &amp; Length</div>
      <div class="competitor-function-conclusion">${fitLengthData.conclusion ?? ""}</div>
      ${rowsMarkup}
    `;
  });
}

function bootstrapCompetitorColorCards() {
  const cards = Array.from(document.querySelectorAll(".competitor-design-card"));
  if (!cards.length) {
    return;
  }

  const zoomModal = ensureCompetitorColorZoomModal();

  const colorCardAssets = {
    "ARC'TERYX/始祖鸟__女": [
      { label: "黑色", imagePath: "../pic/始祖鸟_女_黑色.jpg", shareLabel: "40%" },
      { label: "蓝黑色", imagePath: "../pic/始祖鸟_女_蓝黑色.jpg", shareLabel: "22%" },
      { label: "浅紫色", imagePath: "../pic/始祖鸟_女_浅紫色.jpg", shareLabel: "22%" },
      { label: "浅灰色", imagePath: "../pic/始祖鸟_女_浅灰色.jpg", shareLabel: "14%" },
      { label: "层云蓝", imagePath: "../pic/始祖鸟_女_层云蓝.jpg", shareLabel: "2%" }
    ],
    "ARC'TERYX/始祖鸟__男": [
      { label: "黑色", imagePath: "../pic/始祖鸟_男_黑色.jpg", shareLabel: "47%" },
      { label: "榄苔绿", imagePath: "../pic/始祖鸟_男_榄苔绿.jpg", shareLabel: "18%" },
      { label: "蓝黑色", imagePath: "../pic/始祖鸟_男_蓝黑色.jpg", shareLabel: "10%" },
      { label: "火星红", imagePath: "../pic/始祖鸟_男_火星红.jpg", shareLabel: "8%" },
      { label: "瀚空蓝", imagePath: "../pic/始祖鸟_男_瀚空蓝.jpg", shareLabel: "6%" }
    ],
    "KAILAS/凯乐石__女": [
      { label: "米黄色", imagePath: "../pic/凯乐石_女_米黄色_v2.jpg", shareLabel: "24%" },
      { label: "亮白色", imagePath: "../pic/凯乐石_女_亮白色.jpg", shareLabel: "18%" },
      { label: "浅紫色", imagePath: "../pic/凯乐石_女_浅紫色.jpg", shareLabel: "13%" },
      { label: "蓝黑色", imagePath: "../pic/凯乐石_女_蓝黑色.jpg", shareLabel: "13%" },
      { label: "烟紫色", imagePath: "../pic/凯乐石_女_烟紫色.jpg", shareLabel: "9%" }
    ],
    "KAILAS/凯乐石__男": [
      { label: "黑色", imagePath: "../pic/凯乐石_男_黑色.jpg", shareLabel: "43%" },
      { label: "墨绿色", imagePath: "../pic/凯乐石_男_墨绿色.jpg", shareLabel: "12%" },
      { label: "淡绿色", imagePath: "../pic/凯乐石_男_淡绿色.jpg", shareLabel: "11%" },
      { label: "岩棕色", imagePath: "../pic/凯乐石_男_岩棕色.jpg", shareLabel: "9%" },
      { label: "茶绿色", imagePath: "../pic/凯乐石_男_茶绿色.jpg", shareLabel: "8%" }
    ],
    "KOLON SPORT/可隆__女": [
      { label: "黑色", imagePath: "../pic/可隆_女_黑色.jpg", shareLabel: "51%" },
      { label: "奶油白", imagePath: "../pic/可隆_女_奶油白.jpg", shareLabel: "25%" },
      { label: "薄荷绿", imagePath: "../pic/可隆_女_薄荷绿.jpg", shareLabel: "9%" },
      { label: "红色", imagePath: "../pic/可隆_女_红色.jpg", shareLabel: "5%" },
      { label: "浅蓝色", imagePath: "../pic/可隆_女_浅蓝色.jpg", shareLabel: "4%" }
    ],
    "KOLON SPORT/可隆__男": [
      { label: "黑色", imagePath: "../pic/可隆_男_黑色.jpg", shareLabel: "44%" },
      { label: "米灰色", imagePath: "../pic/可隆_男_米灰色.jpg", shareLabel: "12%" },
      { label: "藏蓝色", imagePath: "../pic/可隆_男_藏蓝色.jpg", shareLabel: "9%" },
      { label: "梅紫色", imagePath: "../pic/可隆_男_梅紫色.jpg", shareLabel: "7%" },
      { label: "烟灰色", imagePath: "../pic/可隆_男_烟灰色.jpg", shareLabel: "6%" }
    ],
    "DESCENTE/迪桑特__女": [
      { label: "黑色", imagePath: "../pic/迪桑特_女_黑色.jpg", shareLabel: "27%" },
      { label: "奶油色", imagePath: "../pic/迪桑特_女_奶油色.jpg", shareLabel: "18%" },
      { label: "深蓝色", imagePath: "../pic/迪桑特_女_深蓝色.jpg", shareLabel: "16%" },
      { label: "白色", imagePath: "../pic/迪桑特_女_白色.jpg", shareLabel: "12%" },
      { label: "炭灰色", imagePath: "../pic/迪桑特_女_炭灰色.jpg", shareLabel: "7%" }
    ],
    "DESCENTE/迪桑特__男": [
      { label: "黑色", imagePath: "../pic/迪桑特_男_黑色.jpg", shareLabel: "37%" },
      { label: "卡其色", imagePath: "../pic/迪桑特_男_卡其色.jpg", shareLabel: "15%" },
      { label: "棕色", imagePath: "../pic/迪桑特_男_棕色.jpg", shareLabel: "14%" },
      { label: "白色", imagePath: "../pic/迪桑特_男_白色.jpg", shareLabel: "7%" },
      { label: "浅灰色", imagePath: "../pic/迪桑特_男_浅灰色.jpg", shareLabel: "7%" }
    ],
    "LULULEMON/露露乐蒙__女": [
      { label: "黑色", imagePath: "../pic/Lulu_女_黑色.jpg", shareLabel: "30%" },
      { label: "浅灰色", imagePath: "../pic/Lulu_女_浅灰色.jpg", shareLabel: "25%" },
      { label: "鸽灰色", imagePath: "../pic/Lulu_女_鸽灰色.jpg", shareLabel: "11%" },
      { label: "浆果红", imagePath: "../pic/Lulu_女_浆果红.jpg", shareLabel: "10%" },
      { label: "银灰色", imagePath: "../pic/Lulu_女_银灰色.jpg", shareLabel: "7%" }
    ],
    "LULULEMON/露露乐蒙__男": [
      { label: "黑色", imagePath: "../pic/Lulu_男_黑色.jpg", shareLabel: "51%" },
      { label: "杂色灰", imagePath: "../pic/Lulu_男_杂色灰.jpg", shareLabel: "8%" },
      { label: "象牙白", imagePath: "../pic/Lulu_男_象牙白.jpg", shareLabel: "6%" },
      { label: "石墨灰", imagePath: "../pic/Lulu_男_石墨灰.jpg", shareLabel: "6%" },
      { label: "杂色棕", imagePath: "../pic/Lulu_男_杂色棕.jpg", shareLabel: "6%" }
    ]
  };

  cards.forEach((card) => {
    const segmentCard = card.closest(".competitor-board.segment[data-brand][data-gender]");
    const brand = segmentCard instanceof HTMLElement ? segmentCard.dataset.brand : "";
    const gender = segmentCard instanceof HTMLElement ? segmentCard.dataset.gender : "";
    const assetKey = brand && gender ? `${brand}__${gender}` : "";
    const assets = colorCardAssets[assetKey] ?? [];
    const slotsMarkup = Array.from({ length: 5 }, (_, index) => {
      const asset = assets[index];
      const slotNumber = index + 1;

      if (asset) {
        return `
          <div class="competitor-color-slot">
            <div class="competitor-color-slot-label">${asset.label}</div>
            <button
              type="button"
              class="competitor-color-slot-frame competitor-color-zoom-trigger has-image"
              data-image-src="${asset.imagePath}"
              data-image-label="${asset.label}"
              aria-label="放大查看${asset.label}"
            >
              <img src="${asset.imagePath}" alt="${asset.label}">
            </button>
            <div class="competitor-color-slot-share">${asset.shareLabel ?? ""}</div>
          </div>
        `;
      }

      return `
        <div class="competitor-color-slot">
          <div class="competitor-color-slot-label">Color ${slotNumber}</div>
          <div class="competitor-color-slot-frame">
            <span>Image</span>
            <small>3:4</small>
          </div>
        </div>
      `;
    }).join("");

    card.innerHTML = `
      <div class="competitor-function-title">Colors</div>
      <div class="competitor-color-grid">
        ${slotsMarkup}
      </div>
    `;

    card.querySelectorAll(".competitor-color-zoom-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        zoomModal.open(trigger.dataset.imageSrc ?? "", trigger.dataset.imageLabel ?? "");
      });
    });
  });
}

function ensureCompetitorColorZoomModal() {
  let modal = document.querySelector("#competitorColorZoomModal");
  if (modal instanceof HTMLElement) {
    return modal;
  }

  modal = document.createElement("div");
  modal.id = "competitorColorZoomModal";
  modal.className = "competitor-color-zoom-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="competitor-color-zoom-backdrop"></div>
    <div class="competitor-color-zoom-dialog" role="dialog" aria-modal="true" aria-label="颜色图片放大预览">
      <button type="button" class="competitor-color-zoom-close" aria-label="关闭图片预览">Close</button>
      <img class="competitor-color-zoom-image" alt="">
      <div class="competitor-color-zoom-caption"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const image = modal.querySelector(".competitor-color-zoom-image");
  const caption = modal.querySelector(".competitor-color-zoom-caption");
  const closeButton = modal.querySelector(".competitor-color-zoom-close");
  const backdrop = modal.querySelector(".competitor-color-zoom-backdrop");

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("is-competitor-color-zoom-open");
    if (image instanceof HTMLImageElement) {
      image.removeAttribute("src");
    }
    if (caption instanceof HTMLElement) {
      caption.textContent = "";
    }
  };

  modal.open = (imageSrc, imageLabel) => {
    if (!(image instanceof HTMLImageElement) || !(caption instanceof HTMLElement) || !imageSrc) {
      return;
    }

    image.src = imageSrc;
    image.alt = imageLabel || "颜色图片预览";
    caption.textContent = imageLabel || "";
    modal.hidden = false;
    document.body.classList.add("is-competitor-color-zoom-open");
  };

  closeButton?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  if (!document.body.dataset.competitorColorZoomBound) {
    document.body.dataset.competitorColorZoomBound = "true";
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const activeModal = document.querySelector("#competitorColorZoomModal");
        if (activeModal instanceof HTMLElement && !activeModal.hidden) {
          activeModal.hidden = true;
          document.body.classList.remove("is-competitor-color-zoom-open");
          const activeImage = activeModal.querySelector(".competitor-color-zoom-image");
          const activeCaption = activeModal.querySelector(".competitor-color-zoom-caption");
          if (activeImage instanceof HTMLImageElement) {
            activeImage.removeAttribute("src");
          }
          if (activeCaption instanceof HTMLElement) {
            activeCaption.textContent = "";
          }
        }
      }
    });
  }

  modal.close = closeModal;

  return modal;
}

function bootstrapCompetitorFunctionRadarCards() {
  const cards = Array.from(document.querySelectorAll(".competitor-function-radar-card[data-brand]"));
  if (!cards.length) {
    return;
  }

  const tooltip = ensureGenderBreakdownTooltip();
  const width = 248;
  const height = 170;
  const centerX = width / 2;
  const centerY = 88;
  const radius = 54;
  const maxValue = 100;
  const levels = [0.34, 0.67, 1];

  const polarPoint = (ratio, angleDeg) => {
    const angle = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: centerX + Math.cos(angle) * radius * ratio,
      y: centerY + Math.sin(angle) * radius * ratio
    };
  };

  const pointsToString = (points) => points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");

  const createRadarSvg = ({ brand, rows, ariaLabel, tooltipTitle, tooltipLines, labelAccessor }) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "competitor-function-radar-svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", ariaLabel);

    const showRowTooltip = (row, event, fallbackTarget) => {
      const html = `
        <div class="gender-breakdown-tooltip-title">${tooltipTitle(row)}</div>
        ${tooltipLines(row).join("")}
      `;
      const rect = fallbackTarget.getBoundingClientRect();
      showGenderBreakdownTooltip(
        tooltip,
        html,
        event?.clientX ?? rect.left + rect.width / 2,
        event?.clientY ?? rect.top
      );
    };

    levels.forEach((level) => {
      const ringPoints = rows.map((_, index) => polarPoint(level, (360 / rows.length) * index));
      const ring = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      ring.setAttribute("class", "competitor-function-radar-grid");
      ring.setAttribute("points", pointsToString(ringPoints));
      svg.appendChild(ring);
    });

    rows.forEach((_, index) => {
      const axisPoint = polarPoint(1, (360 / rows.length) * index);
      const axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
      axis.setAttribute("class", "competitor-function-radar-axis");
      axis.setAttribute("x1", `${centerX}`);
      axis.setAttribute("y1", `${centerY}`);
      axis.setAttribute("x2", `${axisPoint.x}`);
      axis.setAttribute("y2", `${axisPoint.y}`);
      svg.appendChild(axis);
    });

    const valuePoints = rows.map((row, index) =>
      polarPoint(Math.max(0, Math.min(1, row.share / maxValue)), (360 / rows.length) * index)
    );
    const area = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    area.setAttribute("class", "competitor-function-radar-area");
    area.setAttribute("points", pointsToString(valuePoints));
    svg.appendChild(area);

    rows.forEach((row, index) => {
      const angle = (360 / rows.length) * index;
      const nodePoint = valuePoints[index];
      const labelPoint = polarPoint(1.2, angle);
      const labelAnchor = labelPoint.x < centerX - 8 ? "end" : labelPoint.x > centerX + 8 ? "start" : "middle";

      const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hit.setAttribute("class", "competitor-function-radar-hit");
      hit.setAttribute("cx", `${nodePoint.x}`);
      hit.setAttribute("cy", `${nodePoint.y}`);
      hit.setAttribute("r", "12");
      svg.appendChild(hit);

      const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      node.setAttribute("class", "competitor-function-radar-node");
      node.setAttribute("cx", `${nodePoint.x}`);
      node.setAttribute("cy", `${nodePoint.y}`);
      node.setAttribute("r", "4");
      svg.appendChild(node);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "competitor-function-radar-label");
      label.setAttribute("x", `${labelPoint.x}`);
      label.setAttribute("y", `${labelPoint.y}`);
      label.setAttribute("text-anchor", labelAnchor);
      label.textContent = labelAccessor(row);
      svg.appendChild(label);

      [hit, node, label].forEach((element) => {
        element.addEventListener("mouseenter", (event) => showRowTooltip(row, event, element));
        element.addEventListener("mousemove", (event) => placeTooltip(tooltip, event.clientX, event.clientY));
        element.addEventListener("mouseleave", () => hideGenderBreakdownTooltip(tooltip));
      });
    });

    return svg;
  };

  cards.forEach((card) => {
    const brand = card.dataset.brand;
    if (!brand) {
      return;
    }

    const radarData = COMPETITOR_BRAND_FUNCTION_RADARS[brand];
    if (!radarData) {
      return;
    }

    const conclusion = card.querySelector(".competitor-function-radar-conclusion");
    const plot = card.querySelector(".competitor-function-radar-plot");
    const combos = card.querySelector(".competitor-function-radar-combos");
    const rows = radarData.rows ?? [];

    if (conclusion) {
      conclusion.textContent = radarData.conclusion ?? "";
    }

    if (combos) {
      const strongCombos = radarData.strongCombos ?? [];
      if (strongCombos.length) {
        card.classList.add("has-combos");
        combos.innerHTML = `
          <strong>强功能组合：</strong>${strongCombos
            .map(
              (combo, index) => `
                <button class="competitor-function-radar-combo" type="button" data-index="${index}">
                  ${combo.label}
                </button>
              `
            )
            .join("<span class=\"competitor-function-radar-combo-separator\">, </span>")}
        `;

        combos.querySelectorAll(".competitor-function-radar-combo").forEach((comboButton) => {
          const combo = strongCombos[Number(comboButton.dataset.index)];
          if (!combo) {
            return;
          }

          const showComboTooltip = (event, fallbackTarget) => {
            const yoyClass =
              combo.yoy > 0 ? "is-positive" : combo.yoy < 0 ? "is-negative" : "is-neutral";
            const html = `
              <div class="gender-breakdown-tooltip-title">${combo.label}</div>
              <div class="gender-breakdown-tooltip-line">GMV Share <strong>${combo.shareLabel}</strong></div>
              <div class="gender-breakdown-tooltip-line">YOY <strong class="${yoyClass}">${combo.yoyLabel}</strong></div>
            `;
            const rect = fallbackTarget.getBoundingClientRect();
            showGenderBreakdownTooltip(
              tooltip,
              html,
              event?.clientX ?? rect.left + rect.width / 2,
              event?.clientY ?? rect.top
            );
          };

          comboButton.addEventListener("mouseenter", (event) => showComboTooltip(event, comboButton));
          comboButton.addEventListener("mousemove", (event) => placeTooltip(tooltip, event.clientX, event.clientY));
          comboButton.addEventListener("mouseleave", () => hideGenderBreakdownTooltip(tooltip));
        });
      } else {
        card.classList.remove("has-combos");
        combos.textContent = "";
      }
    }

    if (!plot || !rows.length) {
      return;
    }

    plot.innerHTML = "";
    plot.appendChild(
      createRadarSvg({
        brand,
        rows,
        ariaLabel: `${brand} function radar`,
        labelAccessor: (row) => row.label,
        tooltipTitle: (row) => (row.labelEn ? `${row.label} ${row.labelEn}` : row.label),
        tooltipLines: (row) => {
          const yoyDisplay = row.yoyLabel === "new" ? "New" : row.yoyLabel;
          const yoyClass =
            row.yoy > 0 ? "is-positive" : row.yoy < 0 ? "is-negative" : "is-neutral";
          const lines = [
            `<div class="gender-breakdown-tooltip-line">GMV Share <strong>${row.shareLabel}</strong></div>`,
            `<div class="gender-breakdown-tooltip-line">YOY <strong class="${yoyClass}">${yoyDisplay}</strong></div>`
          ];
          const techNote = radarData.techNotes?.[row.key];
          if (techNote) {
            lines.push(`<div class="gender-breakdown-tooltip-line">${techNote}</div>`);
          }
          return lines;
        }
      })
    );
  });
}

function bootstrapCompetitorFabricRadarCards() {
  const cards = Array.from(document.querySelectorAll(".competitor-fabric-radar-card[data-brand]"));
  if (!cards.length) {
    return;
  }

  const tooltip = ensureGenderBreakdownTooltip();
  const width = 248;
  const height = 170;
  const centerX = width / 2;
  const centerY = 88;
  const radius = 54;
  const maxValue = 50;
  const levels = [0.34, 0.67, 1];

  const polarPoint = (ratio, angleDeg) => {
    const angle = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: centerX + Math.cos(angle) * radius * ratio,
      y: centerY + Math.sin(angle) * radius * ratio
    };
  };

  const pointsToString = (points) => points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");

  const createRadarSvg = ({ brand, rows }) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "competitor-function-radar-svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `${brand} fabric radar`);

    const showRowTooltip = (row, event, fallbackTarget) => {
      const yoyDisplay = row.yoyLabel === "new" ? "New" : row.yoyLabel;
      const yoyClass =
        row.yoy > 0 ? "is-positive" : row.yoy < 0 ? "is-negative" : "is-neutral";
      const html = `
        <div class="gender-breakdown-tooltip-title">${row.fullLabelEn || row.fullLabel}</div>
        <div class="gender-breakdown-tooltip-line">GMV Share <strong>${row.shareLabel}</strong></div>
        <div class="gender-breakdown-tooltip-line">YOY <strong class="${yoyClass}">${yoyDisplay}</strong></div>
        <div class="gender-breakdown-tooltip-line">ASP <strong>${row.aspLabel}</strong></div>
      `;
      const rect = fallbackTarget.getBoundingClientRect();
      showGenderBreakdownTooltip(
        tooltip,
        html,
        event?.clientX ?? rect.left + rect.width / 2,
        event?.clientY ?? rect.top
      );
    };

    levels.forEach((level) => {
      const ringPoints = rows.map((_, index) => polarPoint(level, (360 / rows.length) * index));
      const ring = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      ring.setAttribute("class", "competitor-function-radar-grid");
      ring.setAttribute("points", pointsToString(ringPoints));
      svg.appendChild(ring);
    });

    rows.forEach((_, index) => {
      const axisPoint = polarPoint(1, (360 / rows.length) * index);
      const axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
      axis.setAttribute("class", "competitor-function-radar-axis");
      axis.setAttribute("x1", `${centerX}`);
      axis.setAttribute("y1", `${centerY}`);
      axis.setAttribute("x2", `${axisPoint.x}`);
      axis.setAttribute("y2", `${axisPoint.y}`);
      svg.appendChild(axis);
    });

    const valuePoints = rows.map((row, index) =>
      polarPoint(Math.max(0, Math.min(1, row.share / maxValue)), (360 / rows.length) * index)
    );
    const area = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    area.setAttribute("class", "competitor-function-radar-area");
    area.setAttribute("points", pointsToString(valuePoints));
    svg.appendChild(area);

    rows.forEach((row, index) => {
      const angle = (360 / rows.length) * index;
      const nodePoint = valuePoints[index];
      const labelPoint = polarPoint(1.2, angle);
      const labelAnchor = labelPoint.x < centerX - 8 ? "end" : labelPoint.x > centerX + 8 ? "start" : "middle";

      const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hit.setAttribute("class", "competitor-function-radar-hit");
      hit.setAttribute("cx", `${nodePoint.x}`);
      hit.setAttribute("cy", `${nodePoint.y}`);
      hit.setAttribute("r", "12");
      svg.appendChild(hit);

      const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      node.setAttribute("class", "competitor-function-radar-node");
      node.setAttribute("cx", `${nodePoint.x}`);
      node.setAttribute("cy", `${nodePoint.y}`);
      node.setAttribute("r", "4");
      svg.appendChild(node);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "competitor-function-radar-label");
      label.setAttribute("x", `${labelPoint.x}`);
      label.setAttribute("y", `${labelPoint.y}`);
      label.setAttribute("text-anchor", labelAnchor);
      label.textContent = row.label;
      svg.appendChild(label);

      [hit, node, label].forEach((element) => {
        element.addEventListener("mouseenter", (event) => showRowTooltip(row, event, element));
        element.addEventListener("mousemove", (event) => placeTooltip(tooltip, event.clientX, event.clientY));
        element.addEventListener("mouseleave", () => hideGenderBreakdownTooltip(tooltip));
      });
    });

    return svg;
  };

  cards.forEach((card) => {
    const brand = card.dataset.brand;
    if (!brand) {
      return;
    }

    const radarData = COMPETITOR_BRAND_FABRIC_RADARS[brand];
    if (!radarData) {
      return;
    }

    const conclusion = card.querySelector(".competitor-fabric-radar-conclusion");
    const plot = card.querySelector(".competitor-fabric-radar-plot");
    const rows = radarData.rows ?? [];
    if (conclusion) {
      conclusion.textContent = radarData.conclusion ?? "";
    }
    if (!plot || !rows.length) {
      return;
    }

    plot.innerHTML = "";
    plot.appendChild(createRadarSvg({ brand, rows }));
  });
}

function ensureFabricImageLightbox() {
  let lightbox = document.querySelector("#fabricImageLightbox");
  if (lightbox) {
    return lightbox.__fabricImageLightboxApi;
  }

  lightbox = document.createElement("div");
  lightbox.id = "fabricImageLightbox";
  lightbox.className = "fabric-image-lightbox";
  lightbox.innerHTML = `
    <div class="fabric-image-lightbox-backdrop" data-fabric-lightbox-close="true"></div>
    <div class="fabric-image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Fabric image preview">
      <button class="fabric-image-lightbox-close" type="button" aria-label="Close image preview" data-fabric-lightbox-close="true">×</button>
      <div class="fabric-image-lightbox-media-wrap">
        <img class="fabric-image-lightbox-media" alt="">
      </div>
      <div class="fabric-image-lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const media = lightbox.querySelector(".fabric-image-lightbox-media");
  const caption = lightbox.querySelector(".fabric-image-lightbox-caption");

  const close = () => {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("has-fabric-lightbox-open");
    if (media instanceof HTMLImageElement) {
      media.removeAttribute("src");
      media.alt = "";
    }
    if (caption) {
      caption.textContent = "";
    }
  };

  const open = ({ src, alt, brand }) => {
    if (!(media instanceof HTMLImageElement) || !src) {
      return;
    }

    media.src = src;
    media.alt = alt;
    if (caption) {
      caption.textContent = brand || alt || "";
    }
    lightbox.classList.add("is-open");
    document.body.classList.add("has-fabric-lightbox-open");
  };

  lightbox.addEventListener("click", (event) => {
    const closeTrigger = event.target instanceof Element
      ? event.target.closest("[data-fabric-lightbox-close='true']")
      : null;
    if (closeTrigger) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      close();
    }
  });

  const api = { open, close };
  lightbox.__fabricImageLightboxApi = api;
  return api;
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
  const priceLabel = document.body.dataset.lang === "en" ? "ATV" : "成交价格";
  const brand = (target.dataset.brand ?? "").split("/")[0];
  const gender = target.dataset.genderLabel ?? getGenderLegendCopy(target.dataset.gender);
  const yoy = target.dataset.yoy ?? "n/a";
  const price = formatPriceLabel(target.dataset.price);
  const yoyClass =
    yoy === "n/a" ? "is-neutral" : yoy.startsWith("+") ? "is-positive" : yoy.startsWith("-") ? "is-negative" : "is-neutral";

  return `
    <div class="gender-breakdown-tooltip-title">${brand} · ${gender}</div>
    <div class="gender-breakdown-tooltip-line">YOY% <strong class="${yoyClass}">${yoy}</strong></div>
    <div class="gender-breakdown-tooltip-line">${priceLabel} <strong>${price}</strong></div>
  `;
}

function createSegmentTooltipContent(target) {
  const priceLabel = document.body.dataset.lang === "en" ? "ATV" : "成交价格";
  const brand = (target.dataset.brand ?? "").split("/")[0];
  const gender = target.dataset.genderLabel ?? getGenderLegendCopy(target.dataset.gender);
  const price = formatPriceLabel(target.dataset.price);

  return `
    <div class="gender-breakdown-tooltip-title">${brand} · ${gender}</div>
    <div class="gender-breakdown-tooltip-line">${priceLabel} <strong>${price}</strong></div>
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
  const brand = rawBrand.split("/")[0];
  const share = target.dataset.share ?? "n/a";
  const yoy = target.dataset.yoy ?? "n/a";
  const yoyClass =
    yoy === "n/a" ? "is-neutral" : yoy.startsWith("+") ? "is-positive" : yoy.startsWith("-") ? "is-negative" : "is-neutral";

  return `
    <div class="gender-breakdown-tooltip-title">${brand}</div>
    <div class="gender-breakdown-tooltip-line">% in inner TTL <strong>${share}</strong></div>
    <div class="gender-breakdown-tooltip-line">Half-zip YOY <strong class="${yoyClass}">${yoy}</strong></div>
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
  const opportunityContainer = section.querySelector("#function-opportunity-map");
  const genderContainer = section.querySelector("#function-gender-split");
  let activeNode = null;

  const getGenderCards = () => Array.from(section.querySelectorAll(".function-gender-card[data-view]"));
  const applyFunctionGenderHighlight = (viewKey) => {
    const cards = getGenderCards();
    const hasFocusedView = viewKey === "male" || viewKey === "female";

    cards.forEach((card) => {
      const isActive = hasFocusedView && card.dataset.view === viewKey;
      card.classList.toggle("is-linked-active", isActive);
      card.classList.remove("is-linked-dimmed");
    });
  };

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

  opportunityContainer?.addEventListener("functionviewchange", (event) => {
    applyFunctionGenderHighlight(event.detail?.viewKey ?? "all");
  });

  getGenderCards().forEach((card) => {
    const activateLinkedView = () => {
      const viewKey = card.dataset.view;
      if (!viewKey) {
        return;
      }
      opportunityContainer?.__setFunctionOpportunityView?.(viewKey);
      applyFunctionGenderHighlight(viewKey);
    };

    card.addEventListener("click", activateLinkedView);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateLinkedView();
      }
    });
  });

  applyFunctionGenderHighlight(opportunityContainer?.__getFunctionOpportunityView?.() ?? "all");
}

function setupMarketScopeInteractions() {
  const section = document.querySelector("#competitor-scope");
  if (!section) {
    return;
  }

  if (section.dataset.marketScopeInteractionsBound === "true") {
    return;
  }
  section.dataset.marketScopeInteractionsBound = "true";

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

function setupLanguageSwitch() {
  const switcher = document.querySelector("#langSwitch");
  if (!(switcher instanceof HTMLButtonElement)) {
    return;
  }

  const storageKey = "dx-halfzip-lang";
  const applyTranslatableText = (lang) => {
    document.querySelectorAll("[data-zh][data-en]").forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      node.textContent = lang === "en" ? node.dataset.en || "" : node.dataset.zh || "";
    });

    document.querySelectorAll(".silhouette-view-toggle").forEach((node) => {
      if (!(node instanceof HTMLButtonElement)) {
        return;
      }

      const isCompare = node.getAttribute("aria-pressed") === "true";
      const defaultLabel = lang === "en" ? node.dataset.defaultLabelEn || "Pictures" : node.dataset.defaultLabel || "查看图片";
      const altLabel = lang === "en" ? node.dataset.altLabelEn || "Matrix" : node.dataset.altLabel || "查看矩阵";
      node.textContent = isCompare ? altLabel : defaultLabel;
    });
  };

  const applyLanguage = (lang) => {
    const normalized = lang === "en" ? "en" : "zh";
    switcher.dataset.lang = normalized;
    switcher.setAttribute("aria-pressed", normalized === "en" ? "true" : "false");
    switcher.setAttribute("aria-label", normalized === "en" ? "Switch to Chinese" : "切换到英文");
    document.body.dataset.lang = normalized;
    document.documentElement.lang = normalized === "en" ? "en" : "zh-CN";
    applyTranslatableText(normalized);
    bootstrapMarketScopePage();
    bootstrapFemaleOpportunityPage();
    bootstrapFunctionPage();
    bootstrapFabricWarmthFunctionPage();

    try {
      window.localStorage.setItem(storageKey, normalized);
    } catch {
      // Ignore storage failures and keep the switch visual-only.
    }
  };

  let initialLanguage = "zh";
  try {
    initialLanguage = window.localStorage.getItem(storageKey) || "zh";
  } catch {
    initialLanguage = "zh";
  }

  applyLanguage(initialLanguage);

  switcher.addEventListener("click", () => {
    applyLanguage(switcher.dataset.lang === "en" ? "zh" : "en");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  setupLanguageSwitch();
  setupNavigation();
  setupRevealEffects();
  bootstrapMarketScopePage();
  bootstrapFemaleOpportunityPage();
  bootstrapSilhouettePage();
  bootstrapFunctionPage();
  bootstrapFabricOverviewPage();
  bootstrapFabricWarmthFunctionPage();
  bootstrapCompetitorBrandSnapshotCards();
  bootstrapCompetitorSegmentMetricCards();
  bootstrapCompetitorSegmentTopFunctionCards();
  bootstrapCompetitorSegmentFitLengthCards();
  bootstrapCompetitorColorCards();
  bootstrapCompetitorFunctionRadarCards();
  bootstrapCompetitorFabricRadarCards();
  setupScrollState();
});
