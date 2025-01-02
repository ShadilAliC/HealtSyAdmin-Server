import dotenv from "dotenv";
dotenv.config();
import UserDb from "../models/user.model.js";
import twilio from "twilio";
import jwt from "jsonwebtoken";
import { generateOTP } from "../services/otp.service.js";
console.log(process.env.account_SID, process.env.authToken,'process.env.account_SID, process.env.authToken');

const client = twilio(process.env.account_SID, process.env.authToken);

export const sendSMS = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.json({ message: "Phone number is required" });
    }

    const sanitizedPhone = phone.replace(/\D/g, "");
    const phoneWithCountryCode = `+91${sanitizedPhone}`;
    console.log(
      "Sanitized phone number with country code:",
      phoneWithCountryCode
    );

    const currentTime = Date.now();

    const existPhone = await UserDb.findOne({ phone: phoneWithCountryCode });
    let OTP;
    if (existPhone && existPhone.isVerified && existPhone.email) {
      return res.json({
        message: "Phone number already verified",
        status: false,
      });
    }

    if (existPhone && existPhone.expiresAt > currentTime) {
      OTP = existPhone.verificationCode;
    } else {
      OTP = generateOTP();
      const expiresAt = currentTime + 5 * 60 * 1000;

      if (existPhone) {
        existPhone.verificationCode = OTP;
        existPhone.expiresAt = expiresAt;
        await existPhone.save();
      } else {
        const otpRecord = new UserDb({
          phone: phoneWithCountryCode,
          verificationCode: OTP,
          expiresAt,
          isVerified: false,
        });
        await otpRecord.save();
        console.log("OTP saved successfully in DB:", otpRecord);
      }
    }

    try {
      console.log( process.env.Twilio_Test_Number,' process.env.Twilio_Test_Number');
      
      const message = await client.messages.create({
        body: `Your Verification code is ${OTP}`,
        from: process.env.Twilio_Test_Number,
        to: phoneWithCountryCode,
      });

      console.log(`OTP sent with SID: ${message.sid}`);
      res.status(200).json({
        message: "SMS sent successfully",
        sid: message.sid,
        status: message.status,
      });
    } catch (smsError) {
      console.error("Error sending SMS:", smsError);
      res.status(500).json({ message: "Failed to send SMS" });
    }
  } catch (err) {
    console.error("Error in sendSMS:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    const existPhone = await UserDb.findOne({
      phone: `+91${phone}`,
    });

    if (!existPhone) {
      return res.status(400).json({ message: "Phone number not found" });
    }

    if (Date.now() > existPhone.expiresAt) {
      existPhone.verificationCode = undefined;
      existPhone.expiresAt = undefined;
      existPhone.isVerified = false;
      existPhone.phone = undefined;
      await existPhone.save();
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (existPhone.verificationCode === otp) {
      existPhone.isVerified = true;
      const user = await existPhone.save();
      res.status(200).json({ message: "OTP verified successfully", user });
    } else {
      res.json({ message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("Error in verifyCode:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      pharmacyName: req.body.pharmacyName,
      email: req.body.email,
      phone: `+91${req.body.phone}`,
      verificationCode: req.body.verificationCode,
      isVerified: req.body.isVerified,
      expiresAt: req.body.expiresAt,
      pharmacyBusinessType: req.body.pharmacyBusinessType,
      companyName: req.body.companyName,
      pharmacyGstNumber: req.body.pharmacyGstNumber,
      drugLicenseNumber: req.body.drugLicenseNumber,
      fssaiNumber: req.body.fssaiNumber,
      pharmacistLicenseNumber: req.body.pharmacistLicenseNumber,
      state: req.body.state,
      city: req.body.city,
      pharmacyAddress: req.body.pharmacyAddress,
      pincode: req.body.pincode,
      medicineDiscount: req.body.medicineDiscount,
      otcDiscount: req.body.otcDiscount,
      pharmacySize: req.body.pharmacySize,
      inventoryValue: req.body.inventoryValue,
      monthlyTurnover: req.body.monthlyTurnover,
      pharmacistsCount: req.body.pharmacistsCount,
      hasDeliveryStaff: req.body.hasDeliveryStaff,
      hasPoc: req.body.hasPoc,
      isPartOfPlatform: req.body.isPartOfPlatform,
      wholesaleLicense: req.body.wholesaleLicense,
      billingSoftware: req.body.billingSoftware,
    };

    const updatedUser = await UserDb.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const token = jwt.sign(
      {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({ success: true, data: updatedUser, token });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



