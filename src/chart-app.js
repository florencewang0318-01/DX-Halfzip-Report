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
    return "Semi-crop";
  }

  if (length === "regular常规") {
    return "Regular";
  }

  return length;
}

export function renderSilhouetteStructureChart(container, rows, meta = {}) {
  if (!container) {
    return;
  }

  const fitOrder = ["regular合体", "Active运动版型", "slim修身", "loose宽松"];
  const lengthOrder = ["regular常规", "semi-crop短款", "crop短款"];
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
      femaleShare?.count
        ? `data-female-share="${Math.round((femaleShare.count / row.count) * 100)}%"`
        : "",
      femaleShare?.count && femaleShare?.yoyLabel && femaleShare.yoyLabel !== "n/a"
        ? `data-female-yoy="${femaleShare.yoyLabel}"`
        : "",
      maleShare?.count
        ? `data-male-share="${Math.round((maleShare.count / row.count) * 100)}%"`
        : "",
      maleShare?.count && maleShare?.yoyLabel && maleShare.yoyLabel !== "n/a"
        ? `data-male-yoy="${maleShare.yoyLabel}"`
        : "",
      unisexShare?.count
        ? `data-unisex-share="${Math.round((unisexShare.count / row.count) * 100)}%"`
        : "",
      unisexShare?.count && unisexShare?.yoyLabel && unisexShare.yoyLabel !== "n/a"
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

  container.innerHTML = `
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
        6 Brands Integrated: DESCENTE, KOLON, LULULEMON, KAILAS, ARC'TREYX and SALOMON
      </div>
    </div>
  `;
}

