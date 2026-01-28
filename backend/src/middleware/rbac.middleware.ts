import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { permissionService, PermissionCheck } from "@/services/permission.service";
import { PERMISSION_MATRIX } from "@/config/permission-matrix";

export interface RBACRequest extends AuthRequest {
    projectId?: string;
    requiredPermission?: PermissionCheck[];
}

export function requirePermission(resource: string, action: string) {
    return async (req: RBACRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
            }

            const projectId: string | undefined =
                typeof req.params.projectId === "string" ? req.params.projectId
                    : typeof req.query.projectId === "string" ? req.query.projectId
                        : typeof req.body.projectId === "string" ? req.body.projectId
                            : undefined;

            if (!projectId) {
                res.status(400).json({ error: "Missing required projectId" });
                return;
            }

            if (!req.user?.id) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            const hasPermission = await permissionService.hasPermission(
                req.user.id,
                resource,
                action,
                projectId
            );

            if (!hasPermission) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: `You don't have permission to ${action} ${resource}`,
                });
                return;
            }

            if (projectId) {
                req.projectId = projectId;
            }

            next();
        } catch (error) {
            res.status(500).json({ error: 'Permission check failed.' })
        }
    }
}

export function requireAnyPermission(permissions: PermissionCheck[]) {
    return async (req: RBACRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
            }

            const projectId: string | undefined =
                typeof req.params.projectId === "string" ? req.params.projectId
                    : typeof req.query.projectId === "string" ? req.query.projectId
                        : typeof req.body.projectId === "string" ? req.body.projectId
                            : undefined;

            if (!projectId) {
                res.status(400).json({ error: "Missing required projectId" });
                return;
            }

            const hasPermission = await permissionService.hasAnyPermission(
                req.user?.id as string,
                permissions,
                projectId
            );

            if (!hasPermission) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: "You don't have the required permission"
                });
                return;
            }

            if (projectId) {
                req.projectId = projectId
            }

            next();
        } catch (error) {
            res.status(500).json({ error: 'Permission check failed' });
        }
    }
}

export function requireAllPermissions(permissions: PermissionCheck[]) {
    return async (req: RBACRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
            }

            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId: string | undefined =
                typeof req.params.projectId === "string" ? req.params.projectId
                    : typeof req.query.projectId === "string" ? req.query.projectId
                        : typeof req.body.projectId === "string" ? req.body.projectId
                            : undefined;

            if (!projectId) {
                res.status(400).json({ error: "Missing required projectId" });
                return;
            }

            const hasPermission = await permissionService.hasAllPermissions(
                req.user.id,
                permissions,
                projectId
            );


            if (!hasPermission) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: "You don't have all required permissions",
                });
                return;
            }

            if (projectId) {
                req.projectId = projectId;
            }

            next();
        } catch (error) {
            res.status(500).json({ error: 'Permission check failed' });
        }
    }
}

export function requireProjectOwner() {
    return async (req: RBACRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId = req.params.projectId || req.query.projectId as string || req.body.projectId;

            if (!projectId) {
                res.status(400).json({ error: 'Project ID is required' });
                return;
            }

            const isOwner = await permissionService.isProjectOwner(req.user.id, projectId);
            const isAdmin = await permissionService.isAdmin(req.user.id);

            if (!isOwner && !isAdmin) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: 'You must be the project owner to perform this action',
                });
                return;
            }

            req.projectId = projectId;
            next();
        } catch (error) {
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
}

export function requireProjectMember() {
    return async (req: RBACRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId = req.params.projectId || req.query.projectId as string || req.body.projectId;

            if (!projectId) {
                res.status(400).json({ error: 'Project ID is required' });
                return;
            }

            const isMember = await permissionService.isProjectMember(req.user.id, projectId);
            const isAdmin = await permissionService.isAdmin(req.user.id);

            if (!isMember && !isAdmin) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: 'You must be a project member to perform this action',
                });
                return;
            }

            req.projectId = projectId;
            next();
        } catch (error) {
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
}

export function requireAdmin(allowOverride = false) {
    return async (req: RBACRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const isAdmin = await permissionService.isAdmin(req.user.id);

            if (!isAdmin) {
                // If override is allowed, check for special override header
                if (allowOverride && req.headers['x-admin-override'] === process.env.ADMIN_OVERRIDE_SECRET) {
                    // Log override usage for security
                    console.warn(`Admin override used by user ${req.user.id}`);
                    next();
                    return;
                }

                res.status(403).json({
                    error: 'Forbidden',
                    message: 'Admin access required',
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
}