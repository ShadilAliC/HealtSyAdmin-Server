import mongoose from "mongoose";

const SaltMoleculeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    therapeutic_classification: {
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

const SaltMoleculeDb = mongoose.model("SaltMolecule", SaltMoleculeSchema);
export default SaltMoleculeDb;
