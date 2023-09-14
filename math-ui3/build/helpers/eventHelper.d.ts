export default function eventHelper(): {
    paste: (e: ClipboardEvent) => Promise<void>;
    keyUp: (e: KeyboardEvent) => void;
    mouseDown: (e: MouseEvent) => void;
    lineDrawEnded: () => void;
};
