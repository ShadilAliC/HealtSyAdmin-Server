import mongoose from "mongoose";
import VariantSchema from "./medicine-variant.model.js";
import FaqQASchema from "./faqQA.model.js";

const MedicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    package_description: {
      type: String,
    },
    type: {
      type: String,
    },
    stock: {
      type: String,
    },
    prescription_type: {
      type: String,
    },
    status: {
      type: String,
    },
    manufacturer: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
      },
      country: {
        type: String,
      },
      customer_care_email: {
        type: String,
        lowercase: true,
        validate: {
          validator: function (v) {
            return /^\S+@\S+\.\S+$/.test(v);
          },
          message: (props) => `${props.value} is not a valid email address!`,
        },
      },
    },

    pricing: {
      mrp: {
        type: String,
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
      unit: {
        type: String,
        required: true,
      },
      mrp_per_unit: {
        type: String,
        required: true,
      },
      return_policy: {
        returnable: {
          type: String,
        },
        return_window: {
          type: String,
        },
        open_box: {
          type: String,
        },
      },
    },
    molecule_details: {
      salt_molecule: {
        type: String,
      },
      therapeutic_classification: {
        type: String,
      },
      therapeutic_uses: {
        type: String,
      },
    },
    variants: [VariantSchema],
    faq: {
      faq_description: {
        type: String,
      },
      author_details: {
        type: String,
      },
      warning_and_precaution: {
        type: String,
      },
      direction_uses: {
        type: String,
      },
      side_effect: {
        type: String,
      },
      storage_disposal: {
        type: String,
      },
      dosage: {
        type: String,
      },
      reference: {
        type: String,
      },
      question_answers: [FaqQASchema],
    },
  },

  {
    timestamps: true,
  }
);

MedicineSchema.index({ name: 1, "manufacturer.name": 1 });

const Medicine = mongoose.model("Medicine", MedicineSchema);
export default Medicine;
