import express from "express";
import {
    getAccessSnapshot,
    updateRolePermissions,
    updateUserPermissionOverrides,
    updateUserRoles,
} from "../../auth/store.js";
import { requireAnyPermission, requirePermission } from "../../permissions/guards.js";

const router = express.Router();

router.get(
    "/access",
    requireAnyPermission(["users.manage", "permissions.manage"]),
    async (_req, res, next) => {
        try {
            res.json({
                success: true,
                data: await getAccessSnapshot(),
            });
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/users/:id/roles",
    requirePermission("users.manage"),
    async (req, res, next) => {
        try {
            const roles = await updateUserRoles(req.params.id, req.body?.roleIds || []);
            res.json({
                success: true,
                data: roles,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
);

router.put(
    "/users/:id/permission-overrides",
    requirePermission("permissions.manage"),
    async (req, res, next) => {
        try {
            const overrides = await updateUserPermissionOverrides(req.params.id, req.body?.overrides || []);
            res.json({
                success: true,
                data: overrides,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
);

router.put(
    "/roles/:id/permissions",
    requirePermission("permissions.manage"),
    async (req, res, next) => {
        try {
            const assignments = await updateRolePermissions(req.params.id, req.body?.permissionKeys || []);
            res.json({
                success: true,
                data: assignments,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
);

export default router;
