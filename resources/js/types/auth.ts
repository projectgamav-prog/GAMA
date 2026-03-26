export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    can_access_admin_context?: boolean;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type AdminContext = {
    canAccess: boolean;
    isVisible: boolean;
    visibilityUrl: string;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
