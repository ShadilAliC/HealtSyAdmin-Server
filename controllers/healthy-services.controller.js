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
      console.log(filters, "oeoeoeo");

      if (Array.isArray(filters)) {
        filters.forEach((filter) => {
          switch (filter.category) {
            case "Salt":
              filterObj.salt_molecule = filter.value;
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
