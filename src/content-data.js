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

function summarizeHalfZipByBrand(rows) {
  const summary = new Map();

  rows.forEach((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return;
    }

    const brand = getMarketScopeDisplayBrandName(normalizeBrandName(row["品牌"]));
    const current = summary.get(brand) ?? {
      brand,
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

    summary.set(brand, current);
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

export const FABRIC_CATEGORY_DEFINITIONS = [
  {
    key: "smooth",
    label: "光滑/平整面料",
    labelEn: "Smooth Fabric",
    color: "#b0c3f0",
    functionConclusion: "基础功能承接最稳",
    textile: "表面无明显肌理和绒感，整体视觉光滑或平整",
    positioning: "运动功能层、日常舒适层、基础半拉链",
    sampleCount: 5,
    sampleImages: [
      "../pic/smooth01.jpg",
      "../pic/smooth02.jpg",
      "../pic/smooth03.jpg",
      "../pic/smooth04.jpg",
      "../pic/smooth05.jpg"
    ],
    sampleBrands: [
      "LULULEMON",
      "KAILAS",
      "KAILAS",
      "KOLON",
      "DESCENTE"
    ]
  },
  {
    key: "brushed",
    label: "拉绒/磨毛面料",
    labelEn: "Brushed Fabric",
    color: "#ebc58c",
    functionConclusion: "保暖+弹性舒适导向",
    textile: "有绒感/毛感、表面磨毛感或仿羊毛",
    positioning: "秋冬保暖层、轻保暖、亲肤感",
    sampleCount: 5,
    sampleImages: [
      "../pic/brushed01.jpg",
      "../pic/brushed02.jpg",
      "../pic/brushed03.jpg",
      "../pic/brushed04.jpg",
      "../pic/brushed05.jpg"
    ],
    sampleBrands: [
      "ARC‘TERYX",
      "KAILAS",
      "DESCENTE",
      "LULULEMON",
      "KOLON"
    ]
  },
  {
    key: "textured",
    label: "肌理面料",
    labelEn: "Textured Fabric",
    color: "#e4a7b5",
    functionConclusion: "速干+弹力强表达",
    textile: "表面有明确视觉纹理或结构感，如罗纹、华夫格等",
    positioning: "具有透气结构、设计感、风格化面料",
    sampleCount: 5,
    sampleImages: [
      "../pic/textured01.jpg",
      "../pic/textured02.jpg",
      "../pic/textured03.jpg",
      "../pic/textured04.jpg",
      "../pic/textured05.jpg"
    ],
    sampleBrands: [
      "ARC‘TERYX",
      "DESCENTE",
      "LULULEMON",
      "LULULEMON",
      "LULULEMON"
    ]
  },
  {
    key: "wool",
    label: "羊毛面料",
    labelEn: "Wool",
    color: "#99cce8",
    functionConclusion: "功能复合度最高",
    textile: "明确含羊毛/美利奴羊毛等天然羊毛成分",
    positioning: "贴身功能层、高端保暖、专业户外",
    sampleCount: 5,
    sampleImages: [
      "../pic/wool01.jpg",
      "../pic/wool02.jpg",
      "../pic/wool03.jpg",
      "../pic/wool04.jpg",
      "../pic/wool05.jpg"
    ],
    sampleBrands: [
      "ARC‘TERYX",
      "DESCENTE",
      "KOLON",
      "KAILAS",
      "LULULEMON"
    ]
  }
];

function normalizeFabricCategory(rawFabricTexture) {
  const value = String(rawFabricTexture ?? "").trim();
  if (!value) {
    return null;
  }

  if (
    value.includes("拉绒") ||
    value.includes("磨毛") ||
    value.includes("抓绒") ||
    value.includes("仿羊毛") ||
    value.includes("丝绒")
  ) {
    return "brushed";
  }

  if (value.includes("羊毛")) {
    return "wool";
  }

  if (
    value.includes("纹理") ||
    value.includes("肌理") ||
    value.includes("网面") ||
    value.includes("网状") ||
    value.includes("华夫格") ||
    value.includes("罗纹") ||
    value.includes("针织") ||
    value.includes("格子") ||
    value.includes("波浪")
  ) {
    return value.startsWith("光滑") ? "smooth" : "textured";
  }

  if (value.includes("光滑") || value.includes("平整") || value.includes("平滑") || value.includes("顺滑")) {
    return "smooth";
  }

  return "smooth";
}

function summarizeFabricOverview(rows) {
  const summary = new Map();
  let totalGmv = 0;

  rows.forEach((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return;
    }

    const categoryKey = normalizeFabricCategory(row["面料质地"]);
    if (!categoryKey) {
      return;
    }

    const current = summary.get(categoryKey) ?? {
      key: categoryKey,
      gmv: 0,
      count: 0,
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

    if (dealPrice > 0 && units > 0) {
      current.weightedDealPriceTotal += dealPrice * units;
      current.weightedDealPriceUnits += units;
    } else if (dealPrice > 0) {
      current.fallbackDealPriceTotal += dealPrice;
      current.fallbackDealPriceCount += 1;
    }

    totalGmv += sales;
    summary.set(categoryKey, current);
  });

  summary.forEach((item) => {
    if (item.weightedDealPriceUnits > 0) {
      item.avgDealPrice = item.weightedDealPriceTotal / item.weightedDealPriceUnits;
    } else if (item.fallbackDealPriceCount > 0) {
      item.avgDealPrice = item.fallbackDealPriceTotal / item.fallbackDealPriceCount;
    }

    item.share = totalGmv ? (item.gmv / totalGmv) * 100 : 0;
  });

  return {
    totalGmv,
    items: summary
  };
}

const FUNCTION_BUCKETS = [
  {
    key: "warmth",
    label: "保暖",
    labelEn: "Warmth",
    color: "#e6adc8",
    tokens: ["保暖", "锁温保暖", "远红外保暖", "保暖蓄热", "吸光发热保暖"]
  },
  {
    key: "quick-dry",
    label: "吸湿速干",
    labelEn: "Quick Dry",
    color: "#70a6c8",
    tokens: ["吸湿速干", "吸湿排汗", "排汗", "芯吸", "速干", "透气排汗", "出汗不粘"]
  },
  {
    key: "stretch",
    label: "弹力",
    labelEn: "Stretchable",
    color: "#86a5da",
    tokens: ["弹力", "四面弹力", "高弹力", "微弹"]
  },
  {
    key: "breathable",
    label: "透气",
    labelEn: "Breathable",
    color: "#7e9aaa",
    tokens: ["透气", "透气排汗"]
  },
  {
    key: "moisture-vapor",
    label: "透湿",
    labelEn: "Moisture Vapor",
    color: "#80bfa8",
    tokens: ["透湿", "透汽"]
  },
  {
    key: "antibacterial",
    label: "抑菌防臭",
    labelEn: "Antibacterial",
    color: "#77b98c",
    tokens: ["抗菌", "抑菌", "抗菌防臭", "抑菌防臭", "防臭抑菌", "抑菌除臭"]
  },
  {
    key: "lightweight",
    label: "轻量",
    labelEn: "Lightweight",
    color: "#c5a7dc",
    tokens: ["轻量", "轻薄", "轻盈", "轻盈柔软"]
  },
  {
    key: "sun-protect",
    label: "防晒",
    labelEn: "Suncreen",
    color: "#e4c96d",
    tokens: ["防晒", "UPF50+防晒", "UPF100+防晒", "UPF50防紫外线防晒", "防晒抗UV"]
  },
  {
    key: "cool-touch",
    label: "凉感",
    labelEn: "Cooling",
    color: "#8fcbd1",
    tokens: ["凉感", "接触凉感"]
  },
  {
    key: "windproof",
    label: "防风",
    labelEn: "Windproof",
    color: "#50627a",
    tokens: ["防风"]
  },
  {
    key: "durable",
    label: "耐磨耐用",
    labelEn: "Durable",
    color: "#b88d78",
    tokens: ["耐磨", "耐用"]
  },
  {
    key: "anti-static",
    label: "防静电",
    labelEn: "Anti-static",
    color: "#f08a6a",
    tokens: ["防静电"]
  }
];

const FUNCTION_TOKEN_TO_BUCKET = FUNCTION_BUCKETS.reduce((map, bucket) => {
  bucket.tokens.forEach((token) => {
    map.set(token.toLowerCase(), bucket.key);
  });
  return map;
}, new Map());

function getFunctionBucketKeys(row) {
  const keys = new Set();

  String(row.function ?? "")
    .split("/")
    .map((token) => token.trim())
    .filter(Boolean)
    .forEach((token) => {
      const directKey = FUNCTION_TOKEN_TO_BUCKET.get(token.toLowerCase());
      if (directKey) keys.add(directKey);

      // 防晒 / 凉感经常以复合功能词出现，按包含关系兜底避免漏算。
      if (token.includes("防晒")) keys.add("sun-protect");
      if (token.includes("凉感")) keys.add("cool-touch");
    });

  return Array.from(keys);
}

function summarizeFunctionCoverage(rows, gender) {
  const filteredRows = rows.filter((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return false;
    }

    return !gender || row.gender === gender;
  });
  const totalGmv = filteredRows.reduce((sum, row) => sum + toNumber(row["销售额"]), 0);
  const totalCount = filteredRows.length;
  let functionGmv = 0;
  let functionCount = 0;
  const bucketMap = new Map(
    FUNCTION_BUCKETS.map((bucket) => [
      bucket.key,
      {
        ...bucket,
        gmv: 0,
        count: 0
      }
    ])
  );

  filteredRows.forEach((row) => {
    const gmv = toNumber(row["销售额"]);
    const bucketKeys = getFunctionBucketKeys(row);
    if (bucketKeys.length) {
      functionGmv += gmv;
      functionCount += 1;
    }

    bucketKeys.forEach((key) => {
      const current = bucketMap.get(key);
      if (!current) {
        return;
      }

      current.gmv += gmv;
      current.count += 1;
    });
  });

  return {
    totalGmv,
    totalCount,
    functionGmv,
    functionCount,
    buckets: Array.from(bucketMap.values())
  };
}

function summarizeFunctionCoverageByBrand(rows, brandName) {
  const filteredRows = rows.filter((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return false;
    }

    return getMarketScopeDisplayBrandName(normalizeBrandName(row["品牌"])) === brandName;
  });

  const totalGmv = filteredRows.reduce((sum, row) => sum + toNumber(row["销售额"]), 0);
  const totalCount = filteredRows.length;
  let functionGmv = 0;
  let functionCount = 0;
  const bucketMap = new Map(
    FUNCTION_BUCKETS.map((bucket) => [
      bucket.key,
      {
        ...bucket,
        gmv: 0,
        count: 0
      }
    ])
  );

  filteredRows.forEach((row) => {
    const gmv = toNumber(row["销售额"]);
    const bucketKeys = getFunctionBucketKeys(row);
    if (bucketKeys.length) {
      functionGmv += gmv;
      functionCount += 1;
    }

    bucketKeys.forEach((key) => {
      const current = bucketMap.get(key);
      if (!current) {
        return;
      }

      current.gmv += gmv;
      current.count += 1;
    });
  });

  return {
    totalGmv,
    totalCount,
    functionGmv,
    functionCount,
    buckets: Array.from(bucketMap.values())
  };
}

function summarizeFunctionCoverageByBrandGender(rows, brandName, gender) {
  const filteredRows = rows.filter((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return false;
    }

    return getMarketScopeDisplayBrandName(normalizeBrandName(row["品牌"])) === brandName && row.gender === gender;
  });

  const totalGmv = filteredRows.reduce((sum, row) => sum + toNumber(row["销售额"]), 0);
  const totalCount = filteredRows.length;
  let functionGmv = 0;
  let functionCount = 0;
  const bucketMap = new Map(
    FUNCTION_BUCKETS.map((bucket) => [
      bucket.key,
      {
        ...bucket,
        gmv: 0,
        count: 0
      }
    ])
  );

  filteredRows.forEach((row) => {
    const gmv = toNumber(row["销售额"]);
    const bucketKeys = getFunctionBucketKeys(row);
    if (bucketKeys.length) {
      functionGmv += gmv;
      functionCount += 1;
    }

    bucketKeys.forEach((key) => {
      const current = bucketMap.get(key);
      if (!current) {
        return;
      }

      current.gmv += gmv;
      current.count += 1;
    });
  });

  return {
    totalGmv,
    totalCount,
    functionGmv,
    functionCount,
    buckets: Array.from(bucketMap.values())
  };
}

