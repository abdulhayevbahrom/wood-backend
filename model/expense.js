const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["sum", "dollar"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    paymentType: {
      type: String,
      enum: ["Naqd", "Karta orqali"],
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("expense", expenseSchema);
module.exports = Expense;
