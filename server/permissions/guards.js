import { hasAnyPermission, hasPermission } from "../../src/permissions/access.js";

function authError(res, message, statusCode) {
    return res.status(statusCode).json({
        success: false,
        error: message,
    });
}

export function requireAuthenticatedUser(req, res, next) {
    if (req.auth?.user) {
        next();
        return;
    }

    authError(res, "You must be logged in to perform this action.", 401);
}

export function requirePermission(permissionKey) {
    return (req, res, next) => {
        if (!req.auth?.user) {
            authError(res, "You must be logged in to perform this action.", 401);
            return;
        }

        if (!hasPermission(req.auth.permissionContext, permissionKey)) {
            authError(res, `Missing required permission "${permissionKey}".`, 403);
            return;
        }

        next();
    };
}

export function requireAnyPermission(permissionKeys = []) {
    return (req, res, next) => {
        if (!req.auth?.user) {
            authError(res, "You must be logged in to perform this action.", 401);
            return;
        }

        if (!hasAnyPermission(req.auth.permissionContext, permissionKeys)) {
            authError(res, "You do not have permission to access this resource.", 403);
            return;
        }

        next();
    };
}
