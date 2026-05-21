function createSvgElement(tagName, attrs = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
  return element;
}

function formatPercentTick(value) {
  return `${Math.round(value)}%`;
}

function scaleValue(value, min, max, start, end) {
  if (max === min) {
    return (start + end) / 2;
  }

  return start + ((value - min) / (max - min)) * (end - start);
}

function scaleSqrtValue(value, min, max, start, end) {
  if (max === min) {
    return (start + end) / 2;
  }

  const normalized = (value - min) / (max - min);
  return start + Math.sqrt(Math.max(0, normalized)) * (end - start);
}

function polarToCartesian(centerX, centerY, radius, angleDegrees) {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians)
  };
}

function adjustHexColor(hex, percent) {
  const raw = hex.replace("#", "");
  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : raw;

  const readChannel = (offset) => parseInt(normalized.slice(offset, offset + 2), 16);
  const shiftChannel = (value) => {
    const delta = percent < 0 ? value * (percent / 100) : (255 - value) * (percent / 100);
    return Math.round(Math.max(0, Math.min(255, value + delta)));
  };

  return `rgb(${shiftChannel(readChannel(0))}, ${shiftChannel(readChannel(2))}, ${shiftChannel(readChannel(4))})`;
}

function hexToRgba(hex, alpha = 1) {
  const raw = hex.replace("#", "");
  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : raw;

  const readChannel = (offset) => parseInt(normalized.slice(offset, offset + 2), 16);
  return `rgba(${readChannel(0)}, ${readChannel(2)}, ${readChannel(4)}, ${alpha})`;
}

function describeArcPath(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function describePieSlicePath(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z"
  ].join(" ");
}

function getBubbleRadius(value, min, max) {
  if (max === min) {
    return 20;
  }

  const normalized = (value - min) / (max - min);
  return 12 + normalized * 16;
}

function getCompactBubbleRadius(value, min, max) {
  if (max === min) {
    return 19;
  }

  const normalized = (value - min) / (max - min);
  return 12 + normalized * 18;
}

function getChartLanguage() {
  if (typeof document === "undefined") {
    return "zh";
  }

  return document.body?.dataset.lang === "en" ? "en" : "zh";
}

function createStop(offset, color, opacity = 1) {
  return createSvgElement("stop", {
    offset,
    "stop-color": color,
    "stop-opacity": opacity
  });
}

function toPercent(value, total) {
  if (!total) {
    return 0;
  }

  return (value / total) * 100;
}

function createChartOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "chart-overlay";
  return overlay;
}

function createChartOverlayText({
  className = "",
  text = "",
  x = 0,
  y = 0,
  width,
  height,
  anchor = "middle",
  valign = "middle",
  dataset
}) {
  const node = document.createElement("div");
  node.className = `chart-overlay-text ${className}`.trim();
  node.textContent = text;
  node.style.left = `${toPercent(x, width)}%`;
  node.style.top = `${toPercent(y, height)}%`;
  node.dataset.anchor = anchor;
  node.dataset.valign = valign;

  if (dataset) {
    Object.entries(dataset).forEach(([key, value]) => {
      node.dataset[key] = value;
    });
  }

  return node;
}

function getGenderBubblePalette(gender) {
  if (gender === "女") {
    return {
      base: "#e9c4df",
      edge: "#d7a6ca",
      highlight: "#f9eef7",
      shadow: "rgba(206, 153, 192, 0.30)"
    };
  }

  if (gender === "男") {
    return {
      base: "#b9cbea",
      edge: "#90aad8",
      highlight: "#edf3fc",
      shadow: "rgba(122, 150, 203, 0.28)"
    };
  }

  return {
    base: "#f7e9b8",
    edge: "#e4cf7e",
    highlight: "#fff8dd",
    shadow: "rgba(209, 187, 111, 0.25)"
  };
}

export function renderMarketScopeBubbleChart(container, rows) {
  if (!container) {
    return;
  }

  const lang = getChartLanguage();

  const width = 590;
  const height = 382;
  const margin = { top: 44, right: 28, bottom: 48, left: 56 };
  const xAxisLift = 8;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const xValues = rows.map((row) => row.halfZipShareOfInner);
  const yValues = rows.map((row) => row.halfZipYoy);
  const gmvValues = rows.map((row) => row.halfZipGmv25);

  const xMin = 0;
  const xMax = Math.ceil(Math.max(...xValues) / 10) * 10;
  const yMin = 0;
  const yMax = Math.ceil(Math.max(...yValues) / 100) * 100;
  const gmvMin = Math.min(...gmvValues);
  const gmvMax = Math.max(...gmvValues);

  const svg = createSvgElement("svg", {
    class: "bubble-chart-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": lang === "en" ? "Half-Zipper distribution, growth and scale bubble chart" : "竞品品牌半拉链布局深度、增长与规模气泡图"
  });

  const defs = createSvgElement("defs");
  const shadowFilter = createSvgElement("filter", {
    id: "market-bubble-shadow",
    x: "-35%",
    y: "-35%",
    width: "170%",
    height: "170%"
  });
  shadowFilter.appendChild(
    createSvgElement("feDropShadow", {
      dx: "0",
      dy: "6",
      stdDeviation: "7",
      "flood-color": "#94a3b8",
      "flood-opacity": "0.16"
    })
  );
  defs.appendChild(shadowFilter);

  rows.forEach((row, index) => {
    const gradient = createSvgElement("radialGradient", {
      id: `market-bubble-gradient-${index}`,
      cx: "36%",
      cy: "30%",
      r: "76%"
    });
    gradient.appendChild(createStop("0%", "#eef4fe", 0.98));
    gradient.appendChild(createStop("40%", "#9cb5e2", 0.78));
    gradient.appendChild(createStop("100%", "#7c96d1", 0.94));
    defs.appendChild(gradient);
  });
  svg.appendChild(defs);

  const yTickValues = [50, 150, 300, 500].filter((value) => value <= yMax);
  const overlay = createChartOverlay();
  yTickValues.forEach((yValue) => {
    const baseY = scaleSqrtValue(
      yValue,
      yMin,
      yMax,
      margin.top + plotHeight,
      margin.top
    );
    const y = yValue === 50 ? baseY + 8 : baseY;

    svg.appendChild(
      createSvgElement("line", {
        x1: margin.left,
        y1: y,
        x2: margin.left + plotWidth,
        y2: y,
        class: "bubble-grid-line"
      })
    );
    overlay.appendChild(
      createChartOverlayText({
        className: "chart-overlay-tick is-y",
        text: formatPercentTick(yValue),
        x: margin.left - 12,
        y,
        width,
        height,
        anchor: "end",
        valign: "middle"
      })
    );
  });

  const xTickCount = Math.max(4, Math.ceil(xMax / 20));
  for (let i = 0; i <= xTickCount; i += 1) {
    const xValue = xMin + ((xMax - xMin) / xTickCount) * i;
    const x = margin.left + (plotWidth / xTickCount) * i;

    svg.appendChild(
      createSvgElement("line", {
        x1: x,
        y1: margin.top,
        x2: x,
        y2: margin.top + plotHeight - xAxisLift,
        class: "bubble-grid-line"
      })
    );
    overlay.appendChild(
      createChartOverlayText({
        className: "chart-overlay-tick is-x",
        text: formatPercentTick(xValue),
        x,
        y: margin.top + plotHeight + 14 - xAxisLift,
        width,
        height,
        anchor: "middle",
        valign: "top"
      })
    );
  }

  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: margin.top + plotHeight - xAxisLift,
      x2: margin.left + plotWidth,
      y2: margin.top + plotHeight - xAxisLift,
      class: "gender-price-axis-line"
    })
  );

  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: margin.top + plotHeight - xAxisLift,
      x2: margin.left,
      y2: margin.top,
      class: "gender-price-axis-line"
    })
  );

  const arrowSize = 10;
  const xArrow = createSvgElement("path", {
    d: `M ${margin.left + plotWidth - arrowSize} ${margin.top + plotHeight - xAxisLift - arrowSize * 0.6}
        L ${margin.left + plotWidth} ${margin.top + plotHeight - xAxisLift}
        L ${margin.left + plotWidth - arrowSize} ${margin.top + plotHeight - xAxisLift + arrowSize * 0.6}`,
    class: "gender-price-axis-arrow"
  });
  svg.appendChild(xArrow);

  const yArrow = createSvgElement("path", {
    d: `M ${margin.left - arrowSize * 0.6} ${margin.top + arrowSize}
        L ${margin.left} ${margin.top}
        L ${margin.left + arrowSize * 0.6} ${margin.top + arrowSize}`,
    class: "gender-price-axis-arrow"
  });
  svg.appendChild(yArrow);

  overlay.appendChild(
    createChartOverlayText({
      className: "chart-overlay-axis-title is-x",
      text: lang === "en" ? "Half-Zipper Share% in TTL Inner" : "半拉链占内搭总体的占比",
      x: margin.left + plotWidth / 2,
      y: height - 15 - xAxisLift,
      width,
      height,
      anchor: "middle",
      valign: "top"
    })
  );

  overlay.appendChild(
    createChartOverlayText({
      className: "chart-overlay-axis-title is-y",
      text: "YOY%",
      x: 8,
      y: margin.top + plotHeight / 2,
      width,
      height,
      anchor: "middle",
      valign: "middle"
    })
  );

  const legend = document.createElement("div");
  legend.className = "chart-overlay-legend bubble-chart-legend";
  legend.innerHTML = `
    <span class="chart-overlay-legend-circle bubble-legend-circle"></span>
    <span class="chart-overlay-legend-text bubble-legend-text">${lang === "en" ? "Bubble Size = Half-Zipper GMV" : "气泡大小表示半拉链GMV"}</span>
  `;
  overlay.appendChild(legend);

  rows.forEach((row, index) => {
    const brandLabel = row.brand.split("/")[0];
    const cx = scaleValue(
      row.halfZipShareOfInner,
      xMin,
      xMax,
      margin.left,
      margin.left + plotWidth
    );
    const stretchedCy = scaleSqrtValue(
      row.halfZipYoy,
      yMin,
      yMax,
      margin.top + plotHeight,
      margin.top
    );
    const r = getBubbleRadius(row.halfZipGmv25, gmvMin, gmvMax);

    const bubbleGroup = createSvgElement("g", {
      class: "bubble-point-group",
      "data-brand": row.brand,
      "data-share": row.halfZipShareLabel,
      "data-yoy": row.halfZipYoyLabel,
      tabindex: "0"
    });

    const bubble = createSvgElement("circle", {
      cx,
      cy: stretchedCy,
      r,
      class: "bubble-point",
      "data-brand": row.brand,
      "data-share": row.halfZipShareLabel,
      "data-yoy": row.halfZipYoyLabel,
      tabindex: "0",
      fill: `url(#market-bubble-gradient-${index})`,
      filter: "url(#market-bubble-shadow)"
    });
    bubbleGroup.appendChild(bubble);

    const highlight = createSvgElement("circle", {
      cx: cx - r * 0.24,
      cy: stretchedCy - r * 0.28,
      r: Math.max(3, r * 0.24),
      fill: "rgba(255,255,255,0.28)",
      class: "bubble-point-highlight"
    });
    bubbleGroup.appendChild(highlight);
    svg.appendChild(bubbleGroup);

    overlay.appendChild(
      createChartOverlayText({
        className: "chart-overlay-label is-brand market-scope-brand-label",
        text: brandLabel,
        x: cx,
        y: stretchedCy - r - 6,
        width,
        height,
        anchor: "middle",
        valign: "bottom",
        dataset: {
          brand: row.brand
        }
      })
    );

  });

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "bubble-chart-wrap";
  wrap.appendChild(svg);
  wrap.appendChild(overlay);

  container.appendChild(wrap);
}

