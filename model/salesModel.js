const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
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
  }, // Толщина мм
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
  sellingPrice: {
    type: Number,
    required: true,
  },
  vagonNumber: {
    type: Number,
    required: true,
  },
});

const salesSchema = new mongoose.Schema(
  {
    products: [productSchema],
    totalPrice: {
      type: Number,
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client",
    },
    paymentType: {
      type: String,
      enum: ["naqd", "karta", "bank"],
      required: true,
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["sum", "dollar"],
      required: true,
    },
    debtHistory: {
      type: [
        {
          date: {
            type: Date,
            required: true,
            default: Date.now,
          },
          amount: {
            type: Number,
            required: true,
          },
          currency: {
            type: String,
            enum: ["sum", "dollar"],
            required: true,
          },
          paymentType: {
            type: String,
            enum: ["naqd", "karta", "bank"],
            required: true,
          },
        },
      ],
      default: [],
    },
    // qarz uzish muddati
    debtDate: {
      type: Date,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const sales = mongoose.model("sales", salesSchema);

module.exports = sales;
