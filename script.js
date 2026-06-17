const ALGORITHM_DB = Array.isArray(window.ALGORITHM_DB) ? window.ALGORITHM_DB : [];

const ALGO_STATUS_KEY = "algmaster_status_v1";
const CUSTOM_ALGO_KEY = "algmaster_custom_algo_v1";
const UI_PREFERENCES_KEY = "algmaster_ui_preferences_v1";
const TRAINER_CASE_SELECTIONS_KEY = "algmaster_trainer_case_selections_v1";
const TRAINER_SOLVE_HISTORY_KEY = "algmaster_trainer_solve_history_v1";
const APP_LANGUAGE_KEY = "algmaster_language_v1";
const TRAINER_CUBE_SOLVER_MAX_DEPTH = 22;
const TRAINER_SOLVE_HISTORY_LIMIT = 100;
const TRAINER_STATUS_FILTER_OPTIONS = Object.freeze(["learned", "learning", "unlearned"]);
const TRAINER_ACTION_ICONS = Object.freeze({
    plus2: "◷",
    dnf: "⊘",
    delete: "⌫",
    cancel: "↺",
    confirm: "✓"
});
const BUILTIN_CATEGORY_ORDER = ["oll", "pll", "zbll"];
const CATEGORY_SUBTYPE_CONFIG = {
    zbll: ["T", "U", "L", "H", "Pi", "S", "As"]
};
const CASE_PATTERN_COLOR_MAP = {
    u: "#facc15",
    r: "#dc2626",
    f: "#16a34a",
    l: "#f97316",
    b: "#2563eb"
};
const SPEED_CUBE_DB_STICKER_COLOR_MAP = {
    y: "#facc15",
    o: "#f97316",
    r: "#dc2626",
    g: "#16a34a",
    b: "#2563eb",
    w: "#f8fafc"
};
const SPEED_CUBE_DB_PUZZLEGEN_COLOR_MAP = {
    y: { value: "#FFFF00", stroke: "#DDDD00" },
    o: { value: "#FFA500", stroke: "#DD8500" },
    r: { value: "#FF0000", stroke: "#DD0000" },
    g: { value: "#00FF00", stroke: "#00DD00" },
    b: { value: "#0000FF", stroke: "#0000DD" },
    w: { value: "#FFFFFF", stroke: "#DDDDDD" }
};

let currentScrambleData = null;
let currentListCategory = "";
let currentTrainerCategory = "";
let currentListSubtype = "";
let currentTrainerSubtype = "";
let currentTrainerStatusFilters = [...TRAINER_STATUS_FILTER_OPTIONS];
let currentLanguage = "zh-TW";
let trainerCubeSolverInitState = "unknown";
const casePatternImageCache = new Map();
const speedCubeDbImageCache = new Map();

const APP_TRANSLATIONS = {
    "zh-TW": {
        navList: "清單",
        navTrainer: "計時訓練",
        navSettings: "設定",
        listTitle: "公式清單與編輯",
        listSubtitle: "先選類型，再直接覆寫成你自己習慣的公式；學習狀態也會一起保存。",
        listTypeLabel: "公式類型",
        listEmptyState: "這個類型目前沒有題目，可以先到題庫資料中新增公式。",
        trainerTypeLabel: "訓練類型",
        trainerRangeLabel: "訓練範圍",
        trainerSelectAll: "全選",
        trainerClearSelection: "清空",
        trainerStatusFilterLabel: "題目狀態",
        trainerNext: "下一題",
        trainerWaitingScramble: "選好範圍後，按空白鍵或點擊卡片開始。",
        trainerWaitingStatus: "等待開始",
        trainerReadyStatus: "已出題，按空白鍵或點擊卡片開始計時。",
        trainerRunningStatus: "計時中…",
        trainerStoppedStatus: "完成，正在準備下一題…",
        trainerNextReadyStatus: "下一題準備好了，隨時可以開始。",
        trainerResettingStatus: "已更新篩選條件，重新抽題中。",
        trainerNoPoolScramble: "目前沒有符合條件的題目，請調整範圍或狀態篩選。",
        trainerNoPoolStatus: "沒有可用題目",
        trainerScrambleError: "這條公式目前無法產生打亂，請檢查公式格式。",
        trainerRangeSummary: "已選 {selected} / {total} 個 case",
        statusLearned: "已學會",
        statusLearning: "學習中",
        statusUnlearned: "未學",
        settingsTitle: "設定",
        settingsSubtitle: "這裡集中管理題庫偏好、語言、備份與重置，流程比照 Blindfolded Letter Pairs。",
        settingsFormulaTitle: "公式資料",
        settingsFormulaDescription: "內建題庫會保留你的學習狀態與自訂公式；要改某一條公式，直接回清單頁編輯就好。",
        settingsFormulaSummary: "目前內建：{counts}",
        settingsFormulaNote: "自訂公式與進度都會一起被匯出。",
        settingsLanguageTitle: "語言",
        settingsLanguageDescription: "跟 Blindfolded Letter Pairs 一樣保留語言切換，但不做 lettering scheme。",
        settingsLanguageCurrent: "目前語言：{language}",
        settingsLanguageToggleGroupLabel: "語言切換",
        settingsBackupTitle: "備份與匯入",
        settingsBackupDescription: "匯出目前進度與自訂公式，或從先前備份還原。",
        settingsExportTypeLabel: "匯出格式",
        settingsExportJson: "JSON 備份",
        settingsExportCsv: "CSV 清單",
        settingsExportButton: "匯出資料",
        settingsImportLabel: "匯入備份",
        settingsChooseFile: "選擇檔案",
        settingsImportButton: "匯入資料",
        settingsImportHint: "目前支援 JSON 備份檔匯入。",
        settingsNoFileChosen: "尚未選擇檔案",
        settingsSelectedFile: "已選擇：{name}",
        settingsDangerTitle: "危險操作",
        settingsDangerDescription: "清除所有學習狀態、自訂公式、訓練範圍與語言偏好。",
        settingsClearButton: "清除所有資料",
        confirmClearAll: "要清除所有學習資料、自訂公式與偏好嗎？這個動作不能復原。",
        importNeedFile: "請先選擇一個 JSON 備份檔。",
        importInvalid: "匯入失敗，這個檔案不是有效的 AlgMaster 備份。",
        importSuccess: "匯入完成，已套用備份資料。",
        exportFilePrefix: "algmaster-backup",
        csvFilePrefix: "algmaster-algorithms",
        languageNameZhTW: "繁體中文",
        languageNameEn: "English"
    },
    en: {
        navList: "List",
        navTrainer: "Trainer",
        navSettings: "Settings",
        listTitle: "Algorithms",
        listSubtitle: "Pick a type, then override any alg with your preferred version. Learning status is saved too.",
        listTypeLabel: "Algorithm Type",
        listEmptyState: "No cases exist in this category yet. Add more algorithms to the database first.",
        trainerTypeLabel: "Trainer Type",
        trainerRangeLabel: "Training Range",
        trainerSelectAll: "Select All",
        trainerClearSelection: "Clear",
        trainerStatusFilterLabel: "Case Status",
        trainerNext: "Next",
        trainerWaitingScramble: "Choose your range, then press Space or tap the card to start.",
        trainerWaitingStatus: "Waiting",
        trainerReadyStatus: "Scramble ready. Press Space or tap the card to start the timer.",
        trainerRunningStatus: "Timing…",
        trainerStoppedStatus: "Done. Preparing the next case…",
        trainerNextReadyStatus: "Next case is ready when you are.",
        trainerResettingStatus: "Filters updated. Drawing a new case…",
        trainerNoPoolScramble: "No cases match the current filters. Adjust the range or status filters.",
        trainerNoPoolStatus: "No cases available",
        trainerScrambleError: "This algorithm cannot produce a scramble right now. Please check the notation.",
        trainerRangeSummary: "{selected} / {total} cases selected",
        statusLearned: "Learned",
        statusLearning: "Learning",
        statusUnlearned: "Unlearned",
        settingsTitle: "Settings",
        settingsSubtitle: "Manage library preferences, language, backup, and reset here, matching Blindfolded Letter Pairs.",
        settingsFormulaTitle: "Algorithm Data",
        settingsFormulaDescription: "Built-in cases keep your learning state and custom algs. Edit any single case back in the list view.",
        settingsFormulaSummary: "Built-in library: {counts}",
        settingsFormulaNote: "Custom algorithms and progress are included in exports.",
        settingsLanguageTitle: "Language",
        settingsLanguageDescription: "This keeps the language toggle from Blindfolded Letter Pairs, minus lettering scheme.",
        settingsLanguageCurrent: "Current language: {language}",
        settingsLanguageToggleGroupLabel: "Language switcher",
        settingsBackupTitle: "Backup & Import",
        settingsBackupDescription: "Export your current progress and custom algorithms, or restore from a backup.",
        settingsExportTypeLabel: "Export Format",
        settingsExportJson: "JSON Backup",
        settingsExportCsv: "CSV List",
        settingsExportButton: "Export Data",
        settingsImportLabel: "Import Backup",
        settingsChooseFile: "Choose File",
        settingsImportButton: "Import Data",
        settingsImportHint: "JSON backups are supported for import right now.",
        settingsNoFileChosen: "No file chosen",
        settingsSelectedFile: "Selected: {name}",
        settingsDangerTitle: "Danger Zone",
        settingsDangerDescription: "Clear all learning states, custom algorithms, trainer ranges, and language preference.",
        settingsClearButton: "Clear All Data",
        confirmClearAll: "Clear all learning data, custom algorithms, and preferences? This cannot be undone.",
        importNeedFile: "Please choose a JSON backup file first.",
        importInvalid: "Import failed. This file is not a valid AlgMaster backup.",
        importSuccess: "Import complete. Backup data has been applied.",
        exportFilePrefix: "algmaster-backup",
        csvFilePrefix: "algmaster-algorithms",
        languageNameZhTW: "Traditional Chinese",
        languageNameEn: "English"
    }
};

const algoSaveTimeouts = {};
let trainerTimerState = "idle";
let trainerStartTimestamp = 0;
let trainerAnimationFrameId = null;
let expandedTrainerHistoryRecordId = null;
let trainerHistoryDeleteConfirmRecordId = null;

function readStoredJson(key, fallbackValue) {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallbackValue));
    } catch (error) {
        return fallbackValue;
    }
}

function normalizeAppLanguage(language) {
    return language === "en" ? "en" : "zh-TW";
}

function getStoredAppLanguage() {
    try {
        return normalizeAppLanguage(localStorage.getItem(APP_LANGUAGE_KEY));
    } catch (error) {
        return "zh-TW";
    }
}

function setStoredAppLanguage(language) {
    currentLanguage = normalizeAppLanguage(language);
    localStorage.setItem(APP_LANGUAGE_KEY, currentLanguage);
}

