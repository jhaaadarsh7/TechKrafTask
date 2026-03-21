import { Router } from "express";
import {
  addFavourite,
  getMyFavourites,
  removeFavourite,
} from "../controllers/favourite.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { favouritePropertyParamSchema } from "../validators/favourite.validator";

const router = Router();

router.get("/", protect, getMyFavourites);
router.post(
  "/:propertyId",
  protect,
  validate(favouritePropertyParamSchema, "params"),
  addFavourite
);
router.delete(
  "/:propertyId",
  protect,
  validate(favouritePropertyParamSchema, "params"),
  removeFavourite
);

export default router;