export function renderFabricOverviewChart(container, rows) {
  if (!container) {
    return;
  }
  const lang = document.body.dataset.lang === "en" ? "en" : "zh";

  const fabricEnglishLabelMap = {
    smooth: "Smooth Fabric",
    brushed: "Brushed Fabric",
    textured: "Textured Fabric",
    wool: "Wool"
  };

  const width = 372;
  const height = 300;
  const centerX = 186;
  const centerY = 138;
  const radius = 118;

  const root = document.createElement("div");
  root.className = "fabric-overview-root";

  const emitFabricSelection = (key) => {
    root.dispatchEvent(
      new CustomEvent("fabricoverviewselect", {
        bubbles: true,
        detail: { key }
      })
    );
  };

  const setActiveFabricKey = (key) => {
    root.classList.add("has-active-fabric");
    root.querySelectorAll("[data-fabric-key]").forEach((element) => {
      element.classList.toggle("is-active", element.dataset.fabricKey === key);
    });
  };

  const clearActiveFabricKey = () => {
    root.classList.remove("has-active-fabric");
    root.querySelectorAll("[data-fabric-key]").forEach((element) => {
      element.classList.remove("is-active");
    });
  };

  const top = document.createElement("div");
  top.className = "fabric-overview-top";

  const legend = document.createElement("div");
  legend.className = "fabric-overview-legend";
  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "fabric-overview-legend-item";
    item.dataset.fabricKey = row.key;
    item.tabIndex = 0;
    item.innerHTML = `
      <span class="fabric-overview-dot" style="background:${row.color};"></span>
      <div class="fabric-overview-legend-copy">
        <strong>${row.label}</strong>
        <small>${fabricEnglishLabelMap[row.key] ?? ""}</small>
      </div>
    `;
    item.addEventListener("mouseenter", () => setActiveFabricKey(row.key));
    item.addEventListener("mouseleave", clearActiveFabricKey);
    item.addEventListener("click", () => emitFabricSelection(row.key));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        emitFabricSelection(row.key);
      }
    });
    legend.appendChild(item);
  });
  top.appendChild(legend);

  const pieBlock = document.createElement("div");
  pieBlock.className = "fabric-overview-pie-block";

  const ringWrap = document.createElement("div");
  ringWrap.className = "fabric-overview-ring-wrap";

  const svg = createSvgElement("svg", {
    class: "fabric-overview-ring-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "Y25 面料大类占比饼图"
  });

  const defs = createSvgElement("defs");
  const pieShadow = createSvgElement("filter", {
    id: "fabricPieShadow",
    x: "-20%",
    y: "-20%",
    width: "140%",
    height: "140%"
  });
  pieShadow.appendChild(
    createSvgElement("feDropShadow", {
      dx: 0,
      dy: 4,
      stdDeviation: 4,
      "flood-color": "#40547a",
      "flood-opacity": 0.18
    })
  );
  defs.appendChild(pieShadow);

  rows.forEach((row, index) => {
    const gradient = createSvgElement("radialGradient", {
      id: `fabricPieGradient${index}`,
      cx: "34%",
      cy: "30%",
      r: "76%"
    });
    gradient.appendChild(createSvgElement("stop", { offset: "0%", "stop-color": adjustHexColor(row.color, 36) }));
    gradient.appendChild(createSvgElement("stop", { offset: "26%", "stop-color": adjustHexColor(row.color, 18) }));
    gradient.appendChild(createSvgElement("stop", { offset: "72%", "stop-color": row.color }));
    gradient.appendChild(createSvgElement("stop", { offset: "100%", "stop-color": adjustHexColor(row.color, -10) }));
    defs.appendChild(gradient);
  });
  svg.appendChild(defs);

  let labelAngle = -190;
  rows.forEach((row, index) => {
    const span = (row.share25 / 100) * 360;
    const startAngle = labelAngle;
    const endAngle = labelAngle + span;
    const midAngle = labelAngle + span / 2;
    const shareRadius = row.share25 <= 11 ? radius * 0.68 : radius * 0.55;
    const innerPoint = polarToCartesian(centerX, centerY, shareRadius, midAngle);
    const outerRadius = row.key === "smooth" ? radius + 28 : radius + 16;
    const outerPoint = polarToCartesian(centerX, centerY, outerRadius, midAngle);
    const outerAnchor =
      row.key === "smooth"
        ? "end"
        : midAngle > 18 && midAngle < 162
          ? "start"
          : midAngle > 198 && midAngle < 342
            ? "end"
            : "middle";

    const slicePath = createSvgElement("path", {
      d: describePieSlicePath(centerX, centerY, radius, startAngle, endAngle),
      fill: `url(#fabricPieGradient${index})`,
      stroke: "rgba(255,255,255,0.92)",
      "stroke-width": 2,
      filter: "url(#fabricPieShadow)",
      class: "fabric-overview-pie-slice",
      "data-fabric-key": row.key
    });
    slicePath.addEventListener("mouseenter", () => setActiveFabricKey(row.key));
    slicePath.addEventListener("mouseleave", clearActiveFabricKey);
    slicePath.addEventListener("click", () => emitFabricSelection(row.key));
    svg.appendChild(slicePath);

    const shareLabel = createSvgElement("text", {
      x: innerPoint.x,
      y: innerPoint.y + 5,
      class: "fabric-overview-pie-share-label",
      "text-anchor": "middle",
      "data-fabric-key": row.key
    });
    shareLabel.textContent = row.share25Label;
    shareLabel.addEventListener("mouseenter", () => setActiveFabricKey(row.key));
    shareLabel.addEventListener("mouseleave", clearActiveFabricKey);
    shareLabel.addEventListener("click", () => emitFabricSelection(row.key));
    svg.appendChild(shareLabel);

    const yoyLabel = createSvgElement("text", {
      x: outerPoint.x,
      y: outerPoint.y + 4,
      class: "fabric-overview-pie-yoy-label",
      "text-anchor": outerAnchor,
      "data-fabric-key": row.key
    });
    yoyLabel.textContent = row.yoyLabel;
    yoyLabel.addEventListener("mouseenter", () => setActiveFabricKey(row.key));
    yoyLabel.addEventListener("mouseleave", clearActiveFabricKey);
    yoyLabel.addEventListener("click", () => emitFabricSelection(row.key));
    svg.appendChild(yoyLabel);

    labelAngle += span;
  });

  ringWrap.appendChild(svg);
  pieBlock.appendChild(ringWrap);
  top.appendChild(pieBlock);

  const priceStrip = document.createElement("div");
  priceStrip.className = "fabric-price-strip";
  rows.forEach((row) => {
    const card = document.createElement("div");
    card.className = "fabric-price-card";
    card.dataset.fabricKey = row.key;
    card.tabIndex = 0;
    card.style.setProperty("--fabric-card-accent", row.color);
    card.innerHTML = `
      <div class="fabric-price-card-title">
        <span class="fabric-price-card-label">${row.label}</span>
        <small class="fabric-price-card-english">${fabricEnglishLabelMap[row.key] ?? ""}</small>
      </div>
      <div class="fabric-price-card-metric">
        <strong>${row.avgDealPrice25 > 0 ? row.avgDealPrice25Label : "n/a"}</strong>
        <small>${lang === "en" ? "ATV" : "成交均价"}</small>
      </div>
    `;
    card.addEventListener("mouseenter", () => setActiveFabricKey(row.key));
    card.addEventListener("mouseleave", clearActiveFabricKey);
    card.addEventListener("click", () => emitFabricSelection(row.key));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        emitFabricSelection(row.key);
      }
    });
    priceStrip.appendChild(card);
  });

  const note = document.createElement("p");
  note.className = "fabric-overview-note";
  note.textContent = "5 Brands Integrated: DESCENTE, KOLON, LULULEMON, KAILAS and ARC'TERYX";

  root.appendChild(top);
  root.appendChild(priceStrip);
  root.appendChild(note);

  container.innerHTML = "";
  container.appendChild(root);
}

