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
    "aria-label": "竞品品牌半拉链布局深度、增长与规模气泡图"
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
      text: "半拉链占内搭总体的占比",
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
    <span class="chart-overlay-legend-text bubble-legend-text">气泡大小表示半拉链GMV</span>
  `;
  overlay.appendChild(legend);

  rows.forEach((row, index) => {
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
      class: `bubble-point-group${row.brand.includes("SALOMON") ? " is-outlier" : ""}`,
      "data-brand": row.brand,
      "data-share": row.halfZipShareLabel,
      "data-yoy": row.halfZipYoyLabel,
      tabindex: "0"
    });

    const bubble = createSvgElement("circle", {
      cx,
      cy: stretchedCy,
      r,
      class: `bubble-point${row.brand.includes("SALOMON") ? " is-outlier" : ""}`,
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
        text: row.brand.split("/")[0],
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

    if (row.brand.includes("SALOMON")) {
      overlay.appendChild(
        createChartOverlayText({
          className: "chart-overlay-annotation bubble-annotation market-scope-annotation",
          text: "SALOMON 为低基数高增长的离群点",
          x: cx + r + 12,
          y: stretchedCy - r + 14,
          width,
          height,
          anchor: "start",
          valign: "middle",
          dataset: {
            brand: row.brand
          }
        })
      );
    }
  });

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "bubble-chart-wrap";
  wrap.appendChild(svg);
  wrap.appendChild(overlay);

  container.appendChild(wrap);
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
    (row) => row.avgDealPrice > 0 && row.gmv > 0 && row.yoyMetric !== null && Number.isFinite(row.yoyMetric)
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
  const xMin = Math.floor(Math.min(...prices) / 100) * 100;
  const xMax = Math.ceil(Math.max(...prices) / 100) * 100;
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

  const xTickCount = 4;
  for (let i = 0; i <= xTickCount; i += 1) {
    const xValue = xMin + ((xMax - xMin) / xTickCount) * i;
    const x = margin.left + (plotWidth / xTickCount) * i;

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
  }

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
      text: "成交价格",
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
    "KOLON SPORT/可隆__男": { dx: 12, dy: -10, anchor: "start" },
    "KOLON SPORT/可隆__男女": { dx: 0, dy: -16, anchor: "middle" },
    "LULULEMON/露露乐蒙__女": { dx: -18, dy: -10, anchor: "end" },
    "LULULEMON/露露乐蒙__男": { dx: 12, dy: 18, anchor: "start" },
    "KAILAS/凯乐石__女": { dx: 12, dy: -10, anchor: "start" },
    "KAILAS/凯乐石__男": { dx: 14, dy: -10, anchor: "start" },
    "ARC'TERYX/始祖鸟__女": { dx: -12, dy: -10, anchor: "end" },
    "ARC'TERYX/始祖鸟__男": { dx: -16, dy: 18, anchor: "end" },
    "SALOMON/萨洛蒙__男女": { dx: 12, dy: -10, anchor: "start" }
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
      <button type="button" class="gender-breakdown-legend-item gender-legend-toggle" data-gender="男女" aria-pressed="true">
        <span class="gender-breakdown-swatch is-unisex"></span>
        <span>Unisex</span>
      </button>
    </div>
    <div class="gender-price-size-note">Bubble size = GMV</div>
  `;
  wrap.appendChild(svg);
  wrap.appendChild(overlay);
  container.appendChild(wrap);
}
