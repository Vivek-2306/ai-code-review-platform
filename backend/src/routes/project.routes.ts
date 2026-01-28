import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission, requireProjectOwner } from '../middleware/rbac.middleware';
import { loadProject, requireProjectPermission } from '../middleware/project-permission.middleware';
import { projectController } from '../controller/project.controller';
import { PERMISSION_MATRIX } from '../config/permission-matrix';

const projectRouter = Router();

// All routes require authentication
projectRouter.use(authenticateToken);

// Get all projects (requires project read permission)
projectRouter.get(
    '/',
    requirePermission('project', 'read'),
    projectController.getAll.bind(projectController)
);

// Create project (requires project create permission)
projectRouter.post(
    '/',
    requirePermission('project', 'create'),
    projectController.create.bind(projectController)
);

// Get project by ID (requires project read + load project)
projectRouter.get(
    '/:projectId',
    loadProject(),
    requireProjectPermission('project', 'read'),
    projectController.getById.bind(projectController)
);

// Update project (requires project update permission)
projectRouter.put(
    '/:projectId',
    loadProject(),
    requireProjectPermission('project', 'update'),
    projectController.update.bind(projectController)
);

// Delete project (requires project delete + must be owner or admin)
projectRouter.delete(
    '/:projectId',
    loadProject(),
    requireProjectOwner(),
    projectController.delete.bind(projectController)
);

// Add project member (requires manage_members permission)
projectRouter.post(
    '/:projectId/members',
    loadProject(),
    requireProjectPermission('project', 'manage_members'),
    projectController.addMember.bind(projectController)
);

// Get project members (requires project read)
projectRouter.get(
    '/:projectId/members',
    loadProject(),
    requireProjectPermission('project', 'read'),
    projectController.getMembers.bind(projectController)
);

// Update project member role (requires manage_members permission)
projectRouter.put(
    '/:projectId/members/:memberId',
    loadProject(),
    requireProjectPermission('project', 'manage_members'),
    projectController.updateMember.bind(projectController)
);

// Remove project member (requires manage_members permission)
projectRouter.delete(
    '/:projectId/members/:memberId',
    loadProject(),
    requireProjectPermission('project', 'manage_members'),
    projectController.removeMember.bind(projectController)
);

export default projectRouter;