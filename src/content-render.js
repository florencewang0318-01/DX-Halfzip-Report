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

function getContentRenderLanguage() {
  if (typeof document === "undefined") {
    return "zh";
  }

  return document.body?.dataset.lang === "en" ? "en" : "zh";
}

function renderShareCell(label, value, note = "") {
  const safeValue = Math.max(0, Math.min(100, Math.round(value ?? 0)));
  const lang = getContentRenderLanguage();
  const ariaLabel = lang === "en" ? `Half-Zipper share in TTL Inner ${label}` : `半拉链占内搭总体 ${label}`;

  return `
    <div class="share-meter-stack" aria-label="${ariaLabel}">
      <div class="share-meter">
        <div class="share-meter-track">
          <div class="share-meter-fill" style="width: ${safeValue}%;"></div>
        </div>
        <span class="share-meter-value">${label}</span>
      </div>
      ${note ? `<div class="share-meter-note">${note}</div>` : ""}
    </div>
  `;
}

function getDiscoverySkuNote(brand) {
  return "";
}

function renderMarketScopeBrandCell(brand) {
  const note = getDiscoverySkuNote(brand);
  const isPlan = brand === "DISCOVERY_PLAN";
  const displayBrand = String(brand).toUpperCase().includes("DISCOVERY") ? "Discovery 25FW" : brand;
  return `
    <div class="brand-name">
      <div class="market-scope-brand-main">
        ${
          isPlan
            ? `Discovery 26FW <span class="market-scope-brand-plan">(Plan)</span>`
            : displayBrand
        }
      </div>
      ${note ? `<div class="market-scope-brand-sub">${note}</div>` : ""}
    </div>
  `;
}

function renderCompareColorCell(cell, toneClass, brandClass) {
  const lang = getContentRenderLanguage();
  const renderSwatches = (swatches = []) =>
    swatches
      .map((swatch) => `<span class="compare-color-swatch" style="background:${swatch};"></span>`)
      .join("");

  return `
    <div class="compare-matrix-cell ${toneClass} ${brandClass}">
      <div class="compare-color-stack">
        <div class="compare-color-line">
          <span class="compare-color-label">${lang === "en" ? "F" : "女"}</span>
          <span class="compare-color-swatch-row">${renderSwatches(cell.female?.swatches)}</span>
        </div>
        <div class="compare-color-line">
          <span class="compare-color-label">${lang === "en" ? "M" : "男"}</span>
          <span class="compare-color-swatch-row">${renderSwatches(cell.male?.swatches)}</span>
        </div>
      </div>
    </div>
  `;
}

function getCompareYoyClass(label) {
  if (!label || label === "n/a") {
    return "compare-yoy is-neutral";
  }

  if (String(label).trim().startsWith("-")) {
    return "compare-yoy is-negative";
  }

  if (String(label).trim().startsWith("+") || String(label).trim().toLowerCase() === "new") {
    return "compare-yoy is-positive";
  }

  return "compare-yoy is-neutral";
}

function renderCompareScaleCell(cell, toneClass, brandClass) {
  const lang = getContentRenderLanguage();
  const sub = cell.sub;
  const detail =
    sub && typeof sub === "object"
      ? `
          <div class="compare-cell-sub compare-cell-sub-multiline">
          <div class="compare-cell-sub-line">
            <span>${lang === "en" ? "Depth " : "占内搭"}<span class="compare-emphasis-value">${sub.innerShareLabel}</span>,</span>
            <span>YOY</span>
            <span class="${getCompareYoyClass(sub.yoyLabel)}">${sub.yoyLabel}</span>
          </div>
          <div class="compare-cell-sub-line">ATV: ${sub.atvLabel}</div>
        </div>
      `
      : `<div class="compare-cell-sub">n/a</div>`;

  return `
    <div class="compare-matrix-cell ${toneClass} ${brandClass}">
      <div class="compare-cell-main">${lang === "en" ? cell.mainEn ?? cell.main ?? "" : cell.main ?? ""}</div>
      ${detail}
    </div>
  `;
}

