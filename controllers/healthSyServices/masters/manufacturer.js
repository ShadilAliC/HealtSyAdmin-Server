import ManufacturerDb from "../../../models/manufacturer.model.js";
export const createManufacturer = async (req, res) => {
  try {
    const {
      name,
      manufacturer_address,
      country_origin,
      customer_email,
      status,
    } = req.body;
    if (!name || !manufacturer_address || !country_origin || !customer_email) {
      return res.status(400).json({
        success: false,
        message: "All Field are required.",
      });
    }
    const newManufacturer = new ManufacturerDb({
      name,
      manufacturer_address,
      country_origin,
      customer_email,
      status,
    });

    const savedManufacturer = await newManufacturer.save();
    return res.status(201).json({
      success: true,
      message: "Manufacturer created successfully.",
      data: savedManufacturer,
    });
  } catch (error) {
    console.error("Error creating Manufacturer:", error.message);

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the Manufacturer.",
      error: error.message,
    });
  }
};

export const getManufacturer = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', sort } = req.query;
      const query = {};
      let sortObj = {};
      switch (sort) {
        case 'Newest':
          sortObj = { createdAt: -1 };
          break;
        case 'Oldest':
          sortObj = { createdAt: 1 };
          break;
        case 'a-z':
          sortObj = { name: 1 };
          break;
        case 'z-a':
          sortObj = { name: -1 };
          break;
        default:
          sortObj = { createdAt: -1 }; 
      }
      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
          { name: searchRegex },
          { manufacturer_address: searchRegex },
        ];
      }
  
      const manufacturers = await ManufacturerDb.find(query)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      const total = await ManufacturerDb.countDocuments(query);
  
      return res.status(200).json({
        success: true,
        message: manufacturers.length
          ? "Manufacturers retrieved successfully"
          : "No manufacturers found",
        data: manufacturers,
        meta: {
          total,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching manufacturers:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error fetching manufacturers",
        error: error.message,
      });
    }
  };
  export const getManufacturerById = async (req, res) => {
    const { id } = req.params; 
    try {
      const Manufacturer = await ManufacturerDb.findOne({_id:id});
      if (!Manufacturer) {
        return res.status(404).json({ success: false, message: "Manufacturer not found" });
      }
      res.status(200).json({ success: true, data: Manufacturer });
    } catch (err) {
      console.error("Error fetching Manufacturer:", err);
      res.status(500).json({ success: false, message: err.message || "An error occurred" });
    }
  };
  
  export const updateManufacturer = async (req, res) => {
    const { id } = req.params; 
    console.log(id,'oeoeo');
    
    const updateData = req.body; 
    try {
        const Manufacturer = await ManufacturerDb.findById(id);
      if (!Manufacturer) {
        return res.status(404).json({ success: false, message: 'Manufacturer not found' });
      }
      Object.assign(Manufacturer, updateData);
      await Manufacturer.save();
      return res.status(200).json({
        success: true,
        message: 'Manufacturer updated successfully',
        data: Manufacturer
      });
    } catch (err) {
      console.error('Error updating Manufacturer:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  export const deleteManufacturer = async (req, res) => {
    try {
      const { id } = req.params; 
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Manufacturer ID is required for deletion.",
        });
      }
      const deletedManufacturer = await ManufacturerDb.findByIdAndDelete(id);
      if (!deletedManufacturer) {
        return res.status(404).json({
          success: false,
          message: "Manufacturer not found. Unable to delete.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Manufacturer deleted successfully.",
        data: deletedManufacturer,
      });
    } catch (error) {
      console.error("Error deleting Manufacturer:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to delete Manufacturer.",
        error: error.message,
      });
    }
  };

