import productTypeDb from "../../../models/productType.model.js";
export const createProductType = async (req, res) => {
  try {
    const {
     name,
     status
    } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product Type Name Field required.",
      });
    }
    const newProductType = new productTypeDb({
     name,
     status
    });

    const savedProductType = await newProductType.save();
    return res.status(201).json({
      success: true,
      message: "ProductType created successfully.",
      data: savedProductType,
    });
  } catch (error) {
    console.error("Error creating ProductType:", error.message);

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the ProductType.",
      error: error.message,
    });
  }
};

export const getProductType = async (req, res) => {
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
        ];
      }
  
      const ProductType = await productTypeDb.find(query)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      const total = await productTypeDb.countDocuments(query);
  
      return res.status(200).json({
        success: true,
        message: ProductType.length
          ? "ProductType retrieved successfully"
          : "No ProductType found",
        data: ProductType,
        meta: {
          total,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching ProductType:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error fetching ProductType",
        error: error.message,
      });
    }
  };
  export const getProductTypeById = async (req, res) => {
    const { id } = req.params; 
    try {
      const ProductType = await productTypeDb.findOne({_id:id});
      if (!ProductType) {
        return res.status(404).json({ success: false, message: "ProductType not found" });
      }
      res.status(200).json({ success: true, data: ProductType });
    } catch (err) {
      console.error("Error fetching ProductType:", err);
      res.status(500).json({ success: false, message: err.message || "An error occurred" });
    }
  };
  
  export const updateProductType = async (req, res) => {
    const { id } = req.params; 
    const updateData = req.body; 
    try {
        const ProductType = await productTypeDb.findById(id);
      if (!ProductType) {
        return res.status(404).json({ success: false, message: 'ProductType not found' });
      }
      Object.assign(ProductType, updateData);
      await ProductType.save();
      return res.status(200).json({
        success: true,
        message: 'ProductType updated successfully',
        data: ProductType
      });
    } catch (err) {
      console.error('Error updating ProductType:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  export const deleteProductType = async (req, res) => {
    try {
      const { id } = req.params; 
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ProductType ID is required for deletion.",
        });
      }
      const deletedProductType = await productTypeDb.findByIdAndDelete(id);
      if (!deletedProductType) {
        return res.status(404).json({
          success: false,
          message: "ProductType not found. Unable to delete.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "ProductType deleted successfully.",
        data: deletedProductType,
      });
    } catch (error) {
      console.error("Error deleting ProductType:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to delete ProductType.",
        error: error.message,
      });
    }
  };