export function renderFabricWarmthBubbleChart(container, overviewRows, bubbleRows) {
  if (!container) {
    return;
  }
  const lang = document.body.dataset.lang === "en" ? "en" : "zh";

  const warmthCardToneMap = {
    "non-fleece": {
      border: "rgba(147, 197, 253, 0.58)",
      background: "linear-gradient(180deg, rgba(239, 246, 255, 0.98), rgba(255, 255, 255, 0.96))",
      accent: "#60a5fa"
    },
    fleece: {
      border: "rgba(244, 114, 182, 0.34)",
      background: "linear-gradient(180deg, rgba(253, 242, 248, 0.96), rgba(255, 255, 255, 0.96))",
      accent: "#ec4899"
    }
  };
  const shortFabricLabelMap = {
    smooth: "光滑/平整",
    brushed: "拉绒/磨毛",
    textured: "肌理",
    wool: "羊毛"
  };
  const shortFabricLabelMapEn = {
    smooth: "Smooth",
    brushed: "Brushed",
    textured: "Textured",
    wool: "Wool"
  };
  const warmthLabelMap = {
    "non-fleece": "不加绒",
    fleece: "加绒"
  };
  const warmthLabelMapEn = {
    "non-fleece": "Non-Fleece",
    fleece: "Fleece"
  };
  const width = 560;
  const height = 286;
  const margin = {
    top: 12,
    right: 32,
    bottom: 24,
    left: 60
  };
  const xValues = bubbleRows.map((row) => row.avgDealPrice25);
  const yValues = bubbleRows.map((row) => (Number.isFinite(row.yoy) ? row.yoy : 0));
  const xMin = Math.floor((Math.min(...xValues) - 40) / 100) * 100;
  const xMax = Math.ceil((Math.max(...xValues) + 40) / 100) * 100;
  const yMin = Math.min(-100, Math.floor((Math.min(...yValues) - 25) / 100) * 100);
  const yMax = 500;
  const bubbleMax = Math.max(...bubbleRows.map((row) => row.gmv25), 0);
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;
  const warmthZeroY = plotBottom - 26;
  const warmthPositiveStep = (warmthZeroY - plotTop) / 3;
  const xTicks = [];
  for (let tick = xMin; tick <= xMax; tick += 200) {
    xTicks.push(tick);
  }
  const yTicks = [-50, 0, 100, 200, 500].filter((tick) => tick >= yMin && tick <= yMax);

  const scaleWarmthY = (value) => {
    const boundedValue = Number.isFinite(value) ? value : 0;
    if (boundedValue <= -50) {
      return plotBottom;
    }
    if (boundedValue <= 0) {
      return scaleValue(boundedValue, -50, 0, plotBottom, warmthZeroY);
    }
    if (boundedValue <= 100) {
      return scaleValue(boundedValue, 0, 100, warmthZeroY, warmthZeroY - warmthPositiveStep);
    }
    if (boundedValue <= 200) {
      return scaleValue(
        boundedValue,
        100,
        200,
        warmthZeroY - warmthPositiveStep,
        warmthZeroY - warmthPositiveStep * 2
      );
    }
    return scaleValue(
      Math.min(boundedValue, 500),
      200,
      500,
      warmthZeroY - warmthPositiveStep * 2,
      warmthZeroY - warmthPositiveStep * 3
    );
  };

  const root = document.createElement("div");
  root.className = "fabric-warmth-bubble-root";
  const activeWarmthKeys = new Set(["non-fleece", "fleece"]);
  let hoveredWarmthKey = "";

  const overview = document.createElement("div");
  overview.className = "fabric-warmth-overview";
  overviewRows.forEach((row) => {
    const tone = warmthCardToneMap[row.key] ?? warmthCardToneMap["non-fleece"];
    const item = document.createElement("article");
    item.className = "fabric-warmth-kpi-card";
    item.dataset.warmthKey = row.key;
    item.style.borderColor = tone.border;
    item.style.background = tone.background;
    item.style.setProperty("--fabric-warmth-card-accent", tone.accent);
    item.innerHTML = `
      <div class="fabric-warmth-kpi-content">
        <div class="fabric-warmth-kpi-head">
          <strong>${row.label}</strong>
          <small>${row.labelEn}</small>
        </div>
        <div class="fabric-warmth-kpi-metrics">
          <div class="fabric-warmth-kpi-metric">
            <span>${lang === "en" ? "Share" : "占比"}</span>
            <strong>${row.share25Label}</strong>
          </div>
          <div class="fabric-warmth-kpi-metric">
            <span>YOY</span>
            <strong class="${row.yoyLabel.startsWith("-") ? "is-negative" : row.yoyLabel === "n/a" ? "is-neutral" : "is-positive"}">${row.yoyLabel}</strong>
          </div>
          <div class="fabric-warmth-kpi-metric">
            <span>${lang === "en" ? "ATV" : "成交均价"}</span>
            <strong>${row.avgDealPrice25Label}</strong>
          </div>
        </div>
      </div>
      <button
        type="button"
        class="fabric-warmth-visibility-toggle"
        data-warmth-key="${row.key}"
        aria-pressed="false"
      >
        <span class="fabric-warmth-visibility-button-text">${lang === "en" ? "Show" : "展开气泡"}</span>
      </button>
    `;
    item.querySelector(".fabric-warmth-visibility-toggle")?.addEventListener("click", () => {
      if (activeWarmthKeys.has(row.key)) {
        activeWarmthKeys.delete(row.key);
      } else {
        activeWarmthKeys.add(row.key);
      }
      applyWarmthVisibility();
    });
    item.addEventListener("mouseenter", () => {
      hoveredWarmthKey = row.key;
      applyWarmthEmphasis();
    });
    item.addEventListener("mouseleave", () => {
      hoveredWarmthKey = "";
      applyWarmthEmphasis();
    });
    overview.appendChild(item);
  });

  const svg = createSvgElement("svg", {
    class: "fabric-warmth-bubble-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "面料与是否加绒组合的价格、规模和同比气泡图"
  });

  const defs = createSvgElement("defs");
  const shadowFilter = createSvgElement("filter", {
    id: "fabric-warmth-bubble-shadow",
    x: "-35%",
    y: "-35%",
    width: "170%",
    height: "170%"
  });
  shadowFilter.appendChild(
    createSvgElement("feDropShadow", {
      dx: "0",
      dy: "5",
      stdDeviation: "6",
      "flood-color": "#64748b",
      "flood-opacity": "0.17"
    })
  );
  defs.appendChild(shadowFilter);

  const axisMarker = createSvgElement("marker", {
    id: "fabric-warmth-axis-arrow",
    viewBox: "0 0 10 10",
    refX: "8.2",
    refY: "5",
    markerWidth: "6",
    markerHeight: "6",
    orient: "auto-start-reverse"
  });
  axisMarker.appendChild(
    createSvgElement("path", {
      d: "M 0 0 L 10 5 L 0 10 z",
      fill: "#4b5563"
    })
  );
  defs.appendChild(axisMarker);
  svg.appendChild(defs);

  yTicks.forEach((tick) => {
    const y = scaleWarmthY(tick);
    svg.appendChild(
      createSvgElement("line", {
        x1: margin.left,
        x2: width - margin.right,
        y1: y,
        y2: y,
        class: "gender-price-grid-line"
      })
    );

    const tickLabel = createSvgElement("text", {
      x: margin.left - 10,
      y,
      class: "function-map-svg-tick fabric-warmth-bubble-tick",
      "text-anchor": "end",
      "dominant-baseline": "middle"
    });
    tickLabel.textContent = `${tick}%`;
    svg.appendChild(tickLabel);
  });

  xTicks.forEach((tick) => {
    const x = scaleValue(tick, xMin, xMax, margin.left, width - margin.right);
    svg.appendChild(
      createSvgElement("line", {
        x1: x,
        x2: x,
        y1: margin.top,
        y2: height - margin.bottom,
        class: "gender-price-grid-line"
      })
    );

    const xLabel = createSvgElement("text", {
      x,
      y: height - 18,
      class: "function-map-svg-tick fabric-warmth-bubble-tick",
      "text-anchor": "middle",
      "dominant-baseline": "hanging"
    });
    xLabel.textContent = `¥${tick}`;
    svg.appendChild(xLabel);
  });

  const zeroAxisY = scaleWarmthY(0);
  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: height - margin.bottom,
      x2: margin.left,
      y2: margin.top,
      class: "gender-price-axis-line",
      "marker-end": "url(#fabric-warmth-axis-arrow)"
    })
  );
  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: zeroAxisY,
      x2: width - margin.right,
      y2: zeroAxisY,
      class: "gender-price-axis-line",
      "marker-end": "url(#fabric-warmth-axis-arrow)"
    })
  );

  const xAxisTitle = createSvgElement("text", {
    x: margin.left + (width - margin.left - margin.right) / 2,
    y: height - 4,
    class: "function-map-svg-axis-title fabric-warmth-bubble-axis-title",
    "text-anchor": "middle",
    "dominant-baseline": "hanging"
  });
  xAxisTitle.textContent = "Price";
  svg.appendChild(xAxisTitle);

  const yAxisTitle = createSvgElement("text", {
    x: 15,
    y: margin.top + (height - margin.top - margin.bottom) / 2,
    class: "function-map-svg-axis-title fabric-warmth-bubble-axis-title",
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    transform: `rotate(-90 15 ${margin.top + (height - margin.top - margin.bottom) / 2})`
  });
  yAxisTitle.textContent = "YOY%";
  svg.appendChild(yAxisTitle);

  const sortedBubbles = [...bubbleRows].sort((a, b) => b.gmv25 - a.gmv25);
  sortedBubbles.forEach((row, index) => {
    const cx = scaleValue(row.avgDealPrice25, xMin, xMax, margin.left, width - margin.right);
    const baseRadius = scaleSqrtValue(row.gmv25, 0, bubbleMax, 8, 22);
    const radius =
      row.share25 <= 5
        ? baseRadius * 0.56
        : row.share25 <= 10
          ? baseRadius * 0.72
          : row.share25 <= 15
            ? baseRadius * 0.86
            : baseRadius;
    const rawYoy = Number.isFinite(row.yoy) ? row.yoy : 0;
    const cappedYoy = Math.max(-50, Math.min(500, rawYoy));
    const rawCy = scaleWarmthY(cappedYoy);
    const pointOffsetYMap = {
      "textured__fleece": -14,
      "wool__fleece": -20
    };
    const pointOffsetY = pointOffsetYMap[row.key] ?? 0;
    const topOverflowAllowanceMap = {
      "textured__fleece": 10,
      "wool__fleece": 18
    };
    const minCy = margin.top + radius - (topOverflowAllowanceMap[row.key] ?? -4);
    const cy = Math.max(
      minCy,
      Math.min(height - margin.bottom - radius - 4, rawCy + pointOffsetY)
    );
    const yoyClass =
      row.yoyLabel === "n/a" ? "is-neutral" : row.yoyLabel.startsWith("-") ? "is-negative" : "is-positive";
    const labelPlacementMap = {
      "smooth__fleece": { anchor: "middle", x: cx, labelY: cy - radius - 16, yoyOffset: 13 },
      "smooth__non-fleece": {
        anchor: "end",
        x: cx - radius - 10,
        labelY: cy - 1,
        yoyOffset: 13
      },
      "textured__fleece": { anchor: "middle", x: cx, labelY: cy + radius + 12, yoyOffset: 13 },
      "brushed__fleece": { anchor: "start", x: cx + radius + 6, labelY: cy - radius - 12, yoyOffset: 13 },
      "wool__fleece": { anchor: "end", x: cx - radius - 14, labelY: cy - 2, yoyOffset: 13 },
      "wool__non-fleece": { anchor: "start", x: cx + radius + 12, labelY: cy - 2, yoyOffset: 13 },
      "brushed__non-fleece": { anchor: "start", x: cx + radius + 12, labelY: cy - 2, yoyOffset: 13 },
      "textured__non-fleece": { anchor: "middle", x: cx, labelY: cy + radius + 16, yoyOffset: 13 }
    };
    const defaultLabelToRight = cx < width * 0.58;
    const defaultLabelOffset = radius + 30;
    const defaultRawLabelX = defaultLabelToRight ? cx + defaultLabelOffset : cx - defaultLabelOffset;
    const defaultLabelX = Math.max(margin.left + 32, Math.min(width - margin.right + 20, defaultRawLabelX));
    const placement = labelPlacementMap[row.key] ?? {
      anchor: "middle",
      x: defaultLabelX,
      labelY: cy - 1,
      yoyOffset: 13
    };

    const gradient = createSvgElement("radialGradient", {
      id: `fabric-warmth-bubble-gradient-${index}`,
      cx: "35%",
      cy: "30%",
      r: "78%"
    });
    gradient.appendChild(createStop("0%", "#ffffff", 0.78));
    gradient.appendChild(createStop("46%", row.color, 0.82));
    gradient.appendChild(createStop("100%", row.color, 0.98));
    defs.appendChild(gradient);

    const bubbleGroup = createSvgElement("g", {
      class: "fabric-warmth-bubble-node",
      "data-warmth-key": row.warmthKey
    });

    const bubble = createSvgElement("circle", {
      cx,
      cy,
      r: radius,
      fill: `url(#fabric-warmth-bubble-gradient-${index})`,
      stroke: row.color,
      "stroke-width": 1.25,
      filter: "url(#fabric-warmth-bubble-shadow)",
      class: "fabric-warmth-bubble-core"
    });
    bubbleGroup.appendChild(bubble);

    const bubbleLabel = createSvgElement("text", {
      x: placement.x,
      y: placement.labelY,
      class: "fabric-warmth-bubble-label",
      "text-anchor": placement.anchor
    });
    bubbleLabel.textContent =
      lang === "en"
        ? `${shortFabricLabelMapEn[row.fabricKey] ?? row.fabricLabelEn ?? row.fabricLabel} X ${warmthLabelMapEn[row.warmthKey] ?? row.warmthLabelEn ?? row.warmthLabel}`
        : `${shortFabricLabelMap[row.fabricKey] ?? row.fabricLabel} X ${warmthLabelMap[row.warmthKey] ?? row.warmthLabel}`;
    bubbleGroup.appendChild(bubbleLabel);

    bubbleGroup.addEventListener("mouseenter", (event) => {
      showTooltip(event, row, yoyClass);
    });
    bubbleGroup.addEventListener("mousemove", (event) => {
      updateTooltipPosition(event);
    });
    bubbleGroup.addEventListener("mouseleave", () => {
      hideTooltip();
    });
    svg.appendChild(bubbleGroup);
  });

  const chartStage = document.createElement("div");
  chartStage.className = "fabric-warmth-bubble-stage";
  const tooltip = document.createElement("div");
  tooltip.className = "fabric-warmth-bubble-tooltip";
  tooltip.setAttribute("aria-hidden", "true");
  chartStage.appendChild(svg);
  const note = document.createElement("p");
  note.className = "fabric-warmth-bubble-note";
  note.textContent = "Bubble Size = GMV";
  chartStage.appendChild(note);
  chartStage.appendChild(tooltip);

  const hideTooltip = () => {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  };

  const updateTooltipPosition = (event) => {
    const stageRect = chartStage.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth || 160;
    const tooltipHeight = tooltip.offsetHeight || 84;
    const desiredLeft = event.clientX - stageRect.left + 14;
    const desiredTop = event.clientY - stageRect.top - tooltipHeight - 12;
    const boundedLeft = Math.max(8, Math.min(stageRect.width - tooltipWidth - 8, desiredLeft));
    const fallbackTop = event.clientY - stageRect.top + 16;
    const boundedTop = desiredTop < 8 ? fallbackTop : desiredTop;
    tooltip.style.left = `${boundedLeft}px`;
    tooltip.style.top = `${Math.max(8, Math.min(stageRect.height - tooltipHeight - 8, boundedTop))}px`;
  };

  const showTooltip = (event, row, yoyClass) => {
    const comboLabel =
      lang === "en"
        ? `${shortFabricLabelMapEn[row.fabricKey] ?? row.fabricLabelEn ?? row.fabricLabel} X ${warmthLabelMapEn[row.warmthKey] ?? row.warmthLabelEn ?? row.warmthLabel}`
        : `${shortFabricLabelMap[row.fabricKey] ?? row.fabricLabel} X ${warmthLabelMap[row.warmthKey] ?? row.warmthLabel}`;
    tooltip.innerHTML = `
      <div class="fabric-warmth-bubble-tooltip-title">${comboLabel}</div>
      <div class="fabric-warmth-bubble-tooltip-row">
        <span>${lang === "en" ? "GMV Share" : "GMV占比"}</span>
        <strong>${row.share25Label}</strong>
      </div>
      <div class="fabric-warmth-bubble-tooltip-row">
        <span>YOY%</span>
        <strong class="${yoyClass}">${row.yoyLabel}</strong>
      </div>
      <div class="fabric-warmth-bubble-tooltip-row">
        <span>${lang === "en" ? "ATV" : "成交均价"}</span>
        <strong>${row.avgDealPrice25Label}</strong>
      </div>
    `;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    updateTooltipPosition(event);
  };

  const applyWarmthVisibility = () => {
    svg.querySelectorAll(".fabric-warmth-bubble-node[data-warmth-key]").forEach((node) => {
      const isVisible = activeWarmthKeys.has(node.dataset.warmthKey ?? "");
      node.classList.toggle("is-hidden", !isVisible);
    });
    root.querySelectorAll(".fabric-warmth-visibility-toggle[data-warmth-key]").forEach((button) => {
      const isVisible = activeWarmthKeys.has(button.dataset.warmthKey ?? "");
      button.classList.toggle("is-active", !isVisible);
      button.setAttribute("aria-pressed", String(!isVisible));
      const label = button.querySelector(".fabric-warmth-visibility-button-text");
      if (label) {
        label.textContent = lang === "en" ? (isVisible ? "Show" : "Hide") : isVisible ? "展开气泡" : "隐藏气泡";
      }
    });
    applyWarmthEmphasis();
  };

  const applyWarmthEmphasis = () => {
    const hasHover = Boolean(hoveredWarmthKey);
    svg.querySelectorAll(".fabric-warmth-bubble-node[data-warmth-key]").forEach((node) => {
      const nodeWarmthKey = node.dataset.warmthKey ?? "";
      const isVisible = activeWarmthKeys.has(nodeWarmthKey);
      const isTarget = hasHover && nodeWarmthKey === hoveredWarmthKey;
      node.classList.toggle("is-emphasized", isVisible && isTarget);
      node.classList.toggle("is-dimmed", isVisible && hasHover && !isTarget);
    });
    overview.querySelectorAll(".fabric-warmth-kpi-card[data-warmth-key]").forEach((card) => {
      const cardWarmthKey = card.dataset.warmthKey ?? "";
      card.classList.toggle("is-hover-linked", hasHover && cardWarmthKey === hoveredWarmthKey);
      card.classList.toggle("is-dimmed", hasHover && cardWarmthKey !== hoveredWarmthKey);
    });
  };
  applyWarmthVisibility();

  root.appendChild(overview);
  root.appendChild(chartStage);

  container.innerHTML = "";
  container.appendChild(root);
}

export function renderFabricFunctionMatrix(container, rows, columns) {
  if (!container) {
    return;
  }

  const lang = document.body.dataset.lang === "en" ? "en" : "zh";
  const root = document.createElement("div");
  root.className = "fabric-function-matrix-root";
  const tooltip = document.createElement("div");
  tooltip.className = "fabric-function-matrix-tooltip";
  tooltip.setAttribute("aria-hidden", "true");

  const note = document.createElement("p");
  note.className = "fabric-function-matrix-note";
  note.textContent = "Cell Value = GMV share with function claim";

  const grid = document.createElement("div");
  grid.className = "fabric-function-matrix-grid";
  grid.style.gridTemplateColumns = `150px repeat(${columns.length}, minmax(0, 1fr))`;

  const corner = document.createElement("div");
  corner.className = "fabric-function-matrix-corner";
  corner.innerHTML = `
    <span>Fabric</span>
    <em>/</em>
    <span>Function</span>
  `;
  grid.appendChild(corner);

  columns.forEach((column) => {
    const header = document.createElement("div");
    header.className = "fabric-function-matrix-column";
    header.innerHTML = `
      <strong>${column.label}</strong>
      <small>${column.labelEn}</small>
    `;
    grid.appendChild(header);
  });

  rows.forEach((row) => {
    const rowHeader = document.createElement("div");
    rowHeader.className = "fabric-function-matrix-row-header";
    rowHeader.innerHTML = `
      <div class="fabric-function-matrix-row-head">
        <span class="fabric-function-matrix-row-dot" style="background:${row.color};"></span>
        <strong>${lang === "en" ? row.labelEn : row.label}</strong>
      </div>
      <div class="fabric-function-matrix-row-meta">
        ${lang === "en" ? "" : `<span>${row.labelEn}</span>`}
        <span>${lang === "en" ? row.functionConclusionEn ?? row.functionConclusion : row.functionConclusion}</span>
      </div>
    `;
    grid.appendChild(rowHeader);

    row.cells.forEach((cell) => {
      const cellNode = document.createElement("div");
      const levelClass =
        cell.share >= 50 ? "is-strong" : cell.share >= 25 ? "is-medium" : cell.share > 0 ? "is-light" : "is-zero";
      const isElevatedMedium = levelClass === "is-medium" && cell.share > 30;
      const intensity =
        levelClass === "is-strong"
          ? Math.max(0.38, Math.min(0.76, 0.28 + cell.share / 100 * 0.58))
          : levelClass === "is-medium"
            ? Math.max(0.24, Math.min(0.58, 0.16 + cell.share / 100 * 0.52 + (cell.share > 30 ? 0.035 : 0)))
            : levelClass === "is-light"
              ? Math.max(0.08, Math.min(0.22, 0.04 + cell.share / 100 * 0.34))
              : 0.04;
      const borderAlpha =
        levelClass === "is-strong"
          ? Math.min(0.78, intensity + 0.2)
          : levelClass === "is-medium"
            ? Math.min(0.62, intensity + 0.18)
            : levelClass === "is-light"
              ? Math.min(0.42, intensity + 0.14)
              : 0.16;
      cellNode.className = `fabric-function-matrix-cell ${levelClass}${isElevatedMedium ? " is-medium-elevated" : ""}`;
      cellNode.style.background = hexToRgba(row.color, intensity);
      cellNode.style.borderColor = hexToRgba(row.color, borderAlpha);
      cellNode.innerHTML = `
        <strong>${cell.shareLabel}</strong>
        <small>${cell.share >= 50 ? (lang === "en" ? "Strong" : "强表达") : cell.share >= 25 ? (lang === "en" ? "Perceptible" : "可感知") : cell.share > 0 ? (lang === "en" ? "Low" : "弱表达") : "-"}</small>
      `;
      if (cell.share > 0) {
        cellNode.addEventListener("mouseenter", (event) => {
          showTooltip(event, cell);
        });
        cellNode.addEventListener("mousemove", (event) => {
          updateTooltipPosition(event);
        });
        cellNode.addEventListener("mouseleave", () => {
          hideTooltip();
        });
      }
      grid.appendChild(cellNode);
    });
  });

  const hideTooltip = () => {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  };

  const updateTooltipPosition = (event) => {
    const rootRect = root.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth || 132;
    const tooltipHeight = tooltip.offsetHeight || 52;
    const desiredLeft = event.clientX - rootRect.left + 14;
    const desiredTop = event.clientY - rootRect.top - tooltipHeight - 12;
    const boundedLeft = Math.max(8, Math.min(rootRect.width - tooltipWidth - 8, desiredLeft));
    const fallbackTop = event.clientY - rootRect.top + 16;
    const boundedTop = desiredTop < 8 ? fallbackTop : desiredTop;
    tooltip.style.left = `${boundedLeft}px`;
    tooltip.style.top = `${Math.max(8, Math.min(rootRect.height - tooltipHeight - 8, boundedTop))}px`;
  };

  const showTooltip = (event, cell) => {
    tooltip.innerHTML = `
      <div class="fabric-function-matrix-tooltip-row">
        <span>YOY%</span>
        <strong class="${getYoyClass(cell.yoyLabel)}">${cell.yoyLabel}</strong>
      </div>
    `;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    updateTooltipPosition(event);
  };

  root.appendChild(grid);
  root.appendChild(note);
  root.appendChild(tooltip);
  container.innerHTML = "";
  container.appendChild(root);
}

