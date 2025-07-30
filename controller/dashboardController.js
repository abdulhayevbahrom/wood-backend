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

  async getMonthlyKubStatistics(req, res) {
    try {
      let { from, to } = req.query;

      const start = new Date(from);
      const end = new Date(new Date(to).getTime() + 86400000); // 1 kun keyin
      // 1. Sotilgan kunlar uchun totalKub qiymatlarini olish
      const salesData = await Sales.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lt: end },
          },
        },
        {
          $project: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            products: 1,
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$date",
            totalKub: { $sum: "$products.kub" },
          },
        },
      ]);

      // 2. Sana bo‘yicha to‘liq ro‘yxat yaratish (har kun uchun)
      const dayCount = Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      const result = [];

      for (let i = 0; i < dayCount; i++) {
        const day = new Date(start.getTime() + i * 86400000);
        const dateStr = day.toISOString().slice(0, 10); // yyyy-mm-dd

        const matched = salesData.find((d) => d._id === dateStr);
        result.push({
          date: dateStr,
          totalKub: matched ? matched.totalKub : 0,
        });
      }

      res.json({ success: true, data: result });
    } catch (err) {
      console.error("Kub statistikasi xatolik:", err);
      res.status(500).json({ success: false, message: "Server xatolik" });
    }
  }

  async Topclients(req, res) {
    try {
      const topClients = await Sales.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$clientId",
            saleCount: { $sum: 1 },
            totalKub: { $sum: "$products.kub" },
          },
        },
        {
          $sort: {
            saleCount: -1,
            totalKub: -1,
          },
        },
        { $limit: 10 }, // Faqat top 10 mijoz
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: "$client" },
        {
          $project: {
            _id: 0,
            clientId: "$_id",
            name: "$client.name",
            phone: "$client.phone",
            saleCount: 1,
            totalKub: 1,
          },
        },
      ]);

      response.success(res, "Top clients", topClients);
    } catch (error) {
      response.serverError(res, error, error.message);
    }
  }
}

module.exports = new DashboardController();
