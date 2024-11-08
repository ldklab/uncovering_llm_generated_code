// index.js
const Ajv = require("ajv");
const ajvKeywords = require("ajv-keywords/dist/definitions/dynamicDefaults");

const ajv = new Ajv();
require("ajv-keywords")(ajv); // Load all keywords

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
  console.log("Invalid data:", validate.errors);
}
