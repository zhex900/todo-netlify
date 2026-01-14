import { Router } from "express";
import ads from "./adRoute.js";
import availability from "./availabilityRoute.js";
import locations from "./locationRoute.js";
import instruments from "./instrumentRoute.js";
import users from "./userRoute.js";
import tutors from "./tutorRoute.js";
import auth from "./authRoute.js";

const router = Router();

router.use("/auth", auth);
router.use("/ads", ads);
router.use("/availability", availability);
router.use("/locations", locations);
router.use("/instruments", instruments);
router.use("/users", users);
router.use("/tutors", tutors);

export default router;
