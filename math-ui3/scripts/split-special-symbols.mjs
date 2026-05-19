import fs from "fs";
import { execSync } from "child_process";

const panelsPath = "src/components/SpecialSymbolPanels.vue";

const s = execSync(
  "git show HEAD:math-ui3/src/components/SpecialSymbolsToolbar.vue",
  { encoding: "utf8", cwd: "c:/dev/MathBoard" },
);
const panelMarker =
  '<v-expansion-panels multiple class="special-symbols-expansion">';
const panelIdx = s.indexOf(panelMarker);
if (panelIdx < 0) throw new Error("desktop panels not found");

const scriptStart = s.indexOf("<script");
const templateClose = s.lastIndexOf("</template>", scriptStart);
if (templateClose < panelIdx) throw new Error("template close not found");
const panelsBody = s.slice(panelIdx + panelMarker.length, templateClose);

const panelsTemplate =
  `<template>\n  <v-expansion-panels multiple class="special-symbol-panels">` +
  panelsBody +
  `</template>\n`;

const styleStart = s.indexOf("<style");
let script = s.slice(scriptStart, styleStart);
script = script.replace(
  'import { ref, computed, watch } from "vue";',
  'import { ref, computed } from "vue";',
);
script = script.replace(
  /\/\/ Props for modal control[\s\S]*?function closeModal\(\) \{[\s\S]*?\}\n\n/,
  `const props = defineProps({
  closeOnSelect: { type: Boolean, default: false },
});

const emit = defineEmits<{ close: [] }>();

function maybeCloseAfterInsert() {
  if (props.closeOnSelect) emit("close");
}

`,
);

script = script.replace(
  `async function addIntegral(start: string, end: string) {
  const value = start + " ∫ " + end;
  notationMutateHelper.addSymbolNotation(value);
}`,
  `async function addIntegral(start: string, end: string) {
  const value = start + " ∫ " + end;
  notationMutateHelper.addSymbolNotation(value);
  maybeCloseAfterInsert();
}`,
);

script = script.replace(
  `        break;
    }
  }, 0);
}

async function addVector(letter: string) {`,
  `        break;
    }
    maybeCloseAfterInsert();
  }, 0);
}

async function addVector(letter: string) {`,
);

script = script.replace(
  `    notationMutateHelper.addSymbolNotation(symbolValue);
  }, 0);
}

function isTextOrAnnotationMode`,
  `    notationMutateHelper.addSymbolNotation(symbolValue);
    maybeCloseAfterInsert();
  }, 0);
}

function isTextOrAnnotationMode`,
);

script = script.replace(
  `      emitSpecialSymbolToEditors();
      return;`,
  `      emitSpecialSymbolToEditors();
      maybeCloseAfterInsert();
      return;`,
);

script = script.replace(
  `      await addNinetyDegreesAnnotation(symbolValue);
      return;`,
  `      await addNinetyDegreesAnnotation(symbolValue);
      maybeCloseAfterInsert();
      return;`,
);

script = script.replace(
  `      addEachCharAsSymbol(symbolValue);
      return;`,
  `      addEachCharAsSymbol(symbolValue);
      maybeCloseAfterInsert();
      return;`,
);

let style = s.slice(styleStart);
style = style.replace(
  /@media \(max-width: 1023px\) \{\n  \.special-symbols-expansion \{\n    display: none;\n  \}\n\}\n\n/g,
  "",
);
style = style.replace(/\.special-symbols-modal[\s\S]*?}\n\n/g, "");
style = style.replace(
  /\.special-symbols-expansion \{[\s\S]*?\}\n\n/g,
  "",
);

fs.writeFileSync(panelsPath, panelsTemplate + script + style);
console.log("Wrote", panelsPath);
