import express from "express";
import { createCrudRouter } from "./crud-router.js";

const router = express.Router();

router.use("/explanation-documents", createCrudRouter("explanation_documents"));
router.use("/explanation-blocks", createCrudRouter("explanation_blocks"));

export default router;
