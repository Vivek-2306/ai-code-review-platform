import { AppDataSource } from '../config/datasource';
import { Project } from '../models/postgres/project.entity';
import { User } from '../models/postgres/user.entity';
import { ProjectMember } from '../models/postgres/project_member.entity';
import { Role } from '../models/postgres/role.entity';
import { permissionService } from './permission.service';
import {
    CreateProjectDto,
    UpdateProjectDto,
    AddProjectMemberDto,
    UpdateProjectMemberDto,
    ProjectResponse,
    ProjectMemberResponse,
    ProjectListResponse,
} from '../dto/project.dto';

export class ProjectService {
    /**
     * Create a new project
     */
    async createProject(userId: string, data: CreateProjectDto): Promise<ProjectResponse> {
        // Validate user exists
        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Validate project name
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Project name is required');
        }

        if (data.name.length > 255) {
            throw new Error('Project name must be less than 255 characters');
        }

        // Check if project name already exists for this user
        const existingProject = await AppDataSource.getRepository(Project).findOne({
            where: {
                name: data.name.trim(),
                ownerId: userId,
            },
        });

        if (existingProject) {
            throw new Error('Project with this name already exists');
        }

        // Create project
        const project = AppDataSource.getRepository(Project).create({
            name: data.name.trim(),
            description: data.description?.trim() || undefined,
            ownerId: userId,
        });

        const savedProject = await AppDataSource.getRepository(Project).save(project);

        const projectWithOwner = await AppDataSource.getRepository(Project).findOne({
            where: { id: savedProject.id },
            relations: ['owner'],
        });

        if (!projectWithOwner) {
            throw new Error('Project just saved could not be found');
        }

