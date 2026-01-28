import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProjectPermissionRequest } from '../middleware/project-permission.middleware';
import { projectService } from '../services/project.service';
import {
    CreateProjectDto,
    UpdateProjectDto,
    AddProjectMemberDto,
    UpdateProjectMemberDto,
} from '../dto/project.dto';

export class ProjectController {
    /**
     * POST /api/projects
     * Create a new project
     */
    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const data: CreateProjectDto = req.body;

            if (!data.name) {
                res.status(400).json({ error: 'Project name is required' });
                return;
            }

            const project = await projectService.createProject(req.user.id, data);

            res.status(201).json({
                message: 'Project created successfully',
                data: project,
            });
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
                return;
            }
            if (error.message.includes('required') || error.message.includes('must be')) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Failed to create project' });
        }
    }

    /**
     * GET /api/projects
     * Get all projects user has access to
     */
    async getAll(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;

            const result = await projectService.getUserProjects(req.user.id, page, limit, search);

            res.status(200).json({
                message: 'Projects retrieved successfully',
                data: result,
            });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to retrieve projects' });
        }
    }

    /**
     * GET /api/projects/:projectId
     * Get project by ID
     */
    async getById(req: ProjectPermissionRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

            const project = await projectService.getProjectById(projectId, req.user.id);

            res.status(200).json({
                message: 'Project retrieved successfully',
                data: project,
            });
        } catch (error: any) {
            if (error.message === 'Project not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message === 'Access denied') {
                res.status(403).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Failed to retrieve project' });
        }
    }

    /**
     * PUT /api/projects/:projectId
     * Update project
     */
    async update(req: ProjectPermissionRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const data: UpdateProjectDto = req.body;

            const project = await projectService.updateProject(projectId, req.user.id, data);

            res.status(200).json({
                message: 'Project updated successfully',
                data: project,
            });
        } catch (error: any) {
            if (error.message === 'Project not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('permission') || error.message.includes('already exists')) {
                res.status(403).json({ error: error.message });
                return;
            }
            if (error.message.includes('required') || error.message.includes('must be')) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Failed to update project' });
        }
    }

    /**
     * DELETE /api/projects/:projectId
     * Delete project
     */
    async delete(req: ProjectPermissionRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

            await projectService.deleteProject(projectId, req.user.id);

            res.status(200).json({
                message: 'Project deleted successfully',
            });
        } catch (error: any) {
            if (error.message === 'Project not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('permission') || error.message.includes('owner')) {
                res.status(403).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Failed to delete project' });
        }
    }

    /**
     * POST /api/projects/:projectId/members
     * Add member to project
     */
    async addMember(req: ProjectPermissionRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const data: AddProjectMemberDto = req.body;

            if (!data.userId || !data.roleId) {
                res.status(400).json({ error: 'userId and roleId are required' });
                return;
            }

            const member = await projectService.addProjectMember(projectId, req.user.id, data);

            res.status(201).json({
                message: 'Member added successfully',
                data: member,
            });
        } catch (error: any) {
            if (error.message === 'Project not found' || error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('permission')) {
                res.status(403).json({ error: error.message });
                return;
            }
            if (error.message.includes('already a member')) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Failed to add member' });
        }
    }

    /**
     * GET /api/projects/:projectId/members
     * Get project members
     */
    async getMembers(req: ProjectPermissionRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const members = await projectService.getProjectMembers(projectId, req.user.id);

            res.status(200).json({
                message: 'Members retrieved successfully',
                data: members,
            });
        } catch (error: any) {
            if (error.message === 'Project not found' || error.message === 'Access denied') {
                res.status(error.message === 'Project not found' ? 404 : 403).json({
                    error: error.message,
                });
                return;
            }
            res.status(500).json({ error: 'Failed to retrieve members' });
        }
    }

    /**
     * PUT /api/projects/:projectId/members/:memberId
     * Update project member role
     */
    async updateMember(req: ProjectPermissionRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const memberId = Array.isArray(req.params.memberId) ? req.params.memberId[0] : req.params.memberId;
            const data: UpdateProjectMemberDto = req.body;

            if (!data.roleId) {
                res.status(400).json({ error: 'roleId is required' });
                return;
            }

            const member = await projectService.updateProjectMember(
                projectId,
                memberId,
                req.user.id,
                data
            );

            res.status(200).json({
                message: 'Member updated successfully',
                data: member,
            });
        } catch (error: any) {
            if (
                error.message === 'Project not found' ||
                error.message === 'Project member not found' ||
                error.message.includes('not found')
            ) {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('permission')) {
                res.status(403).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Failed to update member' });
        }
    }

    /**
     * DELETE /api/projects/:projectId/members/:memberId
     * Remove project member
     */
    async removeMember(req: ProjectPermissionRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const memberId = Array.isArray(req.params.memberId) ? req.params.memberId[0] : req.params.memberId;

            await projectService.removeProjectMember(projectId, memberId, req.user.id);

            res.status(200).json({
                message: 'Member removed successfully',
            });
        } catch (error: any) {
            if (
                error.message === 'Project not found' ||
                error.message === 'Project member not found'
            ) {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('permission') || error.message.includes('owner')) {
                res.status(403).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Failed to remove member' });
        }
    }
}

export const projectController = new ProjectController();