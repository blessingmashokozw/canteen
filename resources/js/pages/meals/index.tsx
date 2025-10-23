import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Meal } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangleIcon,
    PackageIcon,
    PencilIcon,
    PlusIcon,
    TrendingUpIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meals',
        href: '/meals',
    },
];

interface MealsIndexProps {
    meals: Meal[];
}

// Create Meal Modal Component
function AddMealModal() {
    const [showModal, setShowModal] = useState(false);
    const form = useForm({
        name: '',
        price: '',
    });

    const handleSubmit = () => {
        form.post('/meals', {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
            },
        });
    };

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Meal
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Meal</DialogTitle>
                    <DialogDescription>
                        Create a new meal with name and price.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Meal Name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="Enter meal name"
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.data.price}
                            onChange={(e) => form.setData('price', e.target.value)}
                            placeholder="0.00"
                        />
                        <InputError message={form.errors.price} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={form.processing}>
                        Create Meal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Update Price Modal Component
function UpdatePriceModal({ meal }: { meal: Meal }) {
    const [showModal, setShowModal] = useState(false);
    const form = useForm({
        price: meal.price.toString(),
    });

    const handleSubmit = () => {
        form.patch(`/meals/${meal.id}/price`, {
            onSuccess: () => setShowModal(false),
        });
    };

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <PencilIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Price</DialogTitle>
                    <DialogDescription>
                        Update the price for {meal.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="price">New Price ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.data.price}
                            onChange={(e) => form.setData('price', e.target.value)}
                        />
                        <InputError message={form.errors.price} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={form.processing}>
                        Update Price
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Update Stock Modal Component
function UpdateStockModal({ meal }: { meal: Meal }) {
    const [showModal, setShowModal] = useState(false);
    const form = useForm({
        stock_quantity: (meal.stock_quantity || 0).toString(),
        low_stock_threshold: (meal.low_stock_threshold || 5).toString(),
    });

    const handleSubmit = () => {
        form.patch(`/meals/${meal.id}/stock`, {
            onSuccess: () => setShowModal(false),
        });
    };

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <PackageIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Stock</DialogTitle>
                    <DialogDescription>
                        Update stock levels for {meal.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="stock_quantity">Stock Quantity</Label>
                        <Input
                            id="stock_quantity"
                            type="number"
                            min="0"
                            value={form.data.stock_quantity}
                            onChange={(e) => form.setData('stock_quantity', e.target.value)}
                        />
                        <InputError message={form.errors.stock_quantity} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                        <Input
                            id="low_stock_threshold"
                            type="number"
                            min="0"
                            value={form.data.low_stock_threshold}
                            onChange={(e) => form.setData('low_stock_threshold', e.target.value)}
                        />
                        <InputError message={form.errors.low_stock_threshold} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={form.processing}>
                        Update Stock
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Add Stock Modal Component
function AddStockModal({ meal }: { meal: Meal }) {
    const [showModal, setShowModal] = useState(false);
    const form = useForm({
        quantity: '1',
    });

    const handleSubmit = () => {
        form.post(`/meals/${meal.id}/add-stock`, {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
            },
        });
    };

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <TrendingUpIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Stock</DialogTitle>
                    <DialogDescription>
                        Add stock to {meal.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity to Add</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={form.data.quantity}
                            onChange={(e) => form.setData('quantity', e.target.value)}
                        />
                        <InputError message={form.errors.quantity} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={form.processing}>
                        Add Stock
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function MealsIndex({ meals }: MealsIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Available Meals" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Available Meals</CardTitle>
                                <CardDescription>
                                    Browse our selection of delicious meals
                                </CardDescription>
                            </div>
                            <AddMealModal />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Price ($)</TableHead>
                                    <TableHead className="text-center">Stock Status</TableHead>
                                    <TableHead className="text-right">Stock Level</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {meals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No meals available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    meals.map((meal) => (
                                        <TableRow key={meal.id}>
                                            <TableCell className="font-medium">{meal.name}</TableCell>
                                            <TableCell className="text-right font-bold">
                                                ${meal.price.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        (meal.stock_quantity || 0) <= 0 ? 'destructive' :
                                                        (meal.stock_quantity || 0) <= (meal.low_stock_threshold || 5) ? 'default' :
                                                        'secondary'
                                                    }
                                                >
                                                    {(meal.stock_quantity || 0) <= 0 ? 'Out of Stock' :
                                                     (meal.stock_quantity || 0) <= (meal.low_stock_threshold || 5) ? 'Low Stock' :
                                                     'In Stock'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {meal.stock_quantity || 0} units
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(`/meals/${meal.id}/ingredients`)}
                                                    >
                                                        <PackageIcon className="h-4 w-4 mr-1" />
                                                        Ingredients
                                                    </Button>
                                                    <UpdatePriceModal meal={meal} />
                                                    <UpdateStockModal meal={meal} />
                                                    <AddStockModal meal={meal} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}