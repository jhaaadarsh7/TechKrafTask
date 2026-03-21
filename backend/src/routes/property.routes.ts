import { Router } from "express";
import { getAllProperties } from "../controllers/property.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect, getAllProperties);

export default router;