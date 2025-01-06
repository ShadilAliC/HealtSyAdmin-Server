import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  package_description: {
    type: String,
    required: true,
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
    },
  ],
  mrp: {
    type: Number,
    required: true,
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
    required: true,
    min: 0,
  },
  mrp_per_unit: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
  },
});

export default VariantSchema;
