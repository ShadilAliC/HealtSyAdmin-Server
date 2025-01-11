import { Router } from "express";
import { createMedicines, deleteMedicines, getMedicines, getMedicinesById, updateMedicine } from "../controllers/healthy-services.controller.js";
import {
  createManufacturer,
  deleteManufacturer,
  getManufacturer,
  getManufacturerById,
  updateManufacturer,
} from "../controllers/healthSyServices/masters/manufacturer.js";
import {
  createSaltMolecule,
  getSaltMolecule,
  getSaltMoleculeById,
  updateSaltMolecule,
  deleteSaltMolecule,
} from "../controllers/healthSyServices/masters/saltMolecule.js";
import {
  createUnit,
  deleteUnit,
  getUnit,
  getUnitById,
  updateUnit,
} from "../controllers/healthSyServices/masters/unit.js";
import { createProductType, deleteProductType, getProductType, getProductTypeById, updateProductType } from "../controllers/healthSyServices/masters/productType.js";

const router = Router();

// Salt-Molecule
router.post("/salt-molecule", createSaltMolecule);
router.get("/salt-molecule", getSaltMolecule);
router.get("/salt-molecule/:id", getSaltMoleculeById);
router.patch("/salt-molecule/:id", updateSaltMolecule);
router.delete("/salt-molecule/:id", deleteSaltMolecule);

// Manufacturer
router.post("/manufacturer", createManufacturer);
router.get("/manufacturer", getManufacturer);
router.get("/manufacturer/:id", getManufacturerById);
router.patch("/manufacturer/:id", updateManufacturer);
router.delete("/manufacturer/:id", deleteManufacturer);

// Unit
router.post("/unit", createUnit);
router.get("/unit", getUnit);
router.get("/unit/:id", getUnitById);
router.patch("/unit/:id", updateUnit);
router.delete("/unit/:id", deleteUnit);

// Product Type
router.post("/product-type", createProductType);
router.get("/product-type", getProductType);
router.get("/product-type/:id", getProductTypeById);
router.patch("/product-type/:id", updateProductType);
router.delete("/product-type/:id", deleteProductType);

// Medicines
router.get("/medicines", getMedicines);
router.post("/medicines", createMedicines);
router.get("/medicines/:id", getMedicinesById);
router.patch("/medicines/:id", updateMedicine);
router.delete("/medicines/:id", deleteMedicines);



export default router;
