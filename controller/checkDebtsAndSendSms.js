// const Sales = require("../model/salesModel");
// const { sendSms } = require("../utils/sms");
// const cron = require("node-cron");
// const axios = require("axios");

// async function checkDebtsAndSendSms() {
//   try {
//     const today = new Date();
//     today.setHours(23, 59, 59, 999);

//     let one_usd = 0;

//     await axios
//       .get("https://api.exchangerate-api.com/v4/latest/USD")
//       .then((response) => {
//         one_usd = response.data.rates.UZS;
//       })
//       .catch((error) => {
//         console.error("API xatolik: ", error);
//       });

//     const debtors = await Sales.aggregate([
//       {
//         $addFields: {
//           paymentInDollar: {
//             $cond: [
//               { $eq: ["$currency", "sum"] },
//               { $divide: ["$paymentAmount", one_usd] },
//               "$paymentAmount",
//             ],
//           },
//         },
//       },
//       {
//         $match: {
//           $expr: { $lt: ["$paymentInDollar", "$totalPrice"] },
//         },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $lookup: {
//           from: "clients",
//           localField: "clientId",
//           foreignField: "_id",
//           as: "clientId",
//         },
//       },
//       {
//         $unwind: {
//           path: "$clientId",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//     ]);
//     for (let sale of debtors) {
//       const client = sale.clientId;

//       if (!client || !client.phone) {
//         console.log(`Telefon raqam topilmadi: mijoz: ${client?._id}`);
//         continue;
//       }

//       const paidInDollar =
//         sale.currency === "sum"
//           ? sale.paymentAmount / one_usd
//           : sale.paymentAmount;

//       const remainingDebtDollar = sale.totalPrice - paidInDollar;

//       const totalDebt =
//         sale.currency === "sum"
//           ? Math.round(remainingDebtDollar * one_usd)
//           : remainingDebtDollar.toFixed(2);

//       const smsMessage = `Hurmatli ${
//         client.name
//       }, sizning ${totalDebt?.toLocaleString("uz-UZ")} ${
//         sale.currency
//       } miqdorida qarzingiz mavjud. Iltimos qarzni tezroq to'lang.`;

//       await sendSms(client.phone, smsMessage);
//     }
//   } catch (error) {
//     console.error("Xatolik yuz berdi: ", error);
//   }
// }

// cron.schedule("30 5 * * *", () => {
//   checkDebtsAndSendSms();
// });

const Sales = require("../model/salesModel");
const { sendSms } = require("../utils/sms");
const cron = require("node-cron");
const axios = require("axios");

async function checkDebtsAndSendSms() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // faqat sanani solishtiramiz
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // ertangi kun

    let one_usd = 0;

    await axios
      .get("https://api.exchangerate-api.com/v4/latest/USD")
      .then((response) => {
        one_usd = response.data.rates.UZS;
      })
      .catch((error) => {
        console.error("API xatolik: ", error);
      });

    const debtors = await Sales.aggregate([
      {
        $addFields: {
          paymentInDollar: {
            $cond: [
              { $eq: ["$currency", "sum"] },
              { $divide: ["$paymentAmount", one_usd] },
              "$paymentAmount",
            ],
          },
        },
      },
      {
        $match: {
          debtDate: {
            $gte: today,
            $lt: tomorrow,
          },
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

    for (let sale of debtors) {
      const client = sale.clientId;

      if (!client || !client.phone) {
        console.log(`Telefon raqam topilmadi: mijoz: ${client?._id}`);
        continue;
      }

      const paidInDollar =
        sale.currency === "sum"
          ? sale.paymentAmount / one_usd
          : sale.paymentAmount;

      const remainingDebtDollar = sale.totalPrice - paidInDollar;

      const totalDebt =
        sale.currency === "sum"
          ? Math.round(remainingDebtDollar * one_usd)
          : remainingDebtDollar.toFixed(2);

      const smsMessage = `Hurmatli ${
        client.name
      }, sizning ${totalDebt?.toLocaleString("uz-UZ")} ${
        sale.currency
      } miqdorida qarzingiz mavjud. Iltimos qarzni tezroq to'lang.`;

      await sendSms(client.phone, smsMessage);
    }
  } catch (error) {
    console.error("Xatolik yuz berdi: ", error);
  }
}

// Har kuni 05:30 da ishga tushadi
cron.schedule("30 5 * * *", () => {
  checkDebtsAndSendSms();
});
