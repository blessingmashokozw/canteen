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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    CalendarIcon,
    ClockIcon,
    MoreHorizontalIcon,
    PlusIcon,
    SearchIcon,
    TrashIcon,
    EditIcon,
    UsersIcon,
    CheckCircleIcon,
    AlertCircleIcon,
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Collection Slots',
        href: '/collection-slots',
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
    time_range: string;
    date_time_range: string;
}

interface SlotsIndexProps {
    slots: {
        data: CollectionSlot[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_slots: number;
        available_slots: number;
        booked_slots: number;
        full_slots: number;
    };
    filters: {
        date?: string;
        status?: string;
    };
}

export default function SlotsIndex({ slots, stats, filters }: SlotsIndexProps) {
    const { flash } = usePage().props as any;
    const [deleteSlot, setDeleteSlot] = useState<CollectionSlot | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteSlot) return;

        setIsDeleting(true);
        try {
            await router.delete(`/collection-slots/${deleteSlot.id}`);
            setDeleteSlot(null);
        } catch (error) {
            console.error('Error deleting slot:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
            case 'booked':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Booked</Badge>;
            case 'full':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Full</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getCapacityBadge = (booked: number, capacity: number) => {
        const percentage = (booked / capacity) * 100;
        if (percentage >= 100) {
            return <Badge className="bg-red-100 text-red-800">Full</Badge>;
        } else if (percentage >= 80) {
            return <Badge className="bg-orange-100 text-orange-800">Almost Full</Badge>;
        } else {
            return <Badge className="bg-green-100 text-green-800">{booked}/{capacity}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collection Slots" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-7xl mx-auto w-full space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Collection Slots</h1>
                            <p className="text-muted-foreground">
                                Manage food collection time slots
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/collection-slots/create">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Slot
                            </Link>
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_slots}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Available</CardTitle>
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.available_slots}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Booked</CardTitle>
                                <ClockIcon className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.booked_slots}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Full</CardTitle>
                                <AlertCircleIcon className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.full_slots}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={filters.date || ''}
                                        onChange={(e) => {
                                            router.get('/collection-slots', {
                                                ...filters,
                                                date: e.target.value || undefined,
                                            }, { preserveState: true });
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={filters.status || 'all'}
                                        onValueChange={(value) => {
                                            router.get('/collection-slots', {
                                                ...filters,
                                                status: value === 'all' ? undefined : value,
                                            }, { preserveState: true });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="booked">Booked</SelectItem>
                                            <SelectItem value="full">Full</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Slots Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Collection Slots</CardTitle>
                            <CardDescription>
                                Showing {slots.total} slots
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Capacity</TableHead>
                                        <TableHead>Booked</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {slots.data.map((slot) => (
                                        <TableRow key={slot.id}>
                                            <TableCell>
                                                {format(new Date(slot.date), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                {slot.time_range}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(slot.status)}
                                            </TableCell>
                                            <TableCell>
                                                {getCapacityBadge(slot.booked_count, slot.capacity)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <UsersIcon className="w-4 h-4" />
                                                    {slot.booked_count}/{slot.capacity}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontalIcon className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/collection-slots/${slot.id}/edit`}>
                                                                <EditIcon className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => setDeleteSlot(slot)}
                                                        >
                                                            <TrashIcon className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {slots.last_page > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {((slots.current_page - 1) * slots.per_page) + 1} to{' '}
                                        {Math.min(slots.current_page * slots.per_page, slots.total)} of{' '}
                                        {slots.total} results
                                    </p>
                                    <div className="flex gap-2">
                                        {slots.current_page > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get('/collection-slots', {
                                                    ...filters,
                                                    page: slots.current_page - 1,
                                                })}
                                            >
                                                Previous
                                            </Button>
                                        )}
                                        {slots.current_page < slots.last_page && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get('/collection-slots', {
                                                    ...filters,
                                                    page: slots.current_page + 1,
                                                })}
                                            >
                                                Next
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteSlot} onOpenChange={() => setDeleteSlot(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Collection Slot</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this collection slot? This action cannot be undone.
                            {deleteSlot?.booked_count && deleteSlot.booked_count > 0 && (
                                <span className="block mt-2 text-red-600 font-medium">
                                    Warning: This slot has {deleteSlot.booked_count} orders assigned to it.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteSlot(null)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
