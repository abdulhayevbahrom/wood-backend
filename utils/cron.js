// const cron = require("node-cron");
// const { exec } = require("child_process");
// const path = require("path");

// // Har kuni soat 15:59 da ishlaydi
// cron.schedule("9 16 * * *", () => {
//   console.log("Cron-job ishga tushdi...");

//   const scriptPath = path.join(
//     __dirname,
//     "../controller/checkDebtsAndSendSms.js"
//   );

//   exec(`node ${scriptPath}`, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Xatolik: ${error.message}`);
//       return;
//     }
//     if (stderr) {
//       console.error(`Stderr: ${stderr}`);
//       return;
//     }
//     console.log(`Stdout: ${stdout}`);
//   });
// });

// console.log("Cron fayl ishga tushdi...");
