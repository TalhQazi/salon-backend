require("dotenv").config();
const Client = require("../models/Client");

// Add new client
exports.addClient = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required",
      });
    }
    // Check if phone number already exists
    const existingClient = await Client.findOne({ phoneNumber });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "Client with this phone number already exists",
      });
    }
    // Create new client
    const client = new Client({ name, phoneNumber });
    await client.save();
    res.status(201).json({
      success: true,
      message: "Client added successfully",
      client: {
        clientId: client.clientId,
        name: client.name,
        phoneNumber: client.phoneNumber,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error adding client",
      error: err.message,
    });
  }
};

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().select(
      "clientId name phoneNumber createdAt"
    );
    res.status(200).json({
      success: true,
      clients,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching clients",
      error: err.message,
    });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }
    const client = await Client.findById(id).select(
      "clientId name phoneNumber createdAt"
    );
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }
    res.status(200).json({
      success: true,
      client,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching client",
      error: err.message,
    });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    // Check if phone number is being updated and if it already exists
    if (updateData.phoneNumber) {
      const phoneExists = await Client.findOne({
        phoneNumber: updateData.phoneNumber,
        _id: { $ne: id },
      });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists with another client",
        });
      }
    }
    const updatedClient = await Client.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("clientId name phoneNumber");
    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating client",
      error: err.message,
    });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }
    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
      deletedClient: {
        clientId: client.clientId,
        name: client.name,
        phoneNumber: client.phoneNumber,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting client",
      error: err.message,
    });
  }
};

// Search clients (NEW FUNCTION)
exports.searchClients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Search by name or phone number
    const clients = await Client.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { phoneNumber: { $regex: query, $options: "i" } },
        { clientId: { $regex: query, $options: "i" } },
      ],
    }).select("clientId name phoneNumber createdAt");

    res.status(200).json({
      success: true,
      message: `Found ${clients.length} clients`,
      clients,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error searching clients",
      error: err.message,
    });
  }
};

// Get client statistics (NEW FUNCTION)
exports.getClientStats = async (req, res) => {
  try {
    // Total clients
    const totalClients = await Client.countDocuments();

    // Clients added this month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const clientsThisMonth = await Client.countDocuments({
      createdAt: { $gte: firstDayOfMonth },
    });

    // Clients added this week
    const firstDayOfWeek = new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay())
    );
    const clientsThisWeek = await Client.countDocuments({
      createdAt: { $gte: firstDayOfWeek },
    });

    // Recent clients (last 10)
    const recentClients = await Client.find()
      .select("clientId name phoneNumber createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly breakdown for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Client.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format monthly stats
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedMonthlyStats = months.map((month, index) => {
      const stat = monthlyStats.find((s) => s._id === index + 1);
      return {
        month,
        count: stat ? stat.count : 0,
      };
    });

    res.status(200).json({
      success: true,
      message: "Client statistics retrieved successfully",
      stats: {
        totalClients,
        clientsThisMonth,
        clientsThisWeek,
        monthlyBreakdown: formattedMonthlyStats,
        recentClients,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching client statistics",
      error: err.message,
    });
  }
};