function getSilhouetteGenderToken(gender) {
  if (gender === "女") {
    return {
      label: "Female",
      short: "F",
      className: "is-female"
    };
  }

  if (gender === "男") {
    return {
      label: "Male",
      short: "M",
      className: "is-male"
    };
  }

  return {
    label: "Unisex",
    short: "U",
    className: "is-unisex"
  };
}

function formatSilhouetteFitLabel(fit) {
  if (fit === "tight紧身") {
    return "Tight";
  }

  if (fit === "slim修身") {
    return "Slim";
  }

  if (fit === "regular合体") {
    return "Regular";
  }

  if (fit === "Active运动版型") {
    return "Active";
  }

  if (fit === "loose宽松") {
    return "Loose";
  }

  return fit;
}

function formatSilhouetteLengthLabel(length) {
  if (length === "crop短款") {
    return "Crop";
  }

  if (length === "semi-crop短款") {
    return "Semi‑Crop";
  }

  if (length === "regular常规") {
    return "Regular";
  }

  return length;
}

const SILHOUETTE_COMPARE_IMAGE_MAP = {
  "女__slim修身__regular常规": "../pic/Female_Slim X Regular.jpg",
  "女__Active运动版型__regular常规": "../pic/Female_Active X Regular.jpg",
  "女__regular合体__regular常规": "../pic/Female_Regular X Regular.jpg",
  "女__slim修身__semi-crop短款": "../pic/Female_Slim X Semi-Crop.jpg",
  "女__loose宽松__semi-crop短款": "../pic/Female_Loose X Semi-Crop.jpg",
  "女__loose宽松__regular常规": "../pic/Female_Loose X Regular.jpg",
  "女__regular合体__semi-crop短款": "../pic/Female_Regular X Semi-Crop.jpg",
  "男__regular合体__regular常规": "../pic/Male_Regular X Regular.jpg",
  "男__Active运动版型__regular常规": "../pic/Male_Active X Regular.jpg",
  "男__slim修身__regular常规": "../pic/Male_Slim X Regular.jpg"
};

function ensureSilhouetteCompareLightbox() {
  let modal = document.querySelector("#silhouetteCompareLightbox");
  if (modal instanceof HTMLElement && modal.__silhouetteCompareLightboxApi) {
    return modal.__silhouetteCompareLightboxApi;
  }

  modal = document.createElement("div");
  modal.id = "silhouetteCompareLightbox";
  modal.className = "silhouette-compare-lightbox";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="silhouette-compare-lightbox-backdrop" data-silhouette-lightbox-close="true"></div>
    <div class="silhouette-compare-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Silhouette image preview">
      <button type="button" class="silhouette-compare-lightbox-close" aria-label="Close image preview" data-silhouette-lightbox-close="true">Close</button>
      <button type="button" class="silhouette-compare-lightbox-nav is-prev" aria-label="Previous image">‹</button>
      <div class="silhouette-compare-lightbox-media-wrap">
        <img class="silhouette-compare-lightbox-media" alt="">
      </div>
      <button type="button" class="silhouette-compare-lightbox-nav is-next" aria-label="Next image">›</button>
      <div class="silhouette-compare-lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const media = modal.querySelector(".silhouette-compare-lightbox-media");
  const caption = modal.querySelector(".silhouette-compare-lightbox-caption");
  const prevButton = modal.querySelector(".silhouette-compare-lightbox-nav.is-prev");
  const nextButton = modal.querySelector(".silhouette-compare-lightbox-nav.is-next");
  let items = [];
  let currentIndex = 0;

  const render = () => {
    if (!(media instanceof HTMLImageElement) || !(caption instanceof HTMLElement) || !items.length) {
      return;
    }

    const active = items[currentIndex];
    media.src = active.src;
    media.alt = active.label || "Silhouette preview";
    caption.textContent = active.label || "";

    if (prevButton instanceof HTMLButtonElement) {
      prevButton.disabled = items.length <= 1;
    }

    if (nextButton instanceof HTMLButtonElement) {
      nextButton.disabled = items.length <= 1;
    }
  };

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove("has-silhouette-compare-lightbox-open");
    if (media instanceof HTMLImageElement) {
      media.removeAttribute("src");
    }
  };

  const open = (galleryItems, index = 0) => {
    if (!Array.isArray(galleryItems) || !galleryItems.length) {
      return;
    }

    items = galleryItems;
    currentIndex = Math.max(0, Math.min(index, items.length - 1));
    render();
    modal.hidden = false;
    document.body.classList.add("has-silhouette-compare-lightbox-open");
  };

  const step = (direction) => {
    if (items.length <= 1) {
      return;
    }

    currentIndex = (currentIndex + direction + items.length) % items.length;
    render();
  };

  modal.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target) {
      return;
    }

    if (target.closest("[data-silhouette-lightbox-close='true']")) {
      close();
    }
  });

  prevButton?.addEventListener("click", () => step(-1));
  nextButton?.addEventListener("click", () => step(1));

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowLeft") {
      step(-1);
    } else if (event.key === "ArrowRight") {
      step(1);
    }
  });

  const api = { open, close };
  modal.__silhouetteCompareLightboxApi = api;
  return api;
}

