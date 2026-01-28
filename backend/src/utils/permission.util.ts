import { permissionService } from '../services/permission.service';
import { PERMISSION_MATRIX } from '../config/permission-matrix';

/**
 * Check if user can perform action on resource
 */
export async function can(
    userId: string,
    resource: string,
    action: string,
    projectId?: string
): Promise<boolean> {
    return permissionService.hasPermission(userId, resource, action, projectId);
}

/**
 * Check if user can perform any of the actions
 */
export async function canAny(
    userId: string,
    permissions: Array<{ resource: string; action: string }>,
    projectId?: string
): Promise<boolean> {
    return permissionService.hasAnyPermission(userId, permissions, projectId);
}

/**
 * Check if user can perform all actions
 */
export async function canAll(
    userId: string,
    permissions: Array<{ resource: string; action: string }>,
    projectId?: string
): Promise<boolean> {
    return permissionService.hasAllPermissions(userId, permissions, projectId);
}

/**
 * Get user's permissions
 */
export async function getUserPermissions(userId: string, projectId?: string) {
    return permissionService.getUserPermission(userId, projectId);
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
    return permissionService.isAdmin(userId);
}

/**
 * Check if user is project owner
 */
export async function isProjectOwner(userId: string, projectId: string): Promise<boolean> {
    return permissionService.isProjectOwner(userId, projectId);
}

/**
 * Check if user is project member
 */
export async function isProjectMember(userId: string, projectId: string): Promise<boolean> {
    return permissionService.isProjectMember(userId, projectId);
}