import express from "express";
import { createCrudRouter } from "./crud-router.js";

const router = express.Router();

router.use("/content-blocks", createCrudRouter("content_blocks"));
router.use("/media-assets", createCrudRouter("media_assets"));

export default router;