function summarizeSilhouetteByBrandGender(rows, brandName, gender) {
  const comboMap = new Map();
  let trackedCount = 0;
  let trackedGmv = 0;

  rows.forEach((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return;
    }

    if (getMarketScopeDisplayBrandName(normalizeBrandName(row["品牌"])) !== brandName || row.gender !== gender) {
      return;
    }

    const fit = normalizeSilhouetteFit(row.fit);
    const length = normalizeSilhouetteLength(row.length);
    if (!fit || !length || fit === "gender-split") {
      return;
    }

    const comboKey = `${fit}__${length}`;
    const gmv = toNumber(row["销售额"]);
    const current = comboMap.get(comboKey) ?? {
      fit,
      length,
      count: 0,
      gmv: 0
    };

    current.count += 1;
    current.gmv += gmv;
    comboMap.set(comboKey, current);
    trackedCount += 1;
    trackedGmv += gmv;
  });

  return {
    comboMap,
    trackedCount,
    trackedGmv
  };
}

function buildFunctionRows(current, previous, denominator = current.totalGmv) {
  return current.buckets
    .map((bucket) => {
      const previousBucket = previous.buckets.find((item) => item.key === bucket.key) ?? { gmv: 0, count: 0 };
      const share = denominator ? (bucket.gmv / denominator) * 100 : 0;
      const yoy = computeYoy(bucket.gmv, previousBucket.gmv);

      return {
        key: bucket.key,
        label: bucket.label,
        labelEn: bucket.labelEn,
        color: bucket.color,
        gmv25: bucket.gmv,
        gmv24: previousBucket.gmv,
        count25: bucket.count,
        count24: previousBucket.count,
        share,
        shareLabel: `${Math.round(share)}%`,
        yoy,
        yoyLabel: previousBucket.gmv > 0 ? formatYoyLabel(yoy) : bucket.gmv > 0 ? "new" : "n/a"
      };
    })
    .filter((row) => row.gmv25 > 0)
    .sort((a, b) => b.share - a.share);
}

