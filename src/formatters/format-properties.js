import _ from "lodash";

function formatProperties({ properties }) {
  return _.map(properties, formatProperty);
}

function formatProperty(property) {
  const code = _.chain(property).get("href").split(".").last().value();

  return _.set(property, "code", code);
}

export { formatProperties };
