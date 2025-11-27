export interface Vendor {
    vendorId: number;
    userId: number;
    fullName: string;
    ktpImageUrl: string;
    selfieImageUrl: string;
}

export interface VendorRegistrationData {
    user_id: number;
    store_name: string;
    store_description: string;
    category_id: number;
    address: string;
    is_halal: boolean;
    open_time: number;
    close_time: number;
}

export interface VendorRegistrationResponse {
    message: string;
    vendor_id: number;
    store_id: number;
}

export interface DashboardData {
    store: any;
    reviewStats: any;
}