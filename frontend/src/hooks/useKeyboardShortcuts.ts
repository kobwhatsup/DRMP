import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  target?: EventTarget | null;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, target = document } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = (shortcut.ctrlKey ?? false) === event.ctrlKey;
      const shiftMatch = (shortcut.shiftKey ?? false) === event.shiftKey;
      const altMatch = (shortcut.altKey ?? false) === event.altKey;
      const metaMatch = (shortcut.metaKey ?? false) === event.metaKey;

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      matchingShortcut.handler(event);
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!target || !enabled) return;

    target.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [target, enabled, handleKeyDown]);

  // 返回快捷键信息，用于显示帮助
  const getShortcutHelp = useCallback(() => {
    return shortcuts
      .filter(s => s.description)
      .map(s => ({
        combination: [
          s.ctrlKey && 'Ctrl',
          s.metaKey && 'Cmd',
          s.altKey && 'Alt',
          s.shiftKey && 'Shift',
          s.key.toUpperCase()
        ].filter(Boolean).join(' + '),
        description: s.description!
      }));
  }, [shortcuts]);

  return { getShortcutHelp };
};

// 常用快捷键组合
export const commonShortcuts = {
  save: { key: 's', ctrlKey: true, description: '保存' },
  refresh: { key: 'r', ctrlKey: true, description: '刷新' },
  search: { key: 'f', ctrlKey: true, description: '搜索' },
  newItem: { key: 'n', ctrlKey: true, description: '新建' },
  escape: { key: 'Escape', description: '关闭/取消' },
  enter: { key: 'Enter', description: '确认' },
  delete: { key: 'Delete', description: '删除' },
  copy: { key: 'c', ctrlKey: true, description: '复制' },
  paste: { key: 'v', ctrlKey: true, description: '粘贴' },
  undo: { key: 'z', ctrlKey: true, description: '撤销' },
  redo: { key: 'y', ctrlKey: true, description: '重做' },
  selectAll: { key: 'a', ctrlKey: true, description: '全选' },
};

export default useKeyboardShortcuts;