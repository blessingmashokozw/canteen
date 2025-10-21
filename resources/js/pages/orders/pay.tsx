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
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h6a1 1 0 100-2H9z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">PayNow</h4>
                                        <p className="text-sm text-muted-foreground">Fast, secure payment gateway</p>
                                    </div>
                                </div>

                                {/* Payment Instructions */}
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</div>
                                        <p>Click "Complete Payment" to proceed to PayNow</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</div>
                                        <p>Choose your preferred payment method (Mobile Money, Card, etc.)</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">3</div>
                                        <p>Complete payment and wait for confirmation</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Placeholder */}
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <p className="text-gray-600 font-medium">Payment Page Loading</p>
                                <p className="text-sm text-gray-500 mt-1">You will be redirected to PayNow for payment</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handlePayment}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                                    </svg>
                                    Complete Payment (Demo)
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
