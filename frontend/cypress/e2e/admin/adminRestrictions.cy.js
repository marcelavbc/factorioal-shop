describe("Admin Restrictions Page", () => {
  beforeEach(function () {
    cy.fixture("partOptionsMock").then((partOptions) => {
      this.partOptionsData = partOptions;

      cy.intercept("GET", "/api/part-options", {
        fixture: "partOptionsMock",
      }).as("getPartOptions");
    });

    cy.visit("/admin/restrictions");
    cy.wait("@getPartOptions");
  });
  it("should load the admin restrictions page successfully", function () {
    cy.contains("Manage Part Restrictions").should("be.visible");
  });
  it("should allow selecting a part option", function () {
    const part = this.partOptionsData.find((p) => p.category === "Frame Type");

    cy.contains(part.value).click();
    cy.contains(`Manage Restrictions for ${part.value}`).should("be.visible");
  });
  it("should allow adding a new restriction", function () {
    const part = this.partOptionsData.find((p) => p.category === "Frame Type");
    const restrictedCategory = "Wheels";

    cy.contains(part.value).click();
    cy.get(`[data-testid="add-restriction-${part.value}"]`).click();

    cy.get(`[data-testid="categories-select"]`).click();

    cy.get("[role='listbox']").should("be.visible").contains("Wheels").click();

    cy.get(`[data-testid="values-select-dropdown"]`).click();
    cy.get("[role='listbox']")
      .should("be.visible")
      .contains("Mountain Wheels")
      .click();

    cy.intercept(
      "PATCH",
      `/api/part-options/${part._id}/restrictions`,
      (req) => {
        req.reply({
          statusCode: 200,
          body: {
            ...part,
            restrictions: {
              ...part.restrictions,
              [restrictedCategory]: ["Mountain Wheels"],
            },
          },
        });
      }
    ).as("updateRestrictions");

    cy.get(".modal .btn-primary").contains("Add").click();
    cy.wait("@updateRestrictions");

    cy.contains("Restriction updated!").should("be.visible");
    cy.contains(`${restrictedCategory}: Mountain Wheels`).should("be.visible");
  });
  it("should allow editing a restriction", function () {
    const part = this.partOptionsData.find((p) => p.category === "Frame Type");
    const restrictedCategory = "Wheels";

    cy.contains(part.value).click();
    cy.get(`[data-testid="edit-restriction-${part.value}"]`).click();

    cy.get(`[data-testid="values-select-dropdown"]`).click();
    cy.get("[role='listbox']")
      .should("be.visible")
      .contains("Road Wheels")
      .click();

    cy.intercept(
      "PATCH",
      `/api/part-options/${part._id}/restrictions`,
      (req) => {
        req.reply({
          statusCode: 200,
          body: {
            ...part,
            restrictions: {
              ...part.restrictions,
              [restrictedCategory]: ["Road Wheels"],
            },
          },
        });
      }
    ).as("updateRestrictions");

    cy.get(".modal .btn-primary").contains("Add").click();
    cy.wait("@updateRestrictions");

    cy.contains("Restriction updated!").should("be.visible");
    cy.contains(`${restrictedCategory}: Mountain Wheels`).should("be.visible");
  });
  it("should allow removing a restriction", function () {
    const part = this.partOptionsData.find((p) => p.category === "Frame Type");
    const restrictedCategory = "Wheels";

    cy.intercept("PATCH", "**/api/part-options/*/restrictions", (req) => {
      req.reply({
        statusCode: 200,
        body: { message: "Restriction updated successfully" },
      });
    }).as("updateRestrictions");

    cy.contains(part.value).click();

    cy.get(`[data-testid="remove-restriction-${part.value}"]`)
      .should("be.visible")
      .and("not.be.disabled")
      .click();

    cy.wait("@updateRestrictions", { timeout: 10000 }).then((interceptions) => {
      console.log("Captured Intercept:", interceptions);
      expect(interceptions.response.statusCode).to.eq(200);
    });

    cy.get("@updateRestrictions.all").then((interceptions) => {
      console.log("All Captured Requests:", interceptions);
    });

    cy.contains("Restriction removed!", { timeout: 7000 }).should("be.visible");

    cy.contains(`${restrictedCategory}: Mountain Wheels`, {
      timeout: 5000,
    }).should("not.exist");
  });
});
