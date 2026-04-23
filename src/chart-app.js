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
    return 22;
  }

  const normalized = (value - min) / (max - min);
  return 16 + normalized * 20;
}

export function renderMarketScopeBubbleChart(container, rows) {
  if (!container) {
    return;
  }

  const width = 560;
  const height = 376;
  const margin = { top: 44, right: 28, bottom: 62, left: 78 };
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

  const yTickValues = [50, 150, 300, 500].filter((value) => value <= yMax);
  yTickValues.forEach((yValue) => {
    const y = scaleSqrtValue(
      yValue,
      yMin,
      yMax,
      margin.top + plotHeight,
      margin.top
    );

    svg.appendChild(
      createSvgElement("line", {
        x1: margin.left,
        y1: y,
        x2: margin.left + plotWidth,
        y2: y,
        class: "bubble-grid-line"
      })
    );

    const tickLabel = createSvgElement("text", {
      x: margin.left - 10,
      y: y + 4,
      class: "bubble-tick-label",
      "text-anchor": "end"
    });
    tickLabel.textContent = formatPercentTick(yValue);
    svg.appendChild(tickLabel);
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
        y2: margin.top + plotHeight,
        class: "bubble-grid-line"
      })
    );

    const tickLabel = createSvgElement("text", {
      x,
      y: margin.top + plotHeight + 20,
      class: "bubble-tick-label",
      "text-anchor": "middle"
    });
    tickLabel.textContent = formatPercentTick(xValue);
    svg.appendChild(tickLabel);
  }

  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: margin.top + plotHeight,
      x2: margin.left + plotWidth,
      y2: margin.top + plotHeight,
      class: "bubble-axis-line"
    })
  );

  svg.appendChild(
    createSvgElement("line", {
      x1: margin.left,
      y1: margin.top,
      x2: margin.left,
      y2: margin.top + plotHeight,
      class: "bubble-axis-line"
    })
  );

  const xAxisTitle = createSvgElement("text", {
    x: margin.left + plotWidth / 2,
    y: height - 10,
    class: "bubble-axis-title",
    "text-anchor": "middle"
  });
  xAxisTitle.textContent = "半拉链占内搭总体的占比";
  svg.appendChild(xAxisTitle);

  const yAxisTitle = createSvgElement("text", {
    x: 28,
    y: margin.top + plotHeight / 2,
    class: "bubble-axis-title",
    transform: `rotate(-90 28 ${margin.top + plotHeight / 2})`,
    "text-anchor": "middle"
  });
  yAxisTitle.textContent = "YOY%";
  svg.appendChild(yAxisTitle);

  const legendGroup = createSvgElement("g", {
    transform: `translate(${width - 146}, 12)`
  });
  legendGroup.appendChild(
    createSvgElement("circle", {
      cx: 9,
      cy: 10,
      r: 7,
      class: "bubble-legend-circle"
    })
  );
  const legendText = createSvgElement("text", {
    x: 24,
    y: 14,
    class: "bubble-legend-text"
  });
  legendText.textContent = "气泡大小表示半拉链GMV";
  legendGroup.appendChild(legendText);
  svg.appendChild(legendGroup);

  rows.forEach((row) => {
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

    const bubble = createSvgElement("circle", {
      cx,
      cy: stretchedCy,
      r,
      class: `bubble-point${row.brand.includes("SALOMON") ? " is-outlier" : ""}`
    });
    svg.appendChild(bubble);

    const brandLabel = createSvgElement("text", {
      x: cx,
      y: stretchedCy - r - 6,
      class: "bubble-label",
      "text-anchor": "middle"
    });
    brandLabel.textContent = row.brand.split("/")[0];
    svg.appendChild(brandLabel);

    if (row.brand.includes("SALOMON")) {
      const annotation = createSvgElement("text", {
        x: cx + r + 12,
        y: stretchedCy - r + 14,
        class: "bubble-annotation"
      });
      annotation.textContent = "SALOMON 为低基数高增长的离群点";
      svg.appendChild(annotation);
    }
  });

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "bubble-chart-wrap";
  wrap.appendChild(svg);

  container.appendChild(wrap);
}
