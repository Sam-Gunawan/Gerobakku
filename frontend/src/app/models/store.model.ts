import { Menu } from "./menu.model";

export interface Store {
    storeId: string;
    vendorId: string;
    name: string;
    description: string;
    rating: number;
    category: string;
    address: string;
    isOpen: boolean;
    isHalal: boolean;
    openTime: string;
    closeTime: string;
    storeImageUrl: string;
    menu: Menu[];
}