import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    UsersIcon,
    ShieldIcon,
    ChefHatIcon,
    UserIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    SearchIcon,
    MoreHorizontalIcon,
    EyeIcon,
} from 'lucide-react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    orders_count?: number;
}

interface UsersIndexProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_users: number;
        admin_users: number;
        kitchen_users: number;
        customer_users: number;
        verified_users: number;
        unverified_users: number;
    };
    filters: {
        search?: string;
        role?: string;
        verified?: string;
    };
}

export default function UsersIndex({ users, stats, filters }: UsersIndexProps) {
    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Administrator</Badge>;
            case 'kitchen':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Kitchen Staff</Badge>;
            case 'customer':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Customer</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const getVerificationBadge = (user: User) => {
        if (user.email_verified_at) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
        } else {
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Unverified</Badge>;
        }
    };

    const getUserStatusIcon = (user: User) => {
        if (user.email_verified_at) {
            return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
        } else {
            return <AlertCircleIcon className="w-4 h-4 text-red-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-7xl mx-auto w-full space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Users</h1>
                            <p className="text-muted-foreground">
                                Manage system users and their accounts
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_users}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                                <ShieldIcon className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.admin_users}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Kitchen Staff</CardTitle>
                                <ChefHatIcon className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.kitchen_users}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                                <UserIcon className="h-4 w-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-600">{stats.customer_users}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Search by name or email..."
                                            value={filters.search || ''}
                                            onChange={(e) => {
                                                router.get('/users', {
                                                    ...filters,
                                                    search: e.target.value || undefined,
                                                }, { preserveState: true });
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={filters.role || 'all'}
                                        onValueChange={(value) => {
                                            router.get('/users', {
                                                ...filters,
                                                role: value === 'all' ? undefined : value,
                                            }, { preserveState: true });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All roles</SelectItem>
                                            <SelectItem value="admin">Administrators</SelectItem>
                                            <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                                            <SelectItem value="customer">Customers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                            <CardDescription>
                                Showing {users.total} users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                        <span className="text-sm font-medium text-primary">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {getRoleBadge(user.role)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getUserStatusIcon(user)}
                                                    {getVerificationBadge(user)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.orders_count || 0} orders
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(user.created_at), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontalIcon className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/users/${user.id}`}>
                                                                <EyeIcon className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {users.last_page > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {((users.current_page - 1) * users.per_page) + 1} to{' '}
                                        {Math.min(users.current_page * users.per_page, users.total)} of{' '}
                                        {users.total} results
                                    </p>
                                    <div className="flex gap-2">
                                        {users.current_page > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get('/users', {
                                                    ...filters,
                                                    page: users.current_page - 1,
                                                })}
                                            >
                                                Previous
                                            </Button>
                                        )}
                                        {users.current_page < users.last_page && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get('/users', {
                                                    ...filters,
                                                    page: users.current_page + 1,
                                                })}
                                            >
                                                Next
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
