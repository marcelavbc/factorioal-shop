describe("Cart Page", () => {
  beforeEach(function () {
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

      cy.visit("/cart");
      cy.wait("@getCart");
    });
  });

  it("should display cart items correctly", function () {
    cy.contains("Your Cart").should("be.visible");

    this.cartData.items.forEach((item) => {
      cy.contains(item.bicycle.name).should("be.visible");
      cy.contains(`$${item.bicycle.price}`).should("be.visible");

      cy.get(`#quantity-${item._id}`).should(
        "have.value",
        item.quantity.toString()
      );

      item.options.forEach((opt) => {
        cy.contains(`${opt.category}: ${opt.value}`).should("be.visible");
      });
    });

    cy.contains(`Total: $${this.cartData.totalPrice.toFixed(2)}`).should(
      "be.visible"
    );
  });

  it("should allow updating item quantity", function () {
    const item = this.cartData.items[0];

    cy.window().then((win) => {
      expect(win.localStorage.getItem("cartId")).to.exist;
    });

    cy.intercept("PATCH", `/api/cart/${item._id}*`, {
      statusCode: 200,
      body: { ...this.cartData, items: [{ ...item, quantity: 5 }] },
    }).as("updateCartItem");

    cy.get(`#quantity-${item._id}`).clear().type("5");
    cy.get(`#quantity-${item._id}`).should("have.value", "5");

    cy.get(`#quantity-${item._id}`).siblings("button").click();

    cy.wait("@updateCartItem").its("response.statusCode").should("eq", 200);

    cy.contains("Quantity updated!").should("be.visible");
  });

  it("should allow removing an item from the cart", function () {
    const item = this.cartData.items[0];

    cy.intercept("DELETE", `/api/cart/${item._id}`, {
      statusCode: 200,
      body: { ...this.cartData, items: this.cartData.items.slice(1) },
    }).as("removeFromCart");

    cy.get(".btn-danger").contains("Remove").click();
    cy.wait("@removeFromCart");

    cy.contains("Item removed from cart!").should("be.visible");

    cy.contains(item.bicycle.name).should("not.exist");
  });

  it("should disable checkout button when cart is empty", function () {
    cy.intercept("GET", "/api/cart*", {
      statusCode: 200,
      body: { items: [], totalPrice: 0 },
    }).as("emptyCart");

    cy.visit("/cart");
    cy.wait("@emptyCart");

    cy.contains("Your cart is empty.").should("be.visible");
  });

  it("should navigate to home page when clicking 'Continue Shopping'", function () {
    cy.get("a").contains("Continue Shopping").click();
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
  });

  it("should show toast notification on clicking 'Proceed to Checkout'", function () {
    cy.get(".btn-success").contains("Proceed to Checkout").click();
    cy.contains("Checkout coming soon!").should("be.visible");
  });
});
