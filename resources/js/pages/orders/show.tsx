import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';
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
import { CheckCircleIcon, BanknoteIcon, CreditCardIcon, Settings, Check, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import OrderItemAvailabilityModal from '@/components/order-item-availability-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
    {
        title: 'Order Details',
        href: '#',
    },
];

interface OrderShowProps {
    order: Order;
    flash?: {
        availability_success?: string;
        confirmation_success?: string;
        success?: string;
    };
}

export default function OrderShow({ order, flash }: OrderShowProps) {
    const { props } = usePage();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [availabilityModal, setAvailabilityModal] = useState<{
        isOpen: boolean;
        selectedItem: any;
    }>({
        isOpen: false,
        selectedItem: null,
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.availability_success) {
            setSuccessMessage(flash.availability_success);
            setTimeout(() => setSuccessMessage(null), 3000);
        }
        if (flash?.confirmation_success) {
            setSuccessMessage(flash.confirmation_success);
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    }, [flash?.availability_success, flash?.confirmation_success]);

    const handleAvailabilityConfirmation = (itemId: number, available: boolean) => {
        router.post(`/orders/${order.id}/items/${itemId}/confirm-availability`, {
            available,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Flash message will be handled by useEffect above
            },
            onError: () => {
                setSuccessMessage('Error updating availability');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        });
    };

    const handleConfirmOrder = () => {
        router.post(`/orders/${order.id}/confirm`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Flash message will be handled by useEffect above
            },
            onError: () => {
                setSuccessMessage('Error confirming order');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        });
    };

    const openAvailabilityModal = (item: any) => {
        setAvailabilityModal({
            isOpen: true,
            selectedItem: item,
        });
    };

    const closeAvailabilityModal = () => {
        setAvailabilityModal({
            isOpen: false,
            selectedItem: null,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order #${order.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-3xl mx-auto w-full space-y-4">
                    {/* Success Message Banner */}
                    {successMessage && (
                        <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-2 duration-300">
                            <Card className="border-green-200 bg-green-50 shadow-lg">
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircleIcon className="size-5 text-green-600 flex-shrink-0" />
                                        <p className="text-green-800 font-medium">{successMessage}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Success Message */}
                    <Card className="border-primary/50 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <CheckCircleIcon className="size-8 text-primary" />
                                <div>
                                    <h3 className="font-semibold text-lg">Order Placed Successfully!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your order has been received and is being processed.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Order #{order.id}</CardTitle>
                                    <CardDescription>
                                        Placed on {new Date(order.created_at).toLocaleString()}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant={order.status === 'confirmed' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'}
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
                                    {order.status === 'pending' && (
                                        <Button onClick={handleConfirmOrder} className="flex items-center gap-2">
                                            <Check className="size-4" />
                                            Confirm Order
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Payment Method */}
                            <div>
                                <h4 className="font-medium mb-2">Payment Method</h4>
                                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                                    {order.payment_method === 'CASH' ? (
                                        <>
                                            <BanknoteIcon className="size-5" />
                                            <span>Cash Payment</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCardIcon className="size-5" />
                                            <span>Online Payment</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Order Items Summary */}
                            <div className="bg-muted/30 border rounded-lg p-4">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Package className="size-4" />
                                    Order Summary
                                </h4>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Total Items Ordered</div>
                                        <div className="text-lg font-semibold">
                                            {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Available Items</div>
                                        <div className="text-lg font-semibold text-green-600">
                                            {order.order_items?.filter(item => item.is_available === true).reduce((sum, item) => sum + item.quantity, 0) || 0} items
                                        </div>
                                    </div>
                                    {order.order_items?.some(item => item.is_available === false) && (
                                        <div className="space-y-1 sm:col-span-2">
                                            <div className="text-sm text-muted-foreground">Unavailable Items</div>
                                            <div className="text-lg font-semibold text-red-600">
                                                {order.order_items?.filter(item => item.is_available === false).reduce((sum, item) => sum + item.quantity, 0) || 0} items
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-medium mb-3">Order Items</h4>
                                <div className="space-y-3">
                                    {order.order_items && order.order_items.length > 0 ? (
                                        order.order_items.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center justify-between p-4 border rounded-lg bg-card ${
                                                    item.is_available === false
                                                        ? 'border-red-200 bg-red-50/30'
                                                        : item.is_available === true
                                                        ? 'border-green-200 bg-green-50/30'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-medium">{item.meal?.name}</p>
                                                            <Badge
                                                                variant={item.is_available === false ? 'destructive' : item.is_available === true ? 'default' : 'secondary'}
                                                                className={item.is_available === false ? 'bg-red-100 text-red-800 hover:bg-red-100' : item.is_available === true ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                                                            >
                                                                {item.is_available === false ? 'Not Available' : item.is_available === true ? 'Available' : 'Unknown'}
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openAvailabilityModal(item)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Settings className="size-4" />
                                                            Manage Availability
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-muted-foreground">
                                                            ${item.price.toFixed(2)} × {item.quantity}
                                                        </p>
                                                        <p className="font-medium">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No items found in this order.</p>
                                            <p className="text-xs mt-2">Order items count: {order.order_items?.length || 0}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Special Instructions */}
                            {order.instructions && (
                                <div>
                                    <h4 className="font-medium mb-2">Special Instructions</h4>
                                    <p className="p-3 border rounded-lg bg-muted/50 text-sm">
                                        {order.instructions}
                                    </p>
                                </div>
                            )}

                            {/* Total */}
                            <div className="border-t pt-4 space-y-3">
                                {/* Available Items Total - What Client Pays (Most Important) */}
                                <div className="flex justify-between items-center text-2xl font-bold p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                    <span className="text-green-800">Amount to Pay:</span>
                                    <span className="text-green-800">
                                        ${(order.available_total || 0).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-medium">Total Order Amount:</span>
                                    <span className="text-xl font-semibold text-muted-foreground">
                                        ${(order.total || 0).toFixed(2)}
                                    </span>
                                </div>

                                {/* Show difference if there are unavailable items */}
                                {order.total !== order.available_total && (
                                    <div className="text-sm text-muted-foreground text-center p-2 bg-blue-50 border border-blue-200 rounded">
                                        💡 You save ${(order.total - order.available_total).toFixed(2)} from unavailable items
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button asChild className="flex-1">
                                    <Link href="/orders">View All Orders</Link>
                                </Button>
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href="/orders/create">Place New Order</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Availability Modal */}
            <OrderItemAvailabilityModal
                isOpen={availabilityModal.isOpen}
                onClose={closeAvailabilityModal}
                orderItem={availabilityModal.selectedItem}
                onAvailabilityChange={handleAvailabilityConfirmation}
            />
        </AppLayout>
    );
}
