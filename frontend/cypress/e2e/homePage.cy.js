describe("Home Page", () => {
  beforeEach(function () {
    cy.fixture("bicyclesMock").then((bicycles) => {
      this.bicyclesData = bicycles;
    });

    cy.intercept("GET", "/api/bicycles", { fixture: "bicyclesMock" }).as(
      "getBicycles"
    );
  });

  it("should display bicycles from the mock API", function () {
    cy.visit("/");

    cy.wait("@getBicycles");

    this.bicyclesData.forEach((bicycle) => {
      cy.contains(bicycle.name).should("be.visible");
      cy.contains(bicycle.description).should("be.visible");
      cy.contains(bicycle.price).should("be.visible");
      cy.get(`img[alt="${bicycle.name}"]`).should(
        "have.attr",
        "src",
        bicycle.image
      );
    });
  });
});
