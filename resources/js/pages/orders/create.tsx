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
import { MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon, BanknoteIcon, CreditCardIcon, ChefHatIcon, CheckIcon, SearchIcon } from 'lucide-react';

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
    const [animatingItems, setAnimatingItems] = useState<Set<number>>(new Set());
    const [cartAnimation, setCartAnimation] = useState(false);
    const [showNotification, setShowNotification] = useState<{id: number, name: string} | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [outOfStockNotification, setOutOfStockNotification] = useState<{meal: any} | null>(null);
    
    const { data, setData, post, processing, errors } = useForm({
        instructions: '',
        payment_method: '' as 'CASH' | 'ONLINE_PAYMENT' | '',
        items: [] as OrderItem[],
    });

    const addItem = (mealId: number) => {
        const newItems = new Map(selectedItems);
        const meal = meals.find(m => m.id === mealId);
        newItems.set(mealId, (newItems.get(mealId) || 0) + 1);
        setSelectedItems(newItems);
        updateFormItems(newItems);

        // Trigger animations and notification
        setAnimatingItems(prev => new Set(prev).add(mealId));
        setCartAnimation(true);

        if (meal) {
            setShowNotification({ id: mealId, name: meal.name });
            setTimeout(() => setShowNotification(null), 2000);
        }

        // Clear animations after delay
        setTimeout(() => {
            setAnimatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(mealId);
                return newSet;
            });
        }, 600);

        setTimeout(() => {
            setCartAnimation(false);
        }, 400);
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
            <div className="flex h-full flex-1 flex-col gap-4 p-4 relative">
                {/* Notification */}
                {showNotification && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                            <CheckIcon className="size-4" />
                            <span className="font-medium">{showNotification.name} added to cart!</span>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Available Meals */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ChefHatIcon className="size-5" />
                                Available Meals
                            </CardTitle>
                            <CardDescription>
                                Browse our delicious meals and add them to your order
                                {searchTerm && (
                                    <span className="ml-2 text-sm">
                                        • {meals.filter((meal) =>
                                            searchTerm === '' ||
                                            meal.name.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).length} meal{meals.filter((meal) =>
                                            searchTerm === '' ||
                                            meal.name.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).length !== 1 ? 's' : ''} found
                                    </span>
                                )}
                            </CardDescription>

                            {/* Search Input */}
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                                <Input
                                    type="text"
                                    placeholder="Search meals by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {meals
                                    .filter((meal) =>
                                        searchTerm === '' ||
                                        meal.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((meal) => (
                                    <div
                                        key={meal.id}
                                        className={`group relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 ${
                                            animatingItems.has(meal.id)
                                                ? 'ring-2 ring-green-400 ring-offset-2 shadow-green-200 shadow-lg scale-105 animate-pulse'
                                                : ''
                                        }`}
                                    >
                                        <div className="aspect-[4/3] overflow-hidden">
                                            {meal.image ? (
                                                <img
                                                    src={`/${meal.image}`}
                                                    alt={meal.name}
                                                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                                        const fallback = (e.currentTarget.nextElementSibling as HTMLElement);
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`h-full w-full flex items-center justify-center text-muted-foreground bg-muted/50 ${meal.image ? 'hidden' : ''}`}>
                                                <div className="text-center">
                                                    <ChefHatIcon className="size-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm font-medium">No Image</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="mb-4">
                                                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{meal.name}</h3>
                                                <span className="text-2xl font-bold text-primary">
                                                    ${meal.price.toFixed(2)}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => addItem(meal.id)}
                                                className={`w-full shadow-sm hover:shadow-md transition-all duration-200 ${
                                                    animatingItems.has(meal.id)
                                                        ? 'bg-green-500 hover:bg-green-600 text-white animate-bounce'
                                                        : 'bg-primary hover:bg-primary/90'
                                                }`}
                                                disabled={animatingItems.has(meal.id)}
                                            >
                                                {animatingItems.has(meal.id) ? (
                                                    <>
                                                        <CheckIcon className="size-4 mr-1" />
                                                        Added!
                                                    </>
                                                ) : (
                                                    <>
                                                        <PlusIcon className="size-4 mr-1" />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                    </div>
                                ))}

                                {/* No Results Message */}
                                {meals.filter((meal) =>
                                    searchTerm === '' ||
                                    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
                                ).length === 0 && searchTerm !== '' && (
                                    <div className="col-span-full text-center py-12 text-muted-foreground">
                                        <SearchIcon className="size-12 mx-auto mb-4 opacity-50" />
                                        <p className="font-medium text-lg">No meals found</p>
                                        <p className="text-sm">Try searching with different keywords</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card className={`lg:col-span-2 transition-all duration-300 ${cartAnimation ? 'ring-2 ring-green-400 ring-offset-2 shadow-green-200 shadow-lg' : ''}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCartIcon className={`size-5 transition-all duration-300 ${cartAnimation ? 'text-green-500 animate-bounce' : ''}`} />
                                Your Order
                            </CardTitle>
                            <CardDescription>
                                Review your selected items and complete your order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {selectedItems.size === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                            <ShoppingCartIcon className="size-8 opacity-50" />
                                        </div>
                                        <p className="font-medium">Your cart is empty</p>
                                        <p className="text-sm">Add some delicious meals to get started!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {Array.from(selectedItems.entries()).map(([mealId, quantity]) => {
                                            const meal = meals.find(m => m.id === mealId);
                                            if (!meal) return null;
                                            return (
                                                <div
                                                    key={mealId}
                                                    className={`flex items-center gap-3 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-all duration-300 ${
                                                        animatingItems.has(mealId)
                                                            ? 'bg-green-50 border-green-200 shadow-sm scale-[1.02]'
                                                            : 'hover:bg-muted/30'
                                                    }`}
                                                >
                                                    <div className="flex-shrink-0">
                                                        {meal.image ? (
                                                            <img
                                                                src={`/${meal.image}`}
                                                                alt={meal.name}
                                                                className="w-14 h-14 object-cover rounded-lg"
                                                                onError={(e) => {
                                                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                                                    const fallback = (e.currentTarget.nextElementSibling as HTMLElement);
                                                                    if (fallback) fallback.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs ${meal.image ? 'hidden' : ''}`}>
                                                            <ChefHatIcon className="size-4" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{meal.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm text-muted-foreground">
                                                                ${meal.price.toFixed(2)} each
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">×</span>
                                                            <span className="text-sm font-medium">{quantity}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-primary">
                                                            ${(meal.price * quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeItem(mealId)}
                                                        >
                                                            <MinusIcon className="size-4" />
                                                        </Button>
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
                                            <div className={`flex justify-between items-center text-lg font-semibold transition-all duration-300 ${cartAnimation ? 'text-green-600 scale-105' : ''}`}>
                                                <span>Total:</span>
                                                <span className={`transition-all duration-300 ${cartAnimation ? 'text-green-600' : ''}`}>
                                                    ${calculateTotal().toFixed(2)}
                                                </span>
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
