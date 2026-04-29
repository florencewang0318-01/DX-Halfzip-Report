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
    const brandLabel = row.brand.includes("SALOMON") ? "SALOMON*" : row.brand.split("/")[0];
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

        if (genderItem.yoyLabel === "new") {
          return false;
        }

        if (row.fit === "slim修身" && row.length === "regular常规" && genderItem.gender === "男") {
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
      <button type="button" class="gender-breakdown-legend-item gender-legend-toggle" data-gender="男女" aria-pressed="true">
        <span class="gender-breakdown-swatch is-unisex"></span><span>Unisex</span>
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

  const getBubbleRadius3d = (value) => {
    if (maxGmv === minGmv) {
      return 20;
    }

    const normalized = Math.sqrt((value - minGmv) / (maxGmv - minGmv));
    return 12 + normalized * 17;
  };

  const drawBubble = (point, projected) => {
    const palette = getGenderBubblePalette(point.gender);
    const radius = getBubbleRadius3d(point.gmv25) * projected.scale;
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

export function renderFunctionOpportunityMap(container, rows, meta = {}) {
  if (!container) {
    return;
  }

  const validRows = rows.filter((row) => row.gmv25 > 0 && row.key !== "windproof");
  if (!validRows.length) {
    container.innerHTML = "";
    return;
  }

  const width = 600;
  const height = 380;
  const margin = { top: 34, right: 34, bottom: 58, left: 54 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xMax = Math.max(70, Math.ceil(Math.max(...validRows.map((row) => row.share)) / 10) * 10);
  const yMin = -50;
  const yMax = 200;
  const xAxisY = scaleValue(0, yMin, yMax, margin.top + plotHeight, margin.top);
  const averageShareValue = Number.isFinite(meta.averageFunctionShare) ? meta.averageFunctionShare : 0;
  const averageShareLabel = meta.averageFunctionShareLabel ?? `${Math.round(averageShareValue)}%`;
  const ttlHalfZipYoyValue = Number.isFinite(meta.ttlHalfZipYoy) ? meta.ttlHalfZipYoy : 0;
  const ttlHalfZipYoyLabel = meta.ttlHalfZipYoyLabel ?? formatYoyLabel(ttlHalfZipYoyValue);
  const gmvValues = validRows.map((row) => row.gmv25);
  const gmvMin = Math.min(...gmvValues);
  const gmvMax = Math.max(...gmvValues);
  const yTicks = [-50, 0, 50, 100, 150, 200];
  const xTicks = [0, 20, 40, 60].filter((tick) => tick <= xMax);
  if (!xTicks.includes(xMax)) {
    xTicks.push(xMax);
  }

  const svg = createSvgElement("svg", {
    class: "function-map-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": "Function opportunity map"
  });
  const overlay = createChartOverlay();
  const defs = createSvgElement("defs");
  const shadowFilter = createSvgElement("filter", {
    id: "function-map-shadow",
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
    id: "function-map-axis-arrow",
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
    const y = scaleValue(tick, yMin, yMax, margin.top + plotHeight, margin.top);
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
  const quadrantY = scaleValue(Math.max(yMin, Math.min(yMax, ttlHalfZipYoyValue)), yMin, yMax, margin.top + plotHeight, margin.top);

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
      "marker-end": "url(#function-map-axis-arrow)"
    })
  );
  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: xAxisY,
      x2: margin.left + plotWidth,
      y2: xAxisY,
      class: "gender-price-axis-line",
      "marker-end": "url(#function-map-axis-arrow)"
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
    const isOutlier = Number.isFinite(row.yoy) && row.yoy > yMax;
    const cx = scaleValue(row.share, 0, xMax, margin.left, margin.left + plotWidth);
    const cy = scaleValue(
      Number.isFinite(row.yoy) ? Math.max(yMin, Math.min(yMax, row.yoy)) : 0,
      yMin,
      yMax,
      margin.top + plotHeight,
      margin.top
    );
    const r = getCompactBubbleRadius(row.gmv25, gmvMin, gmvMax);
    const gradient = createSvgElement("radialGradient", {
      id: `function-map-gradient-${index}`,
      cx: "35%",
      cy: "30%",
      r: "78%"
    });
    gradient.appendChild(createStop("0%", "#ffffff", 0.78));
    gradient.appendChild(createStop("46%", row.color, 0.82));
    gradient.appendChild(createStop("100%", row.color, 0.98));
    defs.appendChild(gradient);

    const group = createSvgElement("g", {
      class: `function-map-node${isOutlier ? " is-outlier" : ""}`,
      "data-function": row.label,
      "data-function-en": row.labelEn,
      "data-share": row.shareLabel,
      "data-yoy": row.yoyLabel,
      tabindex: "0"
    });
    group.appendChild(
      createSvgElement("circle", {
        cx,
        cy,
        r,
        fill: `url(#function-map-gradient-${index})`,
        stroke: row.color,
        "stroke-width": 1.25,
        filter: "url(#function-map-shadow)",
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
    const labelOffsetMap = {
      "防晒": { dx: 0, dy: r - 10, anchor: "middle", valign: "top" },
      "凉感": { dx: 0, dy: r - 10, anchor: "middle", valign: "top" },
      "防静电": { dx: r + 6, dy: -14, anchor: "start" },
      "透气": { dx: r + 6, dy: -5, anchor: "start" },
      "轻量": { dx: r + 6, dy: -5, anchor: "start" },
      "吸湿速干": { dx: r + 6, dy: -5, anchor: "start" },
      "弹力": { dx: r + 6, dy: 4, anchor: "start" },
      "抑菌防臭": { dx: r + 6, dy: -5, anchor: "start" },
      "保暖": { dx: r + 6, dy: -5, anchor: "start" }
    };
    const defaultAnchor = "start";
    const offset = labelOffsetMap[row.label] ?? {
      dx: r + 6,
      dy: -5,
      anchor: defaultAnchor
    };
    const labelNode = createChartOverlayText({
      className: `chart-overlay-label is-brand function-map-label${bilingualLabels.has(row.label) ? " is-bilingual" : ""}`,
      text: row.label,
      x: cx + offset.dx,
      y: cy + offset.dy,
      width,
      height,
      anchor: offset.anchor,
      valign: offset.valign ?? "bottom"
    });
    if (bilingualLabels.has(row.label)) {
      labelNode.innerHTML = `<span>${row.label}</span><small>${row.labelEn}</small>`;
    }
    overlay.appendChild(labelNode);
  });

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "function-map-wrap";
  wrap.appendChild(svg);
  wrap.appendChild(overlay);
  const note = document.createElement("div");
  note.className = "function-map-note";
  note.innerHTML = `
    <p>Bubble Size = GMV</p>
    <p class="function-map-note-spacer" aria-hidden="true"></p>
    <p>6 Brands Integrated: DESCENTE, KOLON, LULULEMON, KAILAS, ARC'TREYX and SALOMON</p>
  `;
  wrap.appendChild(note);
  container.appendChild(wrap);
}

export function renderFunctionGenderSplit(container, groups) {
  if (!container) {
    return;
  }

  const maxShare = Math.max(
    ...groups.flatMap((group) => group.rows.map((row) => row.share)),
    1
  );

  container.innerHTML = groups
    .map(
      (group) => `
        <article class="function-gender-card ${group.className}">
          <div class="function-gender-card-head">
            <div>
              <div class="function-gender-title">${group.label}</div>
              <div class="function-gender-subtitle">25AW gender overview</div>
            </div>
            <div class="function-gender-head-label">Share / YOY</div>
          </div>
          <div class="function-gender-metrics">
            <div class="function-gender-metric">
              <span>Sales Share</span>
              <strong>${group.salesShareLabel}</strong>
            </div>
            <div class="function-gender-metric">
              <span>GMV YOY</span>
              <strong class="${getYoyTone(group.yoyLabel)}">${group.yoyLabel}</strong>
            </div>
          </div>
          <div class="function-ranking-list">
            ${group.rows
              .map(
                (row) => `
                  <div class="function-ranking-row">
                    <div class="function-ranking-name">
                      <strong>${row.label}</strong>
                      <span>${row.labelEn}</span>
                    </div>
                    <div class="function-ranking-bar">
                      <span style="width:${Math.max(4, (row.share / maxShare) * 100).toFixed(1)}%;"></span>
                    </div>
                    <div class="function-ranking-share">${row.shareLabel}</div>
                    <div class="function-ranking-yoy ${getYoyTone(row.yoyLabel)}">${row.yoyLabel}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}
