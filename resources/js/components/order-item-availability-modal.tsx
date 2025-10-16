import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number;
    meal?: {
        name: string;
    };
    is_available?: boolean;
    price: number;
    quantity: number;
}

interface OrderItemAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderItem: OrderItem | null;
    onAvailabilityChange: (itemId: number, available: boolean) => void;
}

export default function OrderItemAvailabilityModal({
    isOpen,
    onClose,
    orderItem,
    onAvailabilityChange,
}: OrderItemAvailabilityModalProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    if (!orderItem) return null;

    const handleAvailabilityChange = async (available: boolean) => {
        setIsUpdating(true);
        try {
            await onAvailabilityChange(orderItem.id, available);
            onClose();
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {orderItem.meal?.name}
                        <Badge
                            variant={orderItem.is_available === false ? 'destructive' : orderItem.is_available === true ? 'default' : 'secondary'}
                            className={orderItem.is_available === false ? 'bg-red-100 text-red-800' : orderItem.is_available === true ? 'bg-green-100 text-green-800' : ''}
                        >
                            {orderItem.is_available === false ? 'Not Available' : orderItem.is_available === true ? 'Available' : 'Unknown'}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Manage the availability status for this order item. This helps track which items are ready for pickup.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Item Details */}
                    <div className="rounded-lg border p-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Item:</span>
                            <span className="text-sm">{orderItem.meal?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Quantity:</span>
                            <span className="text-sm">{orderItem.quantity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Price per item:</span>
                            <span className="text-sm">${orderItem.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total:</span>
                            <span className="text-sm font-semibold">${(orderItem.price * orderItem.quantity).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                        {orderItem.is_available === true ? (
                            <>
                                <CheckCircleIcon className="size-5 text-green-600" />
                                <span className="text-sm font-medium text-green-800">This item is currently marked as available</span>
                            </>
                        ) : orderItem.is_available === false ? (
                            <>
                                <XCircleIcon className="size-5 text-red-600" />
                                <span className="text-sm font-medium text-red-800">This item is currently marked as not available</span>
                            </>
                        ) : (
                            <>
                                <div className="size-5 rounded-full bg-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Availability status is unknown</span>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                            onClick={() => handleAvailabilityChange(true)}
                            disabled={isUpdating}
                        >
                            <CheckCircleIcon className="size-4 mr-2" />
                            Mark as Available
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleAvailabilityChange(false)}
                            disabled={isUpdating}
                        >
                            <XCircleIcon className="size-4 mr-2" />
                            Mark as Not Available
                        </Button>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={onClose} disabled={isUpdating}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
