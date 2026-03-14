import express from "express";
import { hasPermission } from "../../../src/permissions/access.js";
import { importMediaFiles } from "../../content/media-import-service.js";

const router = express.Router();

function fail(res, error, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: error.message || error,
  });
}

router.post("/import", async (req, res) => {
  try {
    if (!req.auth?.user) {
      return fail(res, "You must be logged in to import media.", 401);
    }

    if (!hasPermission(req.auth.permissionContext, "media.upload")) {
      return fail(res, 'Missing required permission "media.upload".', 403);
    }

    const files = Array.isArray(req.body?.files) ? req.body.files : [];
    const createdAssets = await importMediaFiles(files);

    res.status(201).json({
      success: true,
      data: createdAssets,
    });
  } catch (error) {
    fail(res, error, 400);
  }
});

export default router;
