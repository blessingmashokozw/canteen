import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
    {
        title: 'Payment',
        href: '#',
    },
];

interface PaymentProps {
    order: Order;
    payment_method: string;
    amount: number;
    payment_url?: string;
    reference?: string;
}

export default function Payment({ order, payment_method, amount, payment_url, reference }: PaymentProps) {
    const handlePayment = () => {
        if (payment_url) {
            // Redirect to actual PayNow payment page
            window.location.href = payment_url;
        } else {
            // Fallback for demo purposes
            alert('Payment URL not available. This is a demo implementation.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Payment for Order #${order.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl mx-auto w-full space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                </svg>
                                PayNow Payment
                            </CardTitle>
                            <CardDescription>
                                Complete your payment securely with PayNow
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-muted/30 border rounded-lg p-4">
                                <h4 className="font-medium mb-3">Order Summary</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Order #</span>
                                        <span className="font-medium">#{order.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Items</span>
                                        <span className="font-medium">
                                            {order.order_items?.filter(item => item.is_available === true).length || 0} available items
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                                        <span>Total Amount</span>
                                        <span className="text-green-600">${amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                         

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handlePayment}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                                    </svg>
                                    Complete Payment
                                </Button>
                                <Button variant="outline" asChild className="flex-1">
                                    <Link href={`/orders/${order.id}`}>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>

                            <div className="text-xs text-muted-foreground text-center">
                                <p>🔒 Your payment information is secure and encrypted</p>
                                <p className="mt-1">Supported by major Singapore banks and digital wallets</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
