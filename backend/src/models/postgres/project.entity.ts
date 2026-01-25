import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user_role.entity';
import { ProjectMember } from './project_member.entity';

@Entity('projects')
@Index('idx_projects_owner_id', ['ownerId'])
@Index('idx_projects_name', ['name'])
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'owner_id', type: 'uuid', nullable: false })
    ownerId: string;

    @ManyToOne(() => User, (user) => user.ownedProjects, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @OneToMany(() => UserRole, (userRole) => userRole.project)
    userRoles: UserRole[];

    @OneToMany(() => ProjectMember, (projectMember) => projectMember.project)
    projectMembers: ProjectMember[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
    updatedAt: Date;
}