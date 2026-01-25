import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    OneToMany,
} from 'typeorm';
import { UserRole } from './user_role.entity';
import { RolePermission } from './role_permission.entity';
import { ProjectMember } from './project_member.entity';

@Entity('roles')
@Index('idx_roles_name', ['name'])
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', type: 'varchar', length: 100, nullable: false, unique: true })
    name: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @OneToMany(() => UserRole, (userRole) => userRole.role)
    userRoles: UserRole[];

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
    rolePermissions: RolePermission[];

    @OneToMany(() => ProjectMember, (projectMember) => projectMember.role)
    projectMembers: ProjectMember[];
}