function renderCompareGenderCell(cell, toneClass, brandClass) {
  const lang = getContentRenderLanguage();
  const sub = cell.sub;
  const detail =
    sub && typeof sub === "object"
      ? `
        <div class="compare-cell-sub compare-cell-sub-multiline">
          <div class="compare-cell-sub-line">
            <span>${lang === "en" ? "F" : "女"}</span>
            <span class="compare-emphasis-value">${sub.female?.shareLabel ?? "n/a"}</span>,
            <span>YOY%</span>
            <span class="${getCompareYoyClass(sub.female?.yoyLabel)}">${sub.female?.yoyLabel ?? "n/a"}</span>
          </div>
          <div class="compare-cell-sub-line">
            <span>${lang === "en" ? "M" : "男"}</span>
            <span class="compare-emphasis-value">${sub.male?.shareLabel ?? "n/a"}</span>,
            <span>YOY%</span>
            <span class="${getCompareYoyClass(sub.male?.yoyLabel)}">${sub.male?.yoyLabel ?? "n/a"}</span>
          </div>
        </div>
      `
      : `<div class="compare-cell-sub">n/a</div>`;

  return `
    <div class="compare-matrix-cell ${toneClass} ${brandClass}">
      <div class="compare-cell-main">${lang === "en" ? cell.mainEn ?? cell.main ?? "" : cell.main ?? ""}</div>
      ${detail}
    </div>
  `;
}

function renderCompareSilhouetteCell(cell, toneClass, brandClass) {
  const lang = getContentRenderLanguage();
  const main = cell.main;
  const detail =
    main && typeof main === "object"
      ? `
        <div class="compare-cell-main compare-cell-main-split">
          <div class="compare-cell-main-line">${lang === "en" ? main.femaleLabelEn ?? main.femaleLabel ?? "n/a" : main.femaleLabel ?? "n/a"}</div>
          <div class="compare-cell-main-line">${lang === "en" ? main.maleLabelEn ?? main.maleLabel ?? "n/a" : main.maleLabel ?? "n/a"}</div>
        </div>
      `
      : `<div class="compare-cell-main">n/a</div>`;

  return `
    <div class="compare-matrix-cell ${toneClass} ${brandClass}">
      ${detail}
    </div>
  `;
}

function renderCompareFabricCell(cell, toneClass, brandClass) {
  const lang = getContentRenderLanguage();
  const subSource = lang === "en" ? cell.subEn ?? cell.sub : cell.sub;
  const subMarkup =
    subSource && typeof subSource === "object" && Array.isArray(subSource.parts)
      ? `
        <div class="compare-cell-sub">
          ${subSource.parts
            .map((part) =>
              part.tone
                ? `<span class="compare-yoy is-${part.tone}">${part.text}</span>`
                : `<span>${part.text}</span>`
            )
            .join("")}
        </div>
      `
      : `<div class="compare-cell-sub">${subSource ?? "n/a"}</div>`;

  return `
    <div class="compare-matrix-cell ${toneClass} ${brandClass}">
      <div class="compare-cell-main">${lang === "en" ? cell.mainEn ?? cell.main ?? "" : cell.main ?? ""}</div>
      ${subMarkup}
    </div>
  `;
}

export function renderBrandCompareMatrix(table, matrix) {
  if (!table || !matrix) {
    return;
  }
  const lang = getContentRenderLanguage();

  const header = `
    <thead>
      <tr>
        <th>${lang === "en" ? "Dimension" : "维度"}</th>
        ${matrix.brands
          .map(
            (brand) => `
              <th class="${brand.className}">
                <span class="compare-column-head">
                  <span class="compare-column-dot ${brand.className}"></span>
                  <span>${brand.shortLabel}</span>
                </span>
              </th>
            `
          )
          .join("")}
      </tr>
    </thead>
  `;

  const body = matrix.rows
    .map((row) => {
      const cellsMarkup = row.cells
        .map((cell) => {
          const brandClass = matrix.brands.find((item) => item.brand === cell.brand)?.className ?? "";
          const content =
            row.key === "color"
              ? renderCompareColorCell(cell, row.tone, brandClass)
              : row.key === "scale"
                ? renderCompareScaleCell(cell, row.tone, brandClass)
                : row.key === "gender"
                  ? renderCompareGenderCell(cell, row.tone, brandClass)
                  : row.key === "silhouette"
                    ? renderCompareSilhouetteCell(cell, row.tone, brandClass)
                    : row.key === "fabric"
                      ? renderCompareFabricCell(cell, row.tone, brandClass)
              : `
                <div class="compare-matrix-cell ${row.tone} ${brandClass}">
                  <div class="compare-cell-main">${lang === "en" ? cell.mainEn ?? cell.main ?? "" : cell.main ?? ""}</div>
                  <div class="compare-cell-sub">${lang === "en" ? cell.subEn ?? cell.sub ?? "" : cell.sub ?? ""}</div>
                </div>
              `;
          return `<td>${content}</td>`;
        })
        .join("");

      return `
        <tr>
          <th>
            <div class="compare-dimension-label">
              <div class="compare-dimension-top">
                <div class="compare-dimension-main">${row.label}</div>
              </div>
              <div class="compare-dimension-sub">${row.labelEn}</div>
            </div>
          </th>
          ${cellsMarkup}
        </tr>
      `;
    })
    .join("");

  table.innerHTML = `${header}<tbody>${body}</tbody>`;
}

