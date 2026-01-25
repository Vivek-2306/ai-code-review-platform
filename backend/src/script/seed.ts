import { AppDataSource } from '../config/datasource';
import { User } from '../models/postgres/user.entity';
import { Role } from '../models/postgres/role.entity';
import { Permission } from '../models/postgres/permission.entity';
import { RolePermission } from '../models/postgres/role_permission.entity';
import { Project } from '../models/postgres/project.entity';
import bcrypt from 'bcrypt';

async function seedDatabase() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        console.log('🌱 Starting database seeding...');

        // Clear existing data (optional - only for development)
        if (process.env.NODE_ENV === 'development') {
            console.log('🗑️  Clearing existing data...');
            await AppDataSource.getRepository(RolePermission).delete({});
            await AppDataSource.getRepository(Permission).delete({});
            await AppDataSource.getRepository(Role).delete({});
            await AppDataSource.getRepository(Project).delete({});
            await AppDataSource.getRepository(User).delete({});
        }

        // Create Permissions
        console.log('📝 Creating permissions...');
        const permissions = [
            { name: 'View Project', resource: 'project', action: 'read' },
            { name: 'Create Project', resource: 'project', action: 'create' },
            { name: 'Update Project', resource: 'project', action: 'update' },
            { name: 'Delete Project', resource: 'project', action: 'delete' },
            { name: 'View Review', resource: 'review', action: 'read' },
            { name: 'Create Review', resource: 'review', action: 'create' },
            { name: 'Update Review', resource: 'review', action: 'update' },
            { name: 'Delete Review', resource: 'review', action: 'delete' },
            { name: 'Manage Users', resource: 'user', action: 'manage' },
            { name: 'Manage Roles', resource: 'role', action: 'manage' },
        ];

        const permissionEntities = await AppDataSource.getRepository(Permission).save(
            permissions.map((p) =>
                AppDataSource.getRepository(Permission).create(p)
            )
        );
        console.log(`✅ Created ${permissionEntities.length} permissions`);

        // Create Roles
        console.log('👥 Creating roles...');
        const roles = [
            {
                name: 'admin',
                description: 'Administrator with full access',
            },
            {
                name: 'developer',
                description: 'Developer with project access',
            },
            {
                name: 'reviewer',
                description: 'Code reviewer',
            },
            {
                name: 'viewer',
                description: 'Read-only access',
            },
        ];

        const roleEntities = await AppDataSource.getRepository(Role).save(
            roles.map((r) => AppDataSource.getRepository(Role).create(r))
        );
        console.log(`✅ Created ${roleEntities.length} roles`);

        // Assign permissions to roles
        console.log('🔗 Assigning permissions to roles...');
        const adminRole = roleEntities.find((r) => r.name === 'admin')!;
        const developerRole = roleEntities.find((r) => r.name === 'developer')!;
        const reviewerRole = roleEntities.find((r) => r.name === 'reviewer')!;
        const viewerRole = roleEntities.find((r) => r.name === 'viewer')!;

        // Admin gets all permissions
        const adminPermissions = permissionEntities.map((p) =>
            AppDataSource.getRepository(RolePermission).create({
                roleId: adminRole.id,
                permissionId: p.id,
            })
        );

        // Developer gets project and review permissions
        const developerPermissions = permissionEntities
            .filter((p) => p.resource === 'project' || p.resource === 'review')
            .map((p) =>
                AppDataSource.getRepository(RolePermission).create({
                    roleId: developerRole.id,
                    permissionId: p.id,
                })
            );

        // Reviewer gets review read/create/update
        const reviewerPermissions = permissionEntities
            .filter(
                (p) =>
                    p.resource === 'review' &&
                    (p.action === 'read' || p.action === 'create' || p.action === 'update')
            )
            .map((p) =>
                AppDataSource.getRepository(RolePermission).create({
                    roleId: reviewerRole.id,
                    permissionId: p.id,
                })
            );

        // Viewer gets read permissions
        const viewerPermissions = permissionEntities
            .filter((p) => p.action === 'read')
            .map((p) =>
                AppDataSource.getRepository(RolePermission).create({
                    roleId: viewerRole.id,
                    permissionId: p.id,
                })
            );

        await AppDataSource.getRepository(RolePermission).save([
            ...adminPermissions,
            ...developerPermissions,
            ...reviewerPermissions,
            ...viewerPermissions,
        ]);
        console.log('✅ Permissions assigned to roles');

        // Create default admin user
        console.log('👤 Creating default admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = AppDataSource.getRepository(User).create({
            email: 'admin@example.com',
            passwordHash: hashedPassword,
        });
        await AppDataSource.getRepository(User).save(adminUser);
        console.log('✅ Default admin user created (email: admin@example.com, password: admin123)');

        console.log('✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('✅ Seed script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seed script failed:', error);
            process.exit(1);
        });
}

export { seedDatabase };