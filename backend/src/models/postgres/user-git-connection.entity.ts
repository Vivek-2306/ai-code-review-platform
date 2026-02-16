import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { User } from './user.entity';

export type GitProvider = 'github' | 'gitlab' | 'bitbucket';

@Entity('user_git_connections')
@Unique('uq_user_git_connections_user_provider', ['userId', 'provider'])
export class UserGitConnection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'provider', type: 'varchar', length: 32 })
    provider: GitProvider;

    @Column({ name: 'access_token', type: 'text' })
    accessToken: string;

    @Column({ name: 'refresh_token', type: 'text', nullable: true })
    refreshToken: string | null;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
    updatedAt: Date;
}
