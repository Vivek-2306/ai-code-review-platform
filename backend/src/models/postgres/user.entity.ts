import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { UserRole } from './user_role.entity';
import { ProjectMember } from './project_member.entity';

@Entity('users')
@Index('idx_users_email', ['email'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'email', type: 'varchar', length: 255, nullable: false, unique: true })
    email: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: false })
    passwordHash: string;

    @OneToMany(() => Project, (project) => project.owner)
    ownedProjects: Project[];

    @OneToMany(() => UserRole, (userRole) => userRole.user)
    userRoles: UserRole[];

    @OneToMany(() => ProjectMember, (projectMember) => projectMember.user)
    projectMembers: ProjectMember[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
    updatedAt: Date;
}