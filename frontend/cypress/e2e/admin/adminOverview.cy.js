describe("Admin Overview Page", () => {
  beforeEach(function () {
    cy.fixture("bicyclesMock").then((bicycles) => {
      this.bicyclesData = bicycles;
    });

    cy.fixture("partOptionsMock").then((partOptions) => {
      this.partOptionsData = partOptions;
    });

    cy.intercept("GET", "/api/bicycles", { fixture: "bicyclesMock" }).as(
      "getBicycles"
    );

    cy.intercept("GET", "/api/part-options", { fixture: "partOptionsMock" }).as(
      "getPartOptions"
    );

    cy.visit("/admin");
    cy.wait(["@getBicycles", "@getPartOptions"]);
  });

  it("should display correct total statistics", function () {
    cy.get("[data-testId='total-bikes-value']").should(
      "contain",
      this.bicyclesData.length
    );

    cy.get("[data-testId='total-parts-value']").should(
      "contain",
      this.partOptionsData.length
    );
  });

  it("should navigate to Manage Bicycles page when clicking the button", function () {
    cy.contains("Manage Bicycles").click();
    cy.url().should("include", "/admin/bicycles");
  });

  it("should navigate to Manage Part Options page when clicking the button", function () {
    cy.contains("Manage Part Options").click();
    cy.url().should("include", "/admin/part-options");
  });

  it("should handle API error gracefully", function () {
    cy.intercept("GET", "/api/bicycles", { statusCode: 500 }).as("getBicycles");
    cy.visit("/admin");
    cy.contains("Failed to load dashboard statistics.").should("be.visible");
  });
});
