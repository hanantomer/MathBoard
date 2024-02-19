import { test, expect } from "vitest";
import { DotPosition } from "../../math-common/src/globals";
import { Window } from "happy-dom";

import useElementFinderHelper from "../src/helpers/elementFinderHelper";
const elementFinderHelper = useElementFinderHelper();

test("find cell", async () => {
  const window = new Window({ url: "https://localhost:8080" });
  const document = window.document;

  const html = `<svg id="lessonSvg" x="0" y="0" width="1600" height="760" style="">
	    <g row="23" transform="translate(0, 713)">
		    <rect fill="white" stroke="lightgray" col="0" x="0" width="15.5" height="31"/>
      </g>
    </svg>`;

  console.debug(html);
  //console.debug(document);

  document.createComment(html);

  const dotPosition: DotPosition = { x: 100, y: 100 };

  //const el = elementFinderHelper.findClickedNotation(dotPosition, "rect", null);

  //expect(el).toBeDefined();

  //await window.happyDOM.abort();

  window.close();
});
