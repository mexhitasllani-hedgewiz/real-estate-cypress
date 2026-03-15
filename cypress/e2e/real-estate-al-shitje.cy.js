describe.skip("template spec", () => {
  it("passes", () => {
    cy.visit(
      "https://www.realestate.al/sq/search?city=Tirana&propertyType=apartment&saleStatus=sale&organizimi=undefined&cmimi=undefined&shperndarja-villa=undefined&cmimi-villa=0-1000&siperfaqeZyra=undefined&cmimiZyra=undefined&siperfaqe-toka=undefined&cmimi-toka=all&siperfaqe-mag=undefined&cmimi-mag=0-500&siperfaqe-store=undefined&cmimi-store=0-500&statesearch=closed",
    );

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
