/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<JQuery>;
    clean(): any;
    login(): any;
    openLesson(): Chainable<void>;
    clearBoard(): Chainable<void>;
    dismissUiOverlays(): Chainable<void>;
    drawLine(
      buttonDataCy: string,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      expectDataCy?: string,
    ): Chainable<void>;
    dragLineRightHandle(
      handleDataCy: string,
      x: number,
      y: number,
    ): Chainable<void>;
    clickSvg(x: number, y: number): Chainable<void>;
    drawPolyline(points: Array<[number, number]>): Chainable<void>;
    selectArea(x: number, y: number, width: number, height: number): any;
  }
}

/**
 * MathBoard wires the lesson SVG with native pointer listeners (eventHelper.ts),
 * which emit EV_SVG_POINTERDOWN / MOVE / UP. AreaSelector.vue listens on the bus
 * — not on mouse events. Cypress must dispatch pointer* so emitSvgPointer* runs.
 * emitSvgPointerMove also requires (e.buttons & 1) !== 0 for mouse (non-touch).
 * From CELL_SELECTED, marquee starts on EV_SVG_POINTERMOVE (AreaSelector L138–141).
 */
const SVG_POINTER_ID = 1;

function pointerInSvg(
  win: Window,
  svg: { getBoundingClientRect(): { left: number; top: number } },
  x: number,
  y: number,
): { clientX: number; clientY: number; pageX: number; pageY: number } {
  const br = svg.getBoundingClientRect();
  const clientX = br.left + x;
  const clientY = br.top + y;
  return {
    clientX,
    clientY,
    pageX: win.scrollX + clientX,
    pageY: win.scrollY + clientY,
  };
}

function svgPointerOpts(
  win: Window,
  svg: { getBoundingClientRect(): { left: number; top: number } },
  x: number,
  y: number,
  pressed: boolean,
) {
  const { clientX, clientY, pageX, pageY } = pointerInSvg(win, svg, x, y);
  const buttons = pressed ? 1 : 0;
  return {
    force: true,
    pointerId: SVG_POINTER_ID,
    pointerType: "mouse" as const,
    isPrimary: true,
    clientX,
    clientY,
    pageX,
    pageY,
    button: 0,
    buttons,
  };
}

function dispatchSvgPointer(
  win: Window,
  target: any,
  svg: { getBoundingClientRect(): { left: number; top: number } },
  type: "pointerdown" | "pointermove" | "pointerup",
  x: number,
  y: number,
  pressed: boolean,
) {
  const opts = svgPointerOpts(win, svg, x, y, pressed);
  const event = new win.PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    pointerId: opts.pointerId,
    pointerType: opts.pointerType,
    isPrimary: opts.isPrimary,
    clientX: opts.clientX,
    clientY: opts.clientY,
    button: opts.button,
    buttons: opts.buttons,
  });

  // Keep page* consistent with client* for any legacy listeners.
  Object.defineProperty(event, "pageX", { value: opts.pageX });
  Object.defineProperty(event, "pageY", { value: opts.pageY });

  target.dispatchEvent(event);
}

/** One synthetic pointer step on #lessonSvg; separate cy ticks so the event bus can run. */
function svgPointerStep(
  type: "pointerdown" | "pointermove" | "pointerup",
  x: number,
  y: number,
  pressed: boolean,
) {
  cy.get("#lessonSvg").then(($svg) => {
    const el = $svg[0];
    cy.window().then((win) => {
      dispatchSvgPointer(win, el, el, type, x, y, pressed);
    });
  });
  cy.wait(50);
}

Cypress.Commands.add(
  "drawLine",
  (
    buttonDataCy: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    expectDataCy = "lineRightHandle",
  ) => {
    cy.dataCy(buttonDataCy).click();
    cy.dismissUiOverlays();

    cy.get("#lessonSvg").then(($svg) => {
      const el = $svg[0];
      cy.window().then((win) => {
        dispatchSvgPointer(win, el, el, "pointerdown", x1, y1, true);
      });
    });

    cy.wait(0);

    cy.get("#lessonSvg").then(($svg) => {
      const el = $svg[0];
      cy.window().then((win) => {
        dispatchSvgPointer(win, el, el, "pointermove", x2, y2, true);
      });
    });

    cy.wait(0);

    cy.get("#lessonSvg").then(($svg) => {
      const el = $svg[0];
      cy.window().then((win) => {
        dispatchSvgPointer(win, el, el, "pointerup", x2, y2, false);
      });
    });

    cy.dataCy(expectDataCy).should("exist");
  },
);

/** Drag the right handle so the line/circle/division end lands at SVG (x, y). */
Cypress.Commands.add(
  "dragLineRightHandle",
  (handleDataCy: string, x: number, y: number) => {
    cy.dataCy(handleDataCy).should("exist");
    cy.dataCy(handleDataCy).then(($handle) => {
      const hEl = $handle[0];
      cy.window().then((win) => {
        dispatchSvgPointer(win, hEl, hEl, "pointerdown", 4, 4, true);
      });
    });

    cy.wait(0);

    cy.get("#lessonSvg").then(($svg) => {
      const el = $svg[0];
      cy.window().then((win) => {
        const waypoints: [number, number][] =
          x >= 2 ? [[x - 2, y], [x - 1, y], [x, y]] : [[x, y]];
        for (const [mx, my] of waypoints) {
          dispatchSvgPointer(win, el, el, "pointermove", mx, my, true);
        }
      });
    });

    cy.wait(0);

    cy.get("#lessonSvg").then(($svg) => {
      const el = $svg[0];
      cy.window().then((win) => {
        dispatchSvgPointer(win, el, el, "pointerup", x, y, false);
      });
    });
  },
);

