export interface CreateLinkRequest {
    originalUrl: string;
    customCode?: string;
}

export interface CreateLinkResponse {
    id: string;
    originalUrl: string;
    shortCode: string;
    shortUrl: string;
    clicks: number;
    createdAt: Date;
}

export interface LinkStats {
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: Date;
    updatedAt: Date;
}