function summarizeHalfZipTotals(rows, gender) {
  return rows.reduce(
    (summary, row) => {
      if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
        return summary;
      }

      if (gender && row.gender !== gender) {
        return summary;
      }

      summary.gmv += toNumber(row["销售额"]);
      summary.count += 1;
      return summary;
    },
    { gmv: 0, count: 0 }
  );
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
const HALFZIP_BRAND_SUMMARY_Y25 = summarizeHalfZipByBrand(LS_HZ_INNER_DATASET.raw.y25);

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

export const COMPETITOR_BRAND_SNAPSHOT = MARKET_SCOPE_BRAND_COMPARE.map((item) => {
  const brandSummary = HALFZIP_BRAND_SUMMARY_Y25.get(item.brand) ?? {
    avgDealPrice: 0
  };

  return {
    brand: item.brand,
    innerShare: item.halfZipShareOfInner,
    innerShareLabel: item.halfZipShareLabel,
    halfZipYoy: item.halfZipYoy,
    halfZipYoyLabel: item.halfZipYoyLabel,
    avgDealPrice25: brandSummary.avgDealPrice,
    avgDealPrice25Label: brandSummary.avgDealPrice
      ? `¥${Math.round(brandSummary.avgDealPrice).toLocaleString("en-US")}`
      : "n/a"
  };
});

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

export const COMPETITOR_BRAND_SEGMENT_METRICS = Object.fromEntries(
  FEMALE_OPPORTUNITY_BRAND_GENDER.flatMap((row) =>
    row.cells
      .filter((cell) => cell.gender === "女" || cell.gender === "男")
      .map((cell) => [
        `${row.brand}__${cell.gender}`,
        {
          brand: row.brand,
          gender: cell.gender,
          share: cell.share,
          shareLabel: cell.shareLabel,
          yoy: cell.yoy,
          yoyLabel: cell.yoyLabel
        }
      ])
  )
);

const FUNCTION_COVERAGE_Y25 = summarizeFunctionCoverage(LS_HZ_INNER_DATASET.raw.y25);
const FUNCTION_COVERAGE_Y24 = summarizeFunctionCoverage(LS_HZ_INNER_DATASET.raw.y24);
const FUNCTION_OPPORTUNITY_VIEWS = [
  { key: "all", label: "ALL", gender: null },
  { key: "male", label: "MALE", gender: "男" },
  { key: "female", label: "FEMALE", gender: "女" }
];

function buildFunctionOpportunityMeta(rows, totals25, totals24) {
  const displayRows = rows.filter((row) => row.gmv25 > 0 && row.key !== "windproof");
  const averageShare = displayRows.length
    ? displayRows.reduce((sum, row) => sum + row.share, 0) / displayRows.length
    : 0;
  const ttlHalfZipYoy = computeYoy(totals25.gmv, totals24.gmv);

  return {
    ttlHalfZipYoy,
    ttlHalfZipYoyLabel: formatYoyLabel(ttlHalfZipYoy),
    averageFunctionShare: averageShare,
    averageFunctionShareLabel: `${Math.round(averageShare)}%`
  };
}

export const FUNCTION_OPPORTUNITY_MAPS = FUNCTION_OPPORTUNITY_VIEWS.reduce((result, view) => {
  const current = view.gender
    ? summarizeFunctionCoverage(LS_HZ_INNER_DATASET.raw.y25, view.gender)
    : FUNCTION_COVERAGE_Y25;
  const previous = view.gender
    ? summarizeFunctionCoverage(LS_HZ_INNER_DATASET.raw.y24, view.gender)
    : FUNCTION_COVERAGE_Y24;

  result[view.key] = buildFunctionRows(current, previous).slice(0, 10);
  return result;
}, {});

export const FUNCTION_OPPORTUNITY_MAP = FUNCTION_OPPORTUNITY_MAPS.all;

