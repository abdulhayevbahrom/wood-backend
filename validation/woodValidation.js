const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const woodValidation = (req, res, next) => {
  const woodAjvSchema = {
    type: "object",
    required: ["vagonNumber", "products"],
    properties: {
      vagonNumber: { type: "number" },
      products: {
        type: "array",
        items: {
          type: "object",
          required: [
            "sort",
            "woodType",
            "thickness",
            "width",
            "length",
            "quantity",
            "price",
          ],
          properties: {
            sort: { type: "number" },
            woodType: { type: "string" },
            thickness: { type: "number", minimum: 1 },
            width: { type: "number", minimum: 1 },
            length: { type: "number", minimum: 0.1 },
            quantity: { type: "number", minimum: 1 },
            price: { type: "number", minimum: 1 },
            sellingPrice: { type: "number" },
            // kub kiritilmaydi, avtomatik hisoblanadi
          },
          additionalProperties: false,
        },
        minItems: 1,
      },
    },
    additionalProperties: false,
    errorMessage: {
      required: {
        vagonNumber: "Vagon raqami kiritish shart",
        products: "Mahsulotlar kiritish shart",
      },
      properties: {
        vagonNumber: "Vagon raqami son bo‘lishi kerak",
        products: "Mahsulotlar to‘g‘ri kiritilmagan",
      },
    },
  };

  const validate = ajv.compile(woodAjvSchema);
  const result = validate(req.body);
  if (!result) {
    let errorField =
      validate.errors[0].instancePath.replace("/", "") || "Umumiy";
    let errorMessage = validate.errors[0].message;
    return response.error(res, `${errorField} xato: ${errorMessage}`);
  }
  next();
};

module.exports = woodValidation;
