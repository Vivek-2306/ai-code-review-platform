import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth.middleware";
import { requirePermission, requireAnyPermission, requireAllPermissions } from "@/middleware/rbac.middleware";

export interface AuthorizeMetadata {
    resource: string;
    action: string;
    permissions?: Array<{ resource: string, action: string }>;
    requireAll?: boolean;
}

export function createAuthorizeMiddleware(metadata: AuthorizeMetadata) {
    if (metadata.permissions && metadata.permissions.length > 0) {
        if (metadata.requireAll) {
            return requireAllPermissions(metadata.permissions);
        } else {
            return requireAnyPermission(metadata.permissions);
        }
    } else {
        return requirePermission(metadata.resource, metadata.action);
    }
}

export function Authorize(resource: string, action: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: AuthRequest, res: Response, next: NextFunction) {
            const middleware = requirePermission(resource, action);
            return middleware(req, res, () => {
                return originalMethod.apply(this, [req, res, next]);
            });
        };

        return descriptor;
    };
}

export function AuthorizeAny(permissions: Array<{ resource: string; action: string }>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: AuthRequest, res: Response, next: NextFunction) {
            const middleware = requireAnyPermission(permissions);
            return middleware(req, res, () => {
                return originalMethod.apply(this, [req, res, next]);
            });
        };

        return descriptor;
    }
}

export function AuthorizeAll(permissions: Array<{ resource: string; action: string }>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: AuthRequest, res: Response, next: NextFunction) {
            const middleware = requireAllPermissions(permissions);
            return middleware(req, res, () => {
                return originalMethod.apply(this, [req, res, next]);
            });
        };

        return descriptor;
    };
}