// index.js
const Ajv = require("ajv");
const applyKeywords = require("./ajvKeywords");

const ajv = new Ajv();
applyKeywords(ajv);

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

const validateSchema = ajv.compile(schema);

if (validateSchema(data)) {
  console.log("Valid data:", data);
} else {
  console.log("Invalid data:", validateSchema.errors);
}

// ajvKeywords.js
module.exports = function applyKeywords(ajv) {
  require("ajv-keywords")(ajv);

  const dynamicDefaults = require("ajv-keywords/dist/definitions/dynamicDefaults");
  ajv.addKeyword("dynamicDefaults", dynamicDefaults());
};
