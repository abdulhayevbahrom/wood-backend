const salaryHistory = require("../model/salaryHistory");
const response = require("../utils/response");

class SalaryController {
  async getSalaryHistory(req, res) {
    try {
      const history = await salaryHistory.find().populate("workerId");
      if (!history.length)
        return response.error(res, "Salary history not found");
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