Cypress.Commands.add("dataCy", (value: string) =>
  cy.get(`[data-cy="${value}"]`),
);

Cypress.Commands.add("clickSvg", (x: number, y: number) => {
  cy.get("#lessonSvg").then(($svg) => {
    const el = $svg[0];
    cy.window().then((win) => {
      dispatchSvgPointer(win, el, el, "pointerdown", x, y, true);
    });
  });

  cy.wait(0);

  cy.get("#lessonSvg").then(($svg) => {
    const el = $svg[0];
    cy.window().then((win) => {
      dispatchSvgPointer(win, el, el, "pointerup", x, y, false);
    });
  });
});

Cypress.Commands.add("drawPolyline", (points: Array<[number, number]>) => {
  if (points.length < 2) {
    throw new Error("drawPolyline requires at least two points");
  }

  cy.get("#lessonSvg").then(($svg) => {
    const el = $svg[0];
    cy.window().then((win) => {
      dispatchSvgPointer(win, el, el, "pointerdown", points[0][0], points[0][1], true);
    });
  });

  cy.wait(0);

  cy.get("#lessonSvg").then(($svg) => {
    const el = $svg[0];
    cy.window().then((win) => {
      dispatchSvgPointer(win, el, el, "pointermove", points[1][0], points[1][1], true);
    });
  });

  cy.wait(0);

  cy.get("#lessonSvg").then(($svg) => {
    const el = $svg[0];
    cy.window().then((win) => {
      dispatchSvgPointer(win, el, el, "pointerup", points[1][0], points[1][1], false);
    });
  });

  for (let i = 2; i < points.length; i++) {
    cy.wait(0);

    cy.get("#lessonSvg").then(($svg) => {
      const el = $svg[0];
      cy.window().then((win) => {
        dispatchSvgPointer(win, el, el, "pointermove", points[i][0], points[i][1], true);
      });
    });

    cy.wait(0);

    cy.get("#lessonSvg").then(($svg) => {
      const el = $svg[0];
      cy.window().then((win) => {
        dispatchSvgPointer(win, el, el, "pointerup", points[i][0], points[i][1], false);
      });
    });
  }
});

Cypress.Commands.add("login", () => {
  // Direct login route is more reliable than Welcome auth links after redesign.
  cy.clearCookies();
  cy.visit("http://localhost:13035/login?userType=TEACHER", {
    onBeforeLoad(win) {
      try {
        win.localStorage.clear();
        win.sessionStorage.clear();
      } catch {
        /* ignore */
      }
    },
  });
  cy.dataCy("login_email").should("be.visible").clear().type("hanantomer@gmail.com");
  cy.dataCy("login_password").clear().type("12345678");
  cy.get('[data-cy="login"] > .v-btn__content').click();
});

Cypress.Commands.add("dismissUiOverlays", () => {
  cy.get("body").then(($body) => {
    if ($body.find('[data-cy="teacher-checklist-dont-show"]').length) {
      cy.dataCy("teacher-checklist-dont-show").click({ force: true });
    }
  });

  cy.get("body").then(($body) => {
    if ($body.find('[data-cy="empty-lesson-dismiss"]').length) {
      cy.dataCy("empty-lesson-dismiss").click({ force: true });
    }
  });

  cy.get("body").then(($body) => {
    if ($body.find('[data-cy="coach-mark-skip"]').length) {
      cy.dataCy("coach-mark-skip").click({ force: true });
    }
  });

  cy.get("body").then(($body) => {
    if ($body.find('[data-cy="help-drawer-close"]').length) {
      cy.dataCy("help-drawer-close").click({ force: true });
    }
  });
});

Cypress.Commands.add("openLesson", () => {
  cy.get('[data-cy="lessons"]').click();
  cy.get(".v-data-table", { timeout: 15000 })
    .contains("test lesson")
    .click();
  cy.get("#lessonSvg", { timeout: 30000 }).should("exist");
  cy.dataCy("pBar").should("not.be.visible");
  cy.dismissUiOverlays();
});

Cypress.Commands.add("clearBoard", () => {
  cy.window().then((win) => {
    win.scrollTo(0, 0);
  });

  cy.get("#lessonSvg", { timeout: 30000 }).should("exist");
  cy.dataCy("pBar").should("not.be.visible");
  cy.wait(300);

  cy.get("body").then(($body) => {
    if ($body.find("#lessonSvg foreignObject").length === 0) {
      return;
    }

    cy.dataCy("selectionButton").click({ force: true });
    cy.dismissUiOverlays();
    cy.selectArea(0, 0, 1200, 800);

    cy.wait(200);
    cy.get('[data-cy="area-selection"]', { timeout: 15000 }).should("exist");
    cy.get('[data-cy="floatingToolbar"]', { timeout: 15000 }).should("exist");

    cy.realPress("Delete");

    cy.get('[data-cy="area-selection"]').should("not.exist");
    cy.get("#lessonSvg foreignObject", { timeout: 15000 }).should("not.exist");
  });
});

Cypress.Commands.add(
  "selectArea",
  (x: number, y: number, width: number, height: number) => {
    const pts: [number, number][] = [
      [x, y],
      [x + 1, y + 1],
      [x + 2, y + 2],
      [x + width - 1, y + height - 1],
      [x + width, y + height],
    ];

    svgPointerStep("pointerdown", pts[0][0], pts[0][1], true);
    svgPointerStep("pointermove", pts[1][0], pts[1][1], true);
    for (let i = 2; i < pts.length; i++) {
      svgPointerStep("pointermove", pts[i][0], pts[i][1], true);
    }
    svgPointerStep("pointerup", pts[pts.length - 1][0], pts[pts.length - 1][1], false);
  },
);
