import { Router, type IRouter } from "express";
import { ConfirmCheckoutBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import {
  getEntitlement,
  createCheckout,
  confirmCheckout,
} from "../lib/billing";

const router: IRouter = Router();

// Whether the signed-in account has unlocked full exploration.
router.get("/me/entitlement", requireAuth, async (req, res) => {
  const result = await getEntitlement(req.userId!);
  res.json(result);
});

// Start the one-time unlock checkout (or report the account already owns it).
router.post("/billing/checkout", requireAuth, async (req, res) => {
  const origin = `${req.protocol}://${req.get("host")}`;
  try {
    const result = await createCheckout(req.userId!, origin, req.log);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "failed to create checkout session");
    res.status(503).json({ error: "Checkout is unavailable right now." });
  }
});

// Verify a returned checkout session and grant the unlock when paid.
router.post("/billing/confirm", requireAuth, async (req, res) => {
  const parsed = ConfirmCheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }
  try {
    const result = await confirmCheckout(
      req.userId!,
      parsed.data.sessionId,
      req.log,
    );
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "failed to confirm checkout session");
    res.status(502).json({ error: "Could not confirm payment." });
  }
});

export default router;
