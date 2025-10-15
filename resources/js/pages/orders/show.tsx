import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, BanknoteIcon, CreditCardIcon } from 'lucide-react';

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
}

export default function OrderShow({ order }: OrderShowProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order #${order.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-3xl mx-auto w-full space-y-4">
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
                                <Badge variant="secondary" className="text-sm">
                                    Processing
                                </Badge>
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

                            {/* Order Items */}
                            <div>
                                <h4 className="font-medium mb-3">Order Items</h4>
                                <div className="space-y-2">
                                    {order.order_items && order.order_items.length > 0 ? (
                                        order.order_items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{item.meal?.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ${item.price.toFixed(2)} × {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="font-medium">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
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
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>Total Amount:</span>
                                    <span className="text-2xl">${(order.total || 0).toFixed(2)}</span>
                                </div>
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
        </AppLayout>
    );
}
