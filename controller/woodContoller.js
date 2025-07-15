const woods = require("../model/woodModel");
const response = require("../utils/response");

class WoodController {
  async getWoods(req, res) {
    try {
      const data = await woods.find();
      if (!data.length) return response.notFound(res, "Malumotlar topilmadi");
      response.success(res, "Barcha woods", data);
    } catch (err) {
      response.serverError(res, err, err.message);
    }
  }
  async createWood(req, res) {
    try {
      const data = await woods.create(req.body);
      if (!data) return response.error(res, "Malumot qo'shilmadi");
      response.success(res, "Malumot qo'shildi", data);
    } catch (err) {
      response.serverError(res, err, err.message);
    }
  }

  async updateWood(req, res) {
    try {
      const data = await woods.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!data) return response.notFound(res, "Malumot topilmadi");
      response.success(res, "Malumot yangilandi", data);
    } catch (err) {
      response.serverError(res, err, err.message);
    }
  }

  async deleteWood(req, res) {
    try {
      const data = await woods.findByIdAndDelete(req.params.id);
      if (!data) return response.notFound(res, "Malumot topilmadi");
      response.success(res, "Malumot o'chirildi", data);
    } catch (err) {
      response.serverError(res, err, err.message);
    }
  }
}

module.exports = new WoodController();
