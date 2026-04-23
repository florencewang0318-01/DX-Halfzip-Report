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

function getBubbleRadius(value, min, max) {
  if (max === min) {
    return 28;
  }

  const normalized = (value - min) / (max - min);
  return 20 + normalized * 26;
}

export function renderMarketScopeBubbleChart(container, rows) {
  if (!container) {
    return;
  }

  const width = 520;
  const height = 360;
  const margin = { top: 24, right: 20, bottom: 52, left: 60 };
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

  const gridTicks = 5;
  for (let i = 0; i <= gridTicks; i += 1) {
    const yValue = yMin + ((yMax - yMin) / gridTicks) * i;
    const y = margin.top + plotHeight - (plotHeight / gridTicks) * i;

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
  }

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
    y: height - 12,
    class: "bubble-axis-title",
    "text-anchor": "middle"
  });
  xAxisTitle.textContent = "半拉链占内搭总体的占比";
  svg.appendChild(xAxisTitle);

  const yAxisTitle = createSvgElement("text", {
    x: 18,
    y: margin.top + plotHeight / 2,
    class: "bubble-axis-title",
    transform: `rotate(-90 18 ${margin.top + plotHeight / 2})`,
    "text-anchor": "middle"
  });
  yAxisTitle.textContent = "半拉链 GMV YoY%";
  svg.appendChild(yAxisTitle);

  rows.forEach((row) => {
    const cx = scaleValue(
      row.halfZipShareOfInner,
      xMin,
      xMax,
      margin.left,
      margin.left + plotWidth
    );
    const cy = scaleValue(
      row.halfZipYoy,
      yMin,
      yMax,
      margin.top + plotHeight,
      margin.top
    );
    const r = getBubbleRadius(row.halfZipGmv25, gmvMin, gmvMax);

    const bubble = createSvgElement("circle", {
      cx,
      cy,
      r,
      class: `bubble-point${row.brand.includes("SALOMON") ? " is-outlier" : ""}`
    });
    svg.appendChild(bubble);

    const brandLabel = createSvgElement("text", {
      x: cx,
      y: cy - r - 6,
      class: "bubble-label",
      "text-anchor": "middle"
    });
    brandLabel.textContent = row.brand.split("/")[0];
    svg.appendChild(brandLabel);
  });

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "bubble-chart-wrap";
  wrap.appendChild(svg);

  const note = document.createElement("p");
  note.className = "bubble-note";
  note.textContent =
    "x 轴看品牌对半拉链的布局深度，y 轴看半拉链 GMV 增长，气泡大小代表 25AW 半拉链 GMV。SALOMON 为低基数高增长的离群点。";
  wrap.appendChild(note);

  container.appendChild(wrap);
}
