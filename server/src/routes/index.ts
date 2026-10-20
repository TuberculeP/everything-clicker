import { Router } from "express";
import wordsRouter from "./words";

const router = Router();

router.get("/", (_, res) => {
  res.json({
    message: "Hello from the server!",
  });
});

router.use("/words", wordsRouter);

export default router;
