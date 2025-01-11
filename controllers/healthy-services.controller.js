import Medicine from "../models/medicine.model.js";
export const getMedicines = async (req, res) => {
  try {
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
              filterObj.status = filter.value == "In-Active" ? false : true;
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
    const {
      name,
      package_description,
      type,
      stock,
      prescription_type,
      status,
      pricing,
      manufacturer,
      images,
      description,
      author_details,
      warning_and_precaution,
      direction_and_uses,
      side_effects,
      storage_disposal,
      dosage,
      reference,
      faqs,
      molecule_details,
      variants,
    } = req.body;
    const validatedVariants = variants.map((variant) => {
      const formattedImages = Array.isArray(variant.images)
        ? variant.images.map((url) => ({ url }))
        : [{ url: variant.images }];
      return {
        ...variant,
        images: formattedImages,
        unit: variant.unit?.value || variant.unit,
      };
    });
    const processImages = (images) => {
      return images
        .map((image) => {
          if (typeof image === "string") {
            return image;
          }
          if (image.url) {
            return image.url;
          }
          return null;
        })
        .filter(Boolean);
    };
    const newMedicine = new Medicine({
      name: name,
      package_description: package_description,
      type: type,
      stock: stock,
      prescription_type: prescription_type,
      status: status,
      manufacturer: {
        name: manufacturer.name,
        address: manufacturer.address,
        country: manufacturer.country,
        customer_care_email: manufacturer.customer_care_email,
      },
      pricing: {
        mrp: pricing.mrp,
        discount: pricing.discount,
        quantity: pricing.quantity,
        mrp_per_unit: pricing.mrp_per_unit,
        unit: pricing.unit,
        return_policy: {
          returnable: pricing.return_policy.returnable,
          open_box: pricing.return_policy.open_box,
        },
      },
      molecule_details: {
        salt_molecule: molecule_details.salt_molecule,
        therapeutic_classification: molecule_details.therapeutic_classification,
        therapeutic_uses: molecule_details.therapeutic_uses,
      },
      variants: validatedVariants,
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
      images: processImages(images),
    });

    const ress = await newMedicine.save();
    return res.status(201).json({
      message: "Medicine created successfully!",
      data: newMedicine,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error occurred while creating the medicine.",
      error: err.message,
    });
  }
};
export const getMedicinesById = async (req, res) => {
  const { id } = req.params;
  try {
    const MedicineData = await Medicine.findOne({ _id: id });
    if (!MedicineData) {
      return res
        .status(404)
        .json({ success: false, message: "Medicine not found" });
    }
    res.status(200).json({ success: true, data: MedicineData });
  } catch (err) {
    console.error("Error fetching Medicine:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "An error occurred" });
  }
};
export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      package_description,
      type,
      stock,
      prescription_type,
      status,
      pricing,
      manufacturer,
      images,
      variants,
      description,
      author_details,
      warning_and_precaution,
      direction_and_uses,
      side_effects,
      storage_disposal,
      dosage,
      reference,
      faqs,
      molecule_details,
    } = req.body;
    const validatedVariants = variants.map((variant) => {
      const formattedImages = Array.isArray(variant.images)
        ? variant.images.map((image) =>
            typeof image === "string" ? { url: image } : image
          )
        : [{ url: variant.images }];
      return {
        ...variant,
        images: formattedImages,
        unit: variant.unit?.value || variant.unit,
      };
    });

    const processImages = (images) => {
      return images
        .map((image) => {
          if (typeof image === "string") {
            return image;
          }
          if (image.url) {
            return image.url;
          }
          return null;
        })
        .filter(Boolean);
    };

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      id,
      {
        name: name,
        package_description: package_description,
        type: type,
        stock: stock,
        prescription_type: prescription_type,
        status: status,
        manufacturer: {
          name: manufacturer.name,
          address: manufacturer.address,
          country: manufacturer.country,
          customer_care_email: manufacturer.customer_care_email,
        },
        pricing: {
          mrp: pricing.mrp,
          discount: pricing.discount,
          quantity: pricing.quantity,
          mrp_per_unit: pricing.mrp_per_unit,
          unit: pricing.unit,
          return_policy: {
            returnable: pricing.return_policy.returnable,
            open_box: pricing.return_policy.open_box,
            return_window: pricing.return_policy.return_window,
          },
        },
        molecule_details: {
          salt_molecule: molecule_details.salt_molecule,
          therapeutic_classification:
            molecule_details.therapeutic_classification,
          therapeutic_uses: molecule_details.therapeutic_uses,
        },
        variants: validatedVariants,
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
        images: processImages(images),
      },
      { new: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.status(200).json({
      message: "Medicine updated successfully",
      updatedMedicine,
      success: true,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error updating medicine", error: err.message });
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
