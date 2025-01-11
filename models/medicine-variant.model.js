import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  package_description: {
    type: String,
  },
  images: [
    {
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
    },
  ],
  mrp: {
    type: Number,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  quantity: {
    type: Number,
    min: 0,
  },
  mrp_per_unit: {
    type: Number,
    min: 0,
  },
  unit: {
    type: String,
  },
});

export default VariantSchema;
