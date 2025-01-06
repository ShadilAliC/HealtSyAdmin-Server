import Medicine from "../models/medicine.model.js";
import SaltMoleculeDb from "../models/saltMolecule.model.js";

export const createSaltMolecule = async (req, res) => {
  try {
    const { name, therapeutic_classification,status } = req.body;
    if (!name || !therapeutic_classification) {
      return res.status(400).json({
        success: false,
        message: "Name and Therapeutic Classification are required.",
      });
    }
    const newSaltMolecule = new SaltMoleculeDb({
      name,
      therapeutic_classification,
      status,
    });

    const savedSaltMolecule = await newSaltMolecule.save();
    return res.status(201).json({
      success: true,
      message: "Salt Molecule created successfully.",
      data: savedSaltMolecule,
    });
  } catch (error) {
    console.error("Error creating Salt Molecule:", error.message);

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the Salt Molecule.",
      error: error.message,
    });
  }
};

export const getSaltMolecule = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', sort = 'desc', letter = '' } = req.query;
      const query = {};
      if (letter) {
        query.$or = [
          { name: { $regex: `^${letter}`, $options: 'i' } },
        ];
      }
      
      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        if (letter) {
          query.$and = [
            { $or: [
              { name: { $regex: `^${letter}`, $options: 'i' } },
              { therapeutic_classification: { $regex: `^${letter}`, $options: 'i' } }
            ]},
            { $or: [{ name: searchRegex }, { therapeutic_classification: searchRegex }] }
          ];
        } else {
          query.$or = [{ name: searchRegex }, { therapeutic_classification: searchRegex }];
        }
      }
      const sortOption = sort === 'desc' ? -1 : 1;
      const saltMolecules = await SaltMoleculeDb.find(query)
        .sort({ createdAt: sortOption })
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      const total = await SaltMoleculeDb.countDocuments(query);
  
      return res.status(200).json({
        success: true,
        message: saltMolecules.length ? "Salt molecules retrieved successfully" : "No salt molecules found",
        data: saltMolecules,
        meta: {
          total,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching salt molecules:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error fetching salt molecules",
        error: error.message,
      });
    }
  };

  export const getSaltMoleculeById = async (req, res) => {
    const { id } = req.params; 
    try {
      const saltMolecule = await SaltMoleculeDb.findOne({_id:id});
      if (!saltMolecule) {
        return res.status(404).json({ success: false, message: "Salt molecule not found" });
      }
      res.status(200).json({ success: true, data: saltMolecule });
    } catch (err) {
      console.error("Error fetching salt molecule:", err);
      res.status(500).json({ success: false, message: err.message || "An error occurred" });
    }
  };
  
 export  const updateSaltMolecule = async (req, res) => {
    const { id } = req.params; 
    const updateData = req.body; 
    try {
      const saltMolecule = await SaltMoleculeDb.findById(id);  
      if (!saltMolecule) {
        return res.status(404).json({ success: false, message: 'Salt molecule not found' });
      }
      Object.assign(saltMolecule, updateData);
      await saltMolecule.save();
      return res.status(200).json({
        success: true,
        message: 'Salt molecule updated successfully',
        data: saltMolecule
      });
    } catch (err) {
      console.error('Error updating salt molecule:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };


  export const deleteSaltMolecule = async (req, res) => {
    try {
      const { id } = req.params; 
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required for deletion.",
        });
      }
  
      const deletedUser = await SaltMoleculeDb.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found. Unable to delete.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "User deleted successfully.",
        data: deletedUser,
      });
    } catch (error) {
      console.error("Error deleting user:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to delete user.",
        error: error.message,
      });
    }
  };
  

  export const getMedicines = async (req, res) => {
    try {
      const { sort, filterData, page = 1, limit = 10, search } = req.query;
      console.log(req.query, 'Request Query Parameters');
  
      // Handle sorting
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
        case 'low-high':
          sortObj = { 'pricing.mrp': 1 };
          break;
        case 'high-low':
          sortObj = { 'pricing.mrp': -1 };
          break;
        default:
          sortObj = { createdAt: -1 };
      }
  
      // Handle filtering
      let filterObj = {};
      if (filterData) {
        let filters;
        if (typeof filterData === 'string') {
          try {
            filters = JSON.parse(filterData);
          } catch (parseError) {
            console.error('Error parsing filterData:', parseError);
            return res.status(400).json({ message: 'Invalid filterData format' });
          }
        } else if (typeof filterData === 'object') {
          filters = filterData;
        } else {
          return res.status(400).json({ message: 'Invalid filterData format' });
        }
        console.log(filters,'oeoeoeo');
        
  
        if (Array.isArray(filters)) {
          filters.forEach((filter) => {
            switch (filter.category) {
              case 'Salt':
                filterObj.salt_molecule = filter.value;
                break;
              case 'Manufacturer':
                filterObj['manufacturer.name'] = { $regex: filter.value, $options: 'i' };
                break;
              case 'Medicine Type':
                filterObj.type = filter.value;
                break;
              case 'Variant':
                filterObj.variants =
                  filter.value === 'Variant'
                    ? { $exists: true, $ne: [] }
                    : { $exists: false };
                break;
              case 'Prescription Type':
                filterObj.prescription_type = filter.value;
                break;
              case 'Status':
                filterObj.status = filter.value ;
                break;
            }
          });
        } else {
          console.error('filterData is not an array:', filters);
          return res.status(400).json({ message: 'Invalid filterData format' });
        }
      }
  
      // Handle search
      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        const searchNumber = parseFloat(search);
  
        filterObj.$or = [
          { name: searchRegex },
          { type: searchRegex },
          { 'manufacturer.name': searchRegex },
        ];
  
        if (!isNaN(searchNumber)) {
          filterObj.$or.push({ 'pricing.mrp': searchNumber });
        }
      }
      console.log(filterObj,'slslsl');
      const checkfilter = await Medicine.find(filterObj)
      console.log(checkfilter,'checkfilter');
      
      const check = await Medicine.find()
      console.log(check,'chedk');
      
  
      // Fetch data with filtering, sorting, and pagination
      const medicines = await Medicine.find(filterObj)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      const total = await Medicine.countDocuments(filterObj);
  
      // Send response
      res.json({
        medicines,
        meta: {
          total,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching medicines:', error);
      res.status(500).json({ message: 'Error fetching medicines' });
    }
  };
  
  
  