export function renderSilhouetteStructureChart(container, rows, meta = {}) {
  if (!container) {
    return;
  }

  if (container.__silhouetteStructureCleanup) {
    container.__silhouetteStructureCleanup();
    container.__silhouetteStructureCleanup = null;
  }

  const fitOrder = ["regular合体", "Active运动版型", "slim修身", "loose宽松"];
  const lengthOrder = ["regular常规", "semi-crop短款"];
  const maxShare = Math.max(...rows.map((row) => row.gmvShare), 0);
  const getYoyClass = (label) => {
    if (!label || label === "n/a") {
      return "is-neutral";
    }

    if (label === "new" || label.startsWith("+")) {
      return "is-positive";
    }

    if (label.startsWith("-")) {
      return "is-negative";
    }

    return "is-neutral";
  };
  const renderCell = (row) => {
    if (!row || row.count === 0 || !row.dominantGender) {
      return `
        <div class="silhouette-matrix-cell is-empty">
          <div class="silhouette-matrix-empty">-</div>
        </div>
      `;
    }

    const genderToken = getSilhouetteGenderToken(row.dominantGender);
    const intensity = maxShare > 0 ? Math.max(0.12, row.gmvShare / maxShare) : 0.12;
    const isBlankCell = row.gmvShare < 0.5;
    const isLowShare = row.gmvShare > 0 && row.gmvShare < 5;
    const isEmphasisCell =
      row.length === "regular常规" && (row.fit === "regular合体" || row.fit === "Active运动版型" || row.fit === "slim修身");
    const isMediumEmphasisCell = row.length === "regular常规" && row.fit === "slim修身";
    const ledCopy =
      row.dominantGender === "男"
        ? "Male Led"
        : row.dominantGender === "女"
          ? "Female Led"
          : "Unisex Led";
    const femaleShare = row.genderBreakdown.find((item) => item.gender === "女");
    const maleShare = row.genderBreakdown.find((item) => item.gender === "男");
    const unisexShare = row.genderBreakdown.find((item) => item.gender === "男女");
    const shareAttrs = [
      `data-interactive="true"`,
      `data-fit="${row.fit}"`,
      `data-length="${row.length}"`,
      `data-fit-label="${formatSilhouetteFitLabel(row.fit)}"`,
      `data-length-label="${formatSilhouetteLengthLabel(row.length)}"`,
      femaleShare?.gmv
        ? `data-female-share="${Math.round((femaleShare.gmv / row.gmv) * 100)}%"`
        : "",
      femaleShare?.gmv && femaleShare?.yoyLabel && femaleShare.yoyLabel !== "n/a"
        ? `data-female-yoy="${femaleShare.yoyLabel}"`
        : "",
      maleShare?.gmv
        ? `data-male-share="${Math.round((maleShare.gmv / row.gmv) * 100)}%"`
        : "",
      maleShare?.gmv && maleShare?.yoyLabel && maleShare.yoyLabel !== "n/a"
        ? `data-male-yoy="${maleShare.yoyLabel}"`
        : "",
      unisexShare?.gmv
        ? `data-unisex-share="${Math.round((unisexShare.gmv / row.gmv) * 100)}%"`
        : "",
      unisexShare?.gmv && unisexShare?.yoyLabel && unisexShare.yoyLabel !== "n/a"
        ? `data-unisex-yoy="${unisexShare.yoyLabel}"`
        : ""
    ]
      .filter(Boolean)
      .join(" ");

    if (isBlankCell) {
      return `
        <div class="silhouette-matrix-cell is-empty">
          <div class="silhouette-matrix-empty">-</div>
        </div>
      `;
    }

    return `
      <div class="silhouette-matrix-cell ${genderToken.className}${isLowShare ? " is-low-share" : ""}${isEmphasisCell ? " is-emphasis" : ""}${isMediumEmphasisCell ? " is-medium-emphasis" : ""}" style="--heat-intensity:${intensity.toFixed(3)};" ${shareAttrs}>
        <div class="silhouette-matrix-cell-head">
          <span class="silhouette-matrix-share">${row.gmvShareLabel}</span>
          <span class="silhouette-matrix-yoy ${getYoyClass(row.yoyLabel)}">${row.yoyLabel}</span>
        </div>
        <div class="silhouette-matrix-cell-foot">
          <span class="silhouette-matrix-dominance">${ledCopy}</span>
        </div>
      </div>
    `;
  };

  const bodyMarkup = fitOrder
    .map((fit) => {
      const rowCells = lengthOrder
        .map((length) => renderCell(rows.find((row) => row.fit === fit && row.length === length)))
        .join("");
      return `
        <div class="silhouette-matrix-fit-header">${formatSilhouetteFitLabel(fit)}</div>
        ${rowCells}
      `;
    })
    .join("");

  const totalGmv = rows.reduce((sum, row) => sum + (row.gmv || 0), 0);
  const buildGenderCompareSlots = (gender, limit) =>
    rows
      .map((row) => {
        const genderItem = row.genderBreakdown.find((item) => item.gender === gender);
        const gmv = genderItem?.gmv ?? 0;
        const share = totalGmv > 0 ? (gmv / totalGmv) * 100 : 0;

        return {
          key: `${gender}__${row.fit}__${row.length}`,
          gmv,
          share,
          shareLabel: `${Math.round(share)}%`,
          comboLabel: `${formatSilhouetteFitLabel(row.fit)} X ${formatSilhouetteLengthLabel(row.length)}`,
          imageSrc: SILHOUETTE_COMPARE_IMAGE_MAP[`${gender}__${row.fit}__${row.length}`] || ""
        };
      })
      .filter((item) => item.gmv > 0)
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, limit);

  const femaleCompareSlots = buildGenderCompareSlots("女", 7);
  const maleCompareSlots = buildGenderCompareSlots("男", 3);
  const renderCompareSlot = (slot) => `
    <div class="silhouette-compare-slot" data-silhouette-slot="${slot.key}">
      <button
        type="button"
        class="silhouette-compare-frame${slot.imageSrc ? " silhouette-compare-zoom-trigger has-image" : ""}"
        ${slot.imageSrc ? `data-image-src="${slot.imageSrc}" data-image-label="${slot.comboLabel}" aria-label="放大查看${slot.comboLabel}"` : "disabled aria-hidden=\"true\""}
      >
        ${
          slot.imageSrc
            ? `<img class="silhouette-compare-image" src="${slot.imageSrc}" alt="${slot.comboLabel}">`
            : `<span class="silhouette-compare-frame-ratio">3:4</span>`
        }
      </button>
      <div class="silhouette-compare-share">${slot.shareLabel}</div>
      <div class="silhouette-compare-label">${slot.comboLabel}</div>
    </div>
  `;

  container.innerHTML = `
    <div class="silhouette-structure-wrap" data-view="matrix">
      <div class="silhouette-matrix-view">
        <div class="silhouette-matrix-wrap">
          <div class="gender-breakdown-legend silhouette-matrix-legend">
            <span class="gender-breakdown-legend-item is-static"><span class="gender-breakdown-swatch is-female"></span><span>Female-led</span></span>
            <span class="gender-breakdown-legend-item is-static"><span class="gender-breakdown-swatch is-male"></span><span>Male-led</span></span>
          </div>
          <div class="silhouette-matrix-grid">
            <div class="silhouette-matrix-corner">
              <span class="silhouette-matrix-axis-length">Length</span>
              <span class="silhouette-matrix-axis-fit">Fit</span>
              <span class="silhouette-matrix-axis-diagonal"></span>
            </div>
            ${lengthOrder
              .map(
                (length) => `<div class="silhouette-matrix-length-header">${formatSilhouetteLengthLabel(length)}</div>`
              )
              .join("")}
            ${bodyMarkup}
          </div>
          <div class="silhouette-matrix-note">
            Cell Depth = Y25 GMV
            <br>
            Bottom Tag = Dominant Gender
            <br>
            5 Brands Integrated: DESCENTE, KOLON, LULULEMON, KAILAS and ARC'TERYX
          </div>
        </div>
      </div>
      <div class="silhouette-compare-view" hidden>
        <div class="silhouette-compare-group is-female">
          <div class="silhouette-compare-group-label">Female</div>
          <div class="silhouette-compare-grid is-female">
            ${femaleCompareSlots.map(renderCompareSlot).join("")}
          </div>
        </div>
        <div class="silhouette-compare-group is-male">
          <div class="silhouette-compare-group-label">Male</div>
          <div class="silhouette-compare-grid is-male">
            ${maleCompareSlots.map(renderCompareSlot).join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  const wrap = container.querySelector(".silhouette-structure-wrap");
  const matrixView = container.querySelector(".silhouette-matrix-view");
  const compareView = container.querySelector(".silhouette-compare-view");
  const toggleButton = container.closest(".silhouette-structure-panel")?.querySelector(".silhouette-view-toggle");
  const lightbox = ensureSilhouetteCompareLightbox();

  if (wrap instanceof HTMLElement && matrixView instanceof HTMLElement && compareView instanceof HTMLElement && toggleButton instanceof HTMLButtonElement) {
    const getToggleLabels = () => {
      const currentLang = document.body.dataset.lang === "en" ? "en" : "zh";
      return {
        defaultLabel:
          currentLang === "en"
            ? toggleButton.dataset.defaultLabelEn || "Pictures"
            : toggleButton.dataset.defaultLabel || "查看图片",
        altLabel:
          currentLang === "en"
            ? toggleButton.dataset.altLabelEn || "Matrix"
            : toggleButton.dataset.altLabel || "查看矩阵"
      };
    };

    const applyView = (view) => {
      const nextView = view === "compare" ? "compare" : "matrix";
      const { defaultLabel, altLabel } = getToggleLabels();
      wrap.dataset.view = nextView;
      matrixView.hidden = nextView !== "matrix";
      compareView.hidden = nextView !== "compare";
      toggleButton.textContent = nextView === "compare" ? altLabel : defaultLabel;
      toggleButton.setAttribute("aria-pressed", nextView === "compare" ? "true" : "false");
    };

    const handleToggle = () => {
      applyView(wrap.dataset.view === "compare" ? "matrix" : "compare");
    };

    const zoomTriggers = Array.from(compareView.querySelectorAll(".silhouette-compare-zoom-trigger"));
    const galleryItems = zoomTriggers.map((trigger) => ({
      src: trigger.dataset.imageSrc || "",
      label: trigger.dataset.imageLabel || ""
    }));
    const handleZoomClick = (event) => {
      const trigger = event.currentTarget;
      const index = zoomTriggers.indexOf(trigger);
      if (index < 0) {
        return;
      }

      lightbox.open(galleryItems, index);
    };

    toggleButton.addEventListener("click", handleToggle);
    zoomTriggers.forEach((trigger) => trigger.addEventListener("click", handleZoomClick));
    applyView("matrix");
    container.__silhouetteStructureCleanup = () => {
      toggleButton.removeEventListener("click", handleToggle);
      zoomTriggers.forEach((trigger) => trigger.removeEventListener("click", handleZoomClick));
    };
  }
}

export function renderSilhouetteGrowthChart(container, rows) {
  if (!container) {
    return;
  }

  const validRows = rows.filter(
    (row) => row.length !== "crop短款" && row.genders.some((gender) => gender.count25 > 0)
  );
  if (!validRows.length) {
    container.innerHTML = "";
    return;
  }

  if (container.__silhouetteGrowthCleanup) {
    container.__silhouetteGrowthCleanup();
    container.__silhouetteGrowthCleanup = null;
  }

  const fitPositions = {
    regular合体: -0.52,
    Active运动版型: 0.06,
    slim修身: 0.72,
    loose宽松: 1.3
  };
  const lengthPositions = {
    regular常规: -0.78,
    "semi-crop短款": 0.5
  };
  const genderOffsets = {
    女: { x: -0.08, z: -0.08 },
    男: { x: 0.06, z: 0.03 },
    男女: { x: 0.12, z: 0.1 }
  };
  const axisBaseY = -0.62;
  const points = validRows.flatMap((row) =>
    row.genders
      .filter((genderItem) => {
        if (genderItem.count25 <= 0) {
          return false;
        }

        if (genderItem.gender === "男女") {
          return false;
        }

        if (genderItem.yoyLabel === "new") {
          return false;
        }

        return true;
      })
      .map((genderItem) => {
        const numericYoy =
          genderItem.yoyLabel === "new" ? null : Number(String(genderItem.yoyLabel).replace(/[^\d.-]/g, ""));
        const isFemaleSemiCropRegular =
          genderItem.gender === "女" && row.length === "semi-crop短款" && row.fit === "regular合体";
        const isFemaleSemiCropLoose =
          genderItem.gender === "女" && row.length === "semi-crop短款" && row.fit === "loose宽松";

        let displayX = (lengthPositions[row.length] ?? 0) + (genderOffsets[genderItem.gender]?.x ?? 0);
        let displayZ = (fitPositions[row.fit] ?? 0) + (genderOffsets[genderItem.gender]?.z ?? 0);

        if (isFemaleSemiCropRegular) {
          displayX = 0.9;
          displayZ = -0.18;
        } else if (isFemaleSemiCropLoose) {
          displayX = 0.74;
          displayZ = -0.42;
        }

        return {
          fit: row.fit,
          fitLabel: formatSilhouetteFitLabel(row.fit),
          length: row.length,
          lengthLabel: formatSilhouetteLengthLabel(row.length),
          share: row.share,
          shareLabel: genderItem.gmvShareLabel ?? row.shareLabel,
          gender: genderItem.gender,
          genderLabel: getGenderLabel(genderItem.gender),
          yoyLabel: genderItem.yoyLabel,
          yoyValue: numericYoy,
          gmv25: genderItem.gmv25,
          x: displayX,
          z: displayZ,
          outlierBand: isFemaleSemiCropRegular ? "upper-right" : isFemaleSemiCropLoose ? "upper-mid" : null
        };
      })
  );

  const maxGmv = Math.max(...points.map((point) => point.gmv25));
  const minGmv = Math.min(...points.map((point) => point.gmv25));
  const axisYCap = 100;
  const axisSpan = 1.64;

  const mapY = (point) => {
    if (!Number.isFinite(point.yoyValue)) {
      return null;
    }

    if (point.gender === "女" && point.length === "semi-crop短款" && point.fit === "regular合体") {
      return axisSpan + 0.24;
    }

    if (point.gender === "女" && point.length === "semi-crop短款" && point.fit === "loose宽松") {
      return axisSpan + 0.12;
    }

    if (point.yoyValue > axisYCap) {
      return axisSpan + 0.12;
    }

    if (point.yoyValue < 0) {
      return Math.max(-0.24, (point.yoyValue / axisYCap) * 0.24);
    }

    return (point.yoyValue / axisYCap) * axisSpan;
  };

  points.forEach((point) => {
    point.y = axisBaseY + mapY(point);
  });

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "silhouette-growth-wrap";
  wrap.innerHTML = `
    <div class="gender-breakdown-legend silhouette-growth-legend">
      <button type="button" class="gender-breakdown-legend-item gender-legend-toggle" data-gender="女" aria-pressed="true">
        <span class="gender-breakdown-swatch is-female"></span><span>Female</span>
      </button>
      <button type="button" class="gender-breakdown-legend-item gender-legend-toggle" data-gender="男" aria-pressed="true">
        <span class="gender-breakdown-swatch is-male"></span><span>Male</span>
      </button>
    </div>
    <div class="silhouette-growth-note">Bubble size = GMV</div>
    <div class="silhouette-growth-stage">
      <canvas class="silhouette-growth-canvas" aria-label="可拖动旋转的轮廓增长三维气泡图"></canvas>
    </div>
  `;
  container.appendChild(wrap);

  const stage = wrap.querySelector(".silhouette-growth-stage");
  const canvas = wrap.querySelector(".silhouette-growth-canvas");
  const ctx = canvas.getContext("2d");
  const legendButtons = Array.from(wrap.querySelectorAll(".gender-legend-toggle"));

  const ensureTooltip = () => {
    let tooltip = document.querySelector("#silhouetteGrowthTooltip");
    if (tooltip) {
      return tooltip;
    }

    tooltip = document.createElement("div");
    tooltip.id = "silhouetteGrowthTooltip";
    tooltip.className = "gender-breakdown-tooltip";
    document.body.appendChild(tooltip);
    return tooltip;
  };

  const tooltip = ensureTooltip();
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;
  let currentYaw = -0.88;
  let hoverPoint = null;
  let isDragging = false;
  let dragPointerId = null;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let projectedPoints = [];
  const hiddenGenders = new Set();

  const yoyTicks = [0, 50, 100];
  const fitOrder = ["regular合体", "Active运动版型", "slim修身", "loose宽松"];
  const lengthOrder = ["regular常规", "semi-crop短款"];

  const rotateHorizontal = (point, yaw) => {
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const x1 = point.x * cosYaw + point.z * sinYaw;
    const z1 = -point.x * sinYaw + point.z * cosYaw;

    return { x: x1, y: point.y, z: z1 };
  };

  const projectPoint = (point) => {
    const rotated = rotateHorizontal(point, currentYaw);
    const spreadX = width * 0.19;
    const spreadY = height * 0.245;
    const depthSkewX = width * 0.09;
    const depthSkewY = height * 0.07;
    const centerX = width * 0.545;
    const centerY = height * 0.585;

    return {
      x: centerX + rotated.x * spreadX + rotated.z * depthSkewX,
      y: centerY - rotated.y * spreadY + rotated.z * depthSkewY,
      scale: 1 - rotated.z * 0.045,
      depth: rotated.z
    };
  };

  const projectOutlierPoint = (point) => {
    const rotated = rotateHorizontal(point, currentYaw);
    const spreadX = width * 0.19;
    const depthSkewX = width * 0.09;
    const centerX = width * 0.545;
    const anchorY = point.outlierBand === "upper-right" ? height * 0.25 : height * 0.17;
    const anchorXOffset = point.outlierBand === "upper-right" ? width * 0.19 : width * 0.13;

    return {
      x: centerX + rotated.x * spreadX + rotated.z * depthSkewX + anchorXOffset,
      y: anchorY + rotated.z * 6,
      scale: 0.94 - rotated.z * 0.02,
      depth: rotated.z + 2
    };
  };

  const drawArrow = (from, to) => {
    const headLength = 12;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const getBubbleRadius3d = (point) => {
    if (maxGmv === minGmv) {
      return 20;
    }

    const normalized = Math.sqrt((point.gmv25 - minGmv) / (maxGmv - minGmv));
    const baseRadius = 10 + normalized * 23;
    const isSlightlySmallerPoint =
      (point.gender === "女" &&
        (
          (point.fit === "regular合体" && point.length === "regular常规") ||
          (point.fit === "slim修身" && point.length === "semi-crop短款") ||
          (point.fit === "Active运动版型" && point.length === "regular常规")
        )) ||
      (point.gender === "男" && point.fit === "slim修身" && point.length === "regular常规");

    if (isSlightlySmallerPoint) {
      return baseRadius * 0.88;
    }

    return point.share <= 6 ? baseRadius * 0.76 : baseRadius;
  };

  const drawBubble = (point, projected) => {
    const palette = getGenderBubblePalette(point.gender);
    const radius = getBubbleRadius3d(point) * projected.scale;
    const gradient = ctx.createRadialGradient(
      projected.x - radius * 0.32,
      projected.y - radius * 0.34,
      radius * 0.18,
      projected.x,
      projected.y,
      radius
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.78)");
    gradient.addColorStop(0.24, palette.highlight);
    gradient.addColorStop(0.56, palette.base);
    gradient.addColorStop(1, palette.edge);

    ctx.save();
    if (hoverPoint === point) {
      ctx.shadowColor = palette.shadow;
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
    } else {
      ctx.shadowColor = palette.shadow;
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
    }

    ctx.beginPath();
    ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.lineWidth = hoverPoint === point ? 2.2 : 1.2;
    ctx.strokeStyle = palette.edge;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(projected.x - radius * 0.24, projected.y - radius * 0.28, Math.max(3, radius * 0.22), 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.34)";
    ctx.fill();
    ctx.restore();

    projected.radius = radius;
  };

  const drawLabel = (text, x, y, options = {}) => {
    const { align = "center", baseline = "middle", color = "#111827", size = 12, weight = 700 } = options;
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  const drawScene = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const origin = projectPoint({ x: -1.44, y: axisBaseY, z: -1.28 });
    const xAxisEnd = projectPoint({ x: 1.02, y: axisBaseY, z: -1.28 });
    const zAxisEnd = projectPoint({ x: -1.44, y: axisBaseY, z: 1.38 });
    const yAxisEnd = projectPoint({ x: -1.44, y: axisBaseY + axisSpan + 0.34, z: -1.28 });

    ctx.strokeStyle = "rgba(213, 223, 236, 0.92)";
    ctx.lineWidth = 1;

    lengthOrder.forEach((lengthKey) => {
      const xVal = lengthPositions[lengthKey];
      const front = projectPoint({ x: xVal, y: axisBaseY, z: -1.28 });
      const back = projectPoint({ x: xVal, y: axisBaseY, z: 1.38 });
      ctx.beginPath();
      ctx.moveTo(front.x, front.y);
      ctx.lineTo(back.x, back.y);
      ctx.stroke();
    });

    fitOrder.forEach((fitKey) => {
      const zVal = fitPositions[fitKey];
      const left = projectPoint({ x: -1.44, y: axisBaseY, z: zVal });
      const right = projectPoint({ x: 1.02, y: axisBaseY, z: zVal });
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
    });

    ctx.strokeStyle = "rgba(79, 85, 101, 0.88)";
    ctx.lineWidth = 1.8;
    drawArrow(origin, xAxisEnd);
    drawArrow(origin, zAxisEnd);
    drawArrow(origin, yAxisEnd);

    lengthOrder.forEach((lengthKey) => {
      const xVal = lengthPositions[lengthKey];
      const tick = projectPoint({ x: xVal, y: axisBaseY, z: -1.28 });
      const tickTop = projectPoint({ x: xVal, y: axisBaseY + 0.07, z: -1.28 });
      ctx.beginPath();
      ctx.moveTo(tick.x, tick.y);
      ctx.lineTo(tickTop.x, tickTop.y);
      ctx.stroke();
      drawLabel(formatSilhouetteLengthLabel(lengthKey), tick.x + 12, tick.y - 6, {
        align: "left",
        size: 11,
        color: "#111827",
        weight: 600
      });
    });

    fitOrder.forEach((fitKey) => {
      const zVal = fitPositions[fitKey];
      const tick = projectPoint({ x: -1.44, y: axisBaseY, z: zVal });
      drawLabel(formatSilhouetteFitLabel(fitKey), tick.x - 14, tick.y + 1, {
        align: "right",
        size: 11,
        color: "#111827",
        weight: 600
      });
    });

    yoyTicks.forEach((tickValue) => {
      const tickPoint = projectPoint({
        x: -1.44,
        y: axisBaseY + (tickValue / axisYCap) * axisSpan,
        z: -1.28
      });
      drawLabel(formatPercentTick(tickValue), tickPoint.x + 10, tickPoint.y, {
        align: "left",
        size: 11,
        color: "#111827",
        weight: 600
      });
    });

    drawLabel("Length", xAxisEnd.x + 26, xAxisEnd.y - 2, {
      align: "left",
      size: 12,
      color: "#334155",
      weight: 700
    });
    drawLabel("Fit", zAxisEnd.x - 28, zAxisEnd.y + 14, {
      align: "right",
      size: 12,
      color: "#334155",
      weight: 700
    });

    drawLabel("YOY%", yAxisEnd.x + 10, yAxisEnd.y - 28, {
      size: 12,
      color: "#334155",
      weight: 700
    });

    const visiblePoints = points.filter((point) => !hiddenGenders.has(point.gender));

    const renderedPoints = visiblePoints
      .map((point) => {
        const projected = point.outlierBand ? projectOutlierPoint(point) : projectPoint(point);
        return { point, projected };
      })
      .sort((a, b) => a.projected.depth - b.projected.depth);

    renderedPoints.forEach(({ point, projected }) => drawBubble(point, projected));

    projectedPoints = renderedPoints.map(({ point, projected }) => ({
      point,
      x: projected.x,
      y: projected.y,
      r: projected.radius ?? 12
    }));

    ctx.restore();
  };

  const resizeCanvas = () => {
    const rect = stage.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    drawScene();
  };

  const hideTooltip = () => {
    tooltip.classList.remove("is-visible");
  };

  const showTooltip = (point, clientX, clientY) => {
    const yoyClass =
      point.yoyLabel === "new"
        ? "is-positive"
        : point.yoyLabel.startsWith("+")
          ? "is-positive"
          : point.yoyLabel.startsWith("-")
            ? "is-negative"
            : "is-neutral";

    tooltip.innerHTML = `
      <div class="gender-breakdown-tooltip-title">${point.fitLabel} X ${point.lengthLabel}</div>
      <div class="gender-breakdown-tooltip-line">Gender <strong>${point.genderLabel}</strong></div>
      <div class="gender-breakdown-tooltip-line">GMV Share <strong>${point.shareLabel}</strong></div>
      <div class="gender-breakdown-tooltip-line">YOY% <strong class="${yoyClass}">${point.yoyLabel}</strong></div>
    `;
    tooltip.classList.add("is-visible");
    const rect = tooltip.getBoundingClientRect();
    const nextX = Math.min(clientX + 16, window.innerWidth - rect.width - 16);
    const nextY = Math.min(clientY + 16, window.innerHeight - rect.height - 16);
    tooltip.style.left = `${Math.max(12, nextX)}px`;
    tooltip.style.top = `${Math.max(12, nextY)}px`;
  };

  const pickPoint = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const hit = [...projectedPoints]
      .sort((a, b) => b.r - a.r)
      .find((item) => Math.hypot(item.x - x, item.y - y) <= item.r + 6);

    return hit?.point ?? null;
  };

  const handlePointerDown = (event) => {
    isDragging = true;
    dragPointerId = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    canvas.classList.add("is-dragging");
    canvas.setPointerCapture?.(event.pointerId);
    hideTooltip();
  };

  const handlePointerMove = (event) => {
    if (isDragging && dragPointerId === event.pointerId) {
      const deltaX = event.clientX - lastPointerX;
      lastPointerX = event.clientX;
      currentYaw += deltaX * 0.008;
      hoverPoint = null;
      drawScene();
      return;
    }

    const picked = pickPoint(event.clientX, event.clientY);
    if (picked !== hoverPoint) {
      hoverPoint = picked;
      drawScene();
    }

    if (picked) {
      showTooltip(picked, event.clientX, event.clientY);
    } else {
      hideTooltip();
    }
  };

  const endDrag = () => {
    isDragging = false;
    dragPointerId = null;
    canvas.classList.remove("is-dragging");
  };

  const handlePointerUp = () => {
    endDrag();
  };

  const handlePointerLeave = () => {
    endDrag();
    hoverPoint = null;
    drawScene();
    hideTooltip();
  };

  const syncLegendState = () => {
    legendButtons.forEach((button) => {
      const gender = button.dataset.gender;
      const isVisible = !hiddenGenders.has(gender);
      button.setAttribute("aria-pressed", isVisible ? "true" : "false");
    });
  };

  const handleLegendToggle = (event) => {
    const button = event.currentTarget;
    const gender = button.dataset.gender;
    if (!gender) {
      return;
    }

    if (hiddenGenders.has(gender)) {
      hiddenGenders.delete(gender);
    } else {
      hiddenGenders.add(gender);
    }

    hoverPoint = hoverPoint && hiddenGenders.has(hoverPoint.gender) ? null : hoverPoint;
    hideTooltip();
    syncLegendState();
    drawScene();
  };

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(stage);

  legendButtons.forEach((button) => button.addEventListener("click", handleLegendToggle));
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);
  canvas.addEventListener("pointerleave", handlePointerLeave);

  syncLegendState();
  resizeCanvas();

  container.__silhouetteGrowthCleanup = () => {
    resizeObserver.disconnect();
    legendButtons.forEach((button) => button.removeEventListener("click", handleLegendToggle));
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointercancel", handlePointerUp);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
    hideTooltip();
  };
}

function formatPriceTick(value) {
  return `¥${Math.round(value)}`;
}

function getGenderLabel(gender) {
  if (gender === "女") {
    return "Female";
  }

  if (gender === "男") {
    return "Male";
  }

  return "Unisex";
}

export function renderGenderBreakdownPriceBubbleChart(container, rows) {
  if (!container) {
    return;
  }

  const validRows = rows.filter(
    (row) =>
      row.avgDealPrice > 0 &&
      row.gmv > 0 &&
      row.yoyMetric !== null &&
      Number.isFinite(row.yoyMetric) &&
      !(row.brand === "KOLON SPORT/可隆" && row.gender === "男女")
  );
  if (!validRows.length) {
    container.innerHTML = "";
    return;
  }

  const width = 760;
  const height = 442;
  const margin = { top: 62, right: 18, bottom: 68, left: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const prices = validRows.map((row) => row.avgDealPrice);
  const yoyValues = validRows.map((row) => row.yoyMetric);
  const gmvValues = validRows.map((row) => row.gmv);
  const xMin = 400;
  const xMax = 1800;
  const xTickValues = [400, 800, 1200, 1600, 1800];
  const yMin = Math.min(-50, Math.floor(Math.min(...yoyValues) / 25) * 25);
  const yMax = Math.ceil(Math.max(...yoyValues) / 25) * 25;
  const gmvMin = Math.min(...gmvValues);
  const gmvMax = Math.max(...gmvValues);

  const yTickValues = Array.from(
    new Set(
      [yMin, 0, 50, 100, 150].filter((value) => value >= yMin && value <= yMax)
    )
  ).sort((a, b) => a - b);

  const svg = createSvgElement("svg", {
    class: "gender-price-bubble-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "品牌性别与成交价格气泡图"
  });
  const overlay = createChartOverlay();

  const defs = createSvgElement("defs");
  const shadowFilter = createSvgElement("filter", {
    id: "gender-price-bubble-shadow",
    x: "-35%",
    y: "-35%",
    width: "170%",
    height: "170%"
  });
  shadowFilter.appendChild(
    createSvgElement("feDropShadow", {
      dx: "0",
      dy: "6",
      stdDeviation: "7",
      "flood-color": "#94a3b8",
      "flood-opacity": "0.16"
    })
  );
  defs.appendChild(shadowFilter);

  validRows.forEach((row, index) => {
    const palette = getGenderBubblePalette(row.gender);
    const gradient = createSvgElement("radialGradient", {
      id: `gender-bubble-gradient-${index}`,
      cx: "36%",
      cy: "30%",
      r: "76%"
    });
    gradient.appendChild(createStop("0%", palette.highlight, 0.96));
    gradient.appendChild(createStop("42%", palette.base, 0.90));
    gradient.appendChild(createStop("100%", palette.edge, 0.98));
    defs.appendChild(gradient);
  });
  svg.appendChild(defs);

  xTickValues.forEach((xValue) => {
    const x = scaleValue(xValue, xMin, xMax, margin.left, margin.left + plotWidth);
    svg.appendChild(
      createSvgElement("line", {
        x1: x,
        y1: margin.top,
        x2: x,
        y2: margin.top + plotHeight,
        class: "gender-price-grid-line"
      })
    );

    overlay.appendChild(
      createChartOverlayText({
        className: "chart-overlay-tick is-x",
        text: formatPriceTick(xValue),
        x,
        y: margin.top + plotHeight + 24,
        width,
        height,
        anchor: "middle",
        valign: "top"
      })
    );
  });

  yTickValues.forEach((tickValue) => {
    const y = scaleValue(tickValue, yMin, yMax, margin.top + plotHeight, margin.top);
    svg.appendChild(
      createSvgElement("line", {
        x1: margin.left,
        y1: y,
        x2: margin.left + plotWidth,
        y2: y,
        class: "gender-price-grid-line"
      })
    );

    overlay.appendChild(
      createChartOverlayText({
        className: "chart-overlay-tick is-y",
        text: formatPercentTick(tickValue),
        x: margin.left - 12,
        y,
        width,
        height,
        anchor: "end",
        valign: "middle"
      })
    );
  });

  const yZero = yMin <= 0 && yMax >= 0
    ? scaleValue(0, yMin, yMax, margin.top + plotHeight, margin.top)
    : margin.top + plotHeight;

  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: yZero,
      x2: margin.left + plotWidth,
      y2: yZero,
      class: "gender-price-axis-line"
    })
  );

  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: margin.top + plotHeight,
      x2: margin.left,
      y2: margin.top,
      class: "gender-price-axis-line"
    })
  );

  const arrowSize = 10;
  const xArrow = createSvgElement("path", {
    d: `M ${margin.left + plotWidth - arrowSize} ${yZero - arrowSize * 0.6}
        L ${margin.left + plotWidth} ${yZero}
        L ${margin.left + plotWidth - arrowSize} ${yZero + arrowSize * 0.6}`,
    class: "gender-price-axis-arrow"
  });
  svg.appendChild(xArrow);

  const yArrow = createSvgElement("path", {
    d: `M ${margin.left - arrowSize * 0.6} ${margin.top + arrowSize}
        L ${margin.left} ${margin.top}
        L ${margin.left + arrowSize * 0.6} ${margin.top + arrowSize}`,
    class: "gender-price-axis-arrow"
  });
  svg.appendChild(yArrow);

  overlay.appendChild(
    createChartOverlayText({
      className: "chart-overlay-axis-title is-x",
      text: document.body.dataset.lang === "en" ? "Price" : "成交价格",
      x: margin.left + plotWidth / 2,
      y: height - 18,
      width,
      height,
      anchor: "middle",
      valign: "top"
    })
  );

  overlay.appendChild(
    createChartOverlayText({
      className: "chart-overlay-axis-title is-y",
      text: "YOY%",
      x: 6,
      y: margin.top + plotHeight / 2,
      width,
      height,
      anchor: "middle",
      valign: "middle"
    })
  );

  const labelOffsetMap = {
    "DESCENTE/迪桑特__女": { dx: 0, dy: -18, anchor: "middle" },
    "DESCENTE/迪桑特__男": { dx: 14, dy: -10, anchor: "start" },
    "KOLON SPORT/可隆__女": { dx: 0, dy: -16, anchor: "middle" },
    "KOLON SPORT/可隆__男": { dx: 16, dy: 4, anchor: "start" },
    "KOLON SPORT/可隆__男女": { dx: 0, dy: -16, anchor: "middle" },
    "LULULEMON/露露乐蒙__女": { dx: 16, dy: -8, anchor: "start" },
    "LULULEMON/露露乐蒙__男": { dx: 16, dy: -8, anchor: "start" },
    "KAILAS/凯乐石__女": { dx: -14, dy: 18, anchor: "end" },
    "KAILAS/凯乐石__男": { dx: 0, dy: -16, anchor: "middle" },
    "ARC'TERYX/始祖鸟__女": { dx: -14, dy: -8, anchor: "end" },
    "ARC'TERYX/始祖鸟__男": { dx: -16, dy: -8, anchor: "end" }
  };

  validRows.forEach((row, index) => {
    const cx = scaleValue(row.avgDealPrice, xMin, xMax, margin.left, margin.left + plotWidth);
    const cy = scaleValue(row.yoyMetric, yMin, yMax, margin.top + plotHeight, margin.top);
    const r = getCompactBubbleRadius(row.gmv, gmvMin, gmvMax);
    const palette = getGenderBubblePalette(row.gender);

    const nodeGroup = createSvgElement("g", {
      class: "gender-price-node",
      "data-brand": row.brand,
      "data-gender": row.gender,
      "data-price": `${Math.round(row.avgDealPrice)}`,
      "data-yoy": row.yoyLabel,
      "data-gender-label": getGenderLabel(row.gender),
      tabindex: "0"
    });

    const bubble = createSvgElement("circle", {
      cx,
      cy,
      r,
      fill: `url(#gender-bubble-gradient-${index})`,
      stroke: palette.edge,
      "stroke-width": 1.35,
      filter: "url(#gender-price-bubble-shadow)",
      class: "gender-price-bubble-core"
    });
    nodeGroup.appendChild(bubble);

    const highlight = createSvgElement("circle", {
      cx: cx - r * 0.28,
      cy: cy - r * 0.34,
      r: Math.max(4, r * 0.34),
      fill: "rgba(255,255,255,0.42)",
      class: "gender-price-bubble-highlight"
    });
    nodeGroup.appendChild(highlight);

    const labelKey = `${row.brand}__${row.gender}`;
    const labelOffset = labelOffsetMap[labelKey] ?? { dx: 12, dy: -8, anchor: "start" };
    svg.appendChild(nodeGroup);

    overlay.appendChild(
      createChartOverlayText({
        className: "chart-overlay-label is-brand gender-price-label-overlay",
        text: row.brandLabel,
        x: cx + labelOffset.dx,
        y: cy + labelOffset.dy,
        width,
        height,
        anchor: labelOffset.anchor,
        valign: labelOffset.dy > 0 ? "top" : "bottom",
        dataset: {
          brand: row.brand,
          gender: row.gender
        }
      })
    );
  });

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "gender-price-bubble-wrap";
  wrap.innerHTML = `
    <div class="gender-breakdown-legend gender-price-legend">
      <button type="button" class="gender-breakdown-legend-item gender-legend-toggle" data-gender="女" aria-pressed="true">
        <span class="gender-breakdown-swatch is-female"></span>
        <span>Female</span>
      </button>
      <button type="button" class="gender-breakdown-legend-item gender-legend-toggle" data-gender="男" aria-pressed="true">
        <span class="gender-breakdown-swatch is-male"></span>
        <span>Male</span>
      </button>
    </div>
    <div class="gender-price-size-note">Bubble size = GMV</div>
  `;
  wrap.appendChild(svg);
  wrap.appendChild(overlay);
  container.appendChild(wrap);
}