        return this.mapToResponse(projectWithOwner);
    }

    /**
     * Get project by ID
     */
    async getProjectById(projectId: string, userId: string): Promise<ProjectResponse> {
        const project = await AppDataSource.getRepository(Project).findOne({
            where: { id: projectId },
            relations: ['owner'],
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // Check access
        const isOwner = project.ownerId === userId;
        const isMember = await permissionService.isProjectMember(userId, projectId);
        const isAdmin = await permissionService.isAdmin(userId);

        if (!isOwner && !isMember && !isAdmin) {
            throw new Error('Access denied to this project');
        }

        // Get member count
        const memberCount = await AppDataSource.getRepository(ProjectMember).count({
            where: { projectId },
        });

        return {
            ...this.mapToResponse(project),
            memberCount,
        };
    }

    /**
     * Get all projects user has access to
     */
    async getUserProjects(
        userId: string,
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<ProjectListResponse> {
        const skip = (page - 1) * limit;
        const isAdmin = await permissionService.isAdmin(userId);

        let query = AppDataSource.getRepository(Project)
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.owner', 'owner')
            .leftJoin('project.projectMembers', 'member')
            .where('(project.ownerId = :userId OR member.userId = :userId)', { userId });

        if (search) {
            query.andWhere('(project.name ILIKE :search OR project.description ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        // Admins can see all projects
        if (isAdmin) {
            query = AppDataSource.getRepository(Project)
                .createQueryBuilder('project')
                .leftJoinAndSelect('project.owner', 'owner');

            if (search) {
                query.where('(project.name ILIKE :search OR project.description ILIKE :search)', {
                    search: `%${search}%`,
                });
            }
        }

        const [projects, total] = await query
            .orderBy('project.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        // Get member counts for each project
        const projectIds = projects.map((p) => p.id);
        const memberCounts = await AppDataSource.getRepository(ProjectMember)
            .createQueryBuilder('pm')
            .select('pm.projectId', 'projectId')
            .addSelect('COUNT(pm.id)', 'count')
            .where('pm.projectId IN (:...projectIds)', { projectIds })
            .groupBy('pm.projectId')
            .getRawMany();

        const memberCountMap = new Map(
            memberCounts.map((mc) => [mc.projectId, parseInt(mc.count, 10)])
        );

        return {
            projects: projects.map((project) => ({
                ...this.mapToResponse(project),
                memberCount: memberCountMap.get(project.id) || 0,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Update project
     */
    async updateProject(
        projectId: string,
        userId: string,
        data: UpdateProjectDto
    ): Promise<ProjectResponse> {
        const project = await AppDataSource.getRepository(Project).findOne({
            where: { id: projectId },
            relations: ['owner'],
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // Check permission
        const isOwner = project.ownerId === userId;
        const isAdmin = await permissionService.isAdmin(userId);
        const hasPermission = await permissionService.hasPermission(
            userId,
            'project',
            'update',
            projectId
        );

        if (!isOwner && !isAdmin && !hasPermission) {
            throw new Error('You do not have permission to update this project');
        }

        // Update fields
        if (data.name !== undefined) {
            if (data.name.trim().length === 0) {
                throw new Error('Project name cannot be empty');
            }
            if (data.name.length > 255) {
                throw new Error('Project name must be less than 255 characters');
            }

            // Check for duplicate name (excluding current project)
            const existingProject = await AppDataSource.getRepository(Project).findOne({
                where: {
                    name: data.name.trim(),
                    ownerId: project.ownerId,
                },
            });

            if (existingProject && existingProject.id !== projectId) {
                throw new Error('Project with this name already exists');
            }

            project.name = data.name.trim();
        }

        if (data.description !== undefined) {
            const trimmedDesc = data.description?.trim();
            project.description = trimmedDesc !== undefined && trimmedDesc !== null ? trimmedDesc : project.description;
        }

        const updatedProject = await AppDataSource.getRepository(Project).save(project);

        return this.mapToResponse(updatedProject);
    }

    /**
     * Delete project
     */
    async deleteProject(projectId: string, userId: string): Promise<void> {
        const project = await AppDataSource.getRepository(Project).findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // Only owner or admin can delete
        const isOwner = project.ownerId === userId;
        const isAdmin = await permissionService.isAdmin(userId);

        if (!isOwner && !isAdmin) {
            throw new Error('Only project owner can delete the project');
        }

        await AppDataSource.getRepository(Project).remove(project);
    }

    /**
     * Add member to project
     */
    async addProjectMember(
        projectId: string,
        userId: string,
        data: AddProjectMemberDto
    ): Promise<ProjectMemberResponse> {
        const project = await AppDataSource.getRepository(Project).findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // Check permission
        const hasPermission = await permissionService.hasPermission(
            userId,
            'project',
            'manage_members',
            projectId
        );
        const isOwner = project.ownerId === userId;
        const isAdmin = await permissionService.isAdmin(userId);

        if (!hasPermission && !isOwner && !isAdmin) {
            throw new Error('You do not have permission to manage project members');
        }

        // Validate user exists
        const memberUser = await AppDataSource.getRepository(User).findOne({
            where: { id: data.userId },
        });

        if (!memberUser) {
            throw new Error('User not found');
        }

        // Validate role exists
        const role = await AppDataSource.getRepository(Role).findOne({
            where: { id: data.roleId },
        });

        if (!role) {
            throw new Error('Role not found');
        }

        // Check if user is already a member
        const existingMember = await AppDataSource.getRepository(ProjectMember).findOne({
            where: {
                projectId,
                userId: data.userId,
            },
        });

        if (existingMember) {
            throw new Error('User is already a member of this project');
        }

        // Create project member
        const projectMember = AppDataSource.getRepository(ProjectMember).create({
            projectId,
            userId: data.userId,
            roleId: data.roleId,
        });

        const savedMember = await AppDataSource.getRepository(ProjectMember).save(projectMember);

        // Load relations
        const memberWithRelations = await AppDataSource.getRepository(ProjectMember).findOne({
            where: { id: savedMember.id },
            relations: ['user', 'role'],
        });

        return this.mapMemberToResponse(memberWithRelations!);
    }

    /**
     * Get project members
     */
    async getProjectMembers(projectId: string, userId: string): Promise<ProjectMemberResponse[]> {
        const project = await AppDataSource.getRepository(Project).findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // Check access
        const isOwner = project.ownerId === userId;
        const isMember = await permissionService.isProjectMember(userId, projectId);
        const isAdmin = await permissionService.isAdmin(userId);

        if (!isOwner && !isMember && !isAdmin) {
            throw new Error('Access denied to this project');
        }

        const members = await AppDataSource.getRepository(ProjectMember).find({
            where: { projectId },
            relations: ['user', 'role'],
            order: { createdAt: 'ASC' },
        });

        return members.map((member) => this.mapMemberToResponse(member));
    }

    /**
     * Update project member role
     */
    async updateProjectMember(
        projectId: string,
        memberId: string,
        userId: string,
        data: UpdateProjectMemberDto
    ): Promise<ProjectMemberResponse> {
        const project = await AppDataSource.getRepository(Project).findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // Check permission
        const hasPermission = await permissionService.hasPermission(
            userId,
            'project',
            'manage_members',
            projectId
        );
        const isOwner = project.ownerId === userId;
        const isAdmin = await permissionService.isAdmin(userId);

        if (!hasPermission && !isOwner && !isAdmin) {
            throw new Error('You do not have permission to manage project members');
        }

        const member = await AppDataSource.getRepository(ProjectMember).findOne({
            where: {
                id: memberId,
                projectId,
            },
        });

        if (!member) {
            throw new Error('Project member not found');
        }

        // Validate role exists
        const role = await AppDataSource.getRepository(Role).findOne({
            where: { id: data.roleId },
        });

        if (!role) {
            throw new Error('Role not found');
        }

        // Update role
        member.roleId = data.roleId;
        const updatedMember = await AppDataSource.getRepository(ProjectMember).save(member);

        // Load relations
        const memberWithRelations = await AppDataSource.getRepository(ProjectMember).findOne({
            where: { id: updatedMember.id },
            relations: ['user', 'role'],
        });

        return this.mapMemberToResponse(memberWithRelations!);
    }

    /**
     * Remove project member
     */
    async removeProjectMember(
        projectId: string,
        memberId: string,
        userId: string
    ): Promise<void> {
        const project = await AppDataSource.getRepository(Project).findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // Check permission
        const hasPermission = await permissionService.hasPermission(
            userId,
            'project',
            'manage_members',
            projectId
        );
        const isOwner = project.ownerId === userId;
        const isAdmin = await permissionService.isAdmin(userId);

        if (!hasPermission && !isOwner && !isAdmin) {
            throw new Error('You do not have permission to manage project members');
        }

        const member = await AppDataSource.getRepository(ProjectMember).findOne({
            where: {
                id: memberId,
                projectId,
            },
        });

        if (!member) {
            throw new Error('Project member not found');
        }

        // Prevent removing project owner
        if (member.userId === project.ownerId) {
            throw new Error('Cannot remove project owner');
        }

        await AppDataSource.getRepository(ProjectMember).remove(member);
    }

    /**
     * Map Project entity to response DTO
     */
    private mapToResponse(project: Project): ProjectResponse {
        return {
            id: project.id,
            name: project.name,
            description: project.description,
            ownerId: project.ownerId,
            owner: {
                id: project.owner.id,
                email: project.owner.email,
            },
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };
    }

    /**
     * Map ProjectMember entity to response DTO
     */
    private mapMemberToResponse(member: ProjectMember): ProjectMemberResponse {
        return {
            id: member.id,
            userId: member.userId,
            projectId: member.projectId,
            roleId: member.roleId,
            user: {
                id: member.user.id,
                email: member.user.email,
            },
            role: {
                id: member.role.id,
                name: member.role.name,
                description: member.role.description,
            },
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
        };
    }
}

export const projectService = new ProjectService();