export const FUNCTION_OPPORTUNITY_META = FUNCTION_OPPORTUNITY_VIEWS.reduce((result, view) => {
  const totals25 = summarizeHalfZipTotals(LS_HZ_INNER_DATASET.raw.y25, view.gender);
  const totals24 = summarizeHalfZipTotals(LS_HZ_INNER_DATASET.raw.y24, view.gender);
  result[view.key] = buildFunctionOpportunityMeta(FUNCTION_OPPORTUNITY_MAPS[view.key], totals25, totals24);
  return result;
}, {});

const FUNCTION_GENDER_KEYS = [
  { gender: "男", label: "Male", className: "is-male" },
  { gender: "女", label: "Female", className: "is-female" }
];
const FUNCTION_GENDER_COVERAGE_Y25 = FUNCTION_GENDER_KEYS.map((item) => ({
  ...item,
  summary: summarizeFunctionCoverage(LS_HZ_INNER_DATASET.raw.y25, item.gender),
  previousSummary: summarizeFunctionCoverage(LS_HZ_INNER_DATASET.raw.y24, item.gender)
}));

export const FUNCTION_GENDER_SPLIT = FUNCTION_GENDER_COVERAGE_Y25.map((item) => {
  const rows = buildFunctionRows(item.summary, item.previousSummary, item.summary.totalGmv).slice(0, 7);
  const yoy = computeYoy(item.summary.totalGmv, item.previousSummary.totalGmv);
  const share = item.summary.totalGmv ? (item.summary.functionGmv / item.summary.totalGmv) * 100 : 0;

  return {
    gender: item.gender,
    label: item.label,
    className: item.className,
    totalGmv25: item.summary.totalGmv,
    totalGmv24: item.previousSummary.totalGmv,
    totalCount25: item.summary.totalCount,
    functionGmv25: item.summary.functionGmv,
    functionGmv24: item.previousSummary.functionGmv,
    functionCount25: item.summary.functionCount,
    salesShare: share,
    salesShareLabel: `${Math.round(share)}%`,
    yoy,
    yoyLabel: formatYoyLabel(yoy),
    rows
  };
});

const COMPETITOR_FUNCTION_RADAR_CONFIG = [
  {
    brand: "ARC'TERYX/始祖鸟",
    conclusion: "功能非增长重心，主要以保暖为核心叠加弹力、速干、透气。",
    radarKeys: ["warmth", "stretch", "quick-dry", "breathable", "durable", "lightweight"]
  },
  {
    brand: "KAILAS/凯乐石",
    conclusion: "以吸湿速干、抑菌、保暖、透气为多重核心形成强复合功能层。",
    radarKeys: ["quick-dry", "antibacterial", "warmth", "breathable", "stretch", "lightweight"],
    strongCombos: [
      {
        label: "吸湿速干+抑菌防臭",
        shareLabel: "84%",
        yoyLabel: "+237%",
        yoy: 237
      },
      {
        label: "保暖+吸湿速干+透气",
        shareLabel: "63%",
        yoyLabel: "+227%",
        yoy: 227
      }
    ]
  },
  {
    brand: "KOLON SPORT/可隆",
    conclusion: "以弹力与速干为核心，偏通勤户外的舒适功能层。",
    radarKeys: ["stretch", "quick-dry", "antibacterial", "warmth", "anti-static"],
    strongCombos: [
      {
        label: "弹力+吸湿速干",
        shareLabel: "39%",
        yoyLabel: "+769%",
        yoy: 769
      }
    ]
  },
  {
    brand: "DESCENTE/迪桑特",
    conclusion: "以弹力和吸湿速干为双核心，整体偏性能训练导向。",
    radarKeys: ["stretch", "quick-dry", "warmth", "lightweight", "sun-protect"]
  },
  {
    brand: "LULULEMON/露露乐蒙",
    conclusion: "以弹力为核心叠加速干、保暖与抑菌，整体偏运动休闲舒适功能。",
    radarKeys: ["stretch", "quick-dry", "warmth", "antibacterial", "lightweight"],
    strongCombos: [
      {
        label: "弹力+抑菌防臭",
        shareLabel: "35%",
        yoyLabel: "+290%",
        yoy: 290
      }
    ]
  }
];

export const COMPETITOR_BRAND_FUNCTION_RADARS = Object.fromEntries(
  COMPETITOR_FUNCTION_RADAR_CONFIG.map((item) => {
    const currentSummary = summarizeFunctionCoverageByBrand(LS_HZ_INNER_DATASET.raw.y25, item.brand);
    const previousSummary = summarizeFunctionCoverageByBrand(LS_HZ_INNER_DATASET.raw.y24, item.brand);

    return [
      item.brand,
      {
        brand: item.brand,
        conclusion: item.conclusion,
        strongCombos: item.strongCombos ?? [],
        functionPenetrationShare: currentSummary.totalGmv
          ? (currentSummary.functionGmv / currentSummary.totalGmv) * 100
          : 0,
        functionPenetrationLabel: `${Math.round(
          currentSummary.totalGmv ? (currentSummary.functionGmv / currentSummary.totalGmv) * 100 : 0
        )}%`,
        rows: buildFunctionRows(currentSummary, previousSummary, currentSummary.totalGmv).filter((row) =>
          (item.radarKeys ?? []).includes(row.key)
        )
      }
    ];
  })
);

const COMPETITOR_SEGMENT_TOP_FUNCTION_BRANDS = [
  "ARC'TERYX/始祖鸟",
  "KAILAS/凯乐石",
  "KOLON SPORT/可隆",
  "DESCENTE/迪桑特",
  "LULULEMON/露露乐蒙"
];

const COMPETITOR_SEGMENT_TOP_FUNCTION_GENDERS = ["女", "男"];

export const COMPETITOR_BRAND_SEGMENT_TOP_FUNCTIONS = Object.fromEntries(
  COMPETITOR_SEGMENT_TOP_FUNCTION_BRANDS.flatMap((brand) =>
    COMPETITOR_SEGMENT_TOP_FUNCTION_GENDERS.map((gender) => {
      const current = summarizeFunctionCoverageByBrandGender(LS_HZ_INNER_DATASET.raw.y25, brand, gender);
      const previous = summarizeFunctionCoverageByBrandGender(LS_HZ_INNER_DATASET.raw.y24, brand, gender);

      return [
        `${brand}__${gender}`,
        {
          brand,
          gender,
          rows: buildFunctionRows(current, previous, current.totalGmv).slice(0, 5)
        }
      ];
    })
  )
);

