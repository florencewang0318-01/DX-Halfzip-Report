function getMetricClass(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "metric-cell";
  }

  if (value > 0) {
    return "metric-cell is-positive";
  }

  if (value < 0) {
    return "metric-cell is-negative";
  }

  return "metric-cell";
}

function renderShareCell(label, value) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value ?? 0)));

  return `
    <div class="share-meter" aria-label="半拉链占内搭总体 ${label}">
      <div class="share-meter-track">
        <div class="share-meter-fill" style="width: ${safeValue}%;"></div>
      </div>
      <span class="share-meter-value">${label}</span>
    </div>
  `;
}

export function renderBrandCompareTable(container, rows) {
  if (!container) {
    return;
  }

  const header = `
    <thead>
      <tr>
        <th>品牌</th>
        <th>内搭总体<br>YoY%</th>
        <th>半拉链占<br>内搭总体</th>
        <th>半拉链<br>YoY%</th>
      </tr>
    </thead>
  `;

  const body = rows
    .map(
      (row) => `
        <tr>
          <td><div class="brand-name">${row.brand}</div></td>
          <td class="${getMetricClass(row.innerYoy)}">${row.innerYoyLabel}</td>
          <td class="metric-cell share-cell">${renderShareCell(row.halfZipShareLabel, row.halfZipShareOfInner)}</td>
          <td class="${getMetricClass(row.halfZipYoy)}">${row.halfZipYoyLabel}</td>
        </tr>
      `
    )
    .join("");

  container.innerHTML = `
    <table class="brand-compare-table">
      ${header}
      <tbody>${body}</tbody>
    </table>
  `;
}

function getYoyClass(label) {
  if (label === "n/a") {
    return "gender-cell-yoy is-neutral";
  }

  if (label.startsWith("+")) {
    return "gender-cell-yoy is-positive";
  }

  if (label.startsWith("-")) {
    return "gender-cell-yoy is-negative";
  }

  return "gender-cell-yoy is-neutral";
}

function getGenderFillClass(gender) {
  if (gender === "女") {
    return "is-female";
  }

  if (gender === "男") {
    return "is-male";
  }

  return "is-unisex";
}

function renderGenderBreakdownBrand(row) {
  if (row.brand.includes("SALOMON")) {
    return `
      <div class="gender-breakdown-brand-main">SALOMON/萨洛蒙*</div>
      <div class="gender-breakdown-brand-sub">(仅 2 SKU)</div>
    `;
  }

  return `<div class="gender-breakdown-brand-main">${row.brand}</div>`;
}

function getGenderLegendLabel(gender) {
  if (gender === "女") {
    return "Female";
  }

  if (gender === "男") {
    return "Male";
  }

  return "Unisex";
}

function renderGenderBreakdownYoy(row, cell, width) {
  if (width < 10) {
    return "";
  }

  if (row.brand.includes("SALOMON") && cell.gender === "女") {
    return `
      <span class="gender-segment-yoy-inline gender-segment-yoy-new">
        <span class="gender-segment-yoy-new-text">new</span>
        <span class="gender-segment-yoy-sku">+1 SKU</span>
      </span>
    `;
  }

  if (cell.yoyLabel === "n/a") {
    return "";
  }

  return `<span class="${getYoyClass(cell.yoyLabel)} gender-segment-yoy-inline">${cell.yoyLabel}</span>`;
}

export function renderFemaleOpportunityGenderMatrix(container, rows) {
  if (!container) {
    return;
  }

  const legend = `
    <div class="gender-breakdown-legend">
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
  `;

  const body = rows
    .map((row) => {
      const orderedCells = ["女", "男", "男女"]
        .map((gender) => row.cells.find((cell) => cell.gender === gender))
        .filter(Boolean);

      const segments = orderedCells
        .map((cell) => {
          const width = Math.max(0, Number(cell.share || 0));
          const showShare = width >= 7;
          const yoyMarkup = renderGenderBreakdownYoy(row, cell, width);
          const content =
            showShare || yoyMarkup
              ? `
                <div class="gender-segment-content">
                  ${showShare ? `<span class="gender-segment-share">${cell.shareLabel}</span>` : ""}
                  ${yoyMarkup}
                </div>
              `
              : "";

          return `
            <div
              class="gender-segment ${getGenderFillClass(cell.gender)}"
              style="width: ${width}%;"
              data-brand="${row.brand}"
              data-gender="${cell.gender}"
              data-price="${Math.round(cell.avgDealPrice || 0)}"
              data-yoy="${cell.yoyLabel}"
              data-gender-label="${getGenderLegendLabel(cell.gender)}"
            >
              ${content}
            </div>
          `;
        })
        .join("");

      return `
        <div class="gender-breakdown-row">
          <div class="gender-breakdown-brand">${renderGenderBreakdownBrand(row)}</div>
          <div class="gender-breakdown-track">${segments}</div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `<div class="gender-brand-matrix">${legend}<div class="gender-breakdown-rows">${body}</div></div>`;
}