export function renderSilhouetteGrowthChart(container, rows) {
  if (!container) {
    return;
  }

  const validRows = rows.filter((row) => row.genders.some((gender) => gender.count25 > 0));
  if (!validRows.length) {
    container.innerHTML = "";
    return;
  }

  const width = 760;
  const height = 426;
  const margin = { top: 58, right: 88, bottom: 54, left: 138 };
  const plotWidth = width - margin.left - margin.right;
  const rowGap = 52;
  const plotHeight = rowGap * (validRows.length - 1);
  const axisBottom = margin.top + plotHeight;
  const xMin = -50;
  const xMax = 110;
  const ticks = [-50, 0, 50, 100];

  const svg = createSvgElement("svg", {
    class: "silhouette-growth-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "核心轮廓的性别增长机会图"
  });

  const overlay = createChartOverlay();
  const defs = createSvgElement("defs");
  const shadowFilter = createSvgElement("filter", {
    id: "silhouette-growth-shadow",
    x: "-35%",
    y: "-35%",
    width: "170%",
    height: "170%"
  });
  shadowFilter.appendChild(
    createSvgElement("feDropShadow", {
      dx: "0",
      dy: "4",
      stdDeviation: "5",
      "flood-color": "#94a3b8",
      "flood-opacity": "0.16"
    })
  );
  defs.appendChild(shadowFilter);

  validRows.forEach((row, rowIndex) => {
    row.genders.forEach((genderItem, genderIndex) => {
      const palette = getGenderBubblePalette(genderItem.gender);
      const gradient = createSvgElement("radialGradient", {
        id: `silhouette-growth-gradient-${rowIndex}-${genderIndex}`,
        cx: "36%",
        cy: "30%",
        r: "76%"
      });
      gradient.appendChild(createStop("0%", palette.highlight, 0.96));
      gradient.appendChild(createStop("42%", palette.base, 0.90));
      gradient.appendChild(createStop("100%", palette.edge, 0.98));
      defs.appendChild(gradient);
    });
  });
  svg.appendChild(defs);

  const xZero = scaleValue(0, xMin, xMax, margin.left, margin.left + plotWidth);
  ticks.forEach((tickValue) => {
    const x = scaleValue(tickValue, xMin, xMax, margin.left, margin.left + plotWidth);
    svg.appendChild(
      createSvgElement("line", {
        x1: x,
        y1: margin.top - 10,
        x2: x,
        y2: axisBottom + 10,
        class: `silhouette-growth-grid-line${tickValue === 0 ? " is-zero" : ""}`
      })
    );

    overlay.appendChild(
      createChartOverlayText({
        className: "chart-overlay-tick is-x silhouette-growth-tick",
        text: formatPercentTick(tickValue),
        x,
        y: axisBottom + 18,
        width,
        height,
        anchor: "middle",
        valign: "top"
      })
    );
  });

  validRows.forEach((row, index) => {
    const y = margin.top + index * rowGap;
    svg.appendChild(
      createSvgElement("line", {
        x1: margin.left,
        y1: y,
        x2: margin.left + plotWidth,
        y2: y,
        class: "silhouette-growth-row-line"
      })
    );

    overlay.appendChild(
      createChartOverlayText({
        className: "chart-overlay-tick is-y silhouette-growth-combo-label",
        text: row.comboLabel,
        x: margin.left - 18,
        y,
        width,
        height,
        anchor: "end",
        valign: "middle"
      })
    );
  });

  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: axisBottom,
      x2: margin.left + plotWidth,
      y2: axisBottom,
      class: "gender-price-axis-line"
    })
  );
  svg.appendChild(
    createSvgElement("line", {
      x1: xZero,
      y1: margin.top - 12,
      x2: xZero,
      y2: axisBottom + 8,
      class: "gender-price-axis-line silhouette-growth-zero-line"
    })
  );

  overlay.appendChild(
    createChartOverlayText({
      className: "chart-overlay-axis-title is-x",
      text: "YOY%",
      x: margin.left + plotWidth / 2,
      y: height - 10,
      width,
      height,
      anchor: "middle",
      valign: "top"
    })
  );

  validRows.forEach((row, rowIndex) => {
    const y = margin.top + rowIndex * rowGap;

    row.genders.forEach((genderItem, genderIndex) => {
      if (genderItem.count25 <= 0) {
        return;
      }

      const token = getSilhouetteGenderToken(genderItem.gender);
      const palette = getGenderBubblePalette(genderItem.gender);
      const shareRadius = 9 + (Math.max(0, genderItem.shareInCombo) / 100) * 11;

      if (genderItem.yoyLabel === "new") {
        overlay.appendChild(
          createChartOverlayText({
            className: `chart-overlay-label silhouette-growth-new ${token.className}`,
            text: `${token.short} new`,
            x: margin.left + plotWidth + 26,
            y,
            width,
            height,
            anchor: "start",
            valign: "middle"
          })
        );
        return;
      }

      const x = scaleValue(
        Number(String(genderItem.yoyLabel).replace(/[^\d.-]/g, "")),
        xMin,
        xMax,
        margin.left,
        margin.left + plotWidth
      );

      const group = createSvgElement("g", {
        class: "silhouette-growth-node"
      });
      group.appendChild(
        createSvgElement("circle", {
          cx: x,
          cy: y,
          r: shareRadius,
          fill: `url(#silhouette-growth-gradient-${rowIndex}-${genderIndex})`,
          stroke: palette.edge,
          "stroke-width": 1.2,
          filter: "url(#silhouette-growth-shadow)"
        })
      );
      group.appendChild(
        createSvgElement("circle", {
          cx: x - shareRadius * 0.26,
          cy: y - shareRadius * 0.30,
          r: Math.max(3, shareRadius * 0.28),
          fill: "rgba(255,255,255,0.34)"
        })
      );
      svg.appendChild(group);

      overlay.appendChild(
        createChartOverlayText({
          className: `chart-overlay-label silhouette-growth-yoy ${token.className}`,
          text: `${token.short} ${genderItem.yoyLabel}`,
          x,
          y: y - shareRadius - 12,
          width,
          height,
          anchor: "middle",
          valign: "bottom"
        })
      );
    });
  });

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "silhouette-growth-wrap";
  wrap.innerHTML = `
    <div class="gender-breakdown-legend silhouette-growth-legend">
      <span class="gender-breakdown-legend-item is-static"><span class="gender-breakdown-swatch is-female"></span><span>Female</span></span>
      <span class="gender-breakdown-legend-item is-static"><span class="gender-breakdown-swatch is-male"></span><span>Male</span></span>
      <span class="gender-breakdown-legend-item is-static"><span class="gender-breakdown-swatch is-unisex"></span><span>Unisex</span></span>
    </div>
    <div class="silhouette-growth-note">Dot size = share within silhouette combo</div>
  `;
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
