import type {} from "cypress";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.intercept("POST", "/api/auth").as("login");
    cy.intercept("GET", "/api/users").as("currentUser");
    cy.intercept("GET", "/api/lessons*").as("loadLessons");
    cy.intercept("POST", "/api/lessons").as("addLesson");

    const lessonName = `test lesson`;

    cy.visit("http://localhost:13035");
    //cy.get(".mdi-account-tie").click({ multiple: true });
    cy.login();
    cy.wait("@login");
    cy.wait("@currentUser");
    cy.location("pathname").should("eq", "/lessons");

    cy.wait("@loadLessons");
    
    cy.dataCy("new-board-item-dialog")
      //.should("be.visible")
      .within(() => {
        cy.dataCy("newItemName").find("input").clear().type(lessonName);
      });

    cy.dataCy("button-save").click();
    cy.wait("@addLesson");
    cy.dismissUiOverlays();
  });
});
