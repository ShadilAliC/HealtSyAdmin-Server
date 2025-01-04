import { Router } from "express"
import { createSaltMolecule, deleteSaltMolecule, getSaltMolecule, getSaltMoleculeById, updateSaltMolecule } from "../controllers/healthy-services.controller.js";
// import verifyToken from "../middlewares/auth.js";


const router =Router();
// router.use(verifyToken)
router.post('/salt-molecule',createSaltMolecule)
router.get('/salt-molecule',getSaltMolecule)
router.get('/salt-molecule/:id', getSaltMoleculeById);
router.patch('/salt-molecule/:id', updateSaltMolecule);
router.delete('/salt-molecule/:id', deleteSaltMolecule);

export default router