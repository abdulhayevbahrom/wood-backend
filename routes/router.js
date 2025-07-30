const router = require("express").Router();

const dashboardController = require("../controller/dashboardController");
router.get("/dashboard", dashboardController.getDashboardData);
router.get("/dashboard/monthly-kub", dashboardController.getMonthlyKubStatistics);
router.get("/dashboard/top-clients", dashboardController.Topclients);

const adminController = require("../controller/adminController");
const adminValidation = require("../validation/adminValidation");

router.post("/admin/login", adminController.login);
router.get("/admin/all", adminController.getAdmins);
router.get("/admin/:id", adminController.getAdminById);
router.post("/admin/create", adminValidation, adminController.createAdmin);
router.put("/admin/update/:id", adminValidation, adminController.updateAdmin);
router.delete("/admin/delete/:id", adminController.deleteAdmin);

const expensesController = require("../controller/expenseController");

router.get("/expenses/all", expensesController.getAllExpenses);
router.post("/expenses/create", expensesController.createExpense);
router.post("/expenses/period", expensesController.getExpensesByPeriod);

const woodController = require("../controller/woodContoller");

router.get("/woods/all", woodController.getWoods);
router.post("/woods/create", woodController.createWood);
router.put("/woods/update/:id", woodController.updateWood);
router.delete("/woods/delete/:id", woodController.deleteWood);

// client

const clientController = require("../controller/clientsControlle");
const clientValidation = require("../validation/clientValidation");

router.get("/clients/all", clientController.getClients);
router.post("/clients/create", clientValidation, clientController.createClient);
router.put("/clients/update/:id", clientController.updateClient);
router.delete(
  "/clients/delete/:id",
  clientValidation,
  clientController.deleteClient
);

const salesController = require("../controller/salesController");

router.get("/debtors/:clientId", salesController.getDebtorByClientId);
router.put("/sales/debt-date/:saleId", salesController.updateDebtDate);
router.post("/sales/create", salesController.createSale);
router.get("/sales/all", salesController.getSales);
router.post("/sales/client/:clientId", salesController.getSalesByClientId);
router.get("/sales/debtors", salesController.getDebtors);
router.post("/sales/pay-debt", salesController.payDebt);
router.delete("/sales/return/:saleId", salesController.returnSale);

// salary history

const salaryController = require("../controller/SalaryController");
router.post("/salary/create", salaryController.createSalaryHistory);
router.get("/salary/history", salaryController.getSalaryHistory);

module.exports = router;
