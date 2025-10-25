import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { type Payment } from '@/types';

interface PaymentsPageProps {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_payments: number;
        total_amount: number;
        paid_payments: number;
        pending_payments: number;
        failed_payments: number;
    };
    filters: {
        date_from?: string;
        date_to?: string;
        status?: string;
        payment_method?: string;
        amount_from?: string;
        amount_to?: string;
    };
}

export default function PaymentsIndex({ payments, stats, filters }: PaymentsPageProps) {
    const { url } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [paymentModal, setPaymentModal] = useState<{
        isOpen: boolean;
        payment: Payment | null;
    }>({ isOpen: false, payment: null });

    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            if (value) params.set(key, value as string);
        }

        window.location.href = `${url}?${params.toString()}`;
    };

    const clearFilters = () => {
        window.location.href = url.split('?')[0];
    };

    const openPaymentModal = (payment: Payment) => {
        setPaymentModal({ isOpen: true, payment });
    };

    const closePaymentModal = () => {
        setPaymentModal({ isOpen: false, payment: null });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'default';
            case 'pending': return 'secondary';
            case 'failed': return 'destructive';
            case 'cancelled': return 'outline';
            default: return 'secondary';
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Payments', href: '/payments' },
            ]}
        >
            <Head title="Payments" />

            <div className="space-y-6 p-4">
                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_payments}</div>
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
                            <CardTitle className="text-sm font-medium">Paid</CardTitle>
                            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.paid_payments}</div>
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
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_payments}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Failed</CardTitle>
                            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.failed_payments}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Toggle Button */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>

                    {Object.values(filters).some(filter => filter) && (
                        <Button variant="outline" onClick={clearFilters}>
                            Clear All Filters
                        </Button>
                    )}
                </div>

                {/* Filters - Hidden by default */}
                {showFilters && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>Filter payments by date, status, and amount</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleFilterSubmit} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_from">From Date</Label>
                                        <Input
                                            id="date_from"
                                            name="date_from"
                                            type="date"
                                            defaultValue={filters.date_from}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_to">To Date</Label>
                                        <Input
                                            id="date_to"
                                            name="date_to"
                                            type="date"
                                            defaultValue={filters.date_to}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select name="status" defaultValue={filters.status || "all"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">Payment Method</Label>
                                        <Select name="payment_method" defaultValue={filters.payment_method || "all"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Methods" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Methods</SelectItem>
                                                <SelectItem value="paynow">PayNow</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount_from">Amount From ($)</Label>
                                        <Input
                                            id="amount_from"
                                            name="amount_from"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            defaultValue={filters.amount_from}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount_to">Amount To ($)</Label>
                                        <Input
                                            id="amount_to"
                                            name="amount_to"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            defaultValue={filters.amount_to}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit">Apply Filters</Button>
                                    <Button type="button" variant="outline" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>
                            Showing {payments.data.length} of {payments.total} payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-2 text-left font-medium">Payment ID</th>
                                        <th className="p-2 text-left font-medium">Payment Reference</th>
                                        <th className="p-2 text-left font-medium">Order Code</th>
                                        <th className="p-2 text-left font-medium">Customer</th>
                                        <th className="p-2 text-left font-medium">Amount</th>
                                        <th className="p-2 text-left font-medium">Method</th>
                                        <th className="p-2 text-left font-medium">Status</th>
                                        <th className="p-2 text-left font-medium">Date</th>
                                        <th className="p-2 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="border-b hover:bg-muted/50 cursor-pointer"
                                            onClick={() => openPaymentModal(payment)}
                                        >
                                            <td className="p-2 font-mono text-xs">#{payment.id}</td>
                                            <td className="p-2 font-mono text-xs text-blue-600">
                                                {payment.hash || 'N/A'}
                                            </td>
                                            <td className="p-2 font-mono text-xs text-purple-600">
                                                {payment.order?.order_code || 'N/A'}
                                            </td>
                                            <td className="p-2">
                                                {payment.order?.user ? (
                                                    <div className="text-xs">
                                                        <div className="font-medium truncate max-w-24">{payment.order.user.name}</div>
                                                        <div className="text-muted-foreground truncate max-w-24">{payment.order.user.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-2 font-medium text-sm">${Number(payment.amount).toFixed(2)}</td>
                                            <td className="p-2 capitalize text-xs">{payment.payment_method}</td>
                                            <td className="p-2">
                                                <Badge variant={getStatusBadgeVariant(payment.status)} className="text-xs">
                                                    {payment.status}
                                                </Badge>
                                            </td>
                                            <td className="p-2 text-xs text-muted-foreground">
                                                <div>{new Date(payment.created_at).toLocaleDateString()}</div>
                                                {payment.paid_at && (
                                                    <div className="text-green-600">
                                                        Paid: {new Date(payment.paid_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openPaymentModal(payment);
                                                    }}
                                                    className="text-xs"
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {payments.last_page > 1 && (
                            <div className="flex items-center justify-between space-x-2 py-3">
                                <div className="text-xs text-muted-foreground">
                                    Showing {(payments.current_page - 1) * payments.per_page + 1} to{' '}
                                    {Math.min(payments.current_page * payments.per_page, payments.total)} of{' '}
                                    {payments.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {payments.current_page > 1 && (
                                        <Button variant="outline" size="sm">
                                            <a href={`${url}?page=${payments.current_page - 1}`} className="text-xs">Previous</a>
                                        </Button>
                                    )}
                                    {payments.current_page < payments.last_page && (
                                        <Button variant="outline" size="sm">
                                            <a href={`${url}?page=${payments.current_page + 1}`} className="text-xs">Next</a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Payment Details Modal */}
            <Dialog open={paymentModal.isOpen} onOpenChange={closePaymentModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Payment Details
                            <Badge variant={paymentModal.payment ? getStatusBadgeVariant(paymentModal.payment.status) : 'secondary'}>
                                {paymentModal.payment?.status}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            Complete information about this payment
                        </DialogDescription>
                    </DialogHeader>

                    {paymentModal.payment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Payment ID</Label>
                                    <div className="font-mono text-sm">#{paymentModal.payment.id}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Payment Reference</Label>
                                    <div className="font-mono text-sm text-blue-600">
                                        {paymentModal.payment.hash || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Order Code</Label>
                                    <div className="font-mono text-sm text-purple-600">
                                        {paymentModal.payment.order?.order_code || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                                    <div className="text-sm">
                                        {paymentModal.payment.order?.user ? (
                                            <div>
                                                <div className="font-medium">{paymentModal.payment.order.user.name}</div>
                                                <div className="text-muted-foreground">{paymentModal.payment.order.user.email}</div>
                                            </div>
                                        ) : (
                                            'N/A'
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                                    <div className="text-lg font-semibold">${Number(paymentModal.payment.amount).toFixed(2)}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Method</Label>
                                    <div className="text-sm capitalize">{paymentModal.payment.payment_method}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                    <div className="text-sm">{new Date(paymentModal.payment.created_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge variant={getStatusBadgeVariant(paymentModal.payment.status)} className="text-xs">
                                            {paymentModal.payment.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {paymentModal.payment.paid_at && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Paid At</Label>
                                    <div className="text-sm text-green-600">
                                        {new Date(paymentModal.payment.paid_at).toLocaleString()}
                                    </div>
                                </div>
                            )}

                            {paymentModal.payment.payment_url && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Payment URL</Label>
                                    <div className="text-xs font-mono text-blue-600 break-all">
                                        {paymentModal.payment.payment_url}
                                    </div>
                                </div>
                            )}

                            {paymentModal.payment.paynow_response && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">PayNow Response</Label>
                                    <div className="text-xs bg-muted p-2 rounded font-mono">
                                        <pre>{JSON.stringify(JSON.parse(paymentModal.payment.paynow_response), null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
