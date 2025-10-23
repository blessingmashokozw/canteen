import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Ingredient, type Meal } from '@/types';
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
    TrashIcon,
    TrendingUpIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meals',
        href: '/meals',
    },
    {
        title: 'Ingredients',
        href: '#',
    },
];

interface MealsIngredientsProps {
    meal: Meal & {
        ingredients: (Ingredient & {
            pivot: {
                quantity_required: number;
            };
        })[];
    };
    allIngredients: Ingredient[];
}

export default function MealsIngredients({ meal, allIngredients }: MealsIngredientsProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

    const addForm = useForm({
        ingredient_id: '',
        quantity_required: '',
    });

    const editForm = useForm({
        quantity_required: '',
    });

    const handleAddIngredient = () => {
        addForm.post(`/meals/${meal.id}/ingredients`, {
            onSuccess: () => {
                setShowAddDialog(false);
                addForm.reset();
            },
        });
    };

    const handleEditIngredient = (ingredient: Ingredient & { pivot: { quantity_required: number } }) => {
        setEditingIngredient(ingredient);
        editForm.setData('quantity_required', ingredient.pivot.quantity_required.toString());
    };

    const handleUpdateIngredient = () => {
        if (!editingIngredient) return;

        editForm.patch(`/meals/${meal.id}/ingredients/${editingIngredient.id}`, {
            onSuccess: () => {
                setEditingIngredient(null);
                editForm.reset();
            },
        });
    };

    const handleRemoveIngredient = (ingredient: Ingredient) => {
        if (confirm('Are you sure you want to remove this ingredient from this meal?')) {
            router.delete(`/meals/${meal.id}/ingredients/${ingredient.id}`);
        }
    };

    // Filter out ingredients already assigned to this meal
    const availableIngredients = allIngredients.filter(
        (ingredient) => !meal.ingredients.some((mealIng) => mealIng.id === ingredient.id)
    );

    return (
        <>
            <Head title={`Ingredients for ${meal.name}`} />

            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Ingredients for {meal.name}</h1>
                            <p className="text-muted-foreground">
                                Manage ingredients required for this meal and their quantities.
                            </p>
                        </div>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add Ingredient
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Ingredient to {meal.name}</DialogTitle>
                                    <DialogDescription>
                                        Select an ingredient and specify the quantity required for one serving of this meal.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="ingredient_id">Ingredient</Label>
                                        <select
                                            id="ingredient_id"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={addForm.data.ingredient_id}
                                            onChange={(e) => addForm.setData('ingredient_id', e.target.value)}
                                        >
                                            <option value="">Select an ingredient...</option>
                                            {availableIngredients.map((ingredient) => (
                                                <option key={ingredient.id} value={ingredient.id}>
                                                    {ingredient.name} ({ingredient.unit})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={addForm.errors.ingredient_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="quantity_required">Quantity Required</Label>
                                        <Input
                                            id="quantity_required"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={addForm.data.quantity_required}
                                            onChange={(e) => addForm.setData('quantity_required', e.target.value)}
                                            placeholder="e.g., 2.5"
                                        />
                                        <InputError message={addForm.errors.quantity_required} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddIngredient} disabled={addForm.processing}>
                                        Add Ingredient
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PackageIcon className="h-5 w-5" />
                                    Ingredients for {meal.name}
                                </CardTitle>
                                <CardDescription>
                                    {meal.ingredients.length} ingredient(s) required for this meal.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {meal.ingredients.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <PackageIcon className="mx-auto h-12 w-12 mb-4" />
                                        <p>No ingredients assigned to this meal yet.</p>
                                        <p className="text-sm">Add ingredients to track stock levels and requirements.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ingredient</TableHead>
                                                <TableHead>Unit</TableHead>
                                                <TableHead>Required Quantity</TableHead>
                                                <TableHead>Current Stock</TableHead>
                                                <TableHead>Stock Status</TableHead>
                                                <TableHead className="w-[100px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {meal.ingredients.map((ingredient) => (
                                                <TableRow key={ingredient.id}>
                                                    <TableCell className="font-medium">
                                                        {ingredient.name}
                                                    </TableCell>
                                                    <TableCell>{ingredient.unit}</TableCell>
                                                    <TableCell>{ingredient.pivot.quantity_required}</TableCell>
                                                    <TableCell>
                                                        <span className={`font-medium ${
                                                            ingredient.stock_quantity < ingredient.pivot.quantity_required
                                                                ? 'text-destructive'
                                                                : 'text-green-600'
                                                        }`}>
                                                            {ingredient.stock_quantity}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={(ingredient.getStockBadgeVariant?.() as any) || 'secondary'}>
                                                            {ingredient.getStockStatus?.() || 'Unknown'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditIngredient(ingredient)}
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRemoveIngredient(ingredient)}
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* Low Stock Alert */}
                        {meal.getLowStockIngredients?.() && meal.getLowStockIngredients()?.length > 0 && (
                            <Card className="border-destructive/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                        <AlertTriangleIcon className="h-5 w-5" />
                                        Low Stock Alert
                                    </CardTitle>
                                    <CardDescription>
                                        Some ingredients for this meal are running low.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {meal.getLowStockIngredients?.()?.map((ingredient: any) => (
                                            <div key={ingredient.id} className="flex items-center justify-between">
                                                <span>{ingredient.name}</span>
                                                <Badge variant="destructive">
                                                    {ingredient.stock_quantity} {ingredient.unit} remaining
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Edit Ingredient Dialog */}
                    <Dialog open={!!editingIngredient} onOpenChange={() => setEditingIngredient(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Ingredient Quantity</DialogTitle>
                                <DialogDescription>
                                    Update the quantity of {editingIngredient?.name} required for {meal.name}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_quantity">Quantity Required</Label>
                                    <Input
                                        id="edit_quantity"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={editForm.data.quantity_required}
                                        onChange={(e) => editForm.setData('quantity_required', e.target.value)}
                                        placeholder="e.g., 2.5"
                                    />
                                    <InputError message={editForm.errors.quantity_required} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingIngredient(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateIngredient} disabled={editForm.processing}>
                                    Update Quantity
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </AppLayout>
        </>
    );
}