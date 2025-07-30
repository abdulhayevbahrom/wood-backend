const response = require("../utils/response");
const adminsDB = require("../model/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AdminController {
  // Barcha adminlarni olish (Read - All)
  async getAdmins(req, res) {
    try {
      const admins = await adminsDB.find().select("-password"); // Parolni chiqarmaslik uchun
      if (!admins.length) return response.notFound(res, "Adminlar topilmadi");
      response.success(res, "Barcha adminlar", admins);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // ID bo‘yicha bitta adminni olish (Read - Single)
  async getAdminById(req, res) {
    try {
      const admin = await adminsDB.findById(req.params.id).select("-password");
      if (!admin) return response.notFound(res, "Admin topilmadi");
      response.success(res, "Admin topildi", admin);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // Yangi admin qo‘shish (Create)
  async createAdmin(req, res) {
    try {
      let io = req.app.get("socket");
      const {
        firstName,
        lastName,
        login,
        password,
        role,
        permissions,
        phone,
        isOffice,
        fixedSalary,
      } = req.body;

      // Login takrorlanmasligini tekshirish
      const existingAdmin = await adminsDB.findOne({ login });
      if (existingAdmin) {
        return response.error(res, "Bu login allaqachon mavjud");
      }

      // Ofis hodimi emas bo‘lsa — permissions majburiy
      if (!isOffice && (!permissions || permissions.length === 0)) {
        return response.error(res, "Ruxsatlar tanlanmagan");
      }

      // Ofis hodimi bo‘lsa — fixedSalary ixtiyoriy, default 0 bo‘lishi mumkin
      const salaryValue = isOffice ? fixedSalary || 0 : 0;

      // Parolni shifrlash
      const hashedPassword = await bcrypt.hash(password, 10);

      // Adminni yaratish va saqlash
      const admin = await adminsDB.create({
        firstName,
        lastName,
        login,
        role,
        phone,
        password: hashedPassword,
        permissions: permissions || [], // ofis hodimida bo‘sh bo‘lishi mumkin
        isOffice: isOffice || false,
        fixedSalary: salaryValue,
      });

      // Parolni javobdan olib tashlash
      const adminData = admin.toJSON();
      delete adminData.password;

      // Socket orqali xabar
      io.emit("new_admin", adminData);

      // Javob
      response.created(res, "Admin qo‘shildi", adminData);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // Adminni yangilash (Update)
  async updateAdmin(req, res) {
    try {
      let io = req.app.get("socket");
      const { login, password } = req.body;

      // Login boshqa admin tomonidan ishlatilayotgan bo‘lsa tekshirish
      if (login) {
        const existingAdmin = await adminsDB.findOne({
          login,
          _id: { $ne: req.params.id },
        });
        if (existingAdmin)
          return response.error(res, "Bu login allaqachon mavjud");
      }

      const updateData = { ...req.body };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedAdmin = await adminsDB.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedAdmin)
        return response.error(res, "Admin yangilashda xatolik");

      const adminData = updatedAdmin.toJSON();
      delete adminData.password;

      io.emit("admin_updated", adminData);
      response.success(res, "Admin yangilandi", adminData);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // Adminni o‘chirish (Delete)
  async deleteAdmin(req, res) {
    try {
      let io = req.app.get("socket");
      const admin = await adminsDB.findByIdAndDelete(req.params.id);
      if (!admin) return response.error(res, "Admin o‘chirilmadi");

      const adminData = admin.toJSON();
      delete adminData.password;

      io.emit("admin_deleted", adminData);
      response.success(res, "Admin o‘chirildi");
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // Admin kirishi (Login)
  async login(req, res) {
    try {
      const { login, password } = req.body;
      const admin = await adminsDB.findOne({ login });
      if (!admin) return response.error(res, "Login yoki parol xato");

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return response.error(res, "Login yoki parol xato");

      const token = jwt.sign(
        { id: admin._id, login: admin.login },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );

      const adminData = admin.toJSON();
      delete adminData.password;

      response.success(res, "Kirish muvaffaqiyatli", {
        admin: adminData,
        token,
      });
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }
}

module.exports = new AdminController();