export function renderBrandCompareRadarChart(container, radar) {
  if (!container || !radar?.axes?.length || !radar?.series?.length) {
    return;
  }
  const lang = document.body?.dataset.lang === "en" ? "en" : "zh";

  const width = 352;
  const height = 278;
  const centerX = width / 2;
  const centerY = 110;
  const radius = 84;
  const levels = [0.25, 0.5, 0.75, 1];

  const polarPoint = (ratio, angleDeg) => {
    const angle = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: centerX + Math.cos(angle) * radius * ratio,
      y: centerY + Math.sin(angle) * radius * ratio
    };
  };

  const pointsToString = (points) => points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const seriesByBrand = new Map(radar.series.map((series, index) => [series.brand, { ...series, gradientIndex: index }]));
  const hiddenBrands = new Set();
  let visibleOrder = radar.series.map((series) => series.brand);
  const getRadarAxisLabelLines = (axis) => {
    if (lang !== "en") {
      return [axis.label];
    }

    if (axis.key === "functionPenetration") {
      return ["Function", "penetration"];
    }

    if (axis.key === "femaleOpportunity") {
      return ["Female", "opportunity"];
    }

    if (axis.key === "maleOpportunity") {
      return ["Male", "opportunity"];
    }

    if (axis.key === "layoutDepth") {
      return ["Layout", "depth"];
    }

    return [axis.labelEn ?? axis.label];
  };

  const svg = createSvgElement("svg", {
    class: "bubble-chart-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "品牌对比雷达图"
  });

  const defs = createSvgElement("defs");
  radar.series.forEach((series, index) => {
    const gradient = createSvgElement("linearGradient", {
      id: `brand-compare-radar-fill-${index}`,
      x1: "0%",
      y1: "0%",
      x2: "0%",
      y2: "100%"
    });
    gradient.appendChild(createStop("0%", series.color, 0.18));
    gradient.appendChild(createStop("100%", series.color, 0.04));
    defs.appendChild(gradient);
  });
  svg.appendChild(defs);

  levels.forEach((level) => {
    const ringPoints = radar.axes.map((_, index) => polarPoint(level, (360 / radar.axes.length) * index));
    const ring = createSvgElement("polygon", {
      points: pointsToString(ringPoints),
      fill: "none",
      stroke: "rgba(203, 213, 225, 0.9)",
      "stroke-width": "1"
    });
    svg.appendChild(ring);
  });

  radar.axes.forEach((axis, index) => {
    const angle = (360 / radar.axes.length) * index;
    const axisPoint = polarPoint(1, angle);
    const line = createSvgElement("line", {
      x1: centerX,
      y1: centerY,
      x2: axisPoint.x,
      y2: axisPoint.y,
      stroke: "rgba(203, 213, 225, 0.95)",
      "stroke-width": "1"
    });
    svg.appendChild(line);

    const labelRatio =
      axis.key === "femaleOpportunity"
        ? 1.28
        : axis.key === "maleOpportunity"
          ? 1.2
          : 1.16;
    const labelPoint = polarPoint(labelRatio, angle);
    const label = createSvgElement("text", {
      x: labelPoint.x,
      y: axis.key === "layoutDepth" && lang === "en" ? labelPoint.y - 8 : labelPoint.y,
      "text-anchor": labelPoint.x < centerX - 8 ? "end" : labelPoint.x > centerX + 8 ? "start" : "middle",
      class: "competitor-function-radar-label"
    });
    const labelLines = getRadarAxisLabelLines(axis);
    const baseX = String(labelPoint.x);
    labelLines.forEach((line, lineIndex) => {
      const tspan = createSvgElement("tspan", {
        x: baseX,
        dy: lineIndex === 0 ? "0" : "1.15em"
      });
      tspan.textContent = line;
      label.appendChild(tspan);
    });
    svg.appendChild(label);
  });

  const seriesLayer = createSvgElement("g", {
    class: "brand-compare-radar-series-layer"
  });
  svg.appendChild(seriesLayer);

  const legend = document.createElement("div");
  legend.className = "compare-radar-legend";
  const legendButtons = new Map();

  const renderSeriesLayer = () => {
    seriesLayer.replaceChildren();

    visibleOrder
      .map((brand) => seriesByBrand.get(brand))
      .filter(Boolean)
      .forEach((series) => {
        const points = series.values.map((value, index) =>
          polarPoint(Math.max(0, Math.min(1, value / 100)), (360 / radar.axes.length) * index)
        );

        const area = createSvgElement("polygon", {
          points: pointsToString(points),
          fill: `url(#brand-compare-radar-fill-${series.gradientIndex})`,
          stroke: series.color,
          "stroke-width": "2"
        });
        seriesLayer.appendChild(area);
      });
  };

  const syncLegendState = () => {
    legendButtons.forEach((button, brand) => {
      const visible = !hiddenBrands.has(brand);
      button.setAttribute("aria-pressed", visible ? "true" : "false");
      button.classList.toggle("is-hidden", !visible);
    });
  };

  radar.series.forEach((series) => {
    if (series.label === "DESCENTE") {
      const lineBreak = document.createElement("span");
      lineBreak.className = "compare-radar-legend-break";
      lineBreak.setAttribute("aria-hidden", "true");
      legend.appendChild(lineBreak);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "compare-radar-legend-item";
    button.setAttribute("aria-pressed", "true");
    button.innerHTML = `
      <span class="compare-radar-legend-dot" style="background:${series.color};"></span>
      <span>${series.label}</span>
    `;
    button.addEventListener("click", () => {
      if (hiddenBrands.has(series.brand)) {
        hiddenBrands.delete(series.brand);
        visibleOrder = visibleOrder.filter((brand) => brand !== series.brand);
        visibleOrder.push(series.brand);
      } else {
        hiddenBrands.add(series.brand);
        visibleOrder = visibleOrder.filter((brand) => brand !== series.brand);
      }

      renderSeriesLayer();
      syncLegendState();
    });
    legendButtons.set(series.brand, button);
    legend.appendChild(button);
  });

  renderSeriesLayer();
  syncLegendState();

  container.innerHTML = "";
  container.appendChild(legend);
  container.appendChild(svg);
}

