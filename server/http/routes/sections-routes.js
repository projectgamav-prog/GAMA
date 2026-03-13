import express from "express";
import { createCrudRouter } from "./crud-router.js";

const router = express.Router();

router.use("/book-sections", createCrudRouter("book_sections"));
router.use("/chapter-sections", createCrudRouter("chapter_sections"));

export default router;
