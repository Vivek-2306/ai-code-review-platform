import {
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
@Index('idx_role_permissions_role_id', ['roleId'])
@Index('idx_role_permissions_permission_id', ['permissionId'])
export class RolePermission {
    @PrimaryColumn({ name: 'role_id', type: 'uuid' })
    roleId: string;

    @PrimaryColumn({ name: 'permission_id', type: 'uuid' })
    permissionId: string;

    @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
    createdAt: Date;
}
