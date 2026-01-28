import { AppDataSource } from "@/config/datasource";
import { User } from "@/models/postgres/user.entity";
import { Role } from "@/models/postgres/role.entity";
import { Permission } from "@/models/postgres/permission.entity";
import { UserRole } from "@/models/postgres/user_role.entity";
import { ProjectMember } from "@/models/postgres/project_member.entity";
import { RolePermission } from "@/models/postgres/role_permission.entity";
import { Project } from "@/models/postgres/project.entity";

export interface PermissionCheck {
    resource: string;
    action: string;
}

export interface UserPermission {
    userId: string;
    roles: string[];
    permissions: Array<{
        resource: string;
        action: string;
        name: string;
    }>;
    isAdmin: boolean;
}

export class PermissionService {

    async hasPermission(
        userId: string,
        resource: string,
        action: string,
        projectId?: string,
    ): Promise<boolean> {
        const isAdmin = await this.isAdmin(userId);
        if (isAdmin) {
            return true;
        }

        const userRoles = await this.getUserRoles(userId, projectId);
        if (userRoles.length === 0) {
            return false;
        }

        const roleIds = userRoles.map((ur: any) => ur.roleId);
        const rolePermissions = await AppDataSource.getRepository(RolePermission)
            .createQueryBuilder('rp')
            .innerJoin('rp.permission', 'p')
            .where('rp.roleId IN (:...roleIds)', { roleIds })
            .andWhere('p.resource = :resource', { resource })
            .andWhere('p.action = :action', { action })
            .getOne()

        return !!rolePermissions;
    }

    async hasAnyPermission(
        userId: string,
        permissions: PermissionCheck[],
        projectId?: string
    ): Promise<boolean> {

        for (const permission of permissions) {
            if (await this.hasPermission(userId, permission.resource, permission.action, projectId)) {
                return true;
            }
        }
        return false;
    }

    async hasAllPermissions(
        userId: string,
        permissions: PermissionCheck[],
        projectId?: string,
    ): Promise<boolean> {

        for (const permission of permissions) {
            if (!(await this.hasPermission(userId, permission.resource, permission.action, projectId))) {
                return false;
            }
        }

        return true;
    }

    async getUserPermission(userId: string, projectId?: string): Promise<UserPermission> {

        const userRoles = await this.getUserRoles(userId, projectId);
        const roleIds = userRoles.map((ur: any) => ur.roleId);

        const roles = await AppDataSource.getRepository(Role)
            .createQueryBuilder('r')
            .where('r.id IN (:...roles)', { roleIds })
            .getMany();

        const roleNames = roles.map((r: any) => r.name);
        const isAdmin = roleNames.includes('admin');

        const rolePermissions = await AppDataSource.getRepository(RolePermission)
            .createQueryBuilder('rp')
            .innerJoinAndSelect('rp.permission', 'p')
            .where('rp.roleId IN (:...roleIds)', { roleIds })
            .getMany()

        const permissions = rolePermissions.map((rp: any) => ({
            resource: rp.permission.resource,
            action: rp.permission.action,
            name: rp.permission.name,
        }));

        const uniquePermissions = permissions.filter(
            (p: any, index: number, self) =>
                index === self.findIndex((t: any) => t.resource === p.resource && t.action === p.action)
        );

        return {
            userId,
            roles: roleNames,
            permissions: uniquePermissions,
            isAdmin
        }
    }

    async isAdmin(userId: string): Promise<boolean> {

        const adminRole = await AppDataSource.getRepository(Role).findOne({
            where: { name: 'admin' }
        });
        if (!adminRole) {
            return false;
        }

        const userRole = await AppDataSource.getRepository(UserRole).findOne({
            where: {
                userId,
                roleId: adminRole.id,
                projectId: 'null'
            },
        });

        return !!userRole;
    }

    private async getUserRoles(userId: string, projectId?: string): Promise<UserRole[]> {
        const query = AppDataSource.getRepository(UserRole)
            .createQueryBuilder('ur')
            .where('ur.userId = :userId', { userId });

        if (projectId) {
            query.andWhere('(ur.projectId = :projectId OR ur.projectId IS NULL)', { projectId });
        } else {
            query.andWhere('ur.projectId IS NULL');
        }

        return query.getMany();
    }

    async isProjectOwner(userId: string, projectId: string): Promise<boolean> {
        const project = await AppDataSource.getRepository(Project).findOne({
            where: { id: projectId }
        });

        return project?.ownerId === userId;
    }

    async isProjectMember(userId: string, projectId: string): Promise<boolean> {
        const member = await AppDataSource.getRepository(ProjectMember).findOne({
            where: { userId, projectId }
        });

        return !!member;
    }

    async getProjectRole(userId: string, projectId: string): Promise<Role | null> {
        const projectMember = await AppDataSource.getRepository(ProjectMember)
            .createQueryBuilder('pm')
            .innerJoinAndSelect('pm.role', 'r')
            .where('pm.userId = :userId', { userId })
            .andWhere('pm.projectId = :projectId', { projectId })
            .getOne();

        return projectMember?.role || null;
    }
}

export const permissionService = new PermissionService();