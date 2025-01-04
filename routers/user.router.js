import { Router } from "express"
import { getUserDetail, getUsers } from "../controllers/user.controller.js";
// import verifyToken from "../middlewares/auth.js";

const router =Router();
// router.use(verifyToken)


router.get('/users',getUsers)
router.get('/user-detail/:id', getUserDetail);






export default router