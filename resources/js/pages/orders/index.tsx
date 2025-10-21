import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import {
    PlusIcon,
    SearchIcon,
    FilterIcon,
    XIcon,
    BanknoteIcon,
    CreditCardIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon
} from 'lucide-react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
];

interface OrdersIndexProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    stats: {
        total_orders: number;
        pending_orders: number;
        confirmed_orders: number;
        preparing_orders: number;
        ready_orders: number;
        completed_orders: number;
        cancelled_orders: number;
        total_amount: number;
    };
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        payment_method?: string;
        status?: string;
    };
}

export default function OrdersIndex({ orders, stats, filters: initialFilters }: OrdersIndexProps) {
    const [search, setSearch] = useState(initialFilters.search || '');
    const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
    const [dateTo, setDateTo] = useState(initialFilters.date_to || '');
    const [paymentMethod, setPaymentMethod] = useState(initialFilters.payment_method || '');
    const [status, setStatus] = useState(initialFilters.status || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setSearch(initialFilters.search || '');
        setDateFrom(initialFilters.date_from || '');
        setDateTo(initialFilters.date_to || '');
        setPaymentMethod(initialFilters.payment_method || '');
        setStatus(initialFilters.status || '');
    }, [initialFilters]);

    const handleFilter = () => {
        router.get('/orders', {
            search,
            date_from: dateFrom,
            date_to: dateTo,
            payment_method: paymentMethod,
            status: status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setPaymentMethod('');
        setStatus('');
        router.get('/orders', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = search || dateFrom || dateTo || paymentMethod || status;

    const calculateTotal = (order: Order) => {
        return order.order_items?.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0) || 0;
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_orders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${Number(stats.total_amount).toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_orders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.confirmed_orders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Preparing</CardTitle>
                            <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.preparing_orders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ready</CardTitle>
                            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.ready_orders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed_orders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.cancelled_orders}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Orders</CardTitle>
                                <CardDescription>
                                    View and manage all your orders
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/orders/create">
                                    <PlusIcon className="size-4 mr-2" />
                                    New Order
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FilterIcon className="size-4 mr-2" />
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </Button>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                    >
                                        <XIcon className="size-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            {showFilters && (
                                <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        {/* Search */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="search">Search</Label>
                                            <div className="relative">
                                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="search"
                                                    placeholder="Search orders..."
                                                    className="pl-10"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Date From */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="date_from">From Date</Label>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="date_from"
                                                    type="date"
                                                    className="pl-10"
                                                    value={dateFrom}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Date To */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="date_to">To Date</Label>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="date_to"
                                                    type="date"
                                                    className="pl-10"
                                                    value={dateTo}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="grid gap-2">
                                            <Label>Payment Method</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            >
                                                <option value="">All Methods</option>
                                                <option value="CASH">Cash</option>
                                                <option value="ONLINE_PAYMENT">Online Payment</option>
                                            </select>
                                        </div>

                                        {/* Status */}
                                        <div className="grid gap-2">
                                            <Label>Status</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="preparing">Preparing</option>
                                                <option value="ready">Ready</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleFilter}>Apply Filters</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Orders Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                No orders found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.data.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">#{order.id}</TableCell>
                                                <TableCell>
                                                    <div>{formatDate(order.created_at)}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(order.created_at).toLocaleTimeString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0">
                                                            {/* User Avatar */}
                                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                                {(order.user?.name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{order.user?.name || 'Unknown'}</div>
                                                            <div className="text-sm text-muted-foreground">{order.user?.email || ''}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {order.order_items?.length} item
                                                    {order.order_items?.length !== 1 ? 's' : ''}
                                                </TableCell>
                                                <TableCell>
                                                    ${calculateTotal(order).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            order.status === 'confirmed'
                                                                ? 'default'
                                                                : order.status === 'pending'
                                                                ? 'secondary'
                                                                : 'outline'
                                                        }
                                                        className={
                                                            order.status === 'confirmed'
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                                : order.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                                                : ''
                                                        }
                                                    >
                                                        {order.status === 'confirmed' ? 'Confirmed' : order.status === 'pending' ? 'Pending' : order.status || 'Unknown'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            order.payment_method === 'CASH'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="capitalize"
                                                    >
                                                        {order.payment_method === 'CASH' ? (
                                                            <BanknoteIcon className="mr-1 h-3 w-3" />
                                                        ) : (
                                                            <CreditCardIcon className="mr-1 h-3 w-3" />
                                                        )}
                                                        {order.payment_method.toLowerCase().replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link href={`/orders/${order.id}`}>
                                                            <EyeIcon /> View Order
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex items-center justify-between px-2">
                                <div className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium">{(orders.current_page - 1) * orders.per_page + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(orders.current_page * orders.per_page, orders.total)}
                                    </span>{' '}
                                    of <span className="font-medium">{orders.total}</span> orders
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(orders.links[0]?.url || '')}
                                        disabled={!orders.links[0]?.url}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(orders.links[orders.links.length - 1]?.url || '')}
                                        disabled={!orders.links[orders.links.length - 1]?.url}
                                    >
                                        Next
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
