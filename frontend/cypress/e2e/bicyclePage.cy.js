describe("Bicycle Page", () => {
  beforeEach(function () {
    cy.fixture("bicycleMock").then((bicycle) => {
      this.bicycleData = bicycle;

      cy.intercept("GET", `/api/bicycles/${this.bicycleData._id}`, {
        fixture: "bicycleMock",
      }).as("getBicycle");
    });

    cy.fixture("cartMock").then((cart) => {
      this.cartData = cart;

      const validCartId = "657a50d40d567747ae89f130";

      cy.window().then((win) => {
        win.localStorage.setItem("cartId", validCartId);
      });

      cy.intercept("GET", "/api/cart*", (req) => {
        const url = new URL(req.url);
        if (url.searchParams.get("cartId") === validCartId) {
          req.reply({ fixture: "cartMock" });
        }
      }).as("getCart");
    });

    cy.then(function () {
      cy.visit(`/bicycle/${this.bicycleData._id}`);
      cy.wait(["@getBicycle", "@getCart"]);
    });
  });

  it("should verify localStorage cartId", function () {
    cy.window().then((win) => {
      const cartId = win.localStorage.getItem("cartId");
      cy.log("Stored cartId:", cartId);
      expect(cartId).to.match(/^[a-f0-9]{24}$/);
    });
  });

  it("should display bicycle details correctly", function () {
    cy.contains(this.bicycleData.name).should("be.visible");
    cy.contains(this.bicycleData.description).should("be.visible");
    cy.contains(`$${this.bicycleData.price}`).should("be.visible");
    cy.get(`img[alt="${this.bicycleData.name}"]`).should(
      "have.attr",
      "src",
      this.bicycleData.image
    );
  });

  it("should display bicycle details correctly", function () {
    cy.contains(this.bicycleData.name).should("be.visible");
    cy.contains(this.bicycleData.description).should("be.visible");
    cy.contains(`$${this.bicycleData.price}`).should("be.visible");
    cy.get(`img[alt="${this.bicycleData.name}"]`).should(
      "have.attr",
      "src",
      this.bicycleData.image
    );
  });

  it("should allow selecting customization options", function () {
    // Select Frame Type
    cy.get("#select-Frame-Type").parent().click();
    cy.get(".react-select__menu")
      .should("be.visible")
      .contains("Full Suspension")
      .click();

    // Select Frame Finish
    cy.get("#select-Frame-Finish").parent().click();
    cy.get(".react-select__menu")
      .should("be.visible")
      .contains("Matte")
      .click();
  });

  it("should prevent selecting restricted options", function () {
    // Select Frame Type
    cy.get("#select-Frame-Type").parent().click();
    cy.get(".react-select__menu")
      .should("be.visible")
      .contains("Full Suspension")
      .click();

    // Open Frame Finish dropdown
    cy.get("#select-Frame-Finish").parent().click();

    // Ensure "Shiny" **does not exist** in the available options
    cy.get(".react-select__menu-list").should("not.contain", "Shiny");
  });

  it("should disable add to cart button until all selections are made", function () {
    cy.get(".add-to-cart").should("be.disabled");

    // Select Frame Type
    cy.get("#select-Frame-Type").parent().click();
    cy.get(".react-select__menu")
      .should("be.visible")
      .contains("Full Suspension")
      .click();

    // Select Frame Finish
    cy.get("#select-Frame-Finish").parent().click();
    cy.get(".react-select__menu")
      .should("be.visible")
      .contains("Matte")
      .click();

    // Now the button should be enabled
    cy.get(".add-to-cart").should("not.be.disabled");
  });

  it("should update quantity input correctly", function () {
    cy.get("#quantity").clear().type("3");
    cy.get("#quantity").should("have.value", "3");

    cy.get("#quantity").clear().type("-1");
    cy.get("#quantity").should("have.value", "");
  });
  it("should navigate to cart page when clicking cart icon", function () {
    cy.get(".cart-icon").should("be.visible");

    cy.get(".cart-icon").click();

    cy.url().should("include", "/cart");

    cy.wait("@getCart");

    this.cartData.items.forEach((item) => {
      cy.contains(item.bicycle.name).should("be.visible");
      cy.contains(`$${item.bicycle.price}`).should("be.visible");
      cy.get(`img[alt="${item.bicycle.name}"]`).should(
        "have.attr",
        "src",
        item.bicycle.image
      );
    });
  });
});
