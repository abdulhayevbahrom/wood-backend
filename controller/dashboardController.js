const Sales = require("../model/salesModel");
const Expenses = require("../model/expense");
const response = require("../utils/response");
const moment = require("moment");

class DashboardController {
  async getDashboardData(req, res) {
    try {
      const { from, to, usd } = req.query;
      let oneUsd = parseFloat(usd) || 12638.87;

      const startDate = from
        ? moment(from).startOf("day").toDate()
        : moment().startOf("month").toDate();

      const endDate = to
        ? moment(to).endOf("day").toDate()
        : moment().endOf("month").toDate();

      const totalSalesAgg = await Sales.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$currency",
            total: { $sum: "$totalPrice" },
          },
        },
      ]);

      const totalExpensesAgg = await Expenses.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$currency", // "dollar" yoki "sum"
            total: { $sum: "$amount" },
          },
        },
      ]);

      const debtors = await Sales.aggregate([
        {
          $addFields: {
            paymentInDollar: {
              $cond: [
                { $eq: ["$currency", "sum"] },
                { $divide: ["$paymentAmount", oneUsd] },
                "$paymentAmount",
              ],
            },
          },
        },
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            $expr: { $lt: ["$paymentInDollar", "$totalPrice"] },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $lookup: {
            from: "clients",
            localField: "clientId",
            foreignField: "_id",
            as: "clientId",
          },
        },
        {
          $unwind: {
            path: "$clientId",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      let debt = {
        usd: debtors
          ?.filter((d) => d.currency === "dollar")
          ?.reduce((a, b) => a + (b.totalPrice - b.paymentInDollar), 0),
        sum: debtors
          ?.filter((d) => d.currency === "sum")
          ?.reduce(
            (a, b) => a + (b.totalPrice - b.paymentInDollar) * oneUsd,
            0
          ),
      };

      response.success(res, "Dashboard ma'lumotlari", {
        totalSalesAgg,
        totalExpensesAgg,
        debt,
      });
    } catch (error) {
      console.error(error);
      response.serverError(res, error, error.message);
    }
  }
}

module.exports = new DashboardController();
