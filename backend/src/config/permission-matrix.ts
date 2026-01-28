/**
 * Permission Matrix - Defines all resources and actions in the system
 */
export const PERMISSION_MATRIX = {
    // Project permissions
    PROJECT: {
        READ: { resource: 'project', action: 'read', name: 'View Project' },
        CREATE: { resource: 'project', action: 'create', name: 'Create Project' },
        UPDATE: { resource: 'project', action: 'update', name: 'Update Project' },
        DELETE: { resource: 'project', action: 'delete', name: 'Delete Project' },
        MANAGE_MEMBERS: { resource: 'project', action: 'manage_members', name: 'Manage Project Members' },
    },

    // Review permissions
    REVIEW: {
        READ: { resource: 'review', action: 'read', name: 'View Review' },
        CREATE: { resource: 'review', action: 'create', name: 'Create Review' },
        UPDATE: { resource: 'review', action: 'update', name: 'Update Review' },
        DELETE: { resource: 'review', action: 'delete', name: 'Delete Review' },
        APPROVE: { resource: 'review', action: 'approve', name: 'Approve Review' },
        REJECT: { resource: 'review', action: 'reject', name: 'Reject Review' },
    },

    // Comment permissions
    COMMENT: {
        READ: { resource: 'comment', action: 'read', name: 'View Comment' },
        CREATE: { resource: 'comment', action: 'create', name: 'Create Comment' },
        UPDATE: { resource: 'comment', action: 'update', name: 'Update Comment' },
        DELETE: { resource: 'comment', action: 'delete', name: 'Delete Comment' },
    },

    // User permissions
    USER: {
        READ: { resource: 'user', action: 'read', name: 'View User' },
        UPDATE: { resource: 'user', action: 'update', name: 'Update User' },
        DELETE: { resource: 'user', action: 'delete', name: 'Delete User' },
        MANAGE: { resource: 'user', action: 'manage', name: 'Manage Users' },
    },

    // Role permissions
    ROLE: {
        READ: { resource: 'role', action: 'read', name: 'View Role' },
        CREATE: { resource: 'role', action: 'create', name: 'Create Role' },
        UPDATE: { resource: 'role', action: 'update', name: 'Update Role' },
        DELETE: { resource: 'role', action: 'delete', name: 'Delete Role' },
        MANAGE: { resource: 'role', action: 'manage', name: 'Manage Roles' },
    },

    // Permission permissions
    PERMISSION: {
        READ: { resource: 'permission', action: 'read', name: 'View Permission' },
        MANAGE: { resource: 'permission', action: 'manage', name: 'Manage Permissions' },
    },
} as const;

/**
 * Helper function to get permission by resource and action
 */
export function getPermission(resource: string, action: string) {
    const resourceKey = resource.toUpperCase() as keyof typeof PERMISSION_MATRIX;
    const actionKey = action.toUpperCase() as keyof typeof PERMISSION_MATRIX[typeof resourceKey];

    if (!PERMISSION_MATRIX[resourceKey] || !PERMISSION_MATRIX[resourceKey][actionKey]) {
        return null;
    }

    return PERMISSION_MATRIX[resourceKey][actionKey];
}

/**
 * Get all permissions for a resource
 */
export function getResourcePermissions(resource: string) {
    const resourceKey = resource.toUpperCase() as keyof typeof PERMISSION_MATRIX;
    return PERMISSION_MATRIX[resourceKey] ? Object.values(PERMISSION_MATRIX[resourceKey]) : [];
}