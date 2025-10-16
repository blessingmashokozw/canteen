import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Meal } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { useState } from 'react';
import { MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon, BanknoteIcon, CreditCardIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
    {
        title: 'Create Order',
        href: '/orders/create',
    },
];

interface OrderCreateProps {
    meals: Meal[];
}

interface OrderItem {
    meal_id: number;
    quantity: number;
}

export default function OrderCreate({ meals }: OrderCreateProps) {
    const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map());
    
    const { data, setData, post, processing, errors } = useForm({
        instructions: '',
        payment_method: '' as 'CASH' | 'ONLINE_PAYMENT' | '',
        items: [] as OrderItem[],
    });

    const addItem = (mealId: number) => {
        const newItems = new Map(selectedItems);
        newItems.set(mealId, (newItems.get(mealId) || 0) + 1);
        setSelectedItems(newItems);
        updateFormItems(newItems);
    };

    const removeItem = (mealId: number) => {
        const newItems = new Map(selectedItems);
        const currentQty = newItems.get(mealId) || 0;
        if (currentQty > 1) {
            newItems.set(mealId, currentQty - 1);
        } else {
            newItems.delete(mealId);
        }
        setSelectedItems(newItems);
        updateFormItems(newItems);
    };

    const deleteItem = (mealId: number) => {
        const newItems = new Map(selectedItems);
        newItems.delete(mealId);
        setSelectedItems(newItems);
        updateFormItems(newItems);
    };

    const updateFormItems = (items: Map<number, number>) => {
        const formItems: OrderItem[] = Array.from(items.entries()).map(([meal_id, quantity]) => ({
            meal_id,
            quantity,
        }));
        setData('items', formItems);
    };

    const calculateTotal = () => {
        let total = 0;
        selectedItems.forEach((quantity, mealId) => {
            const meal = meals.find(m => m.id === mealId);
            if (meal) {
                total += meal.price * quantity;
            }
        });
        return total;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/orders');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Available Meals */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Meals</CardTitle>
                            <CardDescription>
                                Select meals to add to your order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {meals.map((meal) => (
                                    <div
                                        key={meal.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">{meal.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                ${meal.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <Button
                                            type="button" 
                                            size="sm"
                                            onClick={() => addItem(meal.id)}
                                        >
                                           
                                             <PlusIcon className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Order</CardTitle>
                            <CardDescription>
                                Review and submit your order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {selectedItems.size === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ShoppingCartIcon className="size-12 mx-auto mb-2 opacity-50" />
                                        <p>No items selected</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {Array.from(selectedItems.entries()).map(([mealId, quantity]) => {
                                            const meal = meals.find(m => m.id === mealId);
                                            if (!meal) return null;
                                            return (
                                                <div
                                                    key={mealId}
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium">{meal.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            ${meal.price.toFixed(2)} × {quantity} = $
                                                            {(meal.price * quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeItem(mealId)}
                                                        >
                                                            <MinusIcon className="size-4" />
                                                        </Button>
                                                        <span className="w-8 text-center">{quantity}</span>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addItem(mealId)}
                                                        >
                                                            <PlusIcon className="size-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteItem(mealId)}
                                                        >
                                                            <TrashIcon className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {selectedItems.size > 0 && (
                                    <>
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center text-lg font-semibold">
                                                <span>Total:</span>
                                                <span>${calculateTotal().toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="instructions">
                                                Special Instructions (Optional)
                                            </Label>
                                            <Input
                                                id="instructions"
                                                value={data.instructions}
                                                onChange={(e) => setData('instructions', e.target.value)}
                                                placeholder="Any special requests?"
                                                maxLength={250}
                                            />
                                            <InputError message={errors.instructions} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Payment Method *</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('payment_method', 'CASH')}
                                                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                                                        data.payment_method === 'CASH'
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-border hover:border-primary/50'
                                                    }`}
                                                >
                                                    <BanknoteIcon className="size-8" />
                                                    <span className="font-medium">Cash</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('payment_method', 'ONLINE_PAYMENT')}
                                                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                                                        data.payment_method === 'ONLINE_PAYMENT'
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-border hover:border-primary/50'
                                                    }`}
                                                >
                                                    <CreditCardIcon className="size-8" />
                                                    <span className="font-medium">Online Payment</span>
                                                </button>
                                            </div>
                                            <InputError message={errors.payment_method} />
                                        </div>

                                        <InputError message={errors.items} />

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing || !data.payment_method}
                                        >
                                            {processing ? 'Placing Order...' : 'Place Order'}
                                        </Button>
                                    </>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
