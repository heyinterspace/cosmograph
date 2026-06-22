import { Router, type IRouter } from "express";
import healthRouter from "./health";
import githubRouter from "./github";
import billingRouter from "./billing";

const router: IRouter = Router();

router.use(healthRouter);
router.use(githubRouter);
router.use(billingRouter);

export default router;
