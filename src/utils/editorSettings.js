import { getCurrentWindow } from '@tauri-apps/api/window';
import { createStore } from '../services/storage.js';

const store = createStore('editor');
store.migrateFrom('mark2:editorSettings', 'settings');

const VALID_APPEARANCES = new Set(['light', 'dark', 'system']);

export const COLOR_VARIANTS = {
    v1: {
        labelKey: 'settings.colorVariant1',
        folder: { light: '#95e1d3', dark: '#fce38a' },
        file: { light: '#f38181', dark: '#eaffd0' },
    },
    v2: {
        labelKey: 'settings.colorVariant2',
        folder: { light: '#a6e3e9', dark: '#cbf1f5' },
        file: { light: '#71c9ce', dark: '#e3fdfd' },
    },
    v3: {
        labelKey: 'settings.colorVariant3',
        folder: { light: '#a8d8ea', dark: '#fcbad3' },
        file: { light: '#aa96da', dark: '#ffffd2' },
    },
    v4: {
        labelKey: 'settings.colorVariant4',
        folder: { light: '#3d84a8', dark: '#46cdcf' },
        file: { light: '#48466d', dark: '#abedd8' },
    },
    v5: {
        labelKey: 'settings.colorVariant5',
        folder: { light: '#ffb6b9', dark: '#bbded6' },
        file: { light: '#61c0bf', dark: '#fae3d9' },
    },
    v6: {
        labelKey: 'settings.colorVariant6',
        folder: { light: '#a8e6cf', dark: '#ffd3b6' },
        file: { light: '#ffaaa5', dark: '#dcedc1' },
    },
    v7: {
        labelKey: 'settings.colorVariant7',
        folder: { light: '#6c5b7b', dark: '#c06c84' },
        file: { light: '#355c7d', dark: '#f67280' },
    },
    v8: {
        labelKey: 'settings.colorVariant8',
        folder: { light: '#ffaaa6', dark: '#ffd3b5' },
        file: { light: '#ff8c94', dark: '#dcedc2' },
    },
    v9: {
        labelKey: 'settings.colorVariant9',
        folder: { light: '#f9a1bc', dark: '#a9eee6' },
        file: { light: '#625772', dark: '#fefaec' },
    },
    v10: {
        labelKey: 'settings.colorVariant10',
        folder: { light: '#a8e6cf', dark: '#ffd3b6' },
        file: { light: '#ffaaa5', dark: '#fdffab' },
    },
    v11: {
        labelKey: 'settings.colorVariant11',
        folder: { light: '#f38181', dark: '#a9eee6' },
        file: { light: '#625772', dark: '#fefaec' },
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
        folder: { light: '#7dace4', dark: '#95e8d7' },
        file: { light: '#8971d0', dark: '#adf7d1' },
    },
    v15: {
        labelKey: 'settings.colorVariant15',
        folder: { light: '#66c6ba', dark: '#a4e5d9' },
        file: { light: '#649dad', dark: '#c8f4de' },
    },
    v16: {
        labelKey: 'settings.colorVariant16',
        folder: { light: '#b8a9c9', dark: '#9f8db3' },
        file: { light: '#3d4452', dark: '#d5dce6' },
    },
    v17: {
        labelKey: 'settings.colorVariant17',
        folder: { light: '#a3b5ae', dark: '#81948c' },
        file: { light: '#2d4a3a', dark: '#c0d4c5' },
    },
    v18: {
        labelKey: 'settings.colorVariant18',
        folder: { light: '#c6b09c', dark: '#a8907c' },
        file: { light: '#4a3728', dark: '#ddd0be' },
    },
    v19: {
        labelKey: 'settings.colorVariant19',
        folder: { light: '#a5b5c9', dark: '#8595a8' },
        file: { light: '#263445', dark: '#c9d6e8' },
    },
    v20: {
        labelKey: 'settings.colorVariant20',
        folder: { light: '#bfaec9', dark: '#9f8da8' },
        file: { light: '#363545', dark: '#d5cce0' },
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
    folderColor: '',
    fileColor: '',
    showDotFiles: true,
    showAssetsFolder: true,
    checkForUpdates: true,
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

        if (typeof candidate.folderColor === 'string') {
            const trimmed = candidate.folderColor.trim();
            prefs.folderColor = /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed : '';
        }

        if (typeof candidate.fileColor === 'string') {
            const trimmed = candidate.fileColor.trim();
            prefs.fileColor = /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed : '';
        }

        if (candidate.showDotFiles !== undefined) {
            prefs.showDotFiles = candidate.showDotFiles !== false;
        }

        if (candidate.showAssetsFolder !== undefined) {
            prefs.showAssetsFolder = candidate.showAssetsFolder !== false;
        }

        if (candidate.checkForUpdates !== undefined) {
            prefs.checkForUpdates = candidate.checkForUpdates !== false;
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
    root.style.setProperty('--folder-text-color', prefs.folderColor || variant.folder[resolvedAppearance]);
    root.style.setProperty('--file-text-color', prefs.fileColor || variant.file[resolvedAppearance]);

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
