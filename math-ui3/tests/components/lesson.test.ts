import { mount } from "@vue/test-utils";
import lesson from "@/components/Welcome.vue";
// import { expect, test } from "vitest";
const wrapper = mount(lesson);

import { test, expect, describe } from "vitest";
import { DotPosition } from "../../../math-common/src/globals";

const elementFinderHelper = useElementFinderHelper();

describe("find cell", async () => {
  const cell = elementFinderHelper.findClickedCell();

  console.debug(html);
  //console.debug(document);

  document.createComment(html);

  const dotPosition: DotPosition = { x: 100, y: 100 };

  //const el = elementFinderHelper.findClickedNotation(dotPosition, "rect", null);

  //expect(el).toBeDefined();

  //await window.happyDOM.abort();

  window.close();
});
