import express from "express";
import { isDevAdminModeEnabled } from "../../../src/auth/dev-admin-mode.js";
import { canAccessAdmin } from "../../../src/permissions/access.js";
import { authenticateUser, registerUser } from "../../auth/store.js";
import { clearSessionCookie, setSessionCookie } from "../../auth/session.js";

const router = express.Router();

function serializeAuthState(authState) {
    return {
        user: authState.user,
        session: authState.session,
        roleIds: authState.roleIds,
        permissionKeys: authState.permissionKeys,
        canAccessAdmin: canAccessAdmin(authState.permissionContext),
    };
}

router.get("/session", (req, res) => {
    res.json({
        success: true,
        data: serializeAuthState(req.auth),
    });
});

router.post("/register", async (req, res) => {
    if (isDevAdminModeEnabled()) {
        res.status(201).json({
            success: true,
            data: serializeAuthState(req.auth),
        });
        return;
    }

    try {
        await registerUser(req.body || {});
        const authState = await authenticateUser(req.body || {});
        setSessionCookie(res, authState.session?.id || "");
        res.status(201).json({
            success: true,
            data: serializeAuthState(authState),
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});

router.post("/login", async (req, res) => {
    if (isDevAdminModeEnabled()) {
        res.json({
            success: true,
            data: serializeAuthState(req.auth),
        });
        return;
    }

    try {
        const authState = await authenticateUser(req.body || {});
        setSessionCookie(res, authState.session?.id || "");
        res.json({
            success: true,
            data: serializeAuthState(authState),
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message,
        });
    }
});

router.post("/logout", async (req, res, next) => {
    if (isDevAdminModeEnabled()) {
        res.json({
            success: true,
            data: serializeAuthState(req.auth),
        });
        return;
    }

    try {
        await clearSessionCookie(req, res);
        res.json({
            success: true,
            data: {
                user: null,
                session: null,
                roleIds: ["guest"],
                permissionKeys: req.auth?.permissionKeys || [],
                canAccessAdmin: false,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