function t(key, replacements = {}) {
    const dictionary = APP_TRANSLATIONS[currentLanguage] || APP_TRANSLATIONS["zh-TW"];
    const fallbackDictionary = APP_TRANSLATIONS["zh-TW"];
    const template = dictionary[key] || fallbackDictionary[key] || key;
    return Object.entries(replacements).reduce((message, [placeholder, value]) => {
        return message.replace(new RegExp(`\\{${placeholder}\\}`, "g"), String(value));
    }, template);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function setTrainerActionButtonActive(buttonElement, isActive = false) {
    if (!buttonElement) return;
    buttonElement.classList.toggle("is-active", !!isActive);
    buttonElement.setAttribute("aria-pressed", String(!!isActive));
}

function setTrainerActionButtonIcon(buttonElement, icon = "", label = "") {
    if (!buttonElement) return;
    buttonElement.classList.add("trainer-icon-btn");
    buttonElement.innerText = icon;
    if (label) {
        buttonElement.setAttribute("aria-label", label);
        buttonElement.title = label;
    } else {
        buttonElement.removeAttribute?.("aria-label");
        buttonElement.removeAttribute?.("title");
    }
}

function canHandleTrainerCardTapTarget(targetElement) {
    if (!(targetElement instanceof Element)) return false;
    if (targetElement.closest("#trainer-penalty-shell")) return false;
    if (targetElement.closest("button, a, input, textarea, select, label")) return false;
    return true;
}

function getAlgoStatusMap() {
    return readStoredJson(ALGO_STATUS_KEY, {});
}

function getCustomAlgoMap() {
    return readStoredJson(CUSTOM_ALGO_KEY, {});
}

function getUiPreferences() {
    return readStoredJson(UI_PREFERENCES_KEY, {});
}

function normalizeTrainerStatusFilters(filters) {
    if (!Array.isArray(filters)) return [...TRAINER_STATUS_FILTER_OPTIONS];

    const normalized = TRAINER_STATUS_FILTER_OPTIONS.filter((status) => filters.includes(status));
    return normalized.length > 0 ? normalized : [...TRAINER_STATUS_FILTER_OPTIONS];
}

function getTrainerCaseSelectionMap() {
    return readStoredJson(TRAINER_CASE_SELECTIONS_KEY, {});
}

function getTrainerSolveHistory() {
    const rawHistory = readStoredJson(TRAINER_SOLVE_HISTORY_KEY, []);
    if (!Array.isArray(rawHistory)) return [];

    return rawHistory
        .map((entry, index) => {
            if (typeof entry === "number" && Number.isFinite(entry) && entry > 0) {
                return {
                    id: `legacy-${index}-${Math.round(entry)}`,
                    rawTimeMs: Math.round(entry),
                    timeMs: Math.round(entry),
                    penalty: "ok",
                    caseId: "",
                    category: "",
                    subtype: "",
                    badgeLabel: "",
                    displayName: "",
                    scrambleText: "",
                    algorithmText: "",
                    recordedAt: ""
                };
            }

            if (!entry || typeof entry !== "object") return null;

            const rawTimeMs = Number(entry.rawTimeMs ?? entry.timeMs);
            if (!Number.isFinite(rawTimeMs) || rawTimeMs <= 0) return null;
            const normalizedPenalty = entry.penalty === "plus2" || entry.penalty === "dnf" ? entry.penalty : "ok";

            return {
                id: String(entry.id || `legacy-${index}-${Math.round(rawTimeMs)}`),
                rawTimeMs: Math.round(rawTimeMs),
                timeMs: Math.round(rawTimeMs),
                penalty: normalizedPenalty,
                caseId: String(entry.caseId || ""),
                category: String(entry.category || ""),
                subtype: String(entry.subtype || ""),
                badgeLabel: String(entry.badgeLabel || ""),
                displayName: String(entry.displayName || ""),
                scrambleText: String(entry.scrambleText || entry.scramble || ""),
                algorithmText: String(entry.algorithmText || entry.algorithm || ""),
                recordedAt: String(entry.recordedAt || "")
            };
        })
        .filter(Boolean)
        .slice(-TRAINER_SOLVE_HISTORY_LIMIT);
}

function saveTrainerSolveHistory(historyEntries = []) {
    localStorage.setItem(
        TRAINER_SOLVE_HISTORY_KEY,
        JSON.stringify(historyEntries.slice(-TRAINER_SOLVE_HISTORY_LIMIT))
    );
}

function saveUiPreferences(nextPreferences = {}) {
    const currentPreferences = getUiPreferences();
    localStorage.setItem(UI_PREFERENCES_KEY, JSON.stringify({ ...currentPreferences, ...nextPreferences }));
}

function getFinalAlgo(caseData) {
    const customMap = getCustomAlgoMap();
    const custom = customMap[caseData.id];
    return custom ? custom : caseData.defaultAlgo;
}

function getTrainerGenerationAlgo(caseData) {
    return caseData?.defaultAlgo || "";
}

function saveAlgoStatus(caseId, status) {
    const statusMap = getAlgoStatusMap();
    statusMap[caseId] = status;
    localStorage.setItem(ALGO_STATUS_KEY, JSON.stringify(statusMap));
    renderAlgoList();
}

function saveCustomAlgo(caseId, value) {
    clearTimeout(algoSaveTimeouts[caseId]);
    algoSaveTimeouts[caseId] = setTimeout(() => {
        const customMap = getCustomAlgoMap();
        customMap[caseId] = String(value ?? "").trim();
        localStorage.setItem(CUSTOM_ALGO_KEY, JSON.stringify(customMap));
    }, 500);
}

function normalizeAlgorithmNotation(algoStr = "") {
    return String(algoStr || "")
        .replace(/[\[\]()]/g, " ")
        .replace(/([A-Za-z]+)2'/g, "$12")
        .replace(/\s+/g, " ")
        .trim();
}

function getVisualCubeUrl(algoStr, visualStage) {
    const normalizedAlgo = normalizeAlgorithmNotation(algoStr);
    const encodedAlgo = encodeURIComponent(normalizedAlgo);
    return `https://visualcube.api.cubing.net/visualcube.php?fmt=svg&size=150&bg=t&view=plan&stage=${visualStage}&case=${encodedAlgo}`;
}

function getVisualStageForAlgorithm(algo) {
    if (algo.visualStage) return algo.visualStage;
    return algo.category === "zbll" ? "oll" : algo.category;
}

function getPuzzleGenStickerColors(speedCubeDbFaces = {}) {
    const faceMapping = {
        U: "us",
        B: "ub",
        F: "uf",
        L: "ul",
        R: "ur"
    };

    return Object.entries(faceMapping).reduce((stickerColors, [faceName, faceKey]) => {
        const faceValue = String(speedCubeDbFaces?.[faceKey] || "").trim().toLowerCase();
        if (faceValue.length !== 9) return stickerColors;

        stickerColors[faceName] = [...faceValue].map((sticker) => {
            const colorEntry = SPEED_CUBE_DB_PUZZLEGEN_COLOR_MAP[sticker] || { value: "#1f2937", stroke: "#020617" };
            return { ...colorEntry };
        });

        return stickerColors;
    }, {});
}

function getSpeedCubeDbPuzzleGenImageUrl(speedCubeDbFaces = {}) {
    const puzzleGen = window.puzzleGen;
    if (!puzzleGen?.SVG || !puzzleGen?.Type?.CUBE_TOP || !document.body) return "";

    const faceKeys = ["ub", "ul", "us", "ur", "uf"];
    const faceValues = faceKeys.map((key) => String(speedCubeDbFaces?.[key] || "").trim().toLowerCase());
    if (faceValues.some((value) => value.length !== 9)) return "";

    const cacheKey = `puzzlegen|${faceValues.join("|")}`;
    if (speedCubeDbImageCache.has(cacheKey)) return speedCubeDbImageCache.get(cacheKey);

    const mountElement = document.createElement("div");
    mountElement.style.position = "fixed";
    mountElement.style.left = "-99999px";
    mountElement.style.top = "-99999px";
    mountElement.style.pointerEvents = "none";
    document.body.appendChild(mountElement);

    try {
        puzzleGen.SVG(mountElement, puzzleGen.Type.CUBE_TOP, {
            width: 75,
            height: 75,
            strokeWidth: 0.03,
            puzzle: {
                size: 3,
                stickerColors: getPuzzleGenStickerColors(speedCubeDbFaces)
            }
        });

        const svgElement = mountElement.querySelector("svg");
        if (!svgElement) return "";

        const svgMarkup = new XMLSerializer().serializeToString(svgElement);
        const imageUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`;
        speedCubeDbImageCache.set(cacheKey, imageUrl);
        return imageUrl;
    } catch (error) {
        return "";
    } finally {
        mountElement.remove();
    }
}

function getSpeedCubeDbImageUrl(speedCubeDbFaces = {}) {
    const faceKeys = ["ub", "ul", "us", "ur", "uf"];
    const faceValues = faceKeys.map((key) => String(speedCubeDbFaces?.[key] || "").trim().toLowerCase());
    if (faceValues.some((value) => value.length !== 9)) return "";

    const cacheKey = faceValues.join("|");
    if (speedCubeDbImageCache.has(cacheKey)) return speedCubeDbImageCache.get(cacheKey);

    const cellSize = 14;
    const cellGap = 1.2;
    const faceGap = 2.4;
    const padding = 6;
    const faceSpan = (cellSize * 3) + (cellGap * 2);
    const gridUnit = faceSpan + faceGap;
    const viewBoxWidth = (padding * 2) + (gridUnit * 3) - faceGap;
    const viewBoxHeight = (padding * 2) + (gridUnit * 3) - faceGap;
    const faceOffsets = {
        ub: [gridUnit, 0],
        ul: [0, gridUnit],
        us: [gridUnit, gridUnit],
        ur: [gridUnit * 2, gridUnit],
        uf: [gridUnit, gridUnit * 2]
    };
    const svgMarkup = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" width="${viewBoxWidth}" height="${viewBoxHeight}">`,
        `<rect width="${viewBoxWidth}" height="${viewBoxHeight}" rx="12" fill="#111827"/>`
    ];

    faceKeys.forEach((faceKey) => {
        const [offsetX, offsetY] = faceOffsets[faceKey];
        const faceValue = String(speedCubeDbFaces?.[faceKey] || "").trim().toLowerCase();
        svgMarkup.push(
            `<rect x="${padding + offsetX - 2}" y="${padding + offsetY - 2}" width="${faceSpan + 4}" height="${faceSpan + 4}" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1.2"/>`
        );

        [...faceValue].forEach((sticker, index) => {
            const fillColor = SPEED_CUBE_DB_STICKER_COLOR_MAP[sticker] || "#1f2937";
            const columnIndex = index % 3;
            const rowIndex = Math.floor(index / 3);
            const x = padding + offsetX + (columnIndex * (cellSize + cellGap));
            const y = padding + offsetY + (rowIndex * (cellSize + cellGap));
            svgMarkup.push(
                `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${fillColor}" stroke="#020617" stroke-width="0.9"/>`
            );
        });
    });

    svgMarkup.push("</svg>");

    const imageUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup.join(""))}`;
    speedCubeDbImageCache.set(cacheKey, imageUrl);
    return imageUrl;
}

function getCasePatternImageUrl(casePattern = "") {
    const normalizedPattern = String(casePattern || "").trim().toLowerCase();
    if (normalizedPattern.length !== 25) return "";
    if (casePatternImageCache.has(normalizedPattern)) return casePatternImageCache.get(normalizedPattern);

    const cellSize = 20;
    const cellGap = 2;
    const padding = 6;
    const gridSize = 5;
    const viewBoxSize = (padding * 2) + (cellSize * gridSize) + (cellGap * (gridSize - 1));
    const svgMarkup = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">`,
        `<rect width="${viewBoxSize}" height="${viewBoxSize}" rx="10" fill="#111827"/>`
    ];

    [...normalizedPattern].forEach((token, index) => {
        const fillColor = CASE_PATTERN_COLOR_MAP[token];
        if (!fillColor) return;

        const columnIndex = index % gridSize;
        const rowIndex = Math.floor(index / gridSize);
        const x = padding + (columnIndex * (cellSize + cellGap));
        const y = padding + (rowIndex * (cellSize + cellGap));
        svgMarkup.push(
            `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="4" fill="${fillColor}" stroke="#020617" stroke-width="1.5"/>`
        );
    });

    svgMarkup.push("</svg>");

    const imageUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup.join(""))}`;
    casePatternImageCache.set(normalizedPattern, imageUrl);
    return imageUrl;
}

function getZbllPllStyleImageUrl(speedCubeDbFaces = {}) {
    const faceValues = {
        us: String(speedCubeDbFaces?.us || "").trim().toLowerCase(),
        ub: String(speedCubeDbFaces?.ub || "").trim().toLowerCase(),
        uf: String(speedCubeDbFaces?.uf || "").trim().toLowerCase(),
        ul: String(speedCubeDbFaces?.ul || "").trim().toLowerCase(),
        ur: String(speedCubeDbFaces?.ur || "").trim().toLowerCase()
    };

    if (Object.values(faceValues).some((value) => value.length !== 9)) return "";

    const cacheKey = `zbll-flat|${faceValues.us}|${faceValues.ub}|${faceValues.uf}|${faceValues.ul}|${faceValues.ur}`;
    if (speedCubeDbImageCache.has(cacheKey)) return speedCubeDbImageCache.get(cacheKey);

    const topStrip = [faceValues.ub[0], faceValues.ub[1], faceValues.ub[2]];
    const rightStrip = [faceValues.ur[2], faceValues.ur[1], faceValues.ur[0]];
    const bottomStrip = [faceValues.uf[0], faceValues.uf[1], faceValues.uf[2]];
    const leftStrip = [faceValues.ul[0], faceValues.ul[1], faceValues.ul[2]];

    const flatStickerColorMap = {
        y: "#FEFE00",
        o: "#FFA100",
        r: "#EE0000",
        g: "#00D800",
        b: "#0000F2",
        w: "#FFFFFF"
    };
    const strokeColor = "#000000";
    const cellSize = 22;
    const strokeWidth = 2;
    const padding = 2;
    const gridSize = 5;
    const viewBoxSize = (padding * 2) + (cellSize * gridSize);
    const svgMarkup = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">`,
        `<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="transparent"/>`
    ];

    const drawSticker = (gridX, gridY, fillColor) => {
        const x = padding + (gridX * cellSize);
        const y = padding + (gridY * cellSize);
        svgMarkup.push(
            `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        );
    };

    for (let rowIndex = 0; rowIndex < 3; rowIndex += 1) {
        for (let columnIndex = 0; columnIndex < 3; columnIndex += 1) {
            const stickerIndex = (rowIndex * 3) + columnIndex;
            const fillColor = flatStickerColorMap[faceValues.us[stickerIndex]] || "#1f2937";
            drawSticker(columnIndex + 1, rowIndex + 1, fillColor);
        }
    }

    topStrip.forEach((token, index) => {
        drawSticker(index + 1, 0, flatStickerColorMap[token] || "#1f2937");
    });

    rightStrip.forEach((token, index) => {
        drawSticker(4, index + 1, flatStickerColorMap[token] || "#1f2937");
    });

    bottomStrip.forEach((token, index) => {
        drawSticker(index + 1, 4, flatStickerColorMap[token] || "#1f2937");
    });

    leftStrip.forEach((token, index) => {
        drawSticker(0, index + 1, flatStickerColorMap[token] || "#1f2937");
    });

    svgMarkup.push("</svg>");

    const imageUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup.join(""))}`;
    speedCubeDbImageCache.set(cacheKey, imageUrl);
    return imageUrl;
}

function getCuberProZbllImageUrl(algo) {
    if (!algo || algo.category !== "zbll") return "";

    const group = String(algo.group || "").trim();
    const caseNumberMatch = String(algo.name || "").match(/(\d+)\s*$/);
    const caseNumber = Number(caseNumberMatch?.[1] || NaN);
    const groupEntries = window.ZBLL_CUBERPRO_FD_DB?.[group];
    if (!Array.isArray(groupEntries) || !Number.isInteger(caseNumber) || caseNumber < 1) return "";

    const fd = String(groupEntries[caseNumber - 1] || "").trim();
    if (!fd) return "";

    return `https://algs.cuber.pro/visualcube/visualcube.php?size=150&view=plan&fmt=png&pzl=3&bg=t&fd=${encodeURIComponent(fd)}`;
}

function getAlgoImageSources(algo) {
    if (algo.imagePath) return { src: algo.imagePath, fallbackSrc: "" };

    const cuberProZbllImageUrl = getCuberProZbllImageUrl(algo);
    const zbllPllStyleImageUrl = algo.category === "zbll" && algo.speedCubeDbFaces
        ? getZbllPllStyleImageUrl(algo.speedCubeDbFaces)
        : "";
    const speedCubeDbPuzzleGenImageUrl = algo.speedCubeDbFaces
        ? getSpeedCubeDbPuzzleGenImageUrl(algo.speedCubeDbFaces)
        : "";
    const speedCubeDbImageUrl = algo.speedCubeDbFaces
        ? getSpeedCubeDbImageUrl(algo.speedCubeDbFaces)
        : "";
    const casePatternImageUrl = algo.casePattern
        ? getCasePatternImageUrl(algo.casePattern)
        : "";

    if (cuberProZbllImageUrl) {
        return {
            src: cuberProZbllImageUrl,
            fallbackSrc: zbllPllStyleImageUrl || speedCubeDbPuzzleGenImageUrl || speedCubeDbImageUrl || casePatternImageUrl || ""
        };
    }

    if (zbllPllStyleImageUrl) {
        return {
            src: zbllPllStyleImageUrl,
            fallbackSrc: speedCubeDbPuzzleGenImageUrl || speedCubeDbImageUrl || casePatternImageUrl || ""
        };
    }

    if (algo.speedCubeDbFaces) {
        if (speedCubeDbPuzzleGenImageUrl) return { src: speedCubeDbPuzzleGenImageUrl, fallbackSrc: speedCubeDbImageUrl || "" };
        if (speedCubeDbImageUrl) return { src: speedCubeDbImageUrl, fallbackSrc: "" };
    }
    if (algo.casePattern) {
        if (casePatternImageUrl) return { src: casePatternImageUrl, fallbackSrc: "" };
    }

    return {
        src: getVisualCubeUrl(algo.defaultAlgo, getVisualStageForAlgorithm(algo)),
        fallbackSrc: ""
    };
}

function getAlgoImageHtml(algo, altText) {
    const { src, fallbackSrc } = getAlgoImageSources(algo);
    const fallbackAttributes = fallbackSrc && fallbackSrc !== src
        ? ` data-fallback-src="${escapeHtml(fallbackSrc)}" onerror="if(this.dataset.fallbackSrc){this.onerror=null;this.src=this.dataset.fallbackSrc;delete this.dataset.fallbackSrc;}"`
        : "";

    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(altText)}"${fallbackAttributes}>`;
}

