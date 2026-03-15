import _ from "lodash";

function formatDuaShpi({ properties }) {
  return _.map(properties, formatProperty);
}

function formatProperty(property) {
  const code = _.chain(property).get("href").split("/").get(4).value();
  const price = _.chain(property)
    .get("price")
    .replace(/\n/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .value();

  _.set(property, "price", price);
  return _.set(property, "code", code);
}

export { formatDuaShpi };
