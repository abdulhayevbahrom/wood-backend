const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const clientValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 50 },
      phone: {
        type: "string",
        minLength: 13,
        maxLength: 13,
        pattern: "^\\+998[0-9]{9}$",
      },
      address: {
        type: "string",
      },
    },
    required: ["name", "phone", "address"],
    additionalProperties: false,
    errorMessage: {
      required: {
        name: "Ism kiritish shart",
        phone: "Telefon kiritish shart",
        address: "Manzil kiritish shart",
      },
      properties: {
        name: "Ism 2-50 ta belgi oralig‘ida bo‘lishi kerak",
        phone: "Telefon 13 ta belgi bo‘lishi kerak",
        address: "Manzil kiritish shart",
      },
      additionalProperties: "Ruxsat etilmagan maydon kiritildi",
    },
  };

  const validate = ajv.compile(schema);
  const result = validate(req.body);
  if (!result) {
    let errorField =
      validate.errors[0].instancePath.replace("/", "") || "Umumiy";
    let errorMessage = validate.errors[0].message;
    return response.error(res, `${errorField} xato: ${errorMessage}`);
  }
  next();
};

module.exports = clientValidation;