function formatFunctionMapTick(value) {
  return `${Math.round(value)}%`;
}

function getYoyTone(label) {
  if (!label || label === "n/a") {
    return "is-neutral";
  }

  if (label === "new" || label.startsWith("+")) {
    return "is-positive";
  }

  if (label.startsWith("-")) {
    return "is-negative";
  }

  return "is-neutral";
}

export function renderFunctionOpportunityMap(container, rowsByView, metaByView = {}) {
  if (!container) {
    return;
  }

  const viewConfigs = {
    all: { key: "all", label: "ALL", titleLabel: "ALL", tone: "all" },
    male: { key: "male", label: "MALE", titleLabel: "Male", tone: "male" },
    female: { key: "female", label: "FEMALE", titleLabel: "Female", tone: "female" }
  };
  let activeView = "all";

  const getFunctionViewIconMarkup = (viewKey) => {
    if (viewKey === "male") {
      return `
        <svg viewBox="0 0 24 24" class="function-map-view-icon" aria-hidden="true">
          <circle cx="12" cy="5.5" r="3.1" fill="currentColor"/>
          <path d="M7.2 10.2H16.8L12 21Z" fill="currentColor"/>
        </svg>
      `;
    }

    if (viewKey === "female") {
      return `
        <svg viewBox="0 0 24 24" class="function-map-view-icon" aria-hidden="true">
          <circle cx="12" cy="5.5" r="3.1" fill="currentColor"/>
          <path d="M12 9.1 7.4 17.2H10.2V21H13.8V17.2H16.6Z" fill="currentColor"/>
        </svg>
      `;
    }

    return `<span class="function-map-view-all-text">ALL</span>`;
  };

  const createFunctionViewButtonMarkup = (view, isActive) => `
    <button
      type="button"
      class="function-map-view-btn is-${view.tone}${isActive ? " is-active" : ""}"
      data-view="${view.key}"
      aria-pressed="${isActive ? "true" : "false"}"
      aria-label="${view.label}"
      title="${view.label}"
    >${getFunctionViewIconMarkup(view.key)}</button>
  `;

  const root = document.createElement("div");
  root.className = "function-map-root";

  const controls = document.createElement("div");
  controls.className = "function-map-view-switch";
  controls.innerHTML = Object.values(viewConfigs)
    .map((view) => createFunctionViewButtonMarkup(view, view.key === activeView))
    .join("");

  const wrap = document.createElement("div");
  wrap.className = "function-map-wrap";
  root.appendChild(controls);
  root.appendChild(wrap);
  container.innerHTML = "";
  container.appendChild(root);

  const syncViewButtons = () => {
    controls.querySelectorAll(".function-map-view-btn[data-view]").forEach((node) => {
      const isActive = node.dataset.view === activeView;
      node.classList.toggle("is-active", isActive);
      node.setAttribute("aria-pressed", String(isActive));
    });
  };

  const renderView = (viewKey) => {
    const rows = rowsByView?.[viewKey] ?? rowsByView?.all ?? [];
    const meta = metaByView?.[viewKey] ?? metaByView?.all ?? {};
    const hiddenKeys = viewKey === "male" ? new Set(["cool-touch", "durable"]) : new Set();
    const bubbleScale = viewKey === "all" ? 1 : 0.88;
    const validRows = rows.filter(
      (row) => row.gmv25 > 0 && row.key !== "windproof" && !hiddenKeys.has(row.key)
    );

    if (!validRows.length) {
      wrap.innerHTML = "";
      return;
    }

    const panelTitle = container.closest(".function-opportunity-panel")?.querySelector(".panel-title");
    if (panelTitle) {
      const currentLang = document.body.dataset.lang === "en" ? "en" : "zh";
      const baseTitle =
        currentLang === "en"
          ? panelTitle.dataset.titleEnBase || panelTitle.dataset.en || "Function Opportunity Map"
          : panelTitle.dataset.titleZhBase || panelTitle.dataset.zh || "半拉链功能机会矩阵";
      panelTitle.textContent = `${baseTitle} | ${viewConfigs[viewKey]?.titleLabel ?? "ALL"}`;
    }

    const width = 600;
    const height = 380;
    const margin = { top: 34, right: 34, bottom: 58, left: 54 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const xMax = Math.max(70, Math.ceil(Math.max(...validRows.map((row) => row.share)) / 10) * 10);
    const yMin = viewKey === "female" ? -10 : -50;
    const yMax = 200;
    const plotTop = margin.top;
    const plotBottom = margin.top + plotHeight;
    const baseZeroY = scaleValue(0, -50, yMax, plotBottom, plotTop);
    const scaleFunctionY = (value) => {
      if (viewKey !== "female") {
        return scaleValue(value, yMin, yMax, plotBottom, plotTop);
      }

      if (value <= 0) {
        return scaleValue(value, yMin, 0, plotBottom, baseZeroY);
      }

      return scaleValue(value, 0, yMax, baseZeroY, plotTop);
    };
    const xAxisY = viewKey === "female" ? baseZeroY : scaleValue(0, yMin, yMax, plotBottom, plotTop);
    const averageShareValue = Number.isFinite(meta.averageFunctionShare) ? meta.averageFunctionShare : 0;
    const averageShareLabel = meta.averageFunctionShareLabel ?? `${Math.round(averageShareValue)}%`;
    const ttlHalfZipYoyValue = Number.isFinite(meta.ttlHalfZipYoy) ? meta.ttlHalfZipYoy : 0;
    const ttlHalfZipYoyLabel = meta.ttlHalfZipYoyLabel ?? formatYoyLabel(ttlHalfZipYoyValue);
    const gmvValues = validRows.map((row) => row.gmv25);
    const gmvMin = Math.min(...gmvValues);
    const gmvMax = Math.max(...gmvValues);
    const yTicks = viewKey === "female" ? [-10, 0, 50, 100, 150, 200] : [-50, 0, 50, 100, 150, 200];
    const xTicks = [0, 20, 40, 60].filter((tick) => tick <= xMax);
    if (!xTicks.includes(xMax)) {
      xTicks.push(xMax);
    }

    const svg = createSvgElement("svg", {
      class: "function-map-svg",
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": `Function opportunity map ${viewConfigs[viewKey]?.label ?? "ALL"}`
    });
    const overlay = createChartOverlay();
    const defs = createSvgElement("defs");
    const shadowFilter = createSvgElement("filter", {
      id: `function-map-shadow-${viewKey}`,
      x: "-35%",
      y: "-35%",
      width: "170%",
      height: "170%"
    });
    shadowFilter.appendChild(
      createSvgElement("feDropShadow", {
        dx: "0",
        dy: "5",
        stdDeviation: "6",
        "flood-color": "#64748b",
        "flood-opacity": "0.17"
      })
    );
    defs.appendChild(shadowFilter);
    const axisMarker = createSvgElement("marker", {
      id: `function-map-axis-arrow-${viewKey}`,
      viewBox: "0 0 10 10",
      refX: "8.2",
      refY: "5",
      markerWidth: "6",
      markerHeight: "6",
      orient: "auto-start-reverse"
    });
    axisMarker.appendChild(
      createSvgElement("path", {
        d: "M 0 0 L 10 5 L 0 10 z",
        fill: "#4b5563"
      })
    );
    defs.appendChild(axisMarker);
    svg.appendChild(defs);

    yTicks.forEach((tick) => {
      const y = scaleFunctionY(tick);
      svg.appendChild(
        createSvgElement("line", {
          x1: margin.left,
          y1: y,
          x2: margin.left + plotWidth,
          y2: y,
          class: tick === 0 ? "function-map-zero-line" : "gender-price-grid-line"
        })
      );
      svg.appendChild(
        createSvgElement("text", {
          x: margin.left - 12,
          y,
          class: "function-map-svg-tick function-map-svg-tick-y",
          "text-anchor": "end",
          "dominant-baseline": "middle"
        })
      );
      svg.lastChild.textContent = formatFunctionMapTick(tick);
    });

    const quadrantX = scaleValue(Math.max(0, Math.min(xMax, averageShareValue)), 0, xMax, margin.left, margin.left + plotWidth);
    const quadrantY = scaleFunctionY(Math.max(yMin, Math.min(yMax, ttlHalfZipYoyValue)));

    svg.appendChild(
      createSvgElement("line", {
        x1: quadrantX,
        y1: margin.top,
        x2: quadrantX,
        y2: margin.top + plotHeight,
        class: "function-map-quadrant-line"
      })
    );
    svg.appendChild(
      createSvgElement("line", {
        x1: margin.left,
        y1: quadrantY,
        x2: margin.left + plotWidth,
        y2: quadrantY,
        class: "function-map-quadrant-line"
      })
    );
    svg.appendChild(
      createSvgElement("text", {
        x: margin.left + plotWidth - 4,
        y: quadrantY - 6,
        class: "function-map-quadrant-note",
        "text-anchor": "end",
        "dominant-baseline": "auto"
      })
    );
    svg.lastChild.textContent = `TTL Half-Zip ${ttlHalfZipYoyLabel}`;
    svg.appendChild(
      createSvgElement("text", {
        x: quadrantX + 6,
        y: margin.top + plotHeight - 8,
        class: "function-map-quadrant-note",
        "text-anchor": "start",
        "dominant-baseline": "auto"
      })
    );
    svg.lastChild.textContent = `Average = ${averageShareLabel}`;
    const quadrantLabels = [
      {
        text: "Potential Functions",
        x: margin.left + 12,
        y: margin.top + 10,
        anchor: "start"
      },
      {
        text: "Core Functions",
        x: margin.left + plotWidth - 12,
        y: margin.top + 10,
        anchor: "end"
      },
      {
        text: "Weak Functions",
        x: margin.left + 12,
        y: margin.top + plotHeight - 12,
        anchor: "start"
      },
      {
        text: "Mature Functions",
        x: margin.left + plotWidth - 12,
        y: margin.top + plotHeight - 12,
        anchor: "end"
      }
    ];
    quadrantLabels.forEach((label) => {
      svg.appendChild(
        createSvgElement("text", {
          x: label.x,
          y: label.y,
          class: "function-map-quadrant-label",
          "text-anchor": label.anchor,
          "dominant-baseline": label.y < margin.top + plotHeight / 2 ? "hanging" : "auto"
        })
      );
      svg.lastChild.textContent = label.text;
    });

    xTicks.forEach((tick) => {
      const x = scaleValue(tick, 0, xMax, margin.left, margin.left + plotWidth);
      svg.appendChild(
        createSvgElement("line", {
          x1: x,
          y1: margin.top,
          x2: x,
          y2: margin.top + plotHeight,
          class: "gender-price-grid-line"
        })
      );
      svg.appendChild(
        createSvgElement("text", {
          x,
          y: margin.top + plotHeight + 9,
          class: "function-map-svg-tick function-map-svg-tick-x",
          "text-anchor": "middle",
          "dominant-baseline": "hanging"
        })
      );
      svg.lastChild.textContent = formatFunctionMapTick(tick);
    });

    svg.appendChild(
      createSvgElement("line", {
        x1: margin.left,
        y1: margin.top + plotHeight,
        x2: margin.left,
        y2: margin.top,
        class: "gender-price-axis-line",
        "marker-end": `url(#function-map-axis-arrow-${viewKey})`
      })
    );
    svg.appendChild(
      createSvgElement("line", {
        x1: margin.left,
        y1: xAxisY,
        x2: margin.left + plotWidth,
        y2: xAxisY,
        class: "gender-price-axis-line",
        "marker-end": `url(#function-map-axis-arrow-${viewKey})`
      })
    );

    svg.appendChild(
      createSvgElement("text", {
        x: margin.left + plotWidth / 2,
        y: height - 29,
        class: "function-map-svg-axis-title function-map-svg-axis-title-x",
        "text-anchor": "middle",
        "dominant-baseline": "hanging"
      })
    );
    svg.lastChild.textContent = "25AW sales share";
    svg.appendChild(
      createSvgElement("text", {
        x: 15,
        y: margin.top + plotHeight / 2,
        class: "function-map-svg-axis-title function-map-svg-axis-title-y",
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        transform: `rotate(-90 15 ${margin.top + plotHeight / 2})`
      })
    );
    svg.lastChild.textContent = "YOY%";

    validRows.forEach((row, index) => {
      const cx = scaleValue(row.share, 0, xMax, margin.left, margin.left + plotWidth);
      const cy = scaleValue(
        Number.isFinite(row.yoy) ? Math.max(yMin, Math.min(yMax, row.yoy)) : 0,
        yMin,
        yMax,
        plotBottom,
        plotTop
      );
      const plottedCy = scaleFunctionY(
        Number.isFinite(row.yoy) ? Math.max(yMin, Math.min(yMax, row.yoy)) : 0
      );
      const r = getCompactBubbleRadius(row.gmv25, gmvMin, gmvMax) * bubbleScale;
      const gradient = createSvgElement("radialGradient", {
        id: `function-map-gradient-${viewKey}-${index}`,
        cx: "35%",
        cy: "30%",
        r: "78%"
      });
      gradient.appendChild(createStop("0%", "#ffffff", 0.78));
      gradient.appendChild(createStop("46%", row.color, 0.82));
      gradient.appendChild(createStop("100%", row.color, 0.98));
      defs.appendChild(gradient);

      const group = createSvgElement("g", {
        class: "function-map-node",
        "data-function": row.label,
        "data-function-en": row.labelEn,
        "data-share": row.shareLabel,
        "data-yoy": row.yoyLabel,
        tabindex: "0"
      });
      group.appendChild(
        createSvgElement("circle", {
          cx,
          cy: plottedCy,
          r,
          fill: `url(#function-map-gradient-${viewKey}-${index})`,
          stroke: row.color,
          "stroke-width": 1.25,
          filter: `url(#function-map-shadow-${viewKey})`,
          class: "function-map-bubble",
          "data-function": row.label,
          "data-function-en": row.labelEn,
          "data-share": row.shareLabel,
          "data-yoy": row.yoyLabel,
          tabindex: "0"
        })
      );
      svg.appendChild(group);

      const bilingualLabels = new Set(["吸湿速干", "弹力", "保暖", "抑菌防臭", "轻量"]);
      const activeBilingualLabels =
        viewKey === "female"
          ? new Set(["吸湿速干", "弹力", "保暖", "抑菌防臭"])
          : bilingualLabels;
      const labelOffsetMap = {
        "防晒": { dx: 0, dy: r - 10, anchor: "middle", valign: "top" },
        "凉感": { dx: 0, dy: r - 10, anchor: "middle", valign: "top" },
        "防静电": { dx: r + 6, dy: -14, anchor: "start" },
        "透气": { dx: r + 6, dy: -16, anchor: "start" },
        "轻量": { dx: r + 6, dy: -5, anchor: "start" },
        "吸湿速干": { dx: r + 6, dy: -5, anchor: "start" },
        "弹力": { dx: r + 6, dy: 4, anchor: "start" },
        "抑菌防臭": { dx: r + 6, dy: -5, anchor: "start" },
        "保暖": { dx: r + 6, dy: -5, anchor: "start" }
      };
      const viewSpecificLabelOffsets = {
        male: {
          "吸湿速干": { dx: -(r + 6), dy: 10, anchor: "end" },
          "弹力": { dx: r + 6, dy: 18, anchor: "start" }
        },
        female: {
          "弹力": { dx: 0, dy: r + 14, anchor: "middle", valign: "top" },
          "透气": { dx: 0, dy: -(r + 10), anchor: "middle", valign: "bottom" },
          "吸湿速干": { dx: -(r + 6), dy: 10, anchor: "end" },
          "抑菌防臭": { dx: 0, dy: -(r + 10), anchor: "middle", valign: "bottom" },
          "防静电": { dx: -(r + 6), dy: -14, anchor: "end" },
          "凉感": { dx: -(r + 6), dy: -12, anchor: "end" },
          "轻量": { dx: 0, dy: r - 6, anchor: "middle", valign: "top" },
          "防晒": { dx: r + 6, dy: -4, anchor: "start" }
        }
      };
      const offset = labelOffsetMap[row.label] ?? {
        dx: r + 6,
        dy: -5,
        anchor: "start"
      };
      const finalOffset = viewSpecificLabelOffsets[viewKey]?.[row.label] ?? offset;
      const labelNode = createChartOverlayText({
        className: `chart-overlay-label is-brand function-map-label${activeBilingualLabels.has(row.label) ? " is-bilingual" : ""}`,
        text: row.label,
        x: cx + finalOffset.dx,
        y: plottedCy + finalOffset.dy,
        width,
        height,
        anchor: finalOffset.anchor,
        valign: finalOffset.valign ?? "bottom"
      });
      if (viewKey === "female" && row.label === "轻量") {
        labelNode.classList.add("is-compact");
      }
      if (activeBilingualLabels.has(row.label)) {
        labelNode.innerHTML = `<span>${row.label}</span><small>${row.labelEn}</small>`;
      }
      overlay.appendChild(labelNode);
    });

    wrap.innerHTML = "";
    wrap.appendChild(svg);
    wrap.appendChild(overlay);
    const note = document.createElement("div");
    note.className = "function-map-note";
    note.innerHTML = `
      <p>Bubble Size = GMV</p>
      <p class="function-map-note-spacer" aria-hidden="true"></p>
      <p>5 Brands Integrated: DESCENTE, KOLON, LULULEMON, KAILAS and ARC'TERYX</p>
    `;
    wrap.appendChild(note);
  };

  controls.querySelectorAll(".function-map-view-btn[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextView = button.dataset.view;
      if (!nextView || nextView === activeView) {
        return;
      }

      activeView = nextView;
      syncViewButtons();
      renderView(activeView);
      container.dispatchEvent(
        new CustomEvent("functionviewchange", {
          detail: { viewKey: activeView }
        })
      );
    });
  });

  container.__setFunctionOpportunityView = (nextView) => {
    if (!viewConfigs[nextView] || nextView === activeView) {
      return;
    }

    activeView = nextView;
    syncViewButtons();
    renderView(activeView);
    container.dispatchEvent(
      new CustomEvent("functionviewchange", {
        detail: { viewKey: activeView }
      })
    );
  };
  container.__getFunctionOpportunityView = () => activeView;

  renderView(activeView);
  syncViewButtons();
}