export function renderBrandCompareTable(container, rows) {
  if (!container) {
    return;
  }

  const lang = getContentRenderLanguage();

  const header = `
    <thead>
      <tr>
        <th>Brand</th>
        <th>Inner TTL<br>YOY%</th>
        <th>ZT<br>STY</th>
        <th>ZT GMV%<br>in TTL Inner</th>
        <th>ZT<br>YOY%</th>
      </tr>
    </thead>
  `;

  const rowsWithPlan = [
    ...rows,
    {
      brand: "DISCOVERY_PLAN",
      innerYoy: null,
      innerYoyLabel: "",
      halfZipStyleCount: 7,
      halfZipShareOfInner: 32,
      halfZipShareLabel: "32%",
      halfZipShareNote: "(Order Value% in TTL Inner)",
      halfZipYoy: null,
      halfZipYoyLabel: ""
    }
  ];

  const body = rowsWithPlan
    .map(
      (row) => `
        <tr
          class="market-scope-row${row.brand === "DISCOVERY" ? " is-discovery" : ""}${row.brand === "DISCOVERY_PLAN" ? " is-plan" : ""}"
          data-brand="${row.brand}"
          data-share="${row.halfZipShareLabel}"
          data-yoy="${row.halfZipYoyLabel}"
          tabindex="0"
        >
          <td>${renderMarketScopeBrandCell(row.brand)}</td>
          <td class="${getMetricClass(row.innerYoy)}">${row.innerYoyLabel}</td>
          <td class="metric-cell">${row.halfZipStyleCount}</td>
          <td class="metric-cell share-cell${row.halfZipShareNote ? " has-note" : ""}">${renderShareCell(row.halfZipShareLabel, row.halfZipShareOfInner, row.halfZipShareNote ?? "")}</td>
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
  const note = getDiscoverySkuNote(row.brand);
  const isPlan = row.brand === "DISCOVERY_PLAN";
  const displayBrand = String(row.brand).toUpperCase().includes("DISCOVERY") ? "DISCOVERY 25FW" : row.brand;
  return `
    <div class="gender-breakdown-brand-main">
      ${
        isPlan
          ? `DISCOVERY 26FW <span class="gender-breakdown-brand-plan">(Plan)</span>`
          : displayBrand
      }
    </div>
    ${isPlan ? `<div class="gender-breakdown-brand-sub">(Order Value%)</div>` : note ? `<div class="gender-breakdown-brand-sub">${note}</div>` : ""}
  `;
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
  if (row.brand === "DISCOVERY_PLAN" && cell.yoyLabel) {
    return `<span class="gender-cell-yoy is-neutral gender-segment-yoy-inline">${cell.yoyLabel}</span>`;
  }

  if (String(row.brand).toUpperCase().includes("DISCOVERY") && cell.gender === "女" && width >= 10) {
    return `<span class="gender-cell-yoy is-neutral gender-segment-yoy-inline">new</span>`;
  }

  if (!cell.yoyLabel) {
    return "";
  }

  if (width < 10) {
    return "";
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

  const rowsWithPlan = [
    ...rows,
    {
      brand: "DISCOVERY_PLAN",
      cells: [
        { gender: "女", share: 54, shareLabel: "54%", yoyLabel: "4 STY" },
        { gender: "男", share: 46, shareLabel: "46%", yoyLabel: "3 STY" }
      ]
    }
  ];

  const body = rowsWithPlan
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
        <div class="gender-breakdown-row${row.brand === "DISCOVERY_PLAN" ? " is-plan" : ""}">
          <div class="gender-breakdown-brand">${renderGenderBreakdownBrand(row)}</div>
          <div class="gender-breakdown-track-stack">
            <div class="gender-breakdown-track">${segments}</div>
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `<div class="gender-brand-matrix">${legend}<div class="gender-breakdown-rows">${body}</div></div>`;
}
