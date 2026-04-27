import {
  LS_HZ_INNER_WORKBOOK,
  LS_HZ_INNER_Y24,
  LS_HZ_INNER_Y25
} from "./data/ls-hz-inner-data.js";

const TARGET_CATEGORY = "半拉链长袖内搭";

const BRAND_NAME_MAP = {
  "ARC‘TERYX/始祖鸟": "ARC'TERYX/始祖鸟",
  "lululemon/露露乐蒙": "lululemon/露露乐蒙"
};

function normalizeBrandName(brand) {
  return BRAND_NAME_MAP[brand] ?? brand;
}

function normalizeRow(row, season) {
  return {
    ...row,
    品牌: normalizeBrandName(row["品牌"]),
    season
  };
}

function filterHalfZip(rows) {
  return rows
    .filter((row) => row["LS HZ Inner"] === TARGET_CATEGORY)
    .map((row) => normalizeRow(row, "25AW"));
}

function summarizeByValue(rows, field) {
  const counts = new Map();

  rows.forEach((row) => {
    const rawValue = row[field];
    if (!rawValue) {
      return;
    }

    counts.set(rawValue, (counts.get(rawValue) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function toNumber(value) {
  const normalized = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(normalized) ? normalized : 0;
}

function summarizeBrandPerformance(rows) {
  const summary = new Map();

  rows.forEach((row) => {
    const brand = normalizeBrandName(row["品牌"]);
    if (!brand) {
      return;
    }

    const current = summary.get(brand) ?? {
      brand,
      innerGmv: 0,
      halfZipGmv: 0
    };

    current.innerGmv += toNumber(row["销售额"]);

    if (row["LS HZ Inner"] === TARGET_CATEGORY) {
      current.halfZipGmv += toNumber(row["销售额"]);
    }

    summary.set(brand, current);
  });

  return summary;
}

function computeYoy(current, previous) {
  if (!previous) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "n/a";
  }

  const rounded = Math.round(value);
  return `${value > 0 ? "+" : ""}${rounded}%`;
}

function formatYoyLabel(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "n/a";
  }

  const rounded = Math.round(value);
  if (rounded === 0) {
    return "0%";
  }
  return `${rounded > 0 ? "+" : ""}${rounded.toLocaleString("en-US")}%`;
}

function getMarketScopeDisplayBrandName(brand) {
  if (brand === "lululemon/露露乐蒙") {
    return "LULULEMON/露露乐蒙";
  }

  return brand;
}

function summarizeHalfZipByBrandGender(rows) {
  const summary = new Map();

  rows.forEach((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return;
    }

    const brand = getMarketScopeDisplayBrandName(normalizeBrandName(row["品牌"]));
    const gender = row["gender"] || "未标注";
    const key = `${brand}__${gender}`;
    const current = summary.get(key) ?? {
      brand,
      gender,
      gmv: 0,
      count: 0,
      units: 0,
      weightedDealPriceTotal: 0,
      weightedDealPriceUnits: 0,
      fallbackDealPriceTotal: 0,
      fallbackDealPriceCount: 0,
      avgDealPrice: 0
    };

    const sales = toNumber(row["销售额"]);
    const units = toNumber(row["销量"]);
    const dealPrice = toNumber(row["成交均价"] ?? row["成交价格"]);

    current.gmv += sales;
    current.count += 1;

    if (units > 0) {
      current.units += units;
    }

    if (dealPrice > 0 && units > 0) {
      current.weightedDealPriceTotal += dealPrice * units;
      current.weightedDealPriceUnits += units;
    } else if (dealPrice > 0) {
      current.fallbackDealPriceTotal += dealPrice;
      current.fallbackDealPriceCount += 1;
    }

    summary.set(key, current);
  });

  summary.forEach((item) => {
    if (item.weightedDealPriceUnits > 0) {
      item.avgDealPrice = item.weightedDealPriceTotal / item.weightedDealPriceUnits;
      return;
    }

    if (item.fallbackDealPriceCount > 0) {
      item.avgDealPrice = item.fallbackDealPriceTotal / item.fallbackDealPriceCount;
    }
  });

  return summary;
}

const SILHOUETTE_FIT_ORDER = ["tight紧身", "slim修身", "regular合体", "Active运动版型", "loose宽松"];
const SILHOUETTE_LENGTH_ORDER = ["crop短款", "semi-crop短款", "regular常规"];
const SILHOUETTE_GENDERS = ["女", "男", "男女"];

function normalizeSilhouetteFit(rawFit) {
  if (!rawFit) {
    return null;
  }

  const normalized = String(rawFit).trim();
  if (SILHOUETTE_FIT_ORDER.includes(normalized)) {
    return normalized;
  }

  if (normalized.includes("男：regular") && normalized.includes("女：slim修身")) {
    return "gender-split";
  }

  return null;
}

function normalizeSilhouetteLength(rawLength) {
  if (!rawLength) {
    return null;
  }

  const normalized = String(rawLength).trim();
  return SILHOUETTE_LENGTH_ORDER.includes(normalized) ? normalized : null;
}

function formatSilhouetteFitShort(fit) {
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

function formatSilhouetteLengthShort(length) {
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

function createSilhouetteSummary(rows) {
  const comboMap = new Map();
  const comboGenderMap = new Map();
  let trackedCount = 0;
  let untrackedCount = 0;
  let trackedGmv = 0;

  rows.forEach((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return;
    }

    const fit = normalizeSilhouetteFit(row.fit);
    const length = normalizeSilhouetteLength(row.length);
    if (!fit || !length || fit === "gender-split") {
      untrackedCount += 1;
      return;
    }

    const gender = SILHOUETTE_GENDERS.includes(row.gender) ? row.gender : "男女";
    const comboKey = `${fit}__${length}`;
    const comboGenderKey = `${fit}__${length}__${gender}`;
    const gmv = toNumber(row["销售额"]);

    const comboCurrent = comboMap.get(comboKey) ?? {
      fit,
      length,
      count: 0,
      gmv: 0
    };
    comboCurrent.count += 1;
    comboCurrent.gmv += gmv;
    comboMap.set(comboKey, comboCurrent);

    const comboGenderCurrent = comboGenderMap.get(comboGenderKey) ?? {
      fit,
      length,
      gender,
      count: 0,
      gmv: 0
    };
    comboGenderCurrent.count += 1;
    comboGenderCurrent.gmv += gmv;
    comboGenderMap.set(comboGenderKey, comboGenderCurrent);

    trackedCount += 1;
    trackedGmv += gmv;
  });

  return {
    comboMap,
    comboGenderMap,
    trackedCount,
    untrackedCount,
    trackedGmv
  };
}

export const LS_HZ_INNER_DATASET = {
  workbook: LS_HZ_INNER_WORKBOOK,
  raw: {
    y25: LS_HZ_INNER_Y25.map((row) => normalizeRow(row, "25AW")),
    y24: LS_HZ_INNER_Y24.map((row) => normalizeRow(row, "24AW"))
  },
  filtered: {
    y25HalfZip: filterHalfZip(LS_HZ_INNER_Y25)
  }
};

export const LS_HZ_INNER_SUMMARY = {
  sampleCount: LS_HZ_INNER_DATASET.filtered.y25HalfZip.length,
  brandCounts: summarizeByValue(LS_HZ_INNER_DATASET.filtered.y25HalfZip, "品牌"),
  genderCounts: summarizeByValue(LS_HZ_INNER_DATASET.filtered.y25HalfZip, "gender"),
  fitCounts: summarizeByValue(LS_HZ_INNER_DATASET.filtered.y25HalfZip, "fit"),
  lengthCounts: summarizeByValue(LS_HZ_INNER_DATASET.filtered.y25HalfZip, "length"),
  brushedCounts: summarizeByValue(LS_HZ_INNER_DATASET.filtered.y25HalfZip, "内里是否加绒")
};

export const REPORT_DATA_SOURCE = {
  product: "半拉链长袖内搭",
  workbook: LS_HZ_INNER_DATASET.workbook.meta,
  dataset: LS_HZ_INNER_DATASET,
  summary: LS_HZ_INNER_SUMMARY
};

const BRAND_PERFORMANCE_Y25 = summarizeBrandPerformance(LS_HZ_INNER_DATASET.raw.y25);
const BRAND_PERFORMANCE_Y24 = summarizeBrandPerformance(LS_HZ_INNER_DATASET.raw.y24);

export const MARKET_SCOPE_BRAND_COMPARE = Array.from(BRAND_PERFORMANCE_Y25.values())
  .map((item) => {
    const previous = BRAND_PERFORMANCE_Y24.get(item.brand) ?? {
      innerGmv: 0,
      halfZipGmv: 0
    };

    const innerYoy = computeYoy(item.innerGmv, previous.innerGmv);
    const halfZipYoy = computeYoy(item.halfZipGmv, previous.halfZipGmv);
    const halfZipShareOfInner = item.innerGmv ? (item.halfZipGmv / item.innerGmv) * 100 : 0;

    return {
      brand: getMarketScopeDisplayBrandName(item.brand),
      innerGmv25: item.innerGmv,
      innerGmv24: previous.innerGmv,
      innerYoy,
      innerYoyLabel: formatPercent(innerYoy),
      halfZipGmv25: item.halfZipGmv,
      halfZipGmv24: previous.halfZipGmv,
      halfZipShareOfInner,
      halfZipShareLabel: `${Math.round(halfZipShareOfInner)}%`,
      halfZipYoy,
      halfZipYoyLabel: formatPercent(halfZipYoy)
    };
  })
  .sort((a, b) => b.innerGmv25 - a.innerGmv25);

const FEMALE_OPPORTUNITY_GENDERS = ["女", "男", "男女"];
const FEMALE_OPPORTUNITY_Y25 = summarizeHalfZipByBrandGender(LS_HZ_INNER_DATASET.raw.y25);
const FEMALE_OPPORTUNITY_Y24 = summarizeHalfZipByBrandGender(LS_HZ_INNER_DATASET.raw.y24);

export const FEMALE_OPPORTUNITY_BRAND_GENDER = Array.from(
  new Set(Array.from(FEMALE_OPPORTUNITY_Y25.values()).map((item) => item.brand))
)
  .map((brand) => {
    const cells = FEMALE_OPPORTUNITY_GENDERS.map((gender) => {
      const current = FEMALE_OPPORTUNITY_Y25.get(`${brand}__${gender}`) ?? {
        gmv: 0,
        count: 0
      };
      const previous = FEMALE_OPPORTUNITY_Y24.get(`${brand}__${gender}`) ?? {
        gmv: 0,
        count: 0
      };

      return {
        gender,
        gmv25: current.gmv,
        count25: current.count,
        units25: current.units,
        avgDealPrice: current.avgDealPrice,
        gmv24: previous.gmv,
        count24: previous.count,
        yoy: computeYoy(current.gmv, previous.gmv)
      };
    });

    const totalGmv25 = cells.reduce((sum, item) => sum + item.gmv25, 0);
    const totalGmv24 = cells.reduce((sum, item) => sum + item.gmv24, 0);
    return {
      brand,
      totalGmv25,
      totalGmv24,
      cells: cells.map((cell) => ({
        ...cell,
        share: totalGmv25 ? (cell.gmv25 / totalGmv25) * 100 : 0,
        share24: totalGmv24 ? (cell.gmv24 / totalGmv24) * 100 : 0,
        shareLabel: `${Math.round(totalGmv25 ? (cell.gmv25 / totalGmv25) * 100 : 0)}%`,
        yoyLabel:
          brand === "KOLON SPORT/可隆" && cell.gender === "男女"
            ? `${(totalGmv25 ? (cell.gmv25 / totalGmv25) * 100 : 0) - (totalGmv24 ? (cell.gmv24 / totalGmv24) * 100 : 0) >= 0 ? "+" : ""}${Math.round(
                (totalGmv25 ? (cell.gmv25 / totalGmv25) * 100 : 0) -
                  (totalGmv24 ? (cell.gmv24 / totalGmv24) * 100 : 0)
              )}pct`
            : formatYoyLabel(cell.yoy)
      }))
    };
  })
  .sort((a, b) => b.totalGmv25 - a.totalGmv25);

export const GENDER_BREAKDOWN_PRICE_BUBBLES = FEMALE_OPPORTUNITY_BRAND_GENDER.flatMap((row, brandIndex) =>
  row.cells
    .filter(
      (cell) =>
        cell.gmv25 > 0 &&
        !(row.brand === "DESCENTE/迪桑特" && cell.gender === "男女")
    )
    .map((cell) => ({
      brand: row.brand,
      brandLabel: row.brand.split("/")[0],
      brandIndex,
      gender: cell.gender,
      avgDealPrice: cell.avgDealPrice,
      yoy: cell.yoy,
      yoyMetric:
        cell.yoyLabel === "n/a"
          ? null
          : Number(String(cell.yoyLabel).replace(/[^\d.-]/g, "")),
      yoyLabel: cell.yoyLabel,
      gmv: cell.gmv25,
      share: cell.share,
      shareLabel: cell.shareLabel,
      skuCount: cell.count25
    }))
);

const SILHOUETTE_Y25 = createSilhouetteSummary(LS_HZ_INNER_DATASET.raw.y25);
const SILHOUETTE_Y24 = createSilhouetteSummary(LS_HZ_INNER_DATASET.raw.y24);

export const SILHOUETTE_MATRIX_DATA = SILHOUETTE_FIT_ORDER.flatMap((fit) =>
  SILHOUETTE_LENGTH_ORDER.map((length) => {
    const current = SILHOUETTE_Y25.comboMap.get(`${fit}__${length}`) ?? {
      count: 0,
      gmv: 0
    };
    const previous = SILHOUETTE_Y24.comboMap.get(`${fit}__${length}`) ?? {
      count: 0,
      gmv: 0
    };

    const genderBreakdown = SILHOUETTE_GENDERS.map((gender) => {
      const item = SILHOUETTE_Y25.comboGenderMap.get(`${fit}__${length}__${gender}`) ?? {
        count: 0,
        gmv: 0
      };
      const previousItem = SILHOUETTE_Y24.comboGenderMap.get(`${fit}__${length}__${gender}`) ?? {
        count: 0,
        gmv: 0
      };
      const yoy = computeYoy(item.gmv, previousItem.gmv);

      return {
        gender,
        count: item.count,
        gmv: item.gmv,
        gmv24: previousItem.gmv,
        yoy,
        yoyLabel: previousItem.gmv > 0 ? formatYoyLabel(yoy) : item.count > 0 ? "new" : "n/a"
      };
    });

    const dominantGender = genderBreakdown.reduce(
      (best, item) => (item.count > best.count ? item : best),
      { gender: "男女", count: 0, gmv: 0 }
    );

    const share = SILHOUETTE_Y25.trackedCount ? (current.count / SILHOUETTE_Y25.trackedCount) * 100 : 0;
    const gmvShare = SILHOUETTE_Y25.trackedGmv ? (current.gmv / SILHOUETTE_Y25.trackedGmv) * 100 : 0;
    const yoy = computeYoy(current.gmv, previous.gmv);

    return {
      fit,
      length,
      count: current.count,
      gmv: current.gmv,
      gmv24: previous.gmv,
      yoy,
      yoyLabel: previous.gmv > 0 ? formatYoyLabel(yoy) : current.count > 0 ? "new" : "n/a",
      share,
      shareLabel: `${Math.round(share)}%`,
      gmvShare,
      gmvShareLabel: `${Math.round(gmvShare)}%`,
      dominantGender: dominantGender.count > 0 ? dominantGender.gender : null,
      dominantGenderShare: current.count ? (dominantGender.count / current.count) * 100 : 0,
      dominantGenderShareLabel: current.count ? `${Math.round((dominantGender.count / current.count) * 100)}%` : "",
      genderBreakdown
    };
  })
);

export const SILHOUETTE_GROWTH_DATA = SILHOUETTE_MATRIX_DATA
  .filter((item) => item.count > 0)
  .sort((a, b) => b.count - a.count)
  .slice(0, 6)
  .map((item) => {
    const comboLabel = `${formatSilhouetteFitShort(item.fit)} × ${formatSilhouetteLengthShort(item.length)}`;

    return {
      fit: item.fit,
      length: item.length,
      comboLabel,
      count: item.count,
      share: item.share,
      shareLabel: item.shareLabel,
      genders: SILHOUETTE_GENDERS.map((gender) => {
        const current = SILHOUETTE_Y25.comboGenderMap.get(`${item.fit}__${item.length}__${gender}`) ?? {
          count: 0,
          gmv: 0
        };
        const previous = SILHOUETTE_Y24.comboGenderMap.get(`${item.fit}__${item.length}__${gender}`) ?? {
          count: 0,
          gmv: 0
        };
        const shareInCombo = item.count ? (current.count / item.count) * 100 : 0;
        const yoy = computeYoy(current.gmv, previous.gmv);

        return {
          gender,
          count25: current.count,
          gmv25: current.gmv,
          gmv24: previous.gmv,
          shareInCombo,
          shareInComboLabel: `${Math.round(shareInCombo)}%`,
          yoy,
          yoyLabel: previous.gmv > 0 ? formatYoyLabel(yoy) : current.count > 0 ? "new" : "n/a"
        };
      })
    };
  });

export const SILHOUETTE_PAGE_DRAFT = {
  trackedSampleCount: SILHOUETTE_Y25.trackedCount,
  untrackedSampleCount: SILHOUETTE_Y25.untrackedCount
};

export const MARKET_SCOPE_PAGE_DRAFT = {
  chapter: "01 Competitor Scope",
  headline: "竞品品牌半拉链表现对比",
  bullets: [
    "左侧表格按 25AW 内搭 GMV 从高到低排序，先看各品牌整体内搭盘子，再看半拉链在其中的角色。",
    "右侧气泡图用半拉链占比、半拉链 GMV YoY 和半拉链 GMV 规模，帮助判断哪些品牌在重投入、强增长或低基数试探。",
    "这一页先建立品牌表现地图，标题和管理层结论后续再基于图形判断收敛。"
  ],
  evidence: [
    {
      title: "样本规模与品牌覆盖",
      description:
        "建议用双轴图呈现各品牌半拉链样本数，以及半拉链在各品牌全店内搭中的配置占比。"
    },
    {
      title: "性别结构分布",
      description:
        "建议用环图或 100% 堆叠条形图呈现男 / 女 / 男女同款占比，为后续女性机会页建立市场基础。"
    }
  ]
};