function getAvailableAlgorithmCategories() {
    const categories = [...new Set(ALGORITHM_DB.map((algo) => algo.category))];
    const mergedCategories = [...BUILTIN_CATEGORY_ORDER];

    categories.forEach((category) => {
        if (!mergedCategories.includes(category)) {
            mergedCategories.push(category);
        }
    });

    return mergedCategories;
}

function normalizeAlgorithmCategory(category) {
    const availableCategories = getAvailableAlgorithmCategories();
    if (availableCategories.length === 0) return "";

    const normalizedInput = String(category || "").trim().toLowerCase();
    const matchedCategory = availableCategories.find((entry) => String(entry).toLowerCase() === normalizedInput);
    return matchedCategory || availableCategories[0];
}

function getAlgorithmCategoryLabel(category) {
    return String(category || "").toUpperCase();
}

function getAlgorithmSubtypesForCategory(category) {
    const normalizedCategory = normalizeAlgorithmCategory(category);
    if (!Object.prototype.hasOwnProperty.call(CATEGORY_SUBTYPE_CONFIG, normalizedCategory)) {
        return [];
    }

    const configuredSubtypes = Array.isArray(CATEGORY_SUBTYPE_CONFIG[normalizedCategory])
        ? CATEGORY_SUBTYPE_CONFIG[normalizedCategory]
        : [];
    const dataSubtypes = ALGORITHM_DB
        .filter((algo) => algo.category === normalizedCategory && String(algo.group || "").trim())
        .map((algo) => String(algo.group).trim());

    const mergedSubtypes = [...configuredSubtypes];
    dataSubtypes.forEach((subtype) => {
        if (!mergedSubtypes.some((entry) => entry.toLowerCase() === subtype.toLowerCase())) {
            mergedSubtypes.push(subtype);
        }
    });

    return mergedSubtypes;
}

function categoryUsesSubtype(category) {
    const normalizedCategory = normalizeAlgorithmCategory(category);
    return Object.prototype.hasOwnProperty.call(CATEGORY_SUBTYPE_CONFIG, normalizedCategory);
}

function normalizeAlgorithmSubtype(category, subtype) {
    const availableSubtypes = getAlgorithmSubtypesForCategory(category);
    if (availableSubtypes.length === 0) return "";

    const normalizedInput = String(subtype || "").trim().toLowerCase();
    const matchedSubtype = availableSubtypes.find((entry) => entry.toLowerCase() === normalizedInput);
    return matchedSubtype || availableSubtypes[0];
}

function getAlgorithmsByCategory(category = currentListCategory, subtype = "") {
    const normalizedCategory = normalizeAlgorithmCategory(category);
    const normalizedSubtype = normalizeAlgorithmSubtype(normalizedCategory, subtype);

    return ALGORITHM_DB.filter((algo) => {
        if (algo.category !== normalizedCategory) return false;
        if (!categoryUsesSubtype(normalizedCategory)) return true;
        return String(algo.group || "").trim().toLowerCase() === normalizedSubtype.toLowerCase();
    });
}

function getTrainerSelectionStorageKey(category, subtype = "") {
    const normalizedCategory = normalizeAlgorithmCategory(category);
    if (!categoryUsesSubtype(normalizedCategory)) return normalizedCategory;

    const normalizedSubtype = normalizeAlgorithmSubtype(normalizedCategory, subtype);
    return `${normalizedCategory}::${normalizedSubtype}`;
}

function getTrainerSelectedCaseIds(category = currentTrainerCategory, subtype = currentTrainerSubtype) {
    const normalizedCategory = normalizeAlgorithmCategory(category);
    const selectionStorageKey = getTrainerSelectionStorageKey(normalizedCategory, subtype);
    const allCaseIds = getAlgorithmsByCategory(normalizedCategory, subtype).map((algo) => algo.id);
    const selectionMap = getTrainerCaseSelectionMap();

    if (!Object.prototype.hasOwnProperty.call(selectionMap, selectionStorageKey)) {
        return allCaseIds;
    }

    const selectedCaseIds = Array.isArray(selectionMap[selectionStorageKey]) ? selectionMap[selectionStorageKey] : [];
    return selectedCaseIds.filter((caseId) => allCaseIds.includes(caseId));
}

