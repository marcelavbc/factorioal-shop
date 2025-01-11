describe("Admin Parts Page", () => {
  beforeEach(function () {
    cy.fixture("partOptionsMock").then((partOptions) => {
      this.partOptionsData = partOptions;

      cy.intercept("GET", "/api/part-options", {
        fixture: "partOptionsMock",
      }).as("getPartOptions");
    });

    cy.visit("/admin/part-options");
    cy.wait("@getPartOptions");
  });

  it("should load the admin parts page successfully", function () {
    cy.contains("Manage Part Options").should("be.visible");
  });

  it("should display correct part options count", function () {
    const totalParts = Object.values(this.partOptionsData).flat().length;
    cy.get(".list-group-item").should("have.length", totalParts);
  });

  it("should open and close the Add Part modal", function () {
    cy.get(".btn-success").first().click();
    cy.contains("Add New").should("be.visible");

    cy.get(".modal").should("be.visible");
    cy.get(".btn").contains("Cancel").click();
    cy.get(".modal").should("not.exist");
  });

  it("should allow adding a new part option", function () {
    cy.get(".btn-success").first().click();

    cy.get("#value").type("Test Part");
    cy.get(".react-select__control").click();
    cy.get(".react-select__menu").contains("In Stock").click();

    cy.intercept("POST", "/api/part-options", (req) => {
      req.reply({
        statusCode: 201,
        body: {
          _id: "newPartId",
          category: "Frame Type",
          value: req.body.value,
          stock: req.body.stock,
        },
      });
    }).as("createPart");

    cy.get(".modal .btn-primary").contains("Add").click();
    cy.wait("@createPart");

    cy.contains('Added "Test Part" to Frame Type!').should("be.visible");
    cy.get(".list-group-item").should("contain", "Test Part");
  });

  it("should allow deleting a part option", function () {
    cy.wait("@getPartOptions").then(() => {
      const frameTypeOptions = this.partOptionsData.filter(
        (part) => part.category === "Frame Type"
      );

      expect(frameTypeOptions, "Part options should not be empty").to.not.be
        .undefined;
      expect(
        frameTypeOptions.length,
        "At least one part option should exist"
      ).to.be.greaterThan(0);

      const partToDelete = frameTypeOptions[0];

      cy.intercept("DELETE", `/api/part-options/${partToDelete._id}`, {
        statusCode: 200,
      }).as("deletePart");

      cy.get(`[data-testid="delete-${partToDelete._id}"]`).click();
      cy.wait("@deletePart");

      cy.contains("Part option deleted successfully!").should("be.visible");
      cy.contains(partToDelete.value).should("not.exist");
    });
  });

  it("should allow toggling stock status", function () {
    cy.wait("@getPartOptions").then(() => {
      const frameTypeOptions = this.partOptionsData.filter(
        (part) => part.category === "Frame Type"
      );

      expect(
        frameTypeOptions.length,
        "At least one part option should exist"
      ).to.be.greaterThan(0);

      const part = frameTypeOptions[0];

      cy.intercept("PUT", `/api/part-options/${part._id}`, (req) => {
        req.reply({
          statusCode: 200,
          body: {
            ...part,
            stock: part.stock === "in_stock" ? "out_of_stock" : "in_stock",
          },
        });
      }).as("toggleStock");

      cy.get(`[data-testid="toggle-stock-${part._id}"]`).click();
      cy.wait("@toggleStock");

      cy.contains("Stock status updated").should("be.visible");
    });
  });
});
