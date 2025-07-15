const client = require("../model/clients");
const response = require("../utils/response");

class ClientsController {
  async createClient(req, res) {
    try {
      let newClient = await client.create(req.body);
      if (!newClient) {
        return response.error(res, "klent qo'shilmadi", null);
      }
      return response.success(res, "Klent qo'shildi", newClient);
    } catch (error) {
      return response.serverError(res, error.message, error);
    }
  }

  //   get
  async getClients(req, res) {
    try {
      const clients = await client.find();
      if (!clients.length) {
        return response.notFound(res, "Klentlar topilmadi");
      }
      return response.success(res, "Barcha klentlar", clients);
    } catch (error) {
      return response.serverError(res, error.message, error);
    }
  }

  async deleteClient(req, res) {
    try {
      const deletedClient = await client.findByIdAndDelete(req.params.id);
      if (!deletedClient) {
        return response.notFound(res, "Klent topilmadi");
      }
      return response.success(res, "Klent o'chirildi", deletedClient);
    } catch (error) {
      return response.serverError(res, error.message, error);
    }
  }

  async updateClient(req, res) {
    try {
      const updatedClient = await client.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedClient) {
        return response.notFound(res, "Klent topilmadi");
      }
      return response.success(res, "Klent yangilandi", updatedClient);
    } catch (error) {
      return response.serverError(res, error.message, error);
    }
  }
}

module.exports = new ClientsController();