function saveTrainerSelectedCaseIds(category, caseIds, subtype = currentTrainerSubtype) {
    const normalizedCategory = normalizeAlgorithmCategory(category);
    const selectionStorageKey = getTrainerSelectionStorageKey(normalizedCategory, subtype);
    const selectionMap = getTrainerCaseSelectionMap();
    selectionMap[selectionStorageKey] = [...new Set(caseIds)];
    localStorage.setItem(TRAINER_CASE_SELECTIONS_KEY, JSON.stringify(selectionMap));
}

function getAlgoBadgeLabel(algo) {
    return getAlgorithmCategoryLabel(algo.category);
}

function getAlgoDisplayName(algo) {
    const rawName = String(algo?.name || "").trim();
    const categoryLabel = getAlgoBadgeLabel(algo);
    const duplicatePrefixPattern = new RegExp(`^${categoryLabel}\\s+`, "i");
    const normalizedName = rawName.replace(duplicatePrefixPattern, "").trim() || rawName;
    return /^\d+$/.test(normalizedName) ? `#${normalizedName}` : normalizedName;
}

function getLibraryCountsText() {
    return getAvailableAlgorithmCategories()
        .map((category) => {
            const normalizedCategory = normalizeAlgorithmCategory(category);
            const caseCount = ALGORITHM_DB.filter((algo) => algo.category === normalizedCategory).length;
            return `${caseCount} ${getAlgorithmCategoryLabel(category)}`;
        })
        .join(" / ");
}

function getLanguageLabel(language = currentLanguage) {
    return normalizeAppLanguage(language) === "en" ? t("languageNameEn") : t("languageNameZhTW");
}

function applyStaticTranslations() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const translationKey = element.getAttribute("data-i18n");
        element.textContent = t(translationKey);
    });
}

function updateImportFileLabel() {
    const fileInput = document.getElementById("import-file-input");
    const fileNameElement = document.getElementById("import-file-name");
    if (!fileInput || !fileNameElement) return;

    const selectedFile = fileInput.files && fileInput.files[0];
    fileNameElement.textContent = selectedFile
        ? t("settingsSelectedFile", { name: selectedFile.name })
        : t("settingsNoFileChosen");
}

function renderSettingsView() {
    const formulaDetailsElement = document.getElementById("settings-formula-details");
    const languageCurrentElement = document.getElementById("settings-language-current");
    const languageToggleElement = document.querySelector(".settings-language-toggle");
    const toggleLanguageZhButton = document.getElementById("toggle-language-zh");
    const toggleLanguageEnButton = document.getElementById("toggle-language-en");
    const exportTypeSelect = document.getElementById("export-type");

    if (formulaDetailsElement) {
        formulaDetailsElement.innerHTML = `
            <strong>${escapeHtml(t("settingsFormulaSummary", { counts: getLibraryCountsText() }))}</strong>
            <span>${escapeHtml(t("settingsFormulaNote"))}</span>
        `;
    }

    if (languageCurrentElement) {
        languageCurrentElement.textContent = t("settingsLanguageCurrent", { language: getLanguageLabel() });
    }

    if (languageToggleElement) {
        languageToggleElement.setAttribute("aria-label", t("settingsLanguageToggleGroupLabel"));
    }

    if (toggleLanguageZhButton) {
        toggleLanguageZhButton.textContent = t("languageNameZhTW");
        toggleLanguageZhButton.classList.toggle("is-active", currentLanguage === "zh-TW");
        toggleLanguageZhButton.setAttribute("aria-pressed", currentLanguage === "zh-TW" ? "true" : "false");
    }

    if (toggleLanguageEnButton) {
        toggleLanguageEnButton.textContent = t("languageNameEn");
        toggleLanguageEnButton.classList.toggle("is-active", currentLanguage === "en");
        toggleLanguageEnButton.setAttribute("aria-pressed", currentLanguage === "en" ? "true" : "false");
    }

    if (exportTypeSelect) {
        const currentValue = exportTypeSelect.value || "json";
        exportTypeSelect.innerHTML = "";

        [
            { value: "json", label: t("settingsExportJson") },
            { value: "csv", label: t("settingsExportCsv") }
        ].forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            optionElement.selected = currentValue === option.value;
            exportTypeSelect.appendChild(optionElement);
        });
    }

    updateImportFileLabel();
}

function setAppLanguage(language) {
    const normalizedLanguage = normalizeAppLanguage(language);
    if (normalizedLanguage === currentLanguage) return;

    setStoredAppLanguage(normalizedLanguage);
    applyStaticTranslations();
    renderCategorySelect("list-type-select", currentListCategory, setListAlgorithmCategory);
    renderCategorySelect("trainer-type-select", currentTrainerCategory, setTrainerAlgorithmCategory);
    renderSubtypeSelect("list-subtype-filter", "list-subtype-select", currentListCategory, currentListSubtype, setListAlgorithmSubtype);
    renderSubtypeSelect("trainer-subtype-filter", "trainer-subtype-select", currentTrainerCategory, currentTrainerSubtype, setTrainerAlgorithmSubtype);
    renderAlgoList();
    renderTrainerCasePicker();
    renderSettingsView();
    renderTrainerHistory();
}

function escapeCsvValue(value) {
    const normalizedValue = String(value ?? "");
    if (/[",\n]/.test(normalizedValue)) {
        return `"${normalizedValue.replace(/"/g, "\"\"")}"`;
    }
    return normalizedValue;
}

function triggerFileDownload(fileName, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const linkElement = document.createElement("a");
    linkElement.href = objectUrl;
    linkElement.download = fileName;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(objectUrl);
}

function buildExportPayload() {
    return {
        app: "AlgMaster",
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
            language: currentLanguage,
            statusMap: getAlgoStatusMap(),
            customAlgoMap: getCustomAlgoMap(),
            uiPreferences: getUiPreferences(),
            trainerCaseSelections: getTrainerCaseSelectionMap(),
            trainerSolveHistory: getTrainerSolveHistory()
        }
    };
}

function exportData() {
    const exportType = document.getElementById("export-type")?.value || "json";

    if (exportType === "csv") {
        const statusMap = getAlgoStatusMap();
        const customAlgoMap = getCustomAlgoMap();
        const selectionMap = getTrainerCaseSelectionMap();
        const rows = [
            ["id", "category", "name", "status", "defaultAlgo", "customAlgo", "selectedInTrainer"]
        ];

        ALGORITHM_DB.forEach((algo) => {
            const selectedCaseIds = Array.isArray(selectionMap[algo.category]) ? selectionMap[algo.category] : [];
            rows.push([
                algo.id,
                getAlgorithmCategoryLabel(algo.category),
                getAlgoDisplayName(algo),
                statusMap[algo.id] || "unlearned",
                algo.defaultAlgo || "",
                customAlgoMap[algo.id] || "",
                selectedCaseIds.includes(algo.id) ? "true" : "false"
            ]);
        });

        const csvContent = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
        triggerFileDownload(`${t("csvFilePrefix")}.csv`, csvContent, "text/csv;charset=utf-8");
        return;
    }

    triggerFileDownload(
        `${t("exportFilePrefix")}.json`,
        JSON.stringify(buildExportPayload(), null, 2),
        "application/json;charset=utf-8"
    );
}

function extractImportPayload(parsedContent) {
    if (!parsedContent || typeof parsedContent !== "object") return null;

    if (parsedContent.app === "AlgMaster" && parsedContent.data && typeof parsedContent.data === "object") {
        return parsedContent.data;
    }

    if (
        Object.prototype.hasOwnProperty.call(parsedContent, "statusMap") ||
        Object.prototype.hasOwnProperty.call(parsedContent, "customAlgoMap") ||
        Object.prototype.hasOwnProperty.call(parsedContent, "trainerCaseSelections") ||
        Object.prototype.hasOwnProperty.call(parsedContent, "trainerSolveHistory")
    ) {
        return parsedContent;
    }

    return null;
}

function applyImportedState(importData) {
    localStorage.setItem(ALGO_STATUS_KEY, JSON.stringify(importData.statusMap || {}));
    localStorage.setItem(CUSTOM_ALGO_KEY, JSON.stringify(importData.customAlgoMap || {}));
    localStorage.setItem(UI_PREFERENCES_KEY, JSON.stringify(importData.uiPreferences || {}));
    localStorage.setItem(TRAINER_CASE_SELECTIONS_KEY, JSON.stringify(importData.trainerCaseSelections || {}));
    saveTrainerSolveHistory(Array.isArray(importData.trainerSolveHistory) ? importData.trainerSolveHistory : []);
    setStoredAppLanguage(importData.language || "zh-TW");
}

function importData() {
    const fileInput = document.getElementById("import-file-input");
    const selectedFile = fileInput?.files?.[0];

    if (!selectedFile) {
        alert(t("importNeedFile"));
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsedContent = JSON.parse(String(reader.result || ""));
            const importPayload = extractImportPayload(parsedContent);
            if (!importPayload) throw new Error("Invalid payload");

            applyImportedState(importPayload);
            initUiPreferences();
            applyStaticTranslations();
            renderCategorySelect("list-type-select", currentListCategory, setListAlgorithmCategory);
            renderCategorySelect("trainer-type-select", currentTrainerCategory, setTrainerAlgorithmCategory);
            renderSubtypeSelect("list-subtype-filter", "list-subtype-select", currentListCategory, currentListSubtype, setListAlgorithmSubtype);
            renderSubtypeSelect("trainer-subtype-filter", "trainer-subtype-select", currentTrainerCategory, currentTrainerSubtype, setTrainerAlgorithmSubtype);
            renderAlgoList();
            renderTrainerCasePicker();
            renderSettingsView();
            renderTrainerHistory();
            resetTrainerState(t("trainerWaitingStatus"));
            generateNextScramble();
            fileInput.value = "";
            updateImportFileLabel();
            alert(t("importSuccess"));
        } catch (error) {
            alert(t("importInvalid"));
        }
    };

    reader.readAsText(selectedFile, "utf-8");
}

function clearAllData() {
    if (!confirm(t("confirmClearAll"))) return;

    [
        ALGO_STATUS_KEY,
        CUSTOM_ALGO_KEY,
        UI_PREFERENCES_KEY,
        TRAINER_CASE_SELECTIONS_KEY,
        TRAINER_SOLVE_HISTORY_KEY,
        APP_LANGUAGE_KEY
    ].forEach((storageKey) => localStorage.removeItem(storageKey));

    currentLanguage = "zh-TW";
    initUiPreferences();
    applyStaticTranslations();
    renderCategorySelect("list-type-select", currentListCategory, setListAlgorithmCategory);
    renderCategorySelect("trainer-type-select", currentTrainerCategory, setTrainerAlgorithmCategory);
    renderSubtypeSelect("list-subtype-filter", "list-subtype-select", currentListCategory, currentListSubtype, setListAlgorithmSubtype);
    renderSubtypeSelect("trainer-subtype-filter", "trainer-subtype-select", currentTrainerCategory, currentTrainerSubtype, setTrainerAlgorithmSubtype);
    renderAlgoList();
    renderTrainerCasePicker();
    renderSettingsView();
    renderTrainerHistory();
    resetTrainerState(t("trainerWaitingStatus"));
    generateNextScramble();
}

