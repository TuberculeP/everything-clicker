import { Router } from "express";
import { pg } from "../config/db.config";

const router = Router();

// get all
router.get("/words", async (req, res) => {
  const results = (await pg.query("SELECT * FROM words")).rows;
  res.json(results);
});

// get from id
router.post("/words", async (req, res) => {
  try {
    const { id } = req.body;
    const result = (await pg.query("SELECT * FROM words WHERE id = $1", [id]))
      .rows?.[0];
    res.json(result);
  } catch (error) {
    res.status(400).json({ error, message: "Error getting word" });
  }
});

router.post("/words/add", async (req, res) => {
  try {
    const { word } = req.body;
    await pg.query("INSERT INTO words (word) VALUES ($1)", [word]);
    res.status(201).json({ message: "Word added" });
  } catch (error) {
    res.status(400).json({ error, message: "Error adding word" });
  }
});

// increase value of word
router.post("/words/increase", async (req, res) => {
  try {
    const { id, amount } = req.body;
    if (amount > 250) {
      // 125 cps * 2s batch
      res.status(400).json({ message: "no_auto_click" });
    } else {
      await pg.query("UPDATE words SET count = count + $1 WHERE id = $2", [
        amount,
        id,
      ]);
    }
    res.status(201).json({ message: "Word increased" });
  } catch (error) {
    res.status(400).json({ error, message: "Error increasing word" });
  }
});

export default router;
