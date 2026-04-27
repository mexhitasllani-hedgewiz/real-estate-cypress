describe("Dua shpi shitje", () => {
  it("passes", () => {
    cy.task("log", "dua-shpi-shitje: visiting listing page");
    cy.visit(
      "https://duashpi.al/kerko-prona?page=2&business_type=sale&city=Tirane",
    );

    cy.task("log", "dua-shpi-shitje: page loaded, handling consent button");
    cy.clickIfExists('Prano');

    const properties = [];

    cy.get('[data-event-value="listing"]').each((element, index) => {
      properties[index] = {};
      console.log(element);
      cy.wrap(element)
        .find(".details")
        .eq(0)
        .find(".title")
        .invoke("text")
        .then((text) => {
          properties[index].title = text;
        });

      cy.wrap(element)
        .invoke("attr", "href")
        .then((text) => {
          properties[index].href = text;
        });

      cy.wrap(element)
        .find(".details")
        .eq(0)
        .find(".description")
        .invoke("text")
        .then((text) => {
          properties[index].content = text;
        });

      cy.wrap(element)
        .find(".details")
        .eq(0)
        .find(".price")
        .invoke("text")
        .then((text) => {
          properties[index].price = text;
        });
    });

    cy.then(() => {
      cy.task(
        "log",
        `dua-shpi-shitje: collected ${properties.length} raw properties`,
      );
    });

    cy.task("log", "dua-shpi-shitje: starting duaShpiTask");
    cy.task("duaShpiTask", { properties });
    cy.task("log", "dua-shpi-shitje: duaShpiTask completed");
  });
});