function sanitizeAlgorithmExpression(expression = "") {
    return String(expression || "")
        .replace(/[()]/g, " ")
        .replace(/\[([^\[\],:]+)\]/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

function splitTopLevelExpression(expression, separator) {
    let depth = 0;

    for (let index = 0; index < expression.length; index += 1) {
        const char = expression[index];
        if (char === "[") depth += 1;
        else if (char === "]") depth -= 1;
        else if (char === separator && depth === 0) {
            return [expression.slice(0, index).trim(), expression.slice(index + 1).trim()];
        }
    }

    return null;
}

function parseMoveToken(token) {
    const normalizedToken = String(token || "").trim();
    if (!normalizedToken) return null;

    const primaryMatch = normalizedToken.match(/^([A-Za-z]+w?)(2)?('?){0,1}$/);
    if (primaryMatch) {
        return {
            base: primaryMatch[1],
            amount: primaryMatch[2] ? 2 : (primaryMatch[3] ? 3 : 1)
        };
    }

    const alternateMatch = normalizedToken.match(/^([A-Za-z]+w?)('?)(2)$/);
    if (alternateMatch) {
        return { base: alternateMatch[1], amount: 2 };
    }

    return null;
}

function normalizeMoveToken({ base, amount }) {
    if (amount === 2) return `${base}2`;
    if (amount === 3) return `${base}'`;
    return base;
}

function parseMoveSequence(sequence) {
    const normalizedSequence = sanitizeAlgorithmExpression(sequence);
    if (!normalizedSequence) return [];

    return normalizedSequence.split(/\s+/).map((token) => {
        const parsedToken = parseMoveToken(token);
        if (!parsedToken) throw new Error(`Invalid move token: ${token}`);
        return normalizeMoveToken(parsedToken);
    });
}

function invertMoveToken(token) {
    const parsedToken = parseMoveToken(token);
    if (!parsedToken) throw new Error(`Invalid move token: ${token}`);

    return normalizeMoveToken({
        base: parsedToken.base,
        amount: parsedToken.amount === 2 ? 2 : (parsedToken.amount === 3 ? 1 : 3)
    });
}

function invertMoveSequence(moves = []) {
    return moves.slice().reverse().map(invertMoveToken);
}

function mergeAdjacentSameBaseMoves(moves = []) {
    const normalizedMoves = [];

    moves.forEach((move) => {
        const parsedMove = parseMoveToken(move);
        if (!parsedMove) {
            normalizedMoves.push(move);
            return;
        }

        const currentMove = normalizeMoveToken(parsedMove);
        const lastMove = normalizedMoves[normalizedMoves.length - 1];
        const parsedLastMove = parseMoveToken(lastMove);

        if (!parsedLastMove || parsedLastMove.base !== parsedMove.base) {
            normalizedMoves.push(currentMove);
            return;
        }

        const combinedAmount = (parsedLastMove.amount + parsedMove.amount) % 4;
        normalizedMoves.pop();
        if (combinedAmount !== 0) {
            normalizedMoves.push(normalizeMoveToken({ base: parsedMove.base, amount: combinedAmount }));
        }
    });

    return normalizedMoves;
}

function getMoveAxis(base = "") {
    const face = String(base || "").trim().charAt(0).toUpperCase();
    if (face === "U" || face === "D") return "UD";
    if (face === "R" || face === "L") return "RL";
    if (face === "F" || face === "B") return "FB";
    return null;
}

function collapseSameAxisMoves(parsedMoves = []) {
    if (parsedMoves.length <= 1) {
        return parsedMoves.map((move) => normalizeMoveToken(move));
    }

    const amountByBase = new Map();
    const order = [];

    parsedMoves.forEach((move) => {
        if (!amountByBase.has(move.base)) {
            amountByBase.set(move.base, 0);
            order.push(move.base);
        }
        amountByBase.set(move.base, (amountByBase.get(move.base) + move.amount) % 4);
    });

    return order.reduce((result, base) => {
        const amount = amountByBase.get(base);
        if (!amount) return result;
        result.push(normalizeMoveToken({ base, amount }));
        return result;
    }, []);
}

function normalizeTrainerScrambleMoves(moves = []) {
    const adjacentNormalized = mergeAdjacentSameBaseMoves(moves);
    const normalizedMoves = [];
    let axisBuffer = [];
    let currentAxis = null;

    const flushAxisBuffer = () => {
        if (axisBuffer.length === 0) return;
        normalizedMoves.push(...collapseSameAxisMoves(axisBuffer));
        axisBuffer = [];
        currentAxis = null;
    };

    adjacentNormalized.forEach((move) => {
        const parsedMove = parseMoveToken(move);
        if (!parsedMove) {
            flushAxisBuffer();
            normalizedMoves.push(move);
            return;
        }

        const axis = getMoveAxis(parsedMove.base);
        if (!axis) {
            flushAxisBuffer();
            normalizedMoves.push(normalizeMoveToken(parsedMove));
            return;
        }

        if (currentAxis && axis !== currentAxis) {
            flushAxisBuffer();
        }

        currentAxis = axis;
        axisBuffer.push(parsedMove);
    });

    flushAxisBuffer();
    return mergeAdjacentSameBaseMoves(normalizedMoves);
}

function getTrainerCaseAlgorithmMoves(rawAlgorithm = "") {
    return expandAlgorithmExpression(rawAlgorithm);
}

function expandAlgorithmExpression(expression) {
    const normalizedExpression = sanitizeAlgorithmExpression(expression);
    if (!normalizedExpression) return [];

    const conjugateParts = splitTopLevelExpression(normalizedExpression, ":");
    if (conjugateParts) {
        const setupMoves = expandAlgorithmExpression(conjugateParts[0]);
        const bodyMoves = expandAlgorithmExpression(conjugateParts[1]);
        return [...setupMoves, ...bodyMoves, ...invertMoveSequence(setupMoves)];
    }

    if (normalizedExpression.startsWith("[") && normalizedExpression.endsWith("]")) {
        const innerExpression = normalizedExpression.slice(1, -1).trim();
        const commutatorParts = splitTopLevelExpression(innerExpression, ",");
        if (!commutatorParts) throw new Error(`Invalid commutator: ${normalizedExpression}`);

        const aMoves = expandAlgorithmExpression(commutatorParts[0]);
        const bMoves = expandAlgorithmExpression(commutatorParts[1]);
        return [...aMoves, ...bMoves, ...invertMoveSequence(aMoves), ...invertMoveSequence(bMoves)];
    }

    return parseMoveSequence(normalizedExpression);
}

function getTrainerCubeSolverConstructor() {
    if (typeof window !== "undefined" && typeof window.Cube === "function") return window.Cube;
    if (typeof Cube === "function") return Cube;
    return null;
}

function ensureTrainerCubeSolverReady() {
    if (trainerCubeSolverInitState === "ready") return true;
    if (trainerCubeSolverInitState === "failed") return false;

    const solver = getTrainerCubeSolverConstructor();
    if (!solver || typeof solver.initSolver !== "function" || typeof solver.inverse !== "function") {
        trainerCubeSolverInitState = "failed";
        return false;
    }

    try {
        solver.initSolver();
        trainerCubeSolverInitState = "ready";
        return true;
    } catch (error) {
        trainerCubeSolverInitState = "failed";
        return false;
    }
}

function normalizeTrainerCubeSolverMoveBase(base = "") {
    const rawBase = String(base || "").trim();
    if (!rawBase) return "";
    if (/^[URFDLB]$/.test(rawBase)) return rawBase;

    const lowerBase = rawBase.toLowerCase();
    if (lowerBase === "m") return "M";
    if (lowerBase === "e") return "E";
    if (lowerBase === "s") return "S";
    if (lowerBase === "x" || lowerBase === "y" || lowerBase === "z") return lowerBase;
    if (lowerBase === "u" || lowerBase === "uw") return "u";
    if (lowerBase === "r" || lowerBase === "rw") return "r";
    if (lowerBase === "f" || lowerBase === "fw") return "f";
    if (lowerBase === "d" || lowerBase === "dw") return "d";
    if (lowerBase === "l" || lowerBase === "lw") return "l";
    if (lowerBase === "b" || lowerBase === "bw") return "b";
    return "";
}

function toTrainerCubeSolverMoves(moves = []) {
    const convertedMoves = [];
    for (const move of moves) {
        const parsedMove = parseMoveToken(move);
        if (!parsedMove) return null;

        const normalizedBase = normalizeTrainerCubeSolverMoveBase(parsedMove.base);
        if (!normalizedBase) return null;

        convertedMoves.push(normalizeMoveToken({
            base: normalizedBase,
            amount: parsedMove.amount
        }));
    }

    return convertedMoves;
}

function buildCubeSolverTrainerScrambleMoves(baseMoves = []) {
    const normalizedMoves = normalizeTrainerScrambleMoves(baseMoves);
    if (normalizedMoves.length === 0) return normalizedMoves;
    if (!ensureTrainerCubeSolverReady()) return null;

    const solverMoves = toTrainerCubeSolverMoves(normalizedMoves);
    if (!solverMoves || solverMoves.length === 0) return null;

    const solver = getTrainerCubeSolverConstructor();
    if (!solver) return null;

    try {
        const cube = new solver();
        cube.move(solverMoves.join(" "));

        const solution = cube.solve(TRAINER_CUBE_SOLVER_MAX_DEPTH);
        const scrambleText = solver.inverse(solution || "");
        const scrambleMoves = normalizeTrainerScrambleMoves(parseMoveSequence(scrambleText));

        if (scrambleMoves.length > 0) return scrambleMoves;
    } catch (error) {
        return null;
    }

    return null;
}

function resetTrainerState(statusText = t("trainerWaitingStatus")) {
    if (trainerAnimationFrameId) {
        cancelAnimationFrame(trainerAnimationFrameId);
        trainerAnimationFrameId = null;
    }

    trainerTimerState = "idle";
    trainerStartTimestamp = 0;
    currentScrambleData = null;

    const trainerTimer = document.getElementById("trainer-timer");
    const trainerStatus = document.getElementById("trainer-status");
    const scrambleGroup = document.getElementById("scramble-group");
    const scrambleName = document.getElementById("scramble-name");

    trainerTimer.classList.remove("is-running");
    trainerTimer.innerText = "0.00";
    trainerStatus.innerText = statusText;
    scrambleGroup.innerText = "--";
    scrambleName.innerText = "--";
}

function switchTab(tabId, clickEvent) {
    document.querySelectorAll(".view-section").forEach((element) => element.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach((element) => element.classList.remove("active"));

    document.getElementById(`view-${tabId}`).classList.add("active");

    if (clickEvent?.currentTarget) {
        clickEvent.currentTarget.classList.add("active");
    }

    if (tabId === "settings") {
        renderSettingsView();
    }
}

function renderCategorySelect(selectId, activeCategory, onSelectCategory) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    const categories = getAvailableAlgorithmCategories();
    selectElement.innerHTML = "";

    categories.forEach((category) => {
        const optionElement = document.createElement("option");
        optionElement.value = category;
        optionElement.innerText = getAlgorithmCategoryLabel(category);
        optionElement.selected = activeCategory === category;
        selectElement.appendChild(optionElement);
    });

    selectElement.onchange = (event) => onSelectCategory(event.target.value);
}

function renderSubtypeSelect(containerId, selectId, activeCategory, activeSubtype, onSelectSubtype) {
    const containerElement = document.getElementById(containerId);
    const selectElement = document.getElementById(selectId);
    if (!containerElement || !selectElement) return;

    if (!categoryUsesSubtype(activeCategory)) {
        containerElement.classList.add("hidden");
        selectElement.innerHTML = "";
        return;
    }

    const subtypes = getAlgorithmSubtypesForCategory(activeCategory);
    const normalizedSubtype = normalizeAlgorithmSubtype(activeCategory, activeSubtype);

    containerElement.classList.remove("hidden");
    selectElement.innerHTML = "";

    subtypes.forEach((subtype) => {
        const optionElement = document.createElement("option");
        optionElement.value = subtype;
        optionElement.innerText = subtype;
        optionElement.selected = normalizedSubtype === subtype;
        selectElement.appendChild(optionElement);
    });

    selectElement.onchange = (event) => onSelectSubtype(event.target.value);
}

function renderAlgoList() {
    const container = document.getElementById("algo-list-container");
    const statusMap = getAlgoStatusMap();
    const customMap = getCustomAlgoMap();
    const algorithms = getAlgorithmsByCategory(currentListCategory, currentListSubtype);

    container.innerHTML = "";

    if (algorithms.length === 0) {
        container.innerHTML = `<div class="empty-state">${escapeHtml(t("listEmptyState"))}</div>`;
        return;
    }

    algorithms.forEach((algo) => {
        const currentStatus = statusMap[algo.id] || "unlearned";
        const userAlgo = customMap[algo.id] || "";
        const imageHtml = getAlgoImageHtml(algo, algo.name);

        const itemElement = document.createElement("div");
        itemElement.className = `algo-item status-bg-${currentStatus}`;
        itemElement.innerHTML = `
            <div class="algo-visual">
                ${imageHtml}
            </div>
            <div class="algo-content">
                <div class="algo-header">
                    <span class="badge">${escapeHtml(getAlgoBadgeLabel(algo))}</span>
                    <strong>${escapeHtml(getAlgoDisplayName(algo))}</strong>
                </div>
                <input
                    type="text"
                    class="custom-algo-input"
                    placeholder="${escapeHtml(algo.defaultAlgo || "")}"
                    value="${escapeHtml(userAlgo)}"
                    oninput="saveCustomAlgo('${escapeHtml(algo.id)}', this.value)">
            </div>
            <div class="algo-actions">
                <button class="${currentStatus === "unlearned" ? "active-unlearned" : ""}" onclick="saveAlgoStatus('${escapeHtml(algo.id)}', 'unlearned')">${escapeHtml(t("statusUnlearned"))}</button>
                <button class="${currentStatus === "learning" ? "active-learning" : ""}" onclick="saveAlgoStatus('${escapeHtml(algo.id)}', 'learning')">${escapeHtml(t("statusLearning"))}</button>
                <button class="${currentStatus === "learned" ? "active-learned" : ""}" onclick="saveAlgoStatus('${escapeHtml(algo.id)}', 'learned')">${escapeHtml(t("statusLearned"))}</button>
            </div>
        `;
        container.appendChild(itemElement);
    });
}

function renderTrainerCasePicker() {
    renderTrainerStatusFilterControls();

    const gridElement = document.getElementById("trainer-case-grid");
    const summaryElement = document.getElementById("trainer-range-summary");
    if (!gridElement || !summaryElement) return;

    const algorithms = getAlgorithmsByCategory(currentTrainerCategory, currentTrainerSubtype);
    const visibleAlgorithms = getTrainerVisibleAlgorithms(algorithms);
    const selectedCaseIds = new Set(getTrainerSelectedCaseIds(currentTrainerCategory, currentTrainerSubtype));
    const selectedVisibleCount = visibleAlgorithms.filter((algo) => selectedCaseIds.has(algo.id)).length;

    summaryElement.innerText = t("trainerRangeSummary", {
        selected: selectedVisibleCount,
        total: visibleAlgorithms.length
    });
    gridElement.innerHTML = "";

    visibleAlgorithms.forEach((algo) => {
        const imageHtml = getAlgoImageHtml(algo, getAlgoDisplayName(algo));
        const buttonElement = document.createElement("button");
        buttonElement.type = "button";
        buttonElement.className = `trainer-case-btn${selectedCaseIds.has(algo.id) ? " is-selected" : ""}`;
        buttonElement.setAttribute("aria-pressed", selectedCaseIds.has(algo.id) ? "true" : "false");
        buttonElement.innerHTML = `
            ${imageHtml}
            <span class="trainer-case-btn-name">${escapeHtml(getAlgoDisplayName(algo))}</span>
        `;
        buttonElement.addEventListener("click", () => toggleTrainerCaseSelection(algo.id));
        gridElement.appendChild(buttonElement);
    });
}

function getTrainerVisibleAlgorithms(algorithms = getAlgorithmsByCategory(currentTrainerCategory, currentTrainerSubtype)) {
    const statusMap = getAlgoStatusMap();
    const activeStatuses = new Set(normalizeTrainerStatusFilters(currentTrainerStatusFilters));

    return algorithms.filter((algo) => activeStatuses.has(statusMap[algo.id] || "unlearned"));
}

function renderTrainerStatusFilterControls() {
    const shellElement = document.getElementById("trainer-status-filter-shell");
    if (!shellElement) return;

    const activeStatuses = new Set(normalizeTrainerStatusFilters(currentTrainerStatusFilters));
    shellElement.innerHTML = "";

    TRAINER_STATUS_FILTER_OPTIONS.forEach((status) => {
        const labelElement = document.createElement("label");
        labelElement.className = `trainer-status-chip${activeStatuses.has(status) ? " is-active" : ""}`;

        const inputElement = document.createElement("input");
        inputElement.type = "checkbox";
        inputElement.checked = activeStatuses.has(status);
        inputElement.addEventListener("change", () => setTrainerStatusFilter(status, inputElement.checked));

        const textElement = document.createElement("span");
        if (status === "learned") textElement.innerText = t("statusLearned");
        else if (status === "learning") textElement.innerText = t("statusLearning");
        else textElement.innerText = t("statusUnlearned");

        labelElement.appendChild(inputElement);
        labelElement.appendChild(textElement);
        shellElement.appendChild(labelElement);
    });
}

function setTrainerStatusFilter(status, enabled) {
    const nextStatuses = new Set(normalizeTrainerStatusFilters(currentTrainerStatusFilters));
    if (enabled) nextStatuses.add(status);
    else nextStatuses.delete(status);

    currentTrainerStatusFilters = normalizeTrainerStatusFilters(Array.from(nextStatuses));
    saveUiPreferences({ trainerStatusFilters: currentTrainerStatusFilters });
    renderTrainerCasePicker();
}

function toggleTrainerCaseSelection(caseId) {
    const selectedCaseIds = new Set(getTrainerSelectedCaseIds(currentTrainerCategory, currentTrainerSubtype));
    if (selectedCaseIds.has(caseId)) selectedCaseIds.delete(caseId);
    else selectedCaseIds.add(caseId);

    saveTrainerSelectedCaseIds(currentTrainerCategory, Array.from(selectedCaseIds), currentTrainerSubtype);
    renderTrainerCasePicker();
    handleTrainerFiltersChanged();
}

function selectAllTrainerCases() {
    const selectedCaseIds = new Set(getTrainerSelectedCaseIds(currentTrainerCategory, currentTrainerSubtype));
    getTrainerVisibleAlgorithms().forEach((algo) => selectedCaseIds.add(algo.id));

    saveTrainerSelectedCaseIds(currentTrainerCategory, Array.from(selectedCaseIds), currentTrainerSubtype);
    renderTrainerCasePicker();
    handleTrainerFiltersChanged();
}

function clearTrainerCaseSelection() {
    const visibleCaseIds = new Set(getTrainerVisibleAlgorithms().map((algo) => algo.id));
    const remainingCaseIds = getTrainerSelectedCaseIds(currentTrainerCategory, currentTrainerSubtype)
        .filter((caseId) => !visibleCaseIds.has(caseId));

    saveTrainerSelectedCaseIds(currentTrainerCategory, remainingCaseIds, currentTrainerSubtype);
    renderTrainerCasePicker();
    handleTrainerFiltersChanged();
}

function setListAlgorithmCategory(category) {
    currentListCategory = normalizeAlgorithmCategory(category);
    currentListSubtype = normalizeAlgorithmSubtype(currentListCategory, currentListSubtype);
    saveUiPreferences({ listCategory: currentListCategory, listSubtype: currentListSubtype });
    renderCategorySelect("list-type-select", currentListCategory, setListAlgorithmCategory);
    renderSubtypeSelect("list-subtype-filter", "list-subtype-select", currentListCategory, currentListSubtype, setListAlgorithmSubtype);
    renderAlgoList();
}

function setTrainerAlgorithmCategory(category) {
    currentTrainerCategory = normalizeAlgorithmCategory(category);
    currentTrainerSubtype = normalizeAlgorithmSubtype(currentTrainerCategory, currentTrainerSubtype);
    saveUiPreferences({ trainerCategory: currentTrainerCategory, trainerSubtype: currentTrainerSubtype });
    renderCategorySelect("trainer-type-select", currentTrainerCategory, setTrainerAlgorithmCategory);
    renderSubtypeSelect("trainer-subtype-filter", "trainer-subtype-select", currentTrainerCategory, currentTrainerSubtype, setTrainerAlgorithmSubtype);
    renderTrainerCasePicker();
    handleTrainerFiltersChanged();
}

function setListAlgorithmSubtype(subtype) {
    currentListSubtype = normalizeAlgorithmSubtype(currentListCategory, subtype);
    saveUiPreferences({ listSubtype: currentListSubtype });
    renderSubtypeSelect("list-subtype-filter", "list-subtype-select", currentListCategory, currentListSubtype, setListAlgorithmSubtype);
    renderAlgoList();
}

function setTrainerAlgorithmSubtype(subtype) {
    currentTrainerSubtype = normalizeAlgorithmSubtype(currentTrainerCategory, subtype);
    saveUiPreferences({ trainerSubtype: currentTrainerSubtype });
    renderSubtypeSelect("trainer-subtype-filter", "trainer-subtype-select", currentTrainerCategory, currentTrainerSubtype, setTrainerAlgorithmSubtype);
    renderTrainerCasePicker();
    handleTrainerFiltersChanged();
}

function handleTrainerFiltersChanged() {
    resetTrainerState(t("trainerResettingStatus"));
    generateNextScramble();
}

function initUiPreferences() {
    const preferences = getUiPreferences();
    currentListCategory = normalizeAlgorithmCategory(preferences.listCategory);
    currentTrainerCategory = normalizeAlgorithmCategory(preferences.trainerCategory);
    currentListSubtype = normalizeAlgorithmSubtype(currentListCategory, preferences.listSubtype);
    currentTrainerSubtype = normalizeAlgorithmSubtype(currentTrainerCategory, preferences.trainerSubtype);
    currentTrainerStatusFilters = normalizeTrainerStatusFilters(preferences.trainerStatusFilters);
    currentLanguage = getStoredAppLanguage();
}

function bindSettingsEvents() {
    const importFileInput = document.getElementById("import-file-input");
    if (importFileInput) {
        importFileInput.addEventListener("change", updateImportFileLabel);
    }
}

function generateNextScramble() {
    if (trainerTimerState === "running") return;

    const selectedCaseIds = new Set(getTrainerSelectedCaseIds(currentTrainerCategory, currentTrainerSubtype));
    const algorithms = getAlgorithmsByCategory(currentTrainerCategory, currentTrainerSubtype);
    const pool = algorithms.filter((algo) => selectedCaseIds.has(algo.id));

    if (pool.length === 0) {
        document.getElementById("trainer-scramble").innerText = t("trainerNoPoolScramble");
        document.getElementById("scramble-name").innerText = "--";
        document.getElementById("scramble-group").innerText = "--";
        document.getElementById("trainer-status").innerText = t("trainerNoPoolStatus");
        currentScrambleData = null;
        return;
    }

    const picked = pool[Math.floor(Math.random() * pool.length)];
    currentScrambleData = picked;
    const rawAlgorithm = String(getTrainerGenerationAlgo(picked) || "").replace(/\r/g, "").trim();

    let scrambleMoves = [];
    try {
        const preparedMoves = getTrainerCaseAlgorithmMoves(rawAlgorithm);
        const inverseMoves = invertMoveSequence(preparedMoves);
        const solverScrambleMoves = buildCubeSolverTrainerScrambleMoves(inverseMoves);
        scrambleMoves = Array.isArray(solverScrambleMoves) && solverScrambleMoves.length > 0
            ? solverScrambleMoves
            : normalizeTrainerScrambleMoves(inverseMoves);
    } catch (error) {
        document.getElementById("trainer-scramble").innerText = t("trainerScrambleError");
        document.getElementById("scramble-name").innerText = "--";
        document.getElementById("scramble-group").innerText = "--";
        document.getElementById("trainer-status").innerText = t("trainerNoPoolStatus");
        currentScrambleData = null;
        return;
    }

    if (!scrambleMoves || scrambleMoves.length === 0) {
        document.getElementById("trainer-scramble").innerText = t("trainerScrambleError");
        document.getElementById("scramble-name").innerText = "--";
        document.getElementById("scramble-group").innerText = "--";
        document.getElementById("trainer-status").innerText = t("trainerNoPoolStatus");
        currentScrambleData = null;
        return;
    }

    document.getElementById("scramble-group").innerText = getAlgoBadgeLabel(picked);
    document.getElementById("scramble-name").innerText = getAlgoDisplayName(picked);
    document.getElementById("trainer-scramble").innerText = scrambleMoves.join(" ");
    document.getElementById("trainer-timer").innerText = "0.00";
    document.getElementById("trainer-status").innerText = t("trainerReadyStatus");
}

function getTrainerNow() {
    return typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
}

function formatTrainerTime(rawTimeMs = 0) {
    const totalCentiseconds = Math.round(rawTimeMs / 10);
    const minutes = Math.floor(totalCentiseconds / 6000);
    const seconds = Math.floor((totalCentiseconds % 6000) / 100);
    const centiseconds = totalCentiseconds % 100;

    if (minutes > 0) {
        return `${minutes}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
    }

    return `${seconds}.${String(centiseconds).padStart(2, "0")}`;
}

function getTrainerHistoryEmptyText() {
    return currentLanguage === "en" ? "No solves yet" : "\u5c1a\u7121\u7d00\u9304";
}

function getTrainerHistoryLabelText() {
    return currentLanguage === "en" ? "History" : "\u7d00\u9304";
}

function getTrainerAveragesLabelText() {
    return currentLanguage === "en" ? "Averages" : "\u5e73\u5747";
}

function getTrainerScrambleLabelText() {
    return currentLanguage === "en" ? "Scramble" : "\u6253\u4e82";
}

function getTrainerAlgorithmLabelText() {
    return currentLanguage === "en" ? "Algorithm" : "\u516c\u5f0f";
}

function getTrainerDeleteLabelText() {
    return currentLanguage === "en" ? "Del" : "\u522a\u9664";
}

function getTrainerDeleteCancelLabelText() {
    return currentLanguage === "en" ? "Cancel" : "\u53d6\u6d88";
}

function getTrainerDeleteConfirmLabelText() {
    return currentLanguage === "en" ? "OK" : "\u78ba\u5b9a";
}

function getTrainerHistoryEntryMeta(entry) {
    const fallbackAlgorithm = ALGORITHM_DB.find((algo) => algo.id === entry.caseId);
    const badgeLabel = String(
        entry.badgeLabel
        || (fallbackAlgorithm ? getAlgoBadgeLabel(fallbackAlgorithm) : getAlgorithmCategoryLabel(entry.category || currentTrainerCategory))
        || ""
    ).trim();
    const displayName = String(
        entry.displayName
        || (fallbackAlgorithm ? getAlgoDisplayName(fallbackAlgorithm) : entry.caseId || "")
        || ""
    ).trim();

    return [badgeLabel, displayName].filter(Boolean).join(" / ");
}

function getTrainerDisplayTime(record) {
    if (!record) return "0.00";
    if (record.penalty === "dnf") return `DNF (${formatTrainerTime(record.rawTimeMs)})`;
    if (record.penalty === "plus2") return `${formatTrainerTime(record.rawTimeMs + 2000)}+`;
    return formatTrainerTime(record.rawTimeMs);
}

function getTrainerRecordFinalTime(record) {
    if (!record) return Infinity;
    if (record.penalty === "dnf") return Infinity;
    return record.rawTimeMs + (record.penalty === "plus2" ? 2000 : 0);
}

function getLatestTrainerSolveRecord() {
    const historyEntries = getTrainerSolveHistory();
    return historyEntries[historyEntries.length - 1] || null;
}

function updateTrainerSolveHistory(nextHistoryEntries = []) {
    saveTrainerSolveHistory(nextHistoryEntries);
    renderTrainerHistory();
}

function toggleTrainerRecordExpanded(recordId) {
    if (!recordId) return;

    if (expandedTrainerHistoryRecordId === recordId) {
        expandedTrainerHistoryRecordId = null;
        trainerHistoryDeleteConfirmRecordId = null;
    } else {
        expandedTrainerHistoryRecordId = recordId;
        trainerHistoryDeleteConfirmRecordId = null;
    }

    renderTrainerHistory();
}

function resolveTrainerHistoryRecordId(recordId = "") {
    const historyEntries = getTrainerSolveHistory();
    if (recordId) {
        return historyEntries.find((entry) => entry.id === recordId)?.id || null;
    }

    return getLatestTrainerSolveRecord()?.id || null;
}

function toggleTrainerHistoryDeleteConfirm(recordId = "") {
    const targetRecordId = resolveTrainerHistoryRecordId(recordId);
    if (!targetRecordId) return;

    trainerHistoryDeleteConfirmRecordId = trainerHistoryDeleteConfirmRecordId === targetRecordId ? null : targetRecordId;
    renderTrainerHistory();
}

function confirmDeleteTrainerRecord(recordId = "") {
    const targetRecordId = resolveTrainerHistoryRecordId(recordId);
    if (!targetRecordId) return;

    const nextHistoryEntries = getTrainerSolveHistory().filter((entry) => entry.id !== targetRecordId);
    trainerHistoryDeleteConfirmRecordId = null;
    if (expandedTrainerHistoryRecordId === targetRecordId) expandedTrainerHistoryRecordId = null;
    updateTrainerSolveHistory(nextHistoryEntries);
}

function toggleTrainerPenalty(penalty, recordId = "") {
    const targetRecordId = resolveTrainerHistoryRecordId(recordId);
    if (!targetRecordId) return;

    const nextHistoryEntries = getTrainerSolveHistory().map((entry) => {
        if (entry.id !== targetRecordId) return entry;
        return {
            ...entry,
            penalty: entry.penalty === penalty ? "ok" : penalty
        };
    });

    trainerHistoryDeleteConfirmRecordId = null;
    updateTrainerSolveHistory(nextHistoryEntries);
}

function updateTrainerPenaltyControls(latestRecord = null) {
    const penaltyShellElement = document.getElementById("trainer-penalty-shell");
    const plus2Button = document.getElementById("trainer-plus2-btn");
    const dnfButton = document.getElementById("trainer-dnf-btn");
    const deleteButton = document.getElementById("trainer-delete-btn");
    const confirmButton = document.getElementById("trainer-delete-confirm-btn");

    if (penaltyShellElement) {
        penaltyShellElement.classList.toggle("hidden", !latestRecord);
    }

    if (plus2Button) {
        plus2Button.onclick = () => toggleTrainerPenalty("plus2");
        setTrainerActionButtonIcon(plus2Button, TRAINER_ACTION_ICONS.plus2, "+2");
        setTrainerActionButtonActive(plus2Button, latestRecord?.penalty === "plus2");
    }

    if (dnfButton) {
        dnfButton.onclick = () => toggleTrainerPenalty("dnf");
        setTrainerActionButtonIcon(dnfButton, TRAINER_ACTION_ICONS.dnf, "DNF");
        setTrainerActionButtonActive(dnfButton, latestRecord?.penalty === "dnf");
    }

    if (deleteButton) {
        const isDeleteConfirming = latestRecord && trainerHistoryDeleteConfirmRecordId === latestRecord.id;
        deleteButton.onclick = () => toggleTrainerHistoryDeleteConfirm();
        setTrainerActionButtonIcon(
            deleteButton,
            isDeleteConfirming ? TRAINER_ACTION_ICONS.cancel : TRAINER_ACTION_ICONS.delete,
            isDeleteConfirming ? getTrainerDeleteCancelLabelText() : getTrainerDeleteLabelText()
        );
        deleteButton.classList.toggle("is-armed", !!isDeleteConfirming);
        setTrainerActionButtonActive(deleteButton, !!isDeleteConfirming);
    }

    if (confirmButton) {
        const isDeleteConfirming = latestRecord && trainerHistoryDeleteConfirmRecordId === latestRecord.id;
        confirmButton.onclick = () => confirmDeleteTrainerRecord();
        setTrainerActionButtonIcon(confirmButton, TRAINER_ACTION_ICONS.confirm, getTrainerDeleteConfirmLabelText());
        confirmButton.classList.toggle("hidden", !isDeleteConfirming);
    }
}

function calculateTrainerAverage(historyEntries = [], solveCount = 0) {
    if (!Array.isArray(historyEntries) || historyEntries.length < solveCount || solveCount <= 0) {
        return null;
    }

    const recentRecords = historyEntries.slice(-solveCount);
    if (recentRecords.length < solveCount) return null;

    const finalTimes = recentRecords.map(getTrainerRecordFinalTime);
    if (solveCount === 3) {
        if (finalTimes.some((time) => !Number.isFinite(time))) return "DNF";
        return Math.round(finalTimes.reduce((sum, time) => sum + time, 0) / finalTimes.length);
    }

    const trimCount = Math.ceil(solveCount * 0.05);
    const dnfCount = finalTimes.filter((time) => !Number.isFinite(time)).length;
    if (dnfCount > trimCount) return "DNF";

    const keptTimes = [...finalTimes]
        .sort((leftTime, rightTime) => leftTime - rightTime)
        .slice(trimCount, finalTimes.length - trimCount);

    if (keptTimes.length === 0 || keptTimes.some((time) => !Number.isFinite(time))) {
        return "DNF";
    }

    return Math.round(keptTimes.reduce((sum, time) => sum + time, 0) / keptTimes.length);
}

function renderTrainerHistory() {
    const averagesLabelElement = document.getElementById("trainer-averages-label");
    const historyLabelElement = document.getElementById("trainer-history-label");
    const historyListElement = document.getElementById("trainer-history-list");
    const ao3Element = document.getElementById("trainer-ao3");
    const ao5Element = document.getElementById("trainer-ao5");
    const ao12Element = document.getElementById("trainer-ao12");

    if (!historyListElement || !ao3Element || !ao5Element || !ao12Element) return;

    const historyEntries = getTrainerSolveHistory();
    const recentEntries = historyEntries.slice().reverse();
    const latestRecord = historyEntries[historyEntries.length - 1] || null;
    const ao3 = calculateTrainerAverage(historyEntries, 3);
    const ao5 = calculateTrainerAverage(historyEntries, 5);
    const ao12 = calculateTrainerAverage(historyEntries, 12);

    if (expandedTrainerHistoryRecordId && !historyEntries.some((entry) => entry.id === expandedTrainerHistoryRecordId)) {
        expandedTrainerHistoryRecordId = null;
        trainerHistoryDeleteConfirmRecordId = null;
    }

    if (averagesLabelElement) averagesLabelElement.textContent = getTrainerAveragesLabelText();
    if (historyLabelElement) historyLabelElement.textContent = getTrainerHistoryLabelText();
    updateTrainerPenaltyControls(latestRecord);

    historyListElement.innerHTML = "";
    if (recentEntries.length === 0) {
        const emptyElement = document.createElement("div");
        emptyElement.className = "trainer-history-empty";
        emptyElement.textContent = getTrainerHistoryEmptyText();
        historyListElement.appendChild(emptyElement);
    } else {
        const historyFragment = document.createDocumentFragment();

        recentEntries.forEach((entry, index) => {
            const isExpanded = entry.id === expandedTrainerHistoryRecordId;
            const isDeleteConfirming = trainerHistoryDeleteConfirmRecordId === entry.id;
            const itemElement = document.createElement("div");
            itemElement.className = `trainer-history-item${index === 0 ? " is-latest" : ""}${isExpanded ? " is-expanded" : ""}`;
            itemElement.addEventListener("click", (event) => {
                event.stopPropagation();
                toggleTrainerRecordExpanded(entry.id);
            });

            const headElement = document.createElement("div");
            headElement.className = "trainer-history-head";

            const timeElement = document.createElement("div");
            timeElement.className = "trainer-history-time";
            timeElement.textContent = getTrainerDisplayTime(entry);

            const metaElement = document.createElement("div");
            metaElement.className = "trainer-history-meta";
            metaElement.textContent = getTrainerHistoryEntryMeta(entry);

            headElement.appendChild(timeElement);
            headElement.appendChild(metaElement);
            itemElement.appendChild(headElement);

            if (isExpanded) {
                const detailsElement = document.createElement("div");
                detailsElement.className = "trainer-history-details";

                const scrambleLabelElement = document.createElement("div");
                scrambleLabelElement.className = "trainer-history-detail-label";
                scrambleLabelElement.textContent = getTrainerScrambleLabelText();

                const scrambleValueElement = document.createElement("div");
                scrambleValueElement.className = "trainer-history-detail-value";
                scrambleValueElement.textContent = entry.scrambleText || "--";

                const algorithmLabelElement = document.createElement("div");
                algorithmLabelElement.className = "trainer-history-detail-label";
                algorithmLabelElement.textContent = getTrainerAlgorithmLabelText();

                const algorithmValueElement = document.createElement("div");
                algorithmValueElement.className = "trainer-history-detail-value";
                algorithmValueElement.textContent = entry.algorithmText || "--";

                const actionRowElement = document.createElement("div");
                actionRowElement.className = "trainer-history-action-row";

                const plus2Button = document.createElement("button");
                plus2Button.type = "button";
                plus2Button.className = "action-btn trainer-history-action-btn trainer-icon-btn";
                setTrainerActionButtonIcon(plus2Button, TRAINER_ACTION_ICONS.plus2, "+2");
                setTrainerActionButtonActive(plus2Button, entry.penalty === "plus2");
                plus2Button.addEventListener("click", (event) => {
                    event.stopPropagation();
                    toggleTrainerPenalty("plus2", entry.id);
                });

                const dnfButton = document.createElement("button");
                dnfButton.type = "button";
                dnfButton.className = "action-btn trainer-history-action-btn trainer-icon-btn";
                setTrainerActionButtonIcon(dnfButton, TRAINER_ACTION_ICONS.dnf, "DNF");
                setTrainerActionButtonActive(dnfButton, entry.penalty === "dnf");
                dnfButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    toggleTrainerPenalty("dnf", entry.id);
                });

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "action-btn trainer-history-action-btn trainer-delete-btn trainer-icon-btn";
                setTrainerActionButtonIcon(
                    deleteButton,
                    isDeleteConfirming ? TRAINER_ACTION_ICONS.cancel : TRAINER_ACTION_ICONS.delete,
                    isDeleteConfirming ? getTrainerDeleteCancelLabelText() : getTrainerDeleteLabelText()
                );
                deleteButton.classList.toggle("is-armed", isDeleteConfirming);
                setTrainerActionButtonActive(deleteButton, isDeleteConfirming);
                deleteButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    toggleTrainerHistoryDeleteConfirm(entry.id);
                });

                const confirmButton = document.createElement("button");
                confirmButton.type = "button";
                confirmButton.className = `action-btn trainer-history-action-btn trainer-delete-confirm-btn trainer-icon-btn${isDeleteConfirming ? "" : " hidden"}`;
                setTrainerActionButtonIcon(confirmButton, TRAINER_ACTION_ICONS.confirm, getTrainerDeleteConfirmLabelText());
                confirmButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    confirmDeleteTrainerRecord(entry.id);
                });

                actionRowElement.appendChild(plus2Button);
                actionRowElement.appendChild(dnfButton);
                actionRowElement.appendChild(deleteButton);
                actionRowElement.appendChild(confirmButton);

                detailsElement.appendChild(scrambleLabelElement);
                detailsElement.appendChild(scrambleValueElement);
                detailsElement.appendChild(algorithmLabelElement);
                detailsElement.appendChild(algorithmValueElement);
                detailsElement.appendChild(actionRowElement);
                itemElement.appendChild(detailsElement);
            }

            historyFragment.appendChild(itemElement);
        });

        historyListElement.appendChild(historyFragment);
    }

    ao3Element.textContent = ao3 === null ? "--" : (ao3 === "DNF" ? "DNF" : formatTrainerTime(ao3));
    ao5Element.textContent = ao5 === null ? "--" : (ao5 === "DNF" ? "DNF" : formatTrainerTime(ao5));
    ao12Element.textContent = ao12 === null ? "--" : (ao12 === "DNF" ? "DNF" : formatTrainerTime(ao12));
    ao3Element.classList.toggle("is-empty", ao3 === null);
    ao5Element.classList.toggle("is-empty", ao5 === null);
    ao12Element.classList.toggle("is-empty", ao12 === null);
    ao3Element.classList.toggle("is-dnf", ao3 === "DNF");
    ao5Element.classList.toggle("is-dnf", ao5 === "DNF");
    ao12Element.classList.toggle("is-dnf", ao12 === "DNF");
}

function recordTrainerSolve(rawTimeMs = 0) {
    const normalizedTimeMs = Math.max(0, Math.round(rawTimeMs));
    if (normalizedTimeMs <= 0) return;

    const historyEntries = getTrainerSolveHistory();
    historyEntries.push({
        id: `trainer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        rawTimeMs: normalizedTimeMs,
        timeMs: normalizedTimeMs,
        penalty: "ok",
        caseId: String(currentScrambleData?.id || ""),
        category: String(currentTrainerCategory || ""),
        subtype: String(currentTrainerSubtype || ""),
        badgeLabel: String(currentScrambleData ? getAlgoBadgeLabel(currentScrambleData) : ""),
        displayName: String(currentScrambleData ? getAlgoDisplayName(currentScrambleData) : ""),
        scrambleText: String(document.getElementById("trainer-scramble")?.innerText || ""),
        algorithmText: String(currentScrambleData ? getFinalAlgo(currentScrambleData) : ""),
        recordedAt: new Date().toISOString()
    });

    saveTrainerSolveHistory(historyEntries);
    renderTrainerHistory();
}

function tickTrainerTimer() {
    if (trainerTimerState !== "running") return;

    document.getElementById("trainer-timer").innerText = formatTrainerTime(getTrainerNow() - trainerStartTimestamp);
    trainerAnimationFrameId = requestAnimationFrame(tickTrainerTimer);
}

function startTrainerTimer() {
    if (!currentScrambleData) return;

    trainerTimerState = "running";
    trainerStartTimestamp = getTrainerNow();
    document.getElementById("trainer-timer").classList.add("is-running");
    document.getElementById("trainer-status").innerText = t("trainerRunningStatus");

    if (trainerAnimationFrameId) cancelAnimationFrame(trainerAnimationFrameId);
    trainerAnimationFrameId = requestAnimationFrame(tickTrainerTimer);
}

function stopTrainerTimer() {
    if (trainerTimerState !== "running") return;

    const rawTimeMs = Math.max(0, Math.round(getTrainerNow() - trainerStartTimestamp));
    cancelAnimationFrame(trainerAnimationFrameId);
    trainerAnimationFrameId = null;
    trainerTimerState = "idle";

    document.getElementById("trainer-timer").classList.remove("is-running");
    document.getElementById("trainer-timer").innerText = formatTrainerTime(rawTimeMs);
    document.getElementById("trainer-status").innerText = t("trainerStoppedStatus");
    recordTrainerSolve(rawTimeMs);

    setTimeout(() => {
        generateNextScramble();
        document.getElementById("trainer-status").innerText = t("trainerNextReadyStatus");
    }, 600);
}

document.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    if (document.activeElement.tagName === "INPUT") return;
    if (!document.getElementById("view-trainer").classList.contains("active")) return;

    event.preventDefault();
    if (event.repeat) return;

    if (trainerTimerState === "running") {
        stopTrainerTimer();
    } else if (trainerTimerState === "idle") {
        if (!currentScrambleData) generateNextScramble();
        else startTrainerTimer();
    }
});

window.addEventListener("load", () => {
    initUiPreferences();
    applyStaticTranslations();
    renderCategorySelect("list-type-select", currentListCategory, setListAlgorithmCategory);
    renderCategorySelect("trainer-type-select", currentTrainerCategory, setTrainerAlgorithmCategory);
    renderSubtypeSelect("list-subtype-filter", "list-subtype-select", currentListCategory, currentListSubtype, setListAlgorithmSubtype);
    renderSubtypeSelect("trainer-subtype-filter", "trainer-subtype-select", currentTrainerCategory, currentTrainerSubtype, setTrainerAlgorithmSubtype);
    renderAlgoList();
    renderTrainerCasePicker();
    bindSettingsEvents();
    renderSettingsView();
    renderTrainerHistory();
    generateNextScramble();

    document.getElementById("timer-touch-area").addEventListener("click", (event) => {
        if (!canHandleTrainerCardTapTarget(event.target)) return;

        if (trainerTimerState === "running") {
            stopTrainerTimer();
        } else if (trainerTimerState === "idle") {
            if (!currentScrambleData) generateNextScramble();
            else startTrainerTimer();
        }
    });
});
