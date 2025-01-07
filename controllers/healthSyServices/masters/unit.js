import UnitDb from "../../../models/unit.model.js";

export const createUnit = async (req, res) => {
  try {
    const { unit, status } = req.body;
    if (!unit) {
      return res.status(400).json({
        success: false,
        message: "unit Field required.",
      });
    }
    const newUnit = new UnitDb({
      unit,
      status,
    });

    const savedUnit = await newUnit.save();
    return res.status(201).json({
      success: true,
      message: "Unit created successfully.",
      data: savedUnit,
    });
  } catch (error) {
    console.error("Error creating Unit:", error.message);

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the Unit.",
      error: error.message,
    });
  }
};

export const getUnit = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort } = req.query;

    const query = {};
    let sortObj = {};

    switch (sort) {
      case "Newest":
        sortObj = { createdAt: -1 };
        break;
      case "Oldest":
        sortObj = { createdAt: 1 };
        break;
      case "a-z":
        sortObj = { unit: 1 };
        break;
      case "z-a":
        sortObj = { unit: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [{ unit: searchRegex }];
    }

    const Unit = await UnitDb.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await UnitDb.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: Unit.length ? "Unit retrieved successfully" : "No Unit found",
      data: Unit,
      meta: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching Unit:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching Unit",
      error: error.message,
    });
  }
};
export const getUnitById = async (req, res) => {
  const { id } = req.params;
  try {
    const Unit = await UnitDb.findOne({ _id: id });
    if (!Unit) {
      return res
        .status(404)
        .json({ success: false, message: "Unit not found" });
    }
    res.status(200).json({ success: true, data: Unit });
  } catch (err) {
    console.error("Error fetching Unit:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "An error occurred" });
  }
};

export const updateUnit = async (req, res) => {
  const { id } = req.params;
  console.log(id, "oeoeo");

  const updateData = req.body;
  try {
    const Unit = await UnitDb.findById(id);
    if (!Unit) {
      return res
        .status(404)
        .json({ success: false, message: "Unit not found" });
    }
    Object.assign(Unit, updateData);
    await Unit.save();
    return res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      data: Unit,
    });
  } catch (err) {
    console.error("Error updating Unit:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Unit ID is required for deletion.",
      });
    }
    const deletedUnit = await UnitDb.findByIdAndDelete(id);
    if (!deletedUnit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found. Unable to delete.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Unit deleted successfully.",
      data: deletedUnit,
    });
  } catch (error) {
    console.error("Error deleting Unit:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Unit.",
      error: error.message,
    });
  }
};
