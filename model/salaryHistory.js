const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    kub: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["kub", "fixed", "advance"],
      default: "kub",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("salaryHistory", schema);
