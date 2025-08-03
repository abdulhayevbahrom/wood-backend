const salaryHistory = require("../model/salaryHistory");
const response = require("../utils/response");

class SalaryController {
  // async getSalaryHistory(req, res) {
  //   try {
  //     const history = await salaryHistory.find().populate("workerId");
  //     if (!history.length)
  //       return response.error(res, "Salary history not found");
  //     return response.success(res, "Salary history", history);
  //   } catch (err) {
  //     return response.error(res, 500, err.message);
  //   }
  // }

  async getSalaryHistory(req, res) {
    try {
      const { from, to } = req.query;

      let startDate, endDate;

      if (from && to) {
        // Foydalanuvchi sanalari
        startDate = new Date(from);
        endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999); // to sananing oxirigacha
      } else {
        // Joriy oyning boshidan oxirigacha
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      const history = await salaryHistory
        .find({ createdAt: { $gte: startDate, $lte: endDate } })
        .populate("workerId");

      // if (!history.length) {
      //   return response.error(res, "Salary history not found", []);
      // }

      return response.success(res, "Salary history", history);
    } catch (err) {
      return response.error(res, 500, err.message);
    }
  }

  async createSalaryHistory(req, res) {
    try {
      const history = await salaryHistory.create(req.body);
      return response.success(res, 200, history);
    } catch (err) {
      return response.error(res, 500, err.message);
    }
  }
}

module.exports = new SalaryController();
