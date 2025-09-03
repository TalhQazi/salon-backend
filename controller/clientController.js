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
    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");

    // Check if phone number already exists
    const existingClient = await Client.findOne({
      phoneNumber: { $regex: `^${normalizedPhone}$`, $options: "i" },
    });

    if (existingClient) {
      // Add a new visit to existing client
      const visitId = `VISIT${Date.now()}`;
      const newVisit = {
        visitId,
        date: new Date(),
        services: [{ name: "Initial Visit", price: 0 }],
        totalAmount: 0,
        billNumber: `BILL${Date.now()}`,
        paymentStatus: "pending",
      };

      // Add visit to existing client
      existingClient.visits.push(newVisit);
      existingClient.totalVisits += 1;
      existingClient.totalSpent += newVisit.totalAmount;
      existingClient.lastVisit = new Date();

      await existingClient.save();

      return res.status(200).json({
        success: true,
        message:
          "Client with this phone number already exists. Visit added to existing client.",
        existingClient: {
          _id: existingClient._id,
          clientId: existingClient.clientId,
          name: existingClient.name,
          phoneNumber: existingClient.phoneNumber,
          totalVisits: existingClient.totalVisits,
          totalSpent: existingClient.totalSpent,
          lastVisit: existingClient.lastVisit,
        },
        newVisit: newVisit,
      });
    }

    // Create new client with initial visit
    const visitId = `VISIT${Date.now()}`;
    const initialVisit = {
      visitId,
      date: new Date(),
      services: [{ name: "Initial Visit", price: 0 }],
      totalAmount: 0,
      billNumber: `BILL${Date.now()}`,
      paymentStatus: "pending",
    };

    const client = new Client({
      name,
      phoneNumber: normalizedPhone,
      totalVisits: 1,
      totalSpent: 0,
      lastVisit: new Date(),
      visits: [initialVisit],
    });

    await client.save();

    res.status(201).json({
      success: true,
      message: "Client added successfully with initial visit!",
      client: {
        _id: client._id,
        clientId: client.clientId,
        name: client.name,
        phoneNumber: client.phoneNumber,
        totalVisits: client.totalVisits,
        totalSpent: client.totalSpent,
        lastVisit: client.lastVisit,
      },
      initialVisit: initialVisit,
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
      "clientId name phoneNumber totalVisits totalSpent lastVisit createdAt"
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
    }).select(
      "clientId name phoneNumber totalVisits totalSpent lastVisit createdAt"
    );

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

// Check if phone number exists (NEW FUNCTION)
exports.checkPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.query;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");

    const existingClient = await Client.findOne({
      phoneNumber: { $regex: `^${normalizedPhone}$`, $options: "i" },
    });

    if (existingClient) {
      return res.status(200).json({
        success: true,
        exists: true,
        client: {
          _id: existingClient._id,
          clientId: existingClient.clientId,
          name: existingClient.name,
          phoneNumber: existingClient.phoneNumber,
          totalVisits: existingClient.totalVisits,
          totalSpent: existingClient.totalSpent,
          lastVisit: existingClient.lastVisit,
        },
      });
    }

    res.status(200).json({
      success: true,
      exists: false,
      client: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error checking phone number",
      error: err.message,
    });
  }
};

// Get client history with visits (NEW FUNCTION)
exports.getClientHistory = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Sort visits by date (newest first)
    const sortedVisits = client.visits.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.status(200).json({
      success: true,
      client: {
        _id: client._id,
        clientId: client.clientId,
        name: client.name,
        phoneNumber: client.phoneNumber,
        totalVisits: client.totalVisits,
        totalSpent: client.totalSpent,
        lastVisit: client.lastVisit,
        visits: sortedVisits,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching client history",
      error: err.message,
    });
  }
};

// Add visit to client (NEW FUNCTION)
exports.addVisitToClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { visitData } = req.body;

    if (!clientId || !visitData) {
      return res.status(400).json({
        success: false,
        message: "Client ID and visit data are required",
      });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Generate visit ID
    const visitId = `VISIT${Date.now()}`;

    // Create new visit
    const newVisit = {
      visitId,
      date: new Date(),
      services: visitData.services || [],
      totalAmount: visitData.totalAmount || 0,
      billNumber: visitData.billNumber || `BILL${Date.now()}`,
      paymentStatus: visitData.paymentStatus || "pending",
    };

    // Add visit to client
    client.visits.push(newVisit);
    client.totalVisits += 1;
    client.totalSpent += newVisit.totalAmount;
    client.lastVisit = new Date();

    await client.save();

    res.status(200).json({
      success: true,
      message: "Visit added successfully",
      visit: newVisit,
      updatedClient: {
        totalVisits: client.totalVisits,
        totalSpent: client.totalSpent,
        lastVisit: client.lastVisit,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error adding visit",
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
