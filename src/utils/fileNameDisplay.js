export function refreshCompactFileNameElement(_label) {
    // no-op: 尾部截断由 CSS overflow: hidden 处理
}

export function refreshCompactFileNameElements(_root) {
    // no-op: 尾部截断由 CSS overflow: hidden 处理
}

export function scheduleCompactFileNameRefresh(_root) {
    // no-op: 尾部截断由 CSS overflow: hidden 处理
}

export function createCompactFileNameElement(className, name) {
    const label = document.createElement('span');
    label.className = className;
    label.textContent = typeof name === 'string' ? name : '';
    label.title = typeof name === 'string' ? name : '';
    return label;
}
