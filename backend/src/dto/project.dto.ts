export interface CreateProjectDto {
    name: string;
    description?: string;
}

export interface UpdateProjectDto {
    name?: string;
    description?: string;
}

export interface AddProjectMemberDto {
    userId: string;
    roleId: string;
}

export interface UpdateProjectMemberDto {
    roleId: string;
}

export interface ProjectResponse {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    owner: {
        id: string;
        email: string;
    };
    memberCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectMemberResponse {
    id: string;
    userId: string;
    projectId: string;
    roleId: string;
    user: {
        id: string;
        email: string;
    };
    role: {
        id: string;
        name: string;
        description: string | null;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectListResponse {
    projects: ProjectResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}