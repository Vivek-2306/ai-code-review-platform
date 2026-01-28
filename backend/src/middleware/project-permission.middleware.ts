import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { permissionService } from "@/services/permission.service";
import { AppDataSource } from "@/config/datasource";
import { Project } from "@/models/postgres/project.entity";

export interface ProjectPermissionRequest extends AuthRequest {
    project?: Project;
    projectId?: string;
}

export function loadProject() {
    return async (req: ProjectPermissionRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
            }

            const projectId = req.params.projectId || req.query.projectId as string || req.body.projectId;

            if (!projectId) {
                res.status(400).json({ error: 'Project ID is required' });
                return;
            }

            const project = await AppDataSource.getRepository(Project).findOne({
                where: { id: projectId }
            });

            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            if (!req.user?.id) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const isOwner = project.ownerId === req.user.id;
            const isMember = await permissionService.isProjectMember(req.user.id, projectId as string);
            const isAdmin = await permissionService.isAdmin(req.user.id);

            if (!isOwner && !isMember && !isAdmin) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have access to this project',
                });
                return;
            }

            req.project = project;
            req.projectId = projectId;
            next();

        } catch (error) {
            res.status(500).json({ error: 'Failed to load project' });
        }
    }
}

export function requireProjectPermission(resource: string, action: string) {
    return async (req: ProjectPermissionRequest, res: Response, next: NextFunction): Promise<void> => {
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

            // Check project-level permission
            const hasPermission = await permissionService.hasPermission(
                req.user.id,
                resource,
                action,
                projectId
            );

            if (!hasPermission) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: `You don't have permission to ${action} ${resource} in this project`,
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