import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Project } from './project.entity';

@Entity('user_roles')
@Index('idx_user_roles_user_id', ['userId'])
@Index('idx_user_roles_role_id', ['roleId'])
@Index('idx_user_roles_project_id', ['projectId'])
@Unique('UQ_user_roles_user_role_project', ['userId', 'roleId', 'projectId'])
export class UserRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    userId: string;

    @Column({ name: 'role_id', type: 'uuid', nullable: false })
    roleId: string;

    @Column({ name: 'project_id', type: 'uuid', nullable: true })
    projectId: string | null;

    @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => Project, (project) => project.userRoles, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'project_id' })
    project: Project | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
    updatedAt: Date;
}