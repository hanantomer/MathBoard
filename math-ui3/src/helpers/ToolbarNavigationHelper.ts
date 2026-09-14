export interface ToolbarButton {
  name: string;
  tooltip: string;
  shortcut?: string;
  tabIndex?: number;
  action: () => void;
}

/** Prefer `code` so Alt+X still matches when `key` is a special char. */
function shortcutLetterFromEvent(e: KeyboardEvent): string {
  if (e.code.startsWith("Key") && e.code.length === 4) {
    return e.code.slice(3).toLowerCase();
  }
  return e.key.toLowerCase();
}

export function useToolbarNavigation() {

  // function handleKeyboardNavigation(e: KeyboardEvent, toolbarClass: string) {
  //   if (e.key === "Tab") {
  //     const toolbarButtons = document.querySelectorAll(
  //       `.${toolbarClass} .vertical-toolbar v-btn`,
  //     );
  //     const currentIndex = Array.from(toolbarButtons).indexOf(
  //       document.activeElement as Element,
  //     );

  //     if (e.shiftKey && currentIndex > 0) {
  //       (toolbarButtons[currentIndex - 1] as HTMLElement).focus();
  //       e.preventDefault();
  //     } else if (!e.shiftKey && currentIndex < toolbarButtons.length - 1) {
  //       (toolbarButtons[currentIndex + 1] as HTMLElement).focus();
  //       e.preventDefault();
  //     }
  //   }
  // }

  function handleShortcuts(e: KeyboardEvent, buttons: ToolbarButton[]) {
    if (!e.altKey) return;

    const pressed = shortcutLetterFromEvent(e);
    const button = buttons.find((btn) => {
      const key = btn.shortcut?.split("+").at(-1)?.toLowerCase();
      return key === pressed;
    });

    if (button) {
      e.preventDefault();
      button.action();
    }
  }

  return {
    handleShortcuts,
  };
}
