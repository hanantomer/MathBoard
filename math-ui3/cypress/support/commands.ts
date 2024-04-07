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
    login();
    openLesson();
    clearBoard();
    drawLine(x: number, y: number, width: number);
    selectArea(x: number, y: number, width: number, height: number);
  }
}

Cypress.Commands.add("dataCy", (value: string) =>
  cy.get(`[data-cy="${value}"]`),
);

Cypress.Commands.add("login", () => {
  cy.dataCy("login_email").type("hanantomer@gmail.com");
  cy.dataCy("login_password").type("12345678");
  cy.get('[data-cy="login"] > .v-btn__content').click();
});

Cypress.Commands.add("openLesson", () => {
  cy.get('[data-cy="lessons"] > .v-btn__content').click();
  cy.login();
  cy.get('td:contains("test lesson")').click();
  cy.dataCy("pBar").should("not.be.visible");
});

Cypress.Commands.add("clearBoard", () => {
  cy.get("#lessonSvg").trigger("mousedown", { buttons: 1, x: 0, y: 0 });
  cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 2, y: 2 });
  cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 3, y: 3 });
  cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 52, y: 52 });
  cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 1300, y: 700 });
  cy.get("#selection").trigger("mouseup");
  cy.get("body").type("{del}");
});

Cypress.Commands.add("drawLine", (x: number, y: number, width: number) => {

  cy.dataCy("fraction").click();

  cy.get("#lessonSvg").realMouseDown({ x: x, y: y });

  cy.get("#lessonSvg").trigger("mousemove", {
    buttons: 1,
    x: x + 1,
    y: y,
    force: true
  });

  cy.get("#lessonSvg").trigger("mousemove", {
    buttons: 1,
    x: x + 2,
    y: 200,
    force: true,
  });

  cy.get("#lessonSvg").trigger("mousemove", {
    buttons: 1,
    x: +width,
    y: 200,
    force: true,
  });

  cy.get("#lineRightHandle").trigger("mouseup");
});

Cypress.Commands.add(
  "selectArea",
  (x: number, y: number, width: number, height: number) => {

    cy.get("#lessonSvg").realMouseDown({ x: x, y: y });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x + 1,
      y: y + 1,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x + 2,
      y: y +2,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x + width,
      y: y + height,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mouseup");
  },
);


