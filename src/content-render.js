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
        <span class="share-meter-label">${label}</span>
      </div>
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
    return "gender-cell-fill is-female";
  }

  if (gender === "男") {
    return "gender-cell-fill is-male";
  }

  return "gender-cell-fill is-unisex";
}

export function renderFemaleOpportunityGenderMatrix(container, rows) {
  if (!container) {
    return;
  }

  const header = `
    <div class="gender-matrix-header">
      <div class="gender-matrix-head">品牌</div>
      <div class="gender-matrix-head">Female</div>
      <div class="gender-matrix-head">Male</div>
      <div class="gender-matrix-head">Unisex</div>
    </div>
  `;

  const body = rows
    .map((row) => {
      const cells = row.cells
        .map(
          (cell) => `
            <div class="gender-cell">
              <div class="gender-cell-track">
                <div class="${getGenderFillClass(cell.gender)}" style="width: ${Math.max(
            6,
            Math.round(cell.share)
          )}%;"></div>
              </div>
              <div class="gender-cell-meta">
                <span class="gender-cell-share">${cell.shareLabel}</span>
                <span class="${getYoyClass(cell.yoyLabel)}">${cell.yoyLabel}</span>
              </div>
            </div>
          `
        )
        .join("");

      return `
        <div class="gender-matrix-row">
          <div class="gender-matrix-brand">${row.brand}</div>
          ${cells}
        </div>
      `;
    })
    .join("");

  container.innerHTML = `<div class="gender-brand-matrix">${header}${body}</div>`;
}
