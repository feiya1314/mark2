import { getCurrentWindow } from '@tauri-apps/api/window';
import { createStore } from '../services/storage.js';

const store = createStore('editor');
store.migrateFrom('mark2:editorSettings', 'settings');

const VALID_APPEARANCES = new Set(['light', 'dark', 'system']);

export const COLOR_VARIANTS = {
    v1: {
        labelKey: 'settings.colorVariant1',
        folder: { light: '#f38181', dark: '#fce38a' },
        file: { light: '#95e1d3', dark: '#eaffd0' },
    },
    v2: {
        labelKey: 'settings.colorVariant2',
        folder: { light: '#71c9ce', dark: '#cbf1f5' },
        file: { light: '#a6e3e9', dark: '#e3fdfd' },
    },
    v3: {
        labelKey: 'settings.colorVariant3',
        folder: { light: '#aa96da', dark: '#fcbad3' },
        file: { light: '#a8d8ea', dark: '#ffffd2' },
    },
    v4: {
        labelKey: 'settings.colorVariant4',
        folder: { light: '#3d84a8', dark: '#46cdcf' },
        file: { light: '#48466d', dark: '#abedd8' },
    },
    v5: {
        labelKey: 'settings.colorVariant5',
        folder: { light: '#61c0bf', dark: '#bbded6' },
        file: { light: '#ffb6b9', dark: '#fae3d9' },
    },
    v6: {
        labelKey: 'settings.colorVariant6',
        folder: { light: '#ffaaa5', dark: '#ffd3b6' },
        file: { light: '#a8e6cf', dark: '#dcedc1' },
    },
    v7: {
        labelKey: 'settings.colorVariant7',
        folder: { light: '#355c7d', dark: '#c06c84' },
        file: { light: '#6c5b7b', dark: '#f67280' },
    },
    v8: {
        labelKey: 'settings.colorVariant8',
        folder: { light: '#ff8c94', dark: '#ffd3b5' },
        file: { light: '#ffaaa6', dark: '#dcedc2' },
    },
    v9: {
        labelKey: 'settings.colorVariant9',
        folder: { light: '#625772', dark: '#a9eee6' },
        file: { light: '#f9a1bc', dark: '#fefaec' },
    },
    v10: {
        labelKey: 'settings.colorVariant10',
        folder: { light: '#ffaaa5', dark: '#ffd3b6' },
        file: { light: '#a8e6cf', dark: '#fdffab' },
    },
    v11: {
        labelKey: 'settings.colorVariant11',
        folder: { light: '#625772', dark: '#a9eee6' },
        file: { light: '#f38181', dark: '#fefaec' },
    },
    v12: {
        labelKey: 'settings.colorVariant12',
        folder: { light: '#1f5f8b', dark: '#1891ac' },
        file: { light: '#253b6e', dark: '#d2ecf9' },
    },
    v13: {
        labelKey: 'settings.colorVariant13',
        folder: { light: '#7fdfd4', dark: '#a7efe9' },
        file: { light: '#fbac91', dark: '#fbe1b6' },
    },
    v14: {
        labelKey: 'settings.colorVariant14',
        folder: { light: '#8971d0', dark: '#95e8d7' },
        file: { light: '#7dace4', dark: '#adf7d1' },
    },
    v15: {
        labelKey: 'settings.colorVariant15',
        folder: { light: '#649dad', dark: '#a4e5d9' },
        file: { light: '#66c6ba', dark: '#c8f4de' },
    },
};

export const defaultEditorSettings = {
    theme: 'default',
    appearance: 'system',
    fontSize: 16,
    lineHeight: 1.6,
    fontFamily: '',
    fontWeight: 400,
    codeTheme: 'auto',
    codeFontSize: 14,
    codeLineHeight: 1.5,
    codeFontFamily: '',
    codeFontWeight: 400,
    terminalFontSize: 13,
    terminalFontFamily: '',
    tabFontSize: 12,
    sidebarFontSize: 12,
    tocFontSize: 12,
    autoSave: true,
    contentMaxWidth: 800,
    colorVariant: 'v1',
};

function clamp(value, min, max) {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(Math.max(value, min), max);
}

function normalizeFontWeight(weight) {
    const allowed = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    if (allowed.includes(weight)) {
        return weight;
    }

    const nearest = allowed.reduce((closest, current) => {
        return Math.abs(current - weight) < Math.abs(closest - weight) ? current : closest;
    }, 400);

    return nearest;
}

