import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Ingredient } from '@/types';
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
    AlertCircleIcon,
    CheckCircleIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ingredients',
        href: '/ingredients',
    },
];

interface IngredientsIndexProps {
    ingredients: Ingredient[];
    lowStockIngredients: Ingredient[];
    outOfStockIngredients: Ingredient[];
}

// Create Ingredient Modal Component
function AddIngredientModal() {
    const [showModal, setShowModal] = useState(false);
    const form = useForm({
        name: '',
        unit: '',
        stock_quantity: '',
        low_stock_threshold: '5',
    });

    const handleSubmit = () => {
        form.post('/ingredients', {
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
                    Add Ingredient
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Ingredient</DialogTitle>
                    <DialogDescription>
                        Create a new ingredient with initial stock levels.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Ingredient Name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="e.g., Chicken Breast"
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="unit">Unit of Measurement</Label>
                        <select
                            id="unit"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={form.data.unit}
                            onChange={(e) => form.setData('unit', e.target.value)}
                        >
                            <option value="">Select unit...</option>
                            <option value="pieces">Pieces</option>
                            <option value="kg">Kilograms (kg)</option>
                            <option value="grams">Grams (g)</option>
                            <option value="liters">Liters (L)</option>
                            <option value="ml">Milliliters (ml)</option>
                            <option value="cups">Cups</option>
                            <option value="tbsp">Tablespoons</option>
                            <option value="tsp">Teaspoons</option>
                            <option value="heads">Heads</option>
                            <option value="loaves">Loaves</option>
                        </select>
                        <InputError message={form.errors.unit} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stock_quantity">Initial Stock Quantity</Label>
                        <Input
                            id="stock_quantity"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.data.stock_quantity}
                            onChange={(e) => form.setData('stock_quantity', e.target.value)}
                            placeholder="0.00"
                        />
                        <InputError message={form.errors.stock_quantity} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                        <Input
                            id="low_stock_threshold"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.data.low_stock_threshold}
                            onChange={(e) => form.setData('low_stock_threshold', e.target.value)}
                            placeholder="5"
                        />
                        <InputError message={form.errors.low_stock_threshold} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={form.processing}>
                        Create Ingredient
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Update Stock Modal Component
function UpdateStockModal({ ingredient }: { ingredient: Ingredient }) {
    const [showModal, setShowModal] = useState(false);
    const form = useForm({
        stock_quantity: Number(ingredient.stock_quantity).toString(),
        low_stock_threshold: Number(ingredient.low_stock_threshold).toString(),
    });

    const handleSubmit = () => {
        form.patch(`/ingredients/${ingredient.id}/stock`, {
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
                    <DialogTitle>Update Stock</DialogTitle>
                    <DialogDescription>
                        Update stock levels for {ingredient.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="stock_quantity">Current Stock ({ingredient.unit})</Label>
                        <Input
                            id="stock_quantity"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.data.stock_quantity}
                            onChange={(e) => form.setData('stock_quantity', e.target.value)}
                        />
                        <InputError message={form.errors.stock_quantity} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="low_stock_threshold">Low Stock Threshold ({ingredient.unit})</Label>
                        <Input
                            id="low_stock_threshold"
                            type="number"
                            min="0"
                            step="0.01"
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
function AddStockModal({ ingredient }: { ingredient: Ingredient }) {
    const [showModal, setShowModal] = useState(false);
    const form = useForm({
        quantity: '1',
    });

    const handleSubmit = () => {
        form.post(`/ingredients/${ingredient.id}/add-stock`, {
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
                        Add stock to {ingredient.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity to Add ({ingredient.unit})</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0.01"
                            step="0.01"
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

export default function IngredientsIndex({ ingredients, lowStockIngredients, outOfStockIngredients }: IngredientsIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ingredients Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Ingredients Management</h1>
                        <p className="text-muted-foreground">
                            Monitor and manage ingredient stock levels across all meals.
                        </p>
                    </div>
                    <AddIngredientModal />
                </div>

                <div className="grid gap-4">
                    {/* Stock Status Overview */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
                                <PackageIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{ingredients.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active ingredients in system
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                                <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{lowStockIngredients.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Need restocking soon
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                                <AlertCircleIcon className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{outOfStockIngredients.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Require immediate attention
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Ingredients Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PackageIcon className="h-5 w-5" />
                                All Ingredients
                            </CardTitle>
                            <CardDescription>
                                Complete overview of all ingredients and their current stock levels.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ingredient</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead className="text-right">Current Stock</TableHead>
                                        <TableHead className="text-right">Low Stock Threshold</TableHead>
                                        <TableHead className="text-center">Stock Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ingredients.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                No ingredients found. Add your first ingredient to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ingredients.map((ingredient) => (
                                            <TableRow key={ingredient.id}>
                                                <TableCell className="font-medium">
                                                    {ingredient.name}
                                                </TableCell>
                                                <TableCell>{ingredient.unit}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    <span className={`font-medium ${
                                                        Number(ingredient.stock_quantity) <= 0 ? 'text-red-600' :
                                                        Number(ingredient.stock_quantity) <= Number(ingredient.low_stock_threshold) ? 'text-yellow-600' :
                                                        'text-green-600'
                                                    }`}>
                                                        {Number(ingredient.stock_quantity).toFixed(3)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {Number(ingredient.low_stock_threshold).toFixed(3)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={(ingredient.getStockBadgeVariant?.() as any) || 'secondary'}>
                                                        {ingredient.getStockStatus?.() || 'Unknown'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <UpdateStockModal ingredient={ingredient} />
                                                        <AddStockModal ingredient={ingredient} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Low Stock Alert */}
                    {lowStockIngredients.length > 0 && (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-800">
                                    <AlertTriangleIcon className="h-5 w-5" />
                                    Low Stock Alert
                                </CardTitle>
                                <CardDescription className="text-yellow-700">
                                    These ingredients are running low and may need restocking soon.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    {lowStockIngredients.map((ingredient) => (
                                        <div key={ingredient.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
                                                <span className="font-medium">{ingredient.name}</span>
                                                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                                                    {Number(ingredient.stock_quantity).toFixed(3)} {ingredient.unit} remaining
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <UpdateStockModal ingredient={ingredient} />
                                                <AddStockModal ingredient={ingredient} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Out of Stock Alert */}
                    {outOfStockIngredients.length > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-800">
                                    <AlertCircleIcon className="h-5 w-5" />
                                    Out of Stock Alert
                                </CardTitle>
                                <CardDescription className="text-red-700">
                                    These ingredients are completely out of stock and need immediate restocking.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    {outOfStockIngredients.map((ingredient) => (
                                        <div key={ingredient.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                                            <div className="flex items-center gap-3">
                                                <AlertCircleIcon className="h-4 w-4 text-red-600" />
                                                <span className="font-medium">{ingredient.name}</span>
                                                <Badge variant="destructive">
                                                    Out of Stock
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <UpdateStockModal ingredient={ingredient} />
                                                <AddStockModal ingredient={ingredient} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