const COMPETITOR_BRAND_SEGMENT_FIT_LENGTH_CONFIG = {
  "ARC'TERYX/始祖鸟__女": 2,
  "ARC'TERYX/始祖鸟__男": 2,
  "KAILAS/凯乐石__女": 3,
  "KAILAS/凯乐石__男": 2,
  "KOLON SPORT/可隆__女": 3,
  "KOLON SPORT/可隆__男": 2,
  "DESCENTE/迪桑特__女": 2,
  "DESCENTE/迪桑特__男": 2,
  "LULULEMON/露露乐蒙__女": 3,
  "LULULEMON/露露乐蒙__男": 2
};

export const COMPETITOR_BRAND_SEGMENT_FIT_LENGTH = Object.fromEntries(
  Object.entries(COMPETITOR_BRAND_SEGMENT_FIT_LENGTH_CONFIG).map(([key, limit]) => {
    const [brand, gender] = key.split("__");
    const current = summarizeSilhouetteByBrandGender(LS_HZ_INNER_DATASET.raw.y25, brand, gender);
    const previous = summarizeSilhouetteByBrandGender(LS_HZ_INNER_DATASET.raw.y24, brand, gender);

    return [
      key,
      {
        brand,
        gender,
        rows: Array.from(current.comboMap.values())
          .map((item) => {
            const previousItem = previous.comboMap.get(`${item.fit}__${item.length}`) ?? {
              count: 0,
              gmv: 0
            };
            const yoy = computeYoy(item.gmv, previousItem.gmv);
            const share = current.trackedGmv ? (item.gmv / current.trackedGmv) * 100 : 0;
            const labelEn = `${formatSilhouetteFitShort(item.fit)} × ${formatSilhouetteLengthShort(item.length)}`;
            const useOneDecimalShareLabel =
              brand === "KOLON SPORT/可隆" && gender === "男" && labelEn === "Slim × Regular";

            return {
              fit: item.fit,
              length: item.length,
              labelEn,
              share,
              shareLabel: `${useOneDecimalShareLabel ? share.toFixed(1) : Math.round(share)}%`,
              yoy,
              yoyLabel: previousItem.gmv > 0 ? formatYoyLabel(yoy) : item.count > 0 ? "new" : "n/a",
              gmv25: item.gmv,
              count25: item.count
            };
          })
          .sort((a, b) => b.gmv25 - a.gmv25)
          .slice(0, limit)
      }
    ];
  })
);

function summarizeFabricWarmthByBrand(rows, brandName) {
  const filteredRows = rows.filter((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return false;
    }

    return getMarketScopeDisplayBrandName(normalizeBrandName(row["品牌"])) === brandName;
  });

  return summarizeFabricWarmth(filteredRows);
}

const COMPETITOR_BRAND_FABRIC_RADAR_CONFIG = [
  {
    brand: "ARC'TERYX/始祖鸟",
    conclusion: "光滑/平整面料仍是主盘，但结构正从加绒保暖层转向轻量贴身的非加绒层；拉绒/磨毛加绒面料增长迅速，承接保暖层需求。",
    combos: [
      {
        key: "smooth__fleece",
        shortLabel: "光滑 X 加绒",
        label: "光滑/平整面料 × 加绒"
        ,
        labelEn: "Smooth X Fleece"
      },
      {
        key: "smooth__non-fleece",
        shortLabel: "光滑 X 不加绒",
        label: "光滑/平整面料 × 不加绒"
        ,
        labelEn: "Smooth X Non-fleece"
      },
      {
        key: "wool__non-fleece",
        shortLabel: "羊毛 X 不加绒",
        label: "羊毛面料 × 不加绒"
        ,
        labelEn: "Wool X Non-fleece"
      },
      {
        key: "textured__fleece",
        shortLabel: "肌理 X 加绒",
        label: "肌理面料 × 加绒"
        ,
        labelEn: "Textured X Fleece"
      },
      {
        key: "brushed__fleece",
        shortLabel: "拉绒/磨毛 X 加绒",
        label: "拉绒/磨毛面料 × 加绒"
        ,
        labelEn: "Brushed X Fleece"
      }
    ]
  },
  {
    brand: "KAILAS/凯乐石",
    conclusion: "光滑/平整 X 加绒为稳定主盘，羊毛面料为主要增量，整体结构以保暖为导向。",
    combos: [
      {
        key: "smooth__fleece",
        shortLabel: "光滑 X 加绒",
        label: "光滑/平整面料 × 加绒",
        labelEn: "Smooth X Fleece"
      },
      {
        key: "wool__fleece",
        shortLabel: "羊毛 X 加绒",
        label: "羊毛面料 × 加绒",
        labelEn: "Wool X Fleece"
      },
      {
        key: "wool__non-fleece",
        shortLabel: "羊毛 X 不加绒",
        label: "羊毛面料 × 不加绒",
        labelEn: "Wool X Non-fleece"
      },
      {
        key: "smooth__non-fleece",
        shortLabel: "光滑 X 不加绒",
        label: "光滑/平整面料 × 不加绒",
        labelEn: "Smooth X Non-fleece"
      },
      {
        key: "textured__fleece",
        shortLabel: "肌理 X 加绒",
        label: "肌理面料 × 加绒",
        labelEn: "Textured X Fleece"
      }
    ]
  },
  {
    brand: "KOLON SPORT/可隆",
    conclusion: "重心向“表面光滑内里加绒”与“表面拉绒内里不加绒”双向迁移，面料结构明显重组。",
    combos: [
      {
        key: "smooth__fleece",
        shortLabel: "光滑 X 加绒",
        label: "光滑/平整面料 × 加绒",
        labelEn: "Smooth X Fleece"
      },
      {
        key: "brushed__non-fleece",
        shortLabel: "拉绒/磨毛 X 不加绒",
        label: "拉绒/磨毛面料 × 不加绒",
        labelEn: "Brushed X Non-fleece"
      },
      {
        key: "smooth__non-fleece",
        shortLabel: "光滑 X 不加绒",
        label: "光滑/平整面料 × 不加绒",
        labelEn: "Smooth X Non-fleece"
      },
      {
        key: "brushed__fleece",
        shortLabel: "拉绒/磨毛 X 加绒",
        label: "拉绒/磨毛面料 × 加绒",
        labelEn: "Brushed X Fleece"
      },
      {
        key: "wool__non-fleece",
        shortLabel: "羊毛 X 不加绒",
        label: "羊毛面料 × 不加绒",
        labelEn: "Wool X Non-fleece"
      }
    ]
  },
  {
    brand: "DESCENTE/迪桑特",
    conclusion: "整体偏轻量训练层而非保暖层，非加绒结构为主盘，其中核心是光滑面料，拉绒和肌理面料快速扩张。",
    combos: [
      {
        key: "smooth__non-fleece",
        shortLabel: "光滑 X 不加绒",
        label: "光滑/平整面料 × 不加绒",
        labelEn: "Smooth X Non-fleece"
      },
      {
        key: "brushed__non-fleece",
        shortLabel: "拉绒/磨毛 X 不加绒",
        label: "拉绒/磨毛面料 × 不加绒",
        labelEn: "Brushed X Non-fleece"
      },
      {
        key: "brushed__fleece",
        shortLabel: "拉绒/磨毛 X 加绒",
        label: "拉绒/磨毛面料 × 加绒",
        labelEn: "Brushed X Fleece"
      },
      {
        key: "textured__non-fleece",
        shortLabel: "肌理 X 不加绒",
        label: "肌理面料 × 不加绒",
        labelEn: "Textured X Non-fleece"
      },
      {
        key: "smooth__fleece",
        shortLabel: "光滑 X 加绒",
        label: "光滑/平整面料 × 加绒",
        labelEn: "Smooth X Fleece"
      }
    ]
  },
  {
    brand: "LULULEMON/露露乐蒙",
    conclusion: "面料结构较分散，肌理面料、光滑/平整面料承接非加绒贴身层，拉绒/磨毛面料承接加绒保暖层。",
    combos: [
      {
        key: "textured__non-fleece",
        shortLabel: "肌理 X 不加绒",
        label: "肌理面料 × 不加绒",
        labelEn: "Textured X Non-fleece"
      },
      {
        key: "smooth__non-fleece",
        shortLabel: "光滑 X 不加绒",
        label: "光滑/平整面料 × 不加绒",
        labelEn: "Smooth X Non-fleece"
      },
      {
        key: "brushed__fleece",
        shortLabel: "拉绒/磨毛 X 加绒",
        label: "拉绒/磨毛面料 × 加绒",
        labelEn: "Brushed X Fleece"
      },
      {
        key: "brushed__non-fleece",
        shortLabel: "拉绒/磨毛 X 不加绒",
        label: "拉绒/磨毛面料 × 不加绒",
        labelEn: "Brushed X Non-fleece"
      },
      {
        key: "wool__fleece",
        shortLabel: "羊毛 X 加绒",
        label: "羊毛面料 × 加绒",
        labelEn: "Wool X Fleece"
      }
    ]
  }
];

