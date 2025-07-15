const sales = require("../model/salesModel");
const response = require("../utils/response");
const moment = require("moment-timezone");
const Woods = require("../model/woodModel");

class SalesController {
  async createSale(req, res) {
    try {
      let { products } = req.body;

      // Har bir mahsulot uchun miqdorni tekshirish va kamaytirish
      for (const item of products) {
        const wood = await Woods.findOne({
          vagonNumber: item.vagonNumber,
        });
        if (!wood) {
          return response.error(
            res,
            `Vagon raqami ${item.vagonNumber} topilmadi`
          );
        }

        // Mahsulotni topish
        const product = wood.products.find(
          (p) => p._id.toString() === item._id
        );

        if (!product) {
          return response.error(res, `Mahsulot topilmadi`);
        }
        // Miqdorni kamaytirish
        product.quantity -= item.quantity;

        // Kubni qayta hisoblash: (sm → m) × (sm → m) × (m) × (dona)
        const unitVolume =
          (product.thickness / 100) * (product.width / 100) * product.length;
        product.kub = parseFloat((unitVolume * product.quantity).toFixed(3));

        await wood.save();
      }

      const data = await sales.create(req.body);

      if (!data) return response.error(res, "Malumot qo'shilmadi");
      response.success(res, "Malumot qo'shildi", data);
    } catch (err) {
      console.log(err);
      response.serverError(res, err, err.message);
    }
  }

  async getSales(req, res) {
    try {
      const { from, to } = req.query;

      let query = {};

      if (from && to) {
        // Mahalliy vaqtni UTC ga aylantiramiz
        const fromDate = moment
          .tz(from, "YYYY-MM-DD", "Asia/Tashkent")
          .startOf("day")
          .toDate();
        const toDate = moment(to).endOf("day").utcOffset(5).toDate();
        query.createdAt = {
          $gte: fromDate,
          $lte: toDate,
        };
      }

      const data = await sales.find(query).populate("clientId");

      // if (!data.length)
      //   return response.notFound(res, "Ma'lumotlar topilmadi", []);
      response.success(res, "Sotuvlar ro'yxati", data);
    } catch (err) {
      response.serverError(res, err, err.message);
    }
  }

  async getSalesByClientId(req, res) {
    try {
      const { clientId } = req.params;
      const data = await sales.find({ clientId }).populate("clientId");
      if (!data.length) return response.notFound(res, "Malumotlar topilmadi");
      response.success(res, "Barcha malumotlar", data);
    } catch (err) {
      response.serverError(res, err, err.message);
    }
  }

  async getDebtors(req, res) {
    try {
      const oneUsd = +req.query.usd;
      if (!oneUsd || oneUsd <= 0) {
        return response.error(res, "USD kursi noto'g'ri kiritilgan");
      }

      const debtors = await sales.aggregate([
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

      response.success(res, "Qarzdorlar ro'yxati", debtors);
    } catch (error) {
      response.serverError(res, error.message, error);
    }
  }

  async payDebt(req, res) {
    try {
      const { saleId, amount, currency, paymentType } = req.body;

      if (!saleId || !amount || !currency || !paymentType) {
        return response.error(res, "Barcha maydonlar to'ldirilishi kerak");
      }

      const sale = await sales.findById(saleId);
      if (!sale) {
        return response.notFound(res, "Qarzdor malumotlari topilmadi");
      }

      sale.paymentAmount += amount;
      sale.debtHistory.push({
        amount,
        currency,
        paymentType,
        date: new Date(),
      });

      await sale.save();
      response.success(res, "To'lov muvaffaqiyatli amalga oshirildi");
    } catch (err) {
      response.serverError(res, err, err.message);
    }
  }

  async returnSale(req, res) {
    try {
      const { saleId } = req.params;

      const sale = await sales.findById(saleId);
      if (!sale) {
        return response.error(res, "Sotuv topilmadi");
      }

      for (const item of sale.products) {
        const wood = await Woods.findOne({ vagonNumber: item.vagonNumber });

        if (!wood) {
          return response.error(
            res,
            `Vagon raqami ${item.vagonNumber} topilmadi`
          );
        }

        const product = wood.products.find(
          (p) => p._id.toString() === item._id.toString()
        );

        if (!product) {
          return response.error(res, `Mahsulot topilmadi`);
        }

        // Miqdorni orttirish
        product.quantity += item.quantity;

        // 2) Kubni qayta‐hisoblash
        const unitVolume =
          (product.thickness / 100) * (product.width / 100) * product.length;
        product.kub = parseFloat((unitVolume * product.quantity).toFixed(3));

        await wood.save();
      }

      // Sotuvni o‘chirib yuborish (yoki flag bilan belgilash)
      await sales.findByIdAndDelete(saleId);

      response.success(
        res,
        "Sotuv bekor qilindi va ombordagi mahsulot tiklandi"
      );
    } catch (err) {
      console.log(err);
      response.serverError(res, err, err.message);
    }
  }
}

module.exports = new SalesController();
