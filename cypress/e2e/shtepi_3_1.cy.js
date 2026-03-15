describe.skip("template spec", () => {
  it("passes", () => {
    cy.visit("https://www.realestate.al/sq/apartament-3+1-ne-shitje-ne-Tirane");

    const properties = [];

    cy.get(".property-container").each((element, index) => {
      properties[index] = {};

      cy.wrap(element)
        .find(".property-title")
        .invoke("text")
        .then((text) => {
          properties[index].title = text;
        });

      cy.wrap(element)
        .find(".property-title a")
        .invoke("attr", "href")
        .then((text) => {
          properties[index].href = `https://www.realestate.al/${text}`;
        });

      cy.wrap(element)
        .find(".property-content")
        .invoke("text")
        .then((text) => {
          properties[index].content = text;
        });

      cy.wrap(element)
        .find(".price")
        .invoke("text")
        .then((text) => {
          properties[index].price = text;
        });

      cy.wrap(element)
        .find(".price")
        .invoke("text")
        .then((text) => {
          properties[index].price = text;
        });
    });

    cy.task("main", { properties });
  });
});
