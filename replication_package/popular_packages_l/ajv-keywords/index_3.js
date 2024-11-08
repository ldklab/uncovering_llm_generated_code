// index.js
const Ajv = require("ajv");
const addAjvKeywords = require("./addAjvKeywords");

const ajv = new Ajv();
addAjvKeywords(ajv);

const schema = {
  type: "object",
  properties: {
    kind: { type: "string" },
    timestamp: { type: "string", format: "date-time" },
  },
  required: ["kind"],
  dynamicDefaults: {
    timestamp: "datetime",
  },
  select: { $data: "0/kind" },
  selectCases: {
    foo: {
      properties: { fooProp: { type: "string" } },
      required: ["fooProp"],
    },
    bar: {
      properties: { barProp: { type: "number" } },
      required: ["barProp"],
    },
  },
  additionalProperties: false,
};

const data = {
  kind: "foo",
  fooProp: "example",
};

const validate = ajv.compile(schema);

if (validate(data)) {
  console.log("Valid data:", data);
} else {
  console.log("Validation errors:", validate.errors);
}

// addAjvKeywords.js
module.exports = function addAjvKeywords(ajv) {
  require("ajv-keywords")(ajv);
  const dynamicDefaults = require("ajv-keywords/dist/definitions/dynamicDefaults");
  ajv.addKeyword("dynamicDefaults", dynamicDefaults());
};
