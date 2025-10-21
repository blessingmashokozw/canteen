import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Collection Slots',
        href: '/collection-slots',
    },
    {
        title: 'Create Slot',
        href: '#',
    },
];

export default function SlotsCreate() {
    const { errors } = usePage().props as any;

    const form = useForm({
        date: '',
        start_time: '',
        end_time: '',
        capacity: '10',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/collection-slots', {
            onSuccess: () => {
                // Success is handled by redirect in controller
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Collection Slot" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl mx-auto w-full space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/collection-slots">
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Back to Slots
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Create Collection Slot</h1>
                            <p className="text-muted-foreground">
                                Add a new time slot for food collection
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Slot Details</CardTitle>
                            <CardDescription>
                                Enter the details for the new collection slot
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={form.data.date}
                                            onChange={(e) => form.setData('date', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                        {errors.date && (
                                            <p className="text-sm text-red-600">{errors.date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacity *</Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={form.data.capacity}
                                            onChange={(e) => form.setData('capacity', e.target.value)}
                                            placeholder="10"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Maximum number of orders that can use this slot
                                        </p>
                                        {errors.capacity && (
                                            <p className="text-sm text-red-600">{errors.capacity}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_time">Start Time *</Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={form.data.start_time}
                                            onChange={(e) => form.setData('start_time', e.target.value)}
                                            required
                                        />
                                        {errors.start_time && (
                                            <p className="text-sm text-red-600">{errors.start_time}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_time">End Time *</Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={form.data.end_time}
                                            onChange={(e) => form.setData('end_time', e.target.value)}
                                            min={form.data.start_time || '00:00'}
                                            required
                                        />
                                        {errors.end_time && (
                                            <p className="text-sm text-red-600">{errors.end_time}</p>
                                        )}
                                    </div>
                                </div>

                                {form.data.start_time && form.data.end_time && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-blue-800">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            <span className="font-medium">Slot Preview:</span>
                                            <span>
                                                {form.data.date} • {form.data.start_time} - {form.data.end_time}
                                                ({form.data.capacity} slots)
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <SaveIcon className="w-4 h-4 mr-2" />
                                                Create Slot
                                            </>
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/collection-slots">Cancel</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
