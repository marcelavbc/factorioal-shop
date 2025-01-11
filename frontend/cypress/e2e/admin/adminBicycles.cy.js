describe("Admin Bicycles Page", () => {
  beforeEach(function () {
    cy.fixture("bicyclesMock").then((bicycles) => {
      this.bicyclesData = bicycles;
      cy.intercept("GET", "/api/bicycles", { fixture: "bicyclesMock" }).as(
        "getBicycles"
      );
    });

    cy.fixture("partOptionsMock").then((partOptions) => {
      this.partOptionsData = partOptions;
      cy.intercept("GET", "/api/part-options", {
        fixture: "partOptionsMock",
      }).as("getPartOptions");
    });

    cy.visit("/admin/bicycles");
    cy.wait(["@getBicycles", "@getPartOptions"]);
  });

  it("should load the admin bicycles page successfully", function () {
    cy.contains("Manage Bicycles").should("be.visible");
  });

  it("should display correct bicycle count", function () {
    cy.get("tbody tr").should("have.length", this.bicyclesData.length);
  });

  it("should display bicycle details correctly", function () {
    this.bicyclesData.forEach((bicycle) => {
      cy.contains(bicycle.name).should("be.visible");
      cy.contains(bicycle.description).should("be.visible");
      cy.contains(`$${bicycle.price}`).should("be.visible");
    });
  });

  it("should show an error message if API fails", function () {
    cy.intercept("GET", "/api/bicycles", { statusCode: 500 }).as(
      "getBicyclesError"
    );

    cy.visit("/admin/bicycles");
    cy.wait("@getBicyclesError");

    cy.contains("Failed to load data.").should("be.visible");
  });

  it("should open and close the Add Bicycle modal", function () {
    cy.get(".btn-primary").contains("Add New Bicycle").click();
    cy.contains("Add New Bicycle").should("be.visible");

    cy.get(".modal").should("be.visible");
    cy.get(".btn").contains("Close").click();
    cy.get(".modal").should("not.exist");
  });

  it("should allow adding a new bicycle", function () {
    cy.get(".btn-primary").contains("Add New Bicycle").click();

    cy.get("#name").type("Test Bicycle");
    cy.get("#description").type("A fast and reliable test bike.");
    cy.get("#price").type("1200");
    cy.get("#image").type("https://via.placeholder.com/150");

    cy.intercept("POST", "/api/bicycles", (req) => {
      req.reply({
        statusCode: 201,
        body: { ...req.body, _id: "newBicycleId" },
      });
    }).as("createBicycle");

    cy.get(".modal .btn-primary").contains("Add").click();
    cy.wait("@createBicycle");

    cy.contains("Bicycle created!").should("be.visible");
    cy.get("tbody tr").should("have.length", this.bicyclesData.length + 1);
  });

  it("should allow editing a bicycle", function () {
    const bicycle = this.bicyclesData[0];

    cy.get("tbody tr").first().contains("Edit").click();
    cy.contains("Edit Bicycle").should("be.visible");

    cy.get("#name").clear().type("Updated Name");

    cy.intercept("PUT", `/api/bicycles/${bicycle._id}`, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          ...bicycle,
          name: req.body.name,
          partOptions: bicycle.partOptions || [],
        },
      });
    }).as("updateBicycle");

    cy.get(".modal .btn-primary").contains("Update").click();
    cy.wait("@updateBicycle");

    cy.contains("Bicycle updated!").should("be.visible");
    cy.contains("Updated Name").should("be.visible");
  });

  it("should allow deleting a bicycle", function () {
    const bicycle = this.bicyclesData[0];

    cy.intercept("DELETE", `/api/bicycles/${bicycle._id}`, {
      statusCode: 200,
    }).as("deleteBicycle");

    cy.get("tbody tr").first().contains("Delete").click();
    cy.wait("@deleteBicycle");

    cy.contains("Bicycle deleted!").should("be.visible");
    cy.get("tbody tr").should("have.length", this.bicyclesData.length - 1);
  });
});
