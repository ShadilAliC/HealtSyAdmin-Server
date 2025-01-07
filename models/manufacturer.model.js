import mongoose from "mongoose";

const ManufacturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    manufacturer_address: {
      type: String,
    },
    customer_email: {
      type: String,
    },
    country_origin: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ManufacturerDb = mongoose.model("manufacturer", ManufacturerSchema);
export default ManufacturerDb;