export function renderFunctionGenderSplit(container, groups) {
  if (!container) {
    return;
  }
  const isEnglish = document.body.dataset.lang === "en";

  container.innerHTML = groups
    .map(
      (group) => `
        <article class="function-gender-card ${group.className}" data-view="${group.gender === "男" ? "male" : "female"}" tabindex="0">
          <div class="function-gender-card-head">
            <div class="function-gender-title">${group.label}</div>
            <div class="function-gender-head-label">Share / YOY</div>
          </div>
          <div class="function-gender-stack">
            <section class="function-gender-section">
              <div class="function-gender-section-head">
                <strong>${isEnglish ? "Function Mix" : "功能复合"}</strong>
              </div>
              <div class="function-gender-stat-list">
                ${group.complexityRows
                  .map(
                    (row) => `
                      <div class="function-gender-stat-row is-complexity">
                        <div class="function-gender-stat-label">${row.shortLabel}</div>
                        <div class="function-gender-stat-bar">
                          <span style="width:${Math.max(4, row.share).toFixed(1)}%;"></span>
                        </div>
                        <div class="function-gender-stat-metric">${row.shareLabel}</div>
                        <div class="function-gender-stat-metric ${getYoyTone(row.yoyLabel)}">${row.yoyLabel}</div>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </section>
            <section class="function-gender-section">
              <div class="function-gender-section-head">
                <strong>${isEnglish ? "Suggested Mix" : "优先开发组合"}</strong>
              </div>
              <div class="function-gender-combo-list">
                ${group.comboRows
                  .map(
                    (row) => `
                      <div class="function-gender-combo-item">
                        <div class="function-gender-combo-label">
                          <strong>${isEnglish ? row.labelEn : row.label}</strong>
                        </div>
                        <div class="function-gender-combo-meta">
                          <div class="function-gender-stat-bar is-combo">
                            <span style="width:${Math.max(4, row.share).toFixed(1)}%;"></span>
                          </div>
                          <div class="function-gender-stat-metric">${row.shareLabel}</div>
                          <div class="function-gender-stat-metric ${getYoyTone(row.yoyLabel)}">${row.yoyLabel}</div>
                        </div>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </section>
          </div>
        </article>
      `
    )
    .join("");
}
