const Expense = require("../model/expense");
const response = require("../utils/response");
const moment = require("moment");

class ExpenseController {
  async createExpense(req, res) {
    try {
      let data = req.body;

      // 1. Xarajatni yaratish
      const newExpence = await Expense.create(data);
      if (!newExpence) {
        return response.error(res, "Xarajat qo‘shilmadi");
      }
      return response.success(res, "Xarajat qo'shildi", newExpence);
    } catch (error) {
      if (error.name === "ValidationError") {
        let xatoXabari = "Xarajatni saqlashda xatolik yuz berdi: ";
        for (let field in error.errors) {
          xatoXabari +=
            error.errors[field].kind === "enum"
              ? `${field} uchun kiritilgan qiymat noto‘g‘ri`
              : error.errors[field].message;
        }
        return response.error(res, xatoXabari);
      }
      return response.serverError(res, error.message);
    }
  }

  async getAllExpenses(req, res) {
    try {
      const expenses = await Expense.find();

      if (!expenses.length) {
        return response.notFound(res, "No expenses found");
      }

      response.success(res, "Expenses fetched successfully", expenses);
    } catch (error) {
      response.serverError(res, error.message);
    }
  }

  async getExpensesByPeriod(req, res) {
    try {
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        return response.badRequest(res, "Start date and endDate are required");
      }

      const startOfPeriod = moment(startDate, "YYYY-MM-DD")
        .startOf("day")
        .toDate();
      const endOfPeriod = moment(endDate, "YYYY-MM-DD").endOf("day").toDate();

      if (startOfPeriod > endOfPeriod) {
        return response.badRequest(res, "Start date must be before end date");
      }

      const [results, currentBalance] = await Promise.all([
        Expense.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfPeriod, $lte: endOfPeriod },
            },
          },
          {
            $facet: {
              outgoing: [
                { $match: { type: "harajat" } },
                {
                  $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    expenses: { $push: "$$ROOT" },
                  },
                },
              ],
              income: [
                { $match: { type: "Kirim" } },
                {
                  $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    expenses: { $push: "$$ROOT" },
                  },
                },
              ],
              all: [{ $sort: { date: 1 } }],
            },
          },
        ]),
        Balance.findOne(),
      ]);

      if (!results?.[0]?.all.length) {
        return response.notFound(res, "No expenses found for the given period");
      }

      moment.locale("uz");
      const formattedStartRaw = moment(startOfPeriod).format("D-MMMM");
      const formattedEndRaw = moment(endOfPeriod).format("D-MMMM");

      const uzMonthMapping = {
        январ: "Yanvar",
        феврал: "Fevral",
        март: "Mart",
        апрел: "Aprel",
        май: "May",
        июн: "Iyun",
        июл: "Iyul",
        август: "Avgust",
        сентябр: "Sentabr",
        октябр: "Oktabr",
        ноябр: "Noyabr",
        декабр: "Dekabr",
      };

      function convertToLatin(formattedDate) {
        const [day, month] = formattedDate.split("-");
        const trimmedMonth = month.trim().toLowerCase();
        const latinMonth = uzMonthMapping[trimmedMonth] || month;
        return `${day} -${latinMonth}`;
      }

      const formattedStart = convertToLatin(formattedStartRaw);
      const formattedEnd = convertToLatin(formattedEndRaw);

      const outgoingData = results[0].outgoing[0] || {
        totalAmount: 0,
        expenses: [],
      };
      const incomeData = results[0].income[0] || {
        totalAmount: 0,
        expenses: [],
      };

      const responseData = {
        period: `${formattedStart} - ${formattedEnd}`,
        allExpenses: results[0].all,
        outgoingExpenses: outgoingData.expenses,
        totalOutgoing: outgoingData.totalAmount,
        incomeExpenses: incomeData.expenses,
        totalIncome: incomeData.totalAmount,
        currentBalance: currentBalance?.balance || 0,
      };

      return response.success(
        res,
        "Expenses fetched successfully",
        responseData
      );
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }
}

module.exports = new ExpenseController();
