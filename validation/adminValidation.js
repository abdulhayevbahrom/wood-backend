const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const adminValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      firstName: { type: "string", minLength: 2, maxLength: 50 },
      lastName: { type: "string", minLength: 2, maxLength: 50 },
      login: {
        type: "string",
        minLength: 4,
        maxLength: 20,
        pattern: "^[a-zA-Z0-9]+$",
      },
      password: { type: "string", minLength: 6, maxLength: 50 },
      role: {
        type: "string",
        minLength: 3,
        maxLength: 30,
      },
      phone: {
        type: "string",
        minLength: 13,
        maxLength: 13,
        pattern: "^\\+998[0-9]{9}$",
      },
      permissions: {
        type: "array",
        items: {
          type: "string",
        },
        uniqueItems: true,
      },

      // ✅ Yangi maydonlar:
      isOffice: {
        type: "boolean",
      },
      fixedSalary: {
        type: "number",
        minimum: 0,
      },
    },
    required: ["firstName", "lastName", "login", "password"],
    additionalProperties: false,
    errorMessage: {
      required: {
        firstName: "Ism kiritish shart",
        lastName: "Familiya kiritish shart",
        login: "Login kiritish shart",
        password: "Parol kiritish shart",
      },
      properties: {
        firstName: "Ism 2-50 ta belgi oralig‘ida bo‘lishi kerak",
        lastName: "Familiya 2-50 ta belgi oralig‘ida bo‘lishi kerak",
        login:
          "Login 4-20 ta belgi bo‘lib, faqat harf va raqamlardan iborat bo‘lishi kerak",
        password: "Parol 6-50 ta belgi oralig‘ida bo‘lishi kerak",
        role: "Lavozim 3-30 ta belgi oralig‘ida bo‘lishi kerak",
        permissions:
          "Permissions — takrorlanmagan stringlar ro‘yxati bo‘lishi kerak",
        phone:
          "Telefon raqam 13 ta belgi bo‘lib, +998901234567 formatda bo‘lishi kerak",
        isOffice: "isOffice faqat true yoki false bo‘lishi kerak",
        fixedSalary: "fixedSalary musbat raqam bo‘lishi kerak",
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

module.exports = adminValidation;
