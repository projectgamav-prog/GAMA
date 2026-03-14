import express from "express";
import { createCrudRouter } from "./crud-router.js";
import { getAdminEntityApiMountPath } from "../../../src/admin/entity-api-paths.js";
import mediaAssetsRouter from "./media-assets-routes.js";

const router = express.Router();

router.use(getAdminEntityApiMountPath("media_assets"), mediaAssetsRouter);
router.use(getAdminEntityApiMountPath("content_blocks"), createCrudRouter("content_blocks"));
router.use(getAdminEntityApiMountPath("media_assets"), createCrudRouter("media_assets"));

export default router;