export const COMPETITOR_BRAND_FABRIC_RADARS = Object.fromEntries(
  COMPETITOR_BRAND_FABRIC_RADAR_CONFIG.map((item) => {
    const currentSummary = summarizeFabricWarmthByBrand(LS_HZ_INNER_DATASET.raw.y25, item.brand);
    const previousSummary = summarizeFabricWarmthByBrand(LS_HZ_INNER_DATASET.raw.y24, item.brand);

    return [
      item.brand,
      {
        brand: item.brand,
        conclusion: item.conclusion ?? "",
        rows: item.combos
          .map((combo) => {
            const current = currentSummary.items.get(combo.key) ?? {
              gmv: 0,
              share: 0,
              avgDealPrice: 0,
              count: 0
            };
            const previous = previousSummary.items.get(combo.key) ?? {
              gmv: 0,
              share: 0,
              avgDealPrice: 0,
              count: 0
            };
            const yoy = computeYoy(current.gmv, previous.gmv);

            return {
              key: combo.key,
              label: combo.shortLabel,
              fullLabel: combo.label,
              fullLabelEn: combo.labelEn,
              share: current.share,
              shareLabel: `${Math.round(current.share)}%`,
              yoy,
              yoyLabel: previous.gmv > 0 ? formatYoyLabel(yoy) : current.gmv > 0 ? "new" : "n/a",
              asp: current.avgDealPrice,
              aspLabel: `¥${Math.round(current.avgDealPrice || 0).toLocaleString("en-US")}`
            };
          })
          .filter((row) => row.share > 0)
      }
    ];
  })
);

const SILHOUETTE_Y25 = createSilhouetteSummary(LS_HZ_INNER_DATASET.raw.y25);
const SILHOUETTE_Y24 = createSilhouetteSummary(LS_HZ_INNER_DATASET.raw.y24);
const FABRIC_OVERVIEW_Y25 = summarizeFabricOverview(LS_HZ_INNER_DATASET.raw.y25);
const FABRIC_OVERVIEW_Y24 = summarizeFabricOverview(LS_HZ_INNER_DATASET.raw.y24);

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

const SILHOUETTE_GROWTH_REQUIRED_KEYS = new Set([
  "regular合体__semi-crop短款",
  "slim修身__semi-crop短款"
]);

const SILHOUETTE_GROWTH_SOURCE = (() => {
  const ranked = SILHOUETTE_MATRIX_DATA.filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  const selected = ranked.slice(0, 6);
  const selectedKeys = new Set(selected.map((item) => `${item.fit}__${item.length}`));

  ranked.forEach((item) => {
    const key = `${item.fit}__${item.length}`;
    if (!SILHOUETTE_GROWTH_REQUIRED_KEYS.has(key) || selectedKeys.has(key)) {
      return;
    }

    selected.push(item);
    selectedKeys.add(key);
  });

  return selected;
})();

