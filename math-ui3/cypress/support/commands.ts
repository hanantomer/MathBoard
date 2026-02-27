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
    openLesson(): any;
    clearBoard(): any;
    drawLine(
      buttonDataCy: string,
      handleDataCy: string,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ): any;
    selectArea(x: number, y: number, width: number, height: number): any;
  }
}

Cypress.Commands.add(
  "drawLine",
  (
    buttonDataCy: string,
    handleDataCy: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => {
    cy.dataCy(buttonDataCy).click();

    cy.get("#lessonSvg").trigger("mousedown", { x: x1, y: y1 });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x1,
      y: y1,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x2,
      y: y2,
    });

    cy.get("#lessonSvg").trigger("mouseup");

    cy.dataCy(handleDataCy).trigger("mousedown");
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 301,
      y: 200,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 302,
      y: 200,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 400,
      y: 200,
    });
    cy.get("#lessonSvg").trigger("mouseup");
  },
);

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
  !cy.dataCy("pBar") || cy.dataCy("pBar").should("not.be.visible");
});

Cypress.Commands.add("clearBoard", () => {
  cy.get('[row="0"] > [col="0"]').click({ force: true });
  cy.get("body").type("0", { force: true });
  cy.get("#lessonSvg").trigger("mousedown", { buttons: 1, x: 0, y: 0 });
  cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 2, y: 2 });
  cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 3, y: 3 });
  cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 52, y: 52 });
  cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 1300, y: 700 });
  cy.get("#selection").trigger("mouseup");

  cy.dataCy("deleteToolButton").click();
  cy.dataCy("confirmDelete").click();
});

Cypress.Commands.add(
  "selectArea",
  (x: number, y: number, width: number, height: number) => {
    cy.get("#lessonSvg").trigger("mousedown", { buttons: 1, x: x, y: y });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x + 1,
      y: y + 1,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x + 2,
      y: y + 2,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x + width - 1,
      y: y + height - 1,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x + width,
      y: y + height,
    });
    cy.get("#selection").trigger("mouseup");
  },
);
