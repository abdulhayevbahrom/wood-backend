const axios = require("axios");
async function sendSms(phone, message) {
  try {
    let data = {
      send: "",
      number: phone?.replace("+998", ""),
      text: message,
      token: process.env.SMS_TOKEN || "",
      id: 5855,
      user_id: 6228251282,
    };

    const response = await axios.post(
      "https://api.xssh.uz/smsv1/?data=" +
        encodeURIComponent(JSON.stringify(data))
    );
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sendSms };
