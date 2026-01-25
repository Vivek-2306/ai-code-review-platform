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
import { Project } from './project.entity';
import { Role } from './role.entity';

@Entity('project_members')
@Index('idx_project_members_user_id', ['userId'])
@Index('idx_project_members_project_id', ['projectId'])
@Index('idx_project_members_role_id', ['roleId'])
@Unique('UQ_project_members_user_project_role', ['userId', 'projectId', 'roleId'])
export class ProjectMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    userId: string;

    @Column({ name: 'project_id', type: 'uuid', nullable: false })
    projectId: string;

    @Column({ name: 'role_id', type: 'uuid', nullable: false })
    roleId: string;

    @ManyToOne(() => User, (user) => user.projectMembers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Project, (project) => project.projectMembers, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @ManyToOne(() => Role, (role) => role.projectMembers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
    updatedAt: Date;
}