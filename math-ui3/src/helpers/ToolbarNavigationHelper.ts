export interface ToolbarButton {
  name: string;
  tooltip: string;
  shortcut?: string;
  tabIndex?: number;
  action: () => void;
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

    const button = buttons.find((btn) => {
      const key = btn.shortcut?.split("+")[1].toLowerCase();
      return key === e.key.toLowerCase();
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
