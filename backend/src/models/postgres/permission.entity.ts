import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    OneToMany,
} from 'typeorm';
import { RolePermission } from './role_permission.entity';

@Entity('permissions')
@Index('idx_permissions_resource_action', ['resource', 'action'])
@Index('idx_permissions_name', ['name'])
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
    name: string;

    @Column({ name: 'resource', type: 'varchar', length: 100, nullable: false })
    resource: string;

    @Column({ name: 'action', type: 'varchar', length: 100, nullable: false })
    action: string;

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
    rolePermissions: RolePermission[];
}