import { ref, computed, type Ref } from "vue";
import { cloneDeep } from "lodash";
import { NotationAttributes } from "common/baseTypes";

export function useUndoRedo(apiHelper: any) {
  const undoStack = ref<Map<String, NotationAttributes>[]>([]);
  const redoStack = ref<Map<String, NotationAttributes>[]>([]);
  const maxStackSize = 20; // Limit stack size to prevent memory issues

  async function syncToDB(
    currentNotations: Map<String, NotationAttributes>,
    previousNotations: Map<String, NotationAttributes>,
  ) {
    const added = Array.from(currentNotations.values()).filter(
      (n) => !previousNotations.has(n.uuid),
    );
    const removed = Array.from(previousNotations.values()).filter(
      (n) => !currentNotations.has(n.uuid),
    );
    const updated = Array.from(currentNotations.values()).filter((n) => {
      const prev = previousNotations.get(n.uuid);
      return prev && JSON.stringify(n) !== JSON.stringify(prev); // Simple diff
    });

    // Sync added notations
    for (const n of added) {
      delete n["id"];
      //delete (n as any)["uuid"];
      (n as any)["parentUUId"] =
        n.boardType === "LESSON"
          ? (n as any)["lesson"].uuid
          : n.boardType === "QUESTION"
          ? (n as any)["v"].uuid
          : n.boardType === "ANSWER"
          ? (n as any)["answer"].uuid
          : null;
      delete (n as any)["lesson"];
      delete (n as any)["question"];
      delete (n as any)["answer"];

      await apiHelper.addNotation(n); // Use addNotation
    }

    // Sync removed notations
    for (const n of removed) {
      await apiHelper.deleteNotation(n);
    }

    // Sync updated notations
    for (const n of updated) {
      await apiHelper.updateNotation(n);
    }
  }

  function saveState(currentNotations: Map<String, NotationAttributes>) {
    undoStack.value.push(cloneDeep(currentNotations));
    if (undoStack.value.length > maxStackSize) {
      undoStack.value.shift(); // Remove oldest state
    }
    redoStack.value = []; // Clear redo stack when new action is performed
  }

  async function undo(
    currentNotations: Ref<Map<String, NotationAttributes>>,
    rebuildOccupationMatrices: () => void,
  ) {
    if (undoStack.value.length === 0) return;

    redoStack.value.push(cloneDeep(currentNotations.value));
    const restoredState = undoStack.value.pop()!;

    // Sync diff to DB
    await syncToDB(restoredState, currentNotations.value);

    currentNotations.value = cloneDeep(restoredState);
    rebuildOccupationMatrices();
  }

  async function redo(
    currentNotations: Ref<Map<String, NotationAttributes>>,
    rebuildOccupationMatrices: () => void,
  ) {
    if (redoStack.value.length === 0) return;

    const previousState = cloneDeep(currentNotations.value);
    undoStack.value.push(previousState);
    const nextState = redoStack.value.pop()!;
    currentNotations.value = cloneDeep(nextState);
    rebuildOccupationMatrices();

    // Sync diff to DB
    await syncToDB(currentNotations.value, previousState);
  }

  return {
    saveState,
    undo,
    redo,
    canUndo: computed(() => undoStack.value.length > 0),
    canRedo: computed(() => redoStack.value.length > 0),
  };
}
