markdown
// index.js
const Ajv = require("ajv");
const addKeywords = require("./ajvKeywords");

const ajv = new Ajv();
addKeywords(ajv);

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

// ajvKeywords.js
module.exports = function addKeywords(ajv) {
  // Load all keywords
  require("ajv-keywords")(ajv);

  // Optionally: Load specific keywords
  // require("ajv-keywords")(ajv, ["transform", "uniqueItemProperties"]);

  // Dynamic defaults, you can add custom functions (not shown here)
  const dynamicDefaults = require("ajv-keywords/dist/definitions/dynamicDefaults");
  ajv.addKeyword("dynamicDefaults", dynamicDefaults());
};
