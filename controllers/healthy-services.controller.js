import Medicine from "../models/medicine.model.js";
export const getMedicines = async (req, res) => {
  try {
    console.log(req.query,'dldld');
    
    const { sort, filterData, page = 1, limit = 10, search } = req.query;
    let sortObj = {};
    switch (sort) {
      case "Newest":
        sortObj = { createdAt: -1 };
        break;
      case "Oldest":
        sortObj = { createdAt: 1 };
        break;
      case "a-z":
        sortObj = { name: 1 };
        break;
      case "z-a":
        sortObj = { name: -1 };
        break;
      case "low-high":
        sortObj = { "pricing.mrp": 1 };
        break;
      case "high-low":
        sortObj = { "pricing.mrp": -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }
    let filterObj = {};
    if (filterData) {
      let filters;
      if (typeof filterData === "string") {
        try {
          filters = JSON.parse(filterData);
        } catch (parseError) {
          console.error("Error parsing filterData:", parseError);
          return res.status(400).json({ message: "Invalid filterData format" });
        }
      } else if (typeof filterData === "object") {
        filters = filterData;
      } else {
        return res.status(400).json({ message: "Invalid filterData format" });
      }
      console.log(filters, "oeoeoeo");

      if (Array.isArray(filters)) {
        filters.forEach((filter) => {
          switch (filter.category) {
            case "Salt":
              filterObj["molecule_details.salt_molecule"] = {
                $regex: filter.value,
                $options: "i",
              };
              break;
            case "Manufacturer":
              filterObj["manufacturer.name"] = {
                $regex: filter.value,
                $options: "i",
              };
              break;
            case "Medicine Type":
              filterObj.type = filter.value;
              break;
            case "Variant":
              filterObj.variants =
                filter.value === "Variant"
                  ? { $exists: true, $ne: [] }
                  : { $exists: false };
              break;
            case "Prescription Type":
              filterObj.prescription_type = filter.value;
              break;
            case "Status":
              filterObj.status = filter.value;
              break;
          }
        });
      } else {
        console.error("filterData is not an array:", filters);
        return res.status(400).json({ message: "Invalid filterData format" });
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchNumber = parseFloat(search);

      filterObj.$or = [
        { name: searchRegex },
        { type: searchRegex },
        { "manufacturer.name": searchRegex },
      ];

      if (!isNaN(searchNumber)) {
        filterObj.$or.push({ "pricing.mrp": searchNumber });
      }
    }
    const medicines = await Medicine.find(filterObj)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Medicine.countDocuments(filterObj);
    res.json({
      medicines,
      meta: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ message: "Error fetching medicines" });
  }
};

export const createMedicines = async (req, res) => {
  try {
    console.log(req.body,'lslsl');
    
    const {
      medicineName,
      packageDescription,
      medicineType,
      stock,
      prescription_type,
      status,
      manufacturer,
      salt_molecule,
      therapeutic_classification,
      therapeutic_uses,
      images,
      description,
      mrp_per_unit,
      author_details,
      warning_and_precaution,
      direction_and_uses,
      side_effects,
      storage_disposal,
      dosage,
      reference,
      faqs,
      mrp,
      discount,
      quantity,
      variants,
      unit,
      return_policy,
      open_box
    } = req.body;
    const validatedVariants = variants.map((variant) => {
      const formattedImages = Array.isArray(variant.images)
        ? variant.images.map((url) => ({ url }))
        : [{ url: variant.images }];

      return {
        ...variant,
        images: formattedImages,
        unit: variant.unit?.value || variant.unit, // Normalize unit
      };
    });

    // Validate images
    // const formattedImages = images.map((url) => ({
    //   url,
    // }));

    const newMedicine = new Medicine({
      name: medicineName,
      package_description: packageDescription,
      type: medicineType,
      stock: stock,
      prescription_type: prescription_type,
      status: status,
      manufacturer: {
        name: manufacturer.label,
        address: manufacturer.data.manufacturer_address,
        country: manufacturer.data.country_origin,
        customer_care_email: manufacturer.data.customer_email,
      },
      pricing: {
        mrp: mrp,
        discount: discount,
        quantity: quantity,
        mrp_per_unit:mrp_per_unit,
        unit: unit.label,
        return_policy: {
          returnable: return_policy,
          open_box: open_box,
        },
      },
      molecule_details: {
        salt_molecule: salt_molecule.label,
        therapeutic_classification: therapeutic_classification,
        therapeutic_uses: therapeutic_uses,
      },
      variants:validatedVariants,
      faq: {
        faq_description: description,
        author_details: author_details,
        warning_and_precaution: warning_and_precaution,
        direction_uses: direction_and_uses,
        side_effect: side_effects,
        storage_disposal: storage_disposal,
        dosage: dosage,
        reference: reference,
        question_answers: faqs,
      },
      images: images.map(image => ({
        url: image, 
      })),
    });

    const ress=await newMedicine.save();
    console.log(ress,'-3-3');
    

    return res.status(201).json({
      message: 'Medicine created successfully!',
      data: newMedicine,
      success:true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Error occurred while creating the medicine.',
      error: err.message,
    });
  }
};
export const getMedicinesById = async (req, res) => {
  const { id } = req.params; 
  try {
    const MedicineData = await Medicine.findOne({_id:id});
    if (!MedicineData) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }
    res.status(200).json({ success: true, data: MedicineData });
  } catch (err) {
    console.error("Error fetching Medicine:", err);
    res.status(500).json({ success: false, message: err.message || "An error occurred" });
  }
};
export const updateMedicine = async (req, res) => {
  try {
    console.log(req.body,'ldldld');
    
    const { id } = req.params; // Extract the ID from the URL parameters
    const {
      medicineName,
      packageDescription,
      medicineType,
      stock,
      prescription_type,
      status,
      manufacturer,
      salt_molecule,
      therapeutic_classification,
      therapeutic_uses,
      images,
      description,
      mrp_per_unit,
      author_details,
      warning_and_precaution,
      direction_and_uses,
      side_effects,
      storage_disposal,
      dosage,
      reference,
      faqs,
      mrp,
      discount,
      quantity,
      unit,
      return_policy,
      open_box
    } = req.body;
    const unitValue = unit?.label || unit;
    const salt_moleculeValue = salt_molecule?.label;

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      id, 
      {
        name: medicineName,
        package_description: packageDescription,
        type: medicineType,
        stock: stock,
        prescription_type: prescription_type,
        status: status,
        manufacturer: {
          name: manufacturer.label,
          address: manufacturer.address,
          country: manufacturer.country,
          customer_care_email: manufacturer.customer_care_email,
        },
        pricing: {
          mrp: mrp,
          discount: discount,
          quantity: quantity,
          mrp_per_unit: mrp_per_unit,
          unit: unitValue,
          return_policy: {
            returnable: return_policy,
            open_box: open_box,
          },
        },
        molecule_details: {
          salt_molecule: salt_moleculeValue,
          therapeutic_classification: therapeutic_classification,
          therapeutic_uses: therapeutic_uses,
        },
        faq: {
          faq_description: description,
          author_details: author_details,
          warning_and_precaution: warning_and_precaution,
          direction_uses: direction_and_uses,
          side_effect: side_effects,
          storage_disposal: storage_disposal,
          dosage: dosage,
          reference: reference,
          question_answers: faqs,
        },
        images: images.map(image => ({
          url: image.url, 
        })),
      },
      { new: true } 
    );

    if (!updatedMedicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.status(200).json({ message: "Medicine updated successfully", updatedMedicine,success:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating medicine", error: err.message });
  }
};
export const deleteMedicines = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required for deletion.",
      });
    }
    const deletedMedicine = await Medicine.findByIdAndDelete(id);
    if (!deletedMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found. Unable to delete.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Medicine deleted successfully.",
      data: deletedMedicine,
    });
  } catch (error) {
    console.error("Error deleting Medicine:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Medicine.",
      error: error.message,
    });
  }
};



