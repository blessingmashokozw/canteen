import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Meal {
    id: number;
    name: string;
    price: number;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    meal_id: number;
    status_id: number;
    price: number;
    quantity: number;
    meal?: Meal;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: number;
    user_id: number;
    instructions: string | null;
    payment_method: 'CASH' | 'ONLINE_PAYMENT';
    user?: User;
    order_items?: OrderItem[];
    total?: number;
    created_at: string;
    updated_at: string;
}
