import mongoose from "mongoose";

const UnitSchema = new mongoose.Schema(
  {
    unit: {
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

const UnitDb = mongoose.model("unit", UnitSchema);
export default UnitDb;
