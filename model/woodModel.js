const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  sort: {
    type: Number,
    required: true,
  },
  woodType: {
    type: String,
    required: true,
  },
  thickness: {
    type: Number,
    required: true,
  }, // Толщина sm
  width: {
    type: Number,
    required: true,
  }, // Ширина мм
  length: {
    type: Number,
    required: true,
  }, // Длина м
  quantity: {
    type: Number,
    required: true,
  }, // Кол-во шт
  kub: {
    type: Number,
    required: false,
  }, // Объем м3 (hisoblanadi avtomatik)
  price: {
    type: Number,
    required: true,
  },
  selling_price: {
    type: Number,
    required: true,
  },
});

const woodSchema = new Schema(
  {
    vagonNumber: {
      type: String,
      required: true,
    },
    products: [productSchema],
  },
  {
    timestamps: true,
  }
);

const Wood = model("Wood", woodSchema);
module.exports = Wood;