export const SILHOUETTE_GROWTH_DATA = SILHOUETTE_GROWTH_SOURCE.map((item) => {
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

const FABRIC_CATEGORY_LOOKUP = new Map(
  FABRIC_CATEGORY_DEFINITIONS.map((definition) => [definition.key, definition])
);

const FABRIC_WARMTH_BUCKETS = [
  {
    key: "non-fleece",
    label: "不加绒",
    labelEn: "Non-fleece",
    axisOrder: 0
  },
  {
    key: "fleece",
    label: "加绒",
    labelEn: "Fleece",
    axisOrder: 1
  }
];

const FABRIC_FUNCTION_MATRIX_BUCKET_KEYS = [
  "warmth",
  "quick-dry",
  "stretch",
  "breathable",
  "antibacterial",
  "lightweight"
];

function normalizeWarmthBucket(rawWarmth) {
  return String(rawWarmth ?? "").trim() === "是" ? "fleece" : "non-fleece";
}

function summarizeFabricWarmth(rows) {
  const summary = new Map();
  let totalGmv = 0;

  rows.forEach((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return;
    }

    const fabricKey = normalizeFabricCategory(row["面料质地"]);
    if (!fabricKey) {
      return;
    }

    const warmthKey = normalizeWarmthBucket(row["内里是否加绒"]);
    const summaryKey = `${fabricKey}__${warmthKey}`;
    const current = summary.get(summaryKey) ?? {
      key: summaryKey,
      fabricKey,
      warmthKey,
      gmv: 0,
      count: 0,
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

    if (dealPrice > 0 && units > 0) {
      current.weightedDealPriceTotal += dealPrice * units;
      current.weightedDealPriceUnits += units;
    } else if (dealPrice > 0) {
      current.fallbackDealPriceTotal += dealPrice;
      current.fallbackDealPriceCount += 1;
    }

    totalGmv += sales;
    summary.set(summaryKey, current);
  });

  summary.forEach((item) => {
    if (item.weightedDealPriceUnits > 0) {
      item.avgDealPrice = item.weightedDealPriceTotal / item.weightedDealPriceUnits;
    } else if (item.fallbackDealPriceCount > 0) {
      item.avgDealPrice = item.fallbackDealPriceTotal / item.fallbackDealPriceCount;
    }

    item.share = totalGmv ? (item.gmv / totalGmv) * 100 : 0;
  });

  return {
    totalGmv,
    items: summary
  };
}

function summarizeWarmthOverview(rows) {
  const summary = new Map();
  let totalGmv = 0;

  rows.forEach((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return;
    }

    const warmthKey = normalizeWarmthBucket(row["内里是否加绒"]);
    const current = summary.get(warmthKey) ?? {
      warmthKey,
      gmv: 0,
      count: 0,
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

    if (dealPrice > 0 && units > 0) {
      current.weightedDealPriceTotal += dealPrice * units;
      current.weightedDealPriceUnits += units;
    } else if (dealPrice > 0) {
      current.fallbackDealPriceTotal += dealPrice;
      current.fallbackDealPriceCount += 1;
    }

    totalGmv += sales;
    summary.set(warmthKey, current);
  });

  summary.forEach((item) => {
    if (item.weightedDealPriceUnits > 0) {
      item.avgDealPrice = item.weightedDealPriceTotal / item.weightedDealPriceUnits;
    } else if (item.fallbackDealPriceCount > 0) {
      item.avgDealPrice = item.fallbackDealPriceTotal / item.fallbackDealPriceCount;
    }

    item.share = totalGmv ? (item.gmv / totalGmv) * 100 : 0;
  });

  return {
    totalGmv,
    items: summary
  };
}

function summarizeFabricFunctionMatrix(rows) {
  const summary = new Map(
    FABRIC_CATEGORY_DEFINITIONS.map((definition) => [
      definition.key,
      {
        key: definition.key,
        gmv: 0,
        count: 0,
        functionGmv: 0,
        buckets: new Map(FABRIC_FUNCTION_MATRIX_BUCKET_KEYS.map((bucketKey) => [bucketKey, 0]))
      }
    ])
  );

  rows.forEach((row) => {
    if (row["LS HZ Inner"] !== TARGET_CATEGORY) {
      return;
    }

    const fabricKey = normalizeFabricCategory(row["面料质地"]);
    const current = summary.get(fabricKey);
    if (!current) {
      return;
    }

    const sales = toNumber(row["销售额"]);
    const bucketKeys = getFunctionBucketKeys(row);

    current.gmv += sales;
    current.count += 1;

    if (bucketKeys.length > 0) {
      current.functionGmv += sales;
    }

    bucketKeys.forEach((bucketKey) => {
      if (!current.buckets.has(bucketKey)) {
        return;
      }

      current.buckets.set(bucketKey, (current.buckets.get(bucketKey) ?? 0) + sales);
    });
  });

  return Array.from(summary.values()).map((item) => ({
    ...item,
    functionCoverageShare: item.gmv ? (item.functionGmv / item.gmv) * 100 : 0,
    functionCoverageLabel: `${Math.round(item.gmv ? (item.functionGmv / item.gmv) * 100 : 0)}%`,
    cells: FABRIC_FUNCTION_MATRIX_BUCKET_KEYS.map((bucketKey) => {
      const bucketGmv = item.buckets.get(bucketKey) ?? 0;
      const share = item.gmv ? (bucketGmv / item.gmv) * 100 : 0;

      return {
        key: bucketKey,
        gmv: bucketGmv,
        share,
        shareLabel: `${Math.round(share)}%`
      };
    })
  }));
}

export const FABRIC_OVERVIEW_DATA = FABRIC_CATEGORY_DEFINITIONS.map((definition) => {
  const current = FABRIC_OVERVIEW_Y25.items.get(definition.key) ?? {
    gmv: 0,
    share: 0,
    avgDealPrice: 0,
    count: 0
  };
  const previous = FABRIC_OVERVIEW_Y24.items.get(definition.key) ?? {
    gmv: 0,
    share: 0,
    avgDealPrice: 0,
    count: 0
  };
  const yoy = computeYoy(current.gmv, previous.gmv);

  return {
    ...definition,
    gmv25: current.gmv,
    gmv24: previous.gmv,
    share25: current.share,
    share24: previous.share,
    share25Label: `${Math.round(current.share)}%`,
    share24Label: `${Math.round(previous.share)}%`,
    avgDealPrice25: current.avgDealPrice,
    avgDealPrice25Label: `¥${Math.round(current.avgDealPrice || 0).toLocaleString("en-US")}`,
    yoy,
    yoyLabel: formatYoyLabel(yoy),
    count25: current.count,
    count24: previous.count
  };
}).sort((a, b) => b.gmv25 - a.gmv25);

const FABRIC_WARMTH_Y25 = summarizeFabricWarmth(LS_HZ_INNER_DATASET.raw.y25);
const FABRIC_WARMTH_Y24 = summarizeFabricWarmth(LS_HZ_INNER_DATASET.raw.y24);
const WARMTH_OVERVIEW_Y25 = summarizeWarmthOverview(LS_HZ_INNER_DATASET.raw.y25);
const WARMTH_OVERVIEW_Y24 = summarizeWarmthOverview(LS_HZ_INNER_DATASET.raw.y24);
const FABRIC_FUNCTION_MATRIX_Y25 = summarizeFabricFunctionMatrix(LS_HZ_INNER_DATASET.raw.y25);
const FABRIC_FUNCTION_MATRIX_Y24 = summarizeFabricFunctionMatrix(LS_HZ_INNER_DATASET.raw.y24);

export const FABRIC_WARMTH_OVERVIEW_DATA = FABRIC_WARMTH_BUCKETS.map((warmthBucket) => {
  const current = WARMTH_OVERVIEW_Y25.items.get(warmthBucket.key) ?? {
    gmv: 0,
    share: 0,
    avgDealPrice: 0,
    count: 0
  };
  const previous = WARMTH_OVERVIEW_Y24.items.get(warmthBucket.key) ?? {
    gmv: 0,
    share: 0,
    avgDealPrice: 0,
    count: 0
  };
  const yoy = computeYoy(current.gmv, previous.gmv);

  return {
    key: warmthBucket.key,
    label: warmthBucket.label,
    labelEn: warmthBucket.labelEn,
    gmv25: current.gmv,
    share25: current.share,
    share25Label: `${Math.round(current.share)}%`,
    avgDealPrice25: current.avgDealPrice,
    avgDealPrice25Label: `¥${Math.round(current.avgDealPrice || 0).toLocaleString("en-US")}`,
    yoy,
    yoyLabel: previous.gmv > 0 ? formatYoyLabel(yoy) : current.gmv > 0 ? "new" : "n/a",
    count25: current.count
  };
});

export const FABRIC_WARMTH_BUBBLE_DATA = FABRIC_CATEGORY_DEFINITIONS.flatMap((definition) =>
  FABRIC_WARMTH_BUCKETS.map((warmthBucket) => {
    const current = FABRIC_WARMTH_Y25.items.get(`${definition.key}__${warmthBucket.key}`) ?? {
      gmv: 0,
      share: 0,
      avgDealPrice: 0,
      count: 0
    };
    const previous = FABRIC_WARMTH_Y24.items.get(`${definition.key}__${warmthBucket.key}`) ?? {
      gmv: 0,
      share: 0,
      avgDealPrice: 0,
      count: 0
    };
    const yoy = computeYoy(current.gmv, previous.gmv);

    return {
      key: `${definition.key}__${warmthBucket.key}`,
      fabricKey: definition.key,
      fabricLabel: definition.label,
      fabricLabelEn: definition.labelEn,
      warmthKey: warmthBucket.key,
      warmthLabel: warmthBucket.label,
      warmthLabelEn: warmthBucket.labelEn,
      warmthAxisOrder: warmthBucket.axisOrder,
      color: definition.color,
      gmv25: current.gmv,
      gmv24: previous.gmv,
      share25: current.share,
      share25Label: `${Math.round(current.share)}%`,
      avgDealPrice25: current.avgDealPrice,
      avgDealPrice25Label: `¥${Math.round(current.avgDealPrice || 0).toLocaleString("en-US")}`,
      yoy,
      yoyLabel:
        previous.gmv > 0 ? formatYoyLabel(yoy) : current.gmv > 0 ? "new" : "n/a",
      count25: current.count
    };
  }).filter((item) => item.gmv25 > 0)
);

export const FABRIC_FUNCTION_MATRIX_COLUMNS = FABRIC_FUNCTION_MATRIX_BUCKET_KEYS.map((bucketKey) => {
  const bucket = FUNCTION_BUCKETS.find((item) => item.key === bucketKey);
  return {
    key: bucketKey,
    label: bucket?.label ?? bucketKey,
    labelEn: bucket?.labelEn ?? bucketKey,
    color: bucket?.color ?? "#cbd5e1"
  };
});

export const FABRIC_FUNCTION_MATRIX_DATA = FABRIC_OVERVIEW_DATA.map((definition) => {
  const matrixRow = FABRIC_FUNCTION_MATRIX_Y25.find((item) => item.key === definition.key) ?? {
    gmv: 0,
    count: 0,
    functionCoverageShare: 0,
    functionCoverageLabel: "0%",
    cells: []
  };
  const previousMatrixRow = FABRIC_FUNCTION_MATRIX_Y24.find((item) => item.key === definition.key) ?? {
    gmv: 0,
    count: 0,
    functionCoverageShare: 0,
    functionCoverageLabel: "0%",
    cells: []
  };

  return {
    key: definition.key,
    label: definition.label,
    labelEn: definition.labelEn,
    color: definition.color,
    functionConclusion: definition.functionConclusion ?? `功能表达 ${matrixRow.functionCoverageLabel}`,
    gmv25: definition.gmv25,
    gmv25Label: `¥${Math.round(definition.gmv25 / 10000)}w`,
    count25: matrixRow.count,
    functionCoverageShare: matrixRow.functionCoverageShare,
    functionCoverageLabel: matrixRow.functionCoverageLabel,
    cells: FABRIC_FUNCTION_MATRIX_COLUMNS.map((column) => {
      const cell = matrixRow.cells.find((item) => item.key === column.key) ?? {
        key: column.key,
        gmv: 0,
        share: 0,
        shareLabel: "0%"
      };
      const previousCell = previousMatrixRow.cells.find((item) => item.key === column.key) ?? {
        key: column.key,
        gmv: 0,
        share: 0,
        shareLabel: "0%"
      };
      const yoy = computeYoy(cell.gmv, previousCell.gmv);

      return {
        ...cell,
        label: column.label,
        labelEn: column.labelEn,
        color: column.color,
        yoy,
        yoyLabel: previousCell.gmv > 0 ? formatYoyLabel(yoy) : cell.gmv > 0 ? "new" : "n/a"
      };
    })
  };
});

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