export function normalizeEditorSettings(candidate) {
    const prefs = { ...defaultEditorSettings };

    if (candidate && typeof candidate === 'object') {
        if (typeof candidate.theme === 'string') {
            const theme = candidate.theme.trim() || 'default';
            prefs.theme = theme;
        }

        if (typeof candidate.appearance === 'string') {
            const normalizedAppearance = candidate.appearance.trim().toLowerCase();
            if (VALID_APPEARANCES.has(normalizedAppearance)) {
                prefs.appearance = normalizedAppearance;
            }
        }

        if (candidate.fontSize !== undefined) {
            const size = Number(candidate.fontSize);
            if (Number.isFinite(size)) {
                prefs.fontSize = clamp(size, 10, 48);
            }
        }

        if (candidate.lineHeight !== undefined) {
            const height = Number(candidate.lineHeight);
            if (Number.isFinite(height)) {
                const clampedHeight = clamp(height, 1.0, 3.0);
                prefs.lineHeight = Number(clampedHeight.toFixed(2));
            }
        }

        if (typeof candidate.fontFamily === 'string') {
            const trimmedFamily = candidate.fontFamily.trim();
            if (
                trimmedFamily &&
                !trimmedFamily.includes(',') &&
                !/["']/.test(trimmedFamily) &&
                /\s/.test(trimmedFamily)
            ) {
                prefs.fontFamily = `'${trimmedFamily.replace(/'/g, "\\'")}'`;
            } else {
                prefs.fontFamily = trimmedFamily;
            }
        }

        if (candidate.fontWeight !== undefined) {
            const weight = Number(candidate.fontWeight);
            if (Number.isFinite(weight)) {
                prefs.fontWeight = normalizeFontWeight(weight);
            }
        }

        if (candidate.codeFontSize !== undefined) {
            const size = Number(candidate.codeFontSize);
            if (Number.isFinite(size)) {
                prefs.codeFontSize = clamp(size, 10, 48);
            }
        }

        if (candidate.codeLineHeight !== undefined) {
            const height = Number(candidate.codeLineHeight);
            if (Number.isFinite(height)) {
                const clampedHeight = clamp(height, 1.0, 3.0);
                prefs.codeLineHeight = Number(clampedHeight.toFixed(2));
            }
        }

        if (typeof candidate.codeTheme === 'string') {
            const theme = candidate.codeTheme.trim() || 'auto';
            prefs.codeTheme = theme;
        }

        if (typeof candidate.codeFontFamily === 'string') {
            prefs.codeFontFamily = candidate.codeFontFamily.trim();
        }

        if (candidate.codeFontWeight !== undefined) {
            const weight = Number(candidate.codeFontWeight);
            if (Number.isFinite(weight)) {
                prefs.codeFontWeight = normalizeFontWeight(weight);
            }
        }

        if (candidate.terminalFontSize !== undefined) {
            const size = Number(candidate.terminalFontSize);
            if (Number.isFinite(size)) {
                prefs.terminalFontSize = clamp(size, 10, 24);
            }
        }

        if (typeof candidate.terminalFontFamily === 'string') {
            prefs.terminalFontFamily = candidate.terminalFontFamily.trim();
        }

        if (candidate.tabFontSize !== undefined) {
            const size = Number(candidate.tabFontSize);
            if (Number.isFinite(size)) {
                prefs.tabFontSize = clamp(size, 9, 24);
            }
        }

        if (candidate.sidebarFontSize !== undefined) {
            const size = Number(candidate.sidebarFontSize);
            if (Number.isFinite(size)) {
                prefs.sidebarFontSize = clamp(size, 9, 24);
            }
        }

        if (candidate.tocFontSize !== undefined) {
            const size = Number(candidate.tocFontSize);
            if (Number.isFinite(size)) {
                prefs.tocFontSize = clamp(size, 9, 24);
            }
        }

        if (candidate.autoSave !== undefined) {
            prefs.autoSave = candidate.autoSave !== false;
        }

        if (candidate.contentMaxWidth !== undefined) {
            const w = Number(candidate.contentMaxWidth);
            if (Number.isFinite(w)) {
                prefs.contentMaxWidth = clamp(w, 400, 2000);
            }
        }

        if (typeof candidate.colorVariant === 'string' && COLOR_VARIANTS[candidate.colorVariant]) {
            prefs.colorVariant = candidate.colorVariant;
        }
    }

    return prefs;
}

// 给编辑器/SaveManager 查询用：autoSave 关掉时所有定时/隐式自动保存都不再触发。
// 手动 cmd+S 走的是显式 saveCurrentFile，不经这里。
export function isAutoSaveEnabled() {
    return lastAppliedSettings.autoSave !== false;
}

export function loadEditorSettings() {
    const parsed = store.get('settings', null);
    return parsed ? normalizeEditorSettings(parsed) : { ...defaultEditorSettings };
}

export function saveEditorSettings(settings) {
    store.set('settings', normalizeEditorSettings(settings));
}

export function applyEditorSettings(settings) {
    const prefs = normalizeEditorSettings(settings);
    const root = document.documentElement;

    lastAppliedSettings = { ...prefs };
    ensureSystemAppearanceListener();

    const appearancePreference = prefs.appearance || 'system';
    const resolvedAppearance = resolveAppearance(appearancePreference);
    currentAppearancePreference = appearancePreference;

    root.dataset.themeAppearance = resolvedAppearance;
    root.dataset.themeAppearancePreference = appearancePreference;
    root.style.setProperty('color-scheme', resolvedAppearance);

    // 同步原生窗口主题（影响 Windows 原生菜单栏颜色）
    const nativeTheme = appearancePreference === 'system' ? null : resolvedAppearance;
    getCurrentWindow().setTheme(nativeTheme).catch(() => {});

    loadTheme(prefs.theme);

    root.style.setProperty('--editor-font-size', `${prefs.fontSize}px`);
    root.style.setProperty('--editor-line-height', prefs.lineHeight.toString());
    root.style.setProperty('--editor-font-weight', prefs.fontWeight.toString());

    if (prefs.fontFamily && prefs.fontFamily.length > 0) {
        root.style.setProperty('--editor-font-family', prefs.fontFamily);
    } else {
        root.style.removeProperty('--editor-font-family');
    }

    root.style.setProperty('--code-font-size', `${prefs.codeFontSize}px`);
    root.style.setProperty('--code-line-height', prefs.codeLineHeight.toString());
    root.style.setProperty('--code-font-weight', prefs.codeFontWeight.toString());

    if (prefs.codeFontFamily && prefs.codeFontFamily.length > 0) {
        root.style.setProperty('--code-font-family', prefs.codeFontFamily);
    } else {
        root.style.removeProperty('--code-font-family');
    }

    root.style.setProperty('--tab-font-size', `${prefs.tabFontSize}px`);
    root.style.setProperty('--sidebar-font-size', `${prefs.sidebarFontSize}px`);
    root.style.setProperty('--toc-font-size', `${prefs.tocFontSize}px`);
    root.style.setProperty('--content-max-width', `${prefs.contentMaxWidth}px`);

    const variant = COLOR_VARIANTS[prefs.colorVariant] || COLOR_VARIANTS.v1;
    root.style.setProperty('--folder-text-color', variant.folder[resolvedAppearance]);
    root.style.setProperty('--file-text-color', variant.file[resolvedAppearance]);

    notifyAppearanceChange(resolvedAppearance, appearancePreference);
}

let prefersDarkMediaQuery = null;
let prefersDarkMediaQueryHandler = null;
let lastAppliedSettings = { ...defaultEditorSettings };
let currentAppearancePreference = defaultEditorSettings.appearance;
let lastNotifiedAppearance = null;
let lastNotifiedPreference = null;
const appearanceListeners = new Set();

const themeAssets = import.meta.glob('../../styles/themes/*.css', {
    query: '?url',
    import: 'default',
    eager: true,
});

const themeUrlByName = Object.entries(themeAssets).reduce((acc, [path, url]) => {
    const match = path.match(/\/([^/]+)\.css$/);
    if (match && match[1]) {
        acc[match[1]] = url;
    }
    return acc;
}, {});

function resolveAppearance(preference) {
    if (preference === 'light' || preference === 'dark') {
        return preference;
    }
    return getSystemAppearance();
}

function getSystemAppearance() {
    if (!prefersDarkMediaQuery && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        prefersDarkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }

    if (!prefersDarkMediaQuery) {
        return 'light';
    }

    return prefersDarkMediaQuery.matches ? 'dark' : 'light';
}

function ensureSystemAppearanceListener() {
    if (prefersDarkMediaQuery && prefersDarkMediaQueryHandler) {
        return;
    }

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && !prefersDarkMediaQuery) {
        prefersDarkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }

    if (!prefersDarkMediaQuery || prefersDarkMediaQueryHandler) {
        return;
    }

    prefersDarkMediaQueryHandler = () => {
        if (currentAppearancePreference === 'system') {
            applyEditorSettings(lastAppliedSettings);
        }
    };

    if (typeof prefersDarkMediaQuery.addEventListener === 'function') {
        prefersDarkMediaQuery.addEventListener('change', prefersDarkMediaQueryHandler);
    } else if (typeof prefersDarkMediaQuery.addListener === 'function') {
        prefersDarkMediaQuery.addListener(prefersDarkMediaQueryHandler);
    }
}

function notifyAppearanceChange(resolvedAppearance, preference) {
    if (
        resolvedAppearance === lastNotifiedAppearance &&
        preference === lastNotifiedPreference
    ) {
        return;
    }

    lastNotifiedAppearance = resolvedAppearance;
    lastNotifiedPreference = preference;

    appearanceListeners.forEach(listener => {
        try {
            listener({ appearance: resolvedAppearance, preference });
        } catch (error) {
            console.warn('appearance listener error', error);
        }
    });
}

export function onEditorAppearanceChange(listener) {
    if (typeof listener !== 'function') {
        return () => {};
    }
    appearanceListeners.add(listener);
    return () => {
        appearanceListeners.delete(listener);
    };
}

function loadTheme(themeName) {
    const theme = themeName || 'default';
    const themeId = 'markdown-theme-stylesheet';

    const existingTheme = document.getElementById(themeId);
    if (existingTheme) {
        existingTheme.remove();
    }

    const href = themeUrlByName[theme] || themeUrlByName.default || `/styles/themes/${theme}.css`;

    const link = document.createElement('link');
    link.id = themeId;
    link.rel = 'stylesheet';
    link.href = href;

    document.head.appendChild(link);
}
