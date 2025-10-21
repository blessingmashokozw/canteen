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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Collection Slots',
        href: '/collection-slots',
    },
    {
        title: 'Edit Slot',
        href: '#',
    },
];

interface CollectionSlot {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    status: 'available' | 'booked' | 'full';
    capacity: number;
    booked_count: number;
}

interface SlotsEditProps {
    slot: CollectionSlot;
}

export default function SlotsEdit({ slot }: SlotsEditProps) {
    const { errors } = usePage().props as any;

    const form = useForm({
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        capacity: slot.capacity.toString(),
        status: slot.status,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(`/collection-slots/${slot.id}`, {
            onSuccess: () => {
                // Success is handled by redirect in controller
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Collection Slot" />

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
                            <h1 className="text-3xl font-bold">Edit Collection Slot</h1>
                            <p className="text-muted-foreground">
                                Modify the collection slot details
                            </p>
                        </div>
                    </div>

                    {/* Current Slot Info */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="text-blue-800">Current Slot Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-medium">Date:</span>
                                    <span>{new Date(slot.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Time:</span>
                                    <span>{slot.start_time} - {slot.end_time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Status:</span>
                                    <span className={`capitalize ${slot.status === 'available' ? 'text-green-600' : slot.status === 'booked' ? 'text-blue-600' : 'text-red-600'}`}>
                                        {slot.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Booked:</span>
                                    <span>{slot.booked_count}/{slot.capacity}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Slot Details</CardTitle>
                            <CardDescription>
                                Update the collection slot information
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
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={form.data.status as 'available' | 'booked' | 'full'}
                                            onValueChange={(value: 'available' | 'booked' | 'full') => form.setData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="booked">Booked</SelectItem>
                                                <SelectItem value="full">Full</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600">{errors.status}</p>
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

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity *</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={form.data.capacity}
                                        onChange={(e) => form.setData('capacity', e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Maximum number of orders that can use this slot
                                        {slot.booked_count > 0 && (
                                            <span className="text-orange-600 ml-2">
                                                Warning: This slot has {slot.booked_count} orders assigned
                                            </span>
                                        )}
                                    </p>
                                    {errors.capacity && (
                                        <p className="text-sm text-red-600">{errors.capacity}</p>
                                    )}
                                </div>

                                {form.data.start_time && form.data.end_time && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                            <span className="font-medium">Updated Slot Preview:</span>
                                            <span>
                                                {form.data.date} • {form.data.start_time} - {form.data.end_time}
                                                ({form.data.capacity} slots) • Status: {form.data.status}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <SaveIcon className="w-4 h-4 mr-2" />
                                                Update Slot
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
