import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    pharmacyName: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    verificationCode: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: String,
    },
    pharmacyBusinessType: {
      type: String,
    },
    companyName: {
      type: String,
    },
    pharmacyGstNumber: {
      type: String,
    },
    drugLicenseNumber: {
      type: String,
    },
    fssaiNumber: {
      type: String,
    },
    pharmacistLicenseNumber: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    pharmacyAddress: {
      type: String,
    },
    pincode: {
      type: String,
    },
    medicineDiscount: {
      type: String,
    },
    otcDiscount: {
      type: String,
    },
    pharmacySize: {
      type: String,
    },
    inventoryValue: {
      type: String,
    },
    monthlyTurnover: {
      type: String,
    },
    pharmacistsCount: {
      type: String,
    },
    hasDeliveryStaff: {
      type: String,
    },
    hasPoc: {
      type: String,
    },
    isPartOfPlatform: {
      type: String,
    },
    wholesaleLicense: {
      type: String,
    },
    billingSoftware: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserDb = mongoose.model("User", userSchema);
export default UserDb;
