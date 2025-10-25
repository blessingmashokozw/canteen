import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
import { Badge } from '@/components/ui/badge';
import {
  CheckCircleIcon,
  CreditCardIcon,
  Settings,
  Check,
  Package,
  Clock,
  Calendar,
  ChefHatIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import OrderItemAvailabilityModal from '@/components/order-item-availability-modal';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Orders', href: '/orders' },
  { title: 'Order Details', href: '#' },
];

interface OrderShowProps {
  order: Order;
  user?: {
    is_admin: boolean;
    is_kitchen: boolean;
    role: string;
  };
  flash?: {
    availability_success?: string;
    confirmation_success?: string;
    success?: string;
  };
}

export default function OrderShow({ order, user, flash }: OrderShowProps) {
  const page = usePage();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availabilityModal, setAvailabilityModal] = useState<{
    isOpen: boolean;
    selectedItem: any;
  }>({ isOpen: false, selectedItem: null });
  const [slotSelectionModal, setSlotSelectionModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    // Display flash messages coming from server (if any)
    if ((flash && flash.success) || (flash && flash.confirmation_success) || (flash && flash.availability_success)) {
      const message = flash.availability_success ?? flash.confirmation_success ?? flash.success ?? null;
      setSuccessMessage(message);
      if (message) {
        const timer = setTimeout(() => setSuccessMessage(null), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [flash]);

  const fetchAvailableSlots = async () => {
    if (order.status !== 'ready' || order.collection_slot_id) {
      return;
    }

    setIsLoadingSlots(true);
    try {
      const response = await fetch('/api/collection-slots');
      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }
      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Fallback to mock data if API fails
      const today = new Date().toISOString().split('T')[0];
      const mockSlots = [
        { id: 1, time_range: '12:25 - 12:40', date_time_range: `${today} 12:25 - 12:40`, available_capacity: 5 },
        { id: 2, time_range: '12:40 - 12:55', date_time_range: `${today} 12:40 - 12:55`, available_capacity: 3 },
        { id: 3, time_range: '12:55 - 13:10', date_time_range: `${today} 12:55 - 13:10`, available_capacity: 4 },
        { id: 4, time_range: '13:10 - 13:25', date_time_range: `${today} 13:10 - 13:25`, available_capacity: 2 },
        { id: 5, time_range: '13:25 - 13:40', date_time_range: `${today} 13:25 - 13:40`, available_capacity: 1 },
        { id: 6, time_range: '13:40 - 13:55', date_time_range: `${today} 13:40 - 13:55`, available_capacity: 0 },
        { id: 7, time_range: '13:55 - 14:10', date_time_range: `${today} 13:55 - 14:10`, available_capacity: 6 },
      ];
      setAvailableSlots(mockSlots);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Fetch slots when order status is ready and no slot is assigned
  useEffect(() => {
    fetchAvailableSlots();
  }, [order.status, order.collection_slot_id]);

  const handleAvailabilityConfirmation = (itemId: number, available: boolean) => {
    setIsUpdatingStatus(true);
    router.post(
      `/orders/${order.id}/items/${itemId}/confirm-availability`,
      { available },
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: (res) => {
          setSuccessMessage('Availability updated');
          setTimeout(() => setSuccessMessage(null), 3000);
          setIsUpdatingStatus(false);
        },
        onError: () => {
          setSuccessMessage('Error updating availability');
          setTimeout(() => setSuccessMessage(null), 3000);
          setIsUpdatingStatus(false);
        },
      }
    );
  };

  const handleConfirmOrder = () => {
    setIsUpdatingStatus(true);
    router.post(
      `/orders/${order.id}/confirm`,
      {},
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setSuccessMessage('Order confirmed');
          setTimeout(() => setSuccessMessage(null), 3000);
          setIsUpdatingStatus(false);
        },
        onError: () => {
          setSuccessMessage('Error confirming order');
          setTimeout(() => setSuccessMessage(null), 3000);
          setIsUpdatingStatus(false);
        },
      }
    );
  };

  const handleAssignSlot = (slotId: number) => {
    setIsUpdatingStatus(true);
    router.post(
      `/orders/${order.id}/assign-slot`,
      { collection_slot_id: slotId },
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setSuccessMessage('Collection slot assigned');
          setTimeout(() => setSuccessMessage(null), 3000);
          setIsUpdatingStatus(false);
        },
        onError: () => {
          setSuccessMessage('Error assigning collection slot');
          setTimeout(() => setSuccessMessage(null), 3000);
          setIsUpdatingStatus(false);
        },
      }
    );
  };

  const handleMarkAsCompleted = () => {
    setIsUpdatingStatus(true);
    router.post(
      `/orders/${order.id}/mark-completed`,
      {},
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setSuccessMessage('Order marked as completed');
          setTimeout(() => setSuccessMessage(null), 3000);
          setIsUpdatingStatus(false);
        },
        onError: () => {
          setSuccessMessage('Error marking order as completed');
          setTimeout(() => setSuccessMessage(null), 3000);
          setIsUpdatingStatus(false);
        },
      }
    );
  };

  const openAvailabilityModal = (item: any) => {
    setAvailabilityModal({ isOpen: true, selectedItem: item });
  };

  const closeAvailabilityModal = () => {
    setAvailabilityModal({ isOpen: false, selectedItem: null });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Order #${order.id}`} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="max-w-3xl mx-auto w-full space-y-4">
          {/* Loading Modal for Order Status Updates */}
          {isUpdatingStatus && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <div>
                    <h3 className="font-semibold text-lg">Updating Order</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please wait while we update your order status...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Placed Successfully Card - Customer Only */}
          {(!user || user.role === 'customer') && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Order Placed Successfully!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your order has been received and is being processed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    Order #{order.id}
                    <Badge variant="outline" className="font-mono text-xs">
                      {order.order_code}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Placed on {new Date(order.created_at).toLocaleString()}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      order.status === 'confirmed'
                        ? 'default'
                        : order.status === 'pending'
                        ? 'secondary'
                        : order.status === 'ready'
                        ? 'default'
                        : order.status === 'preparing'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={
                      order.status === 'confirmed'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                        : order.status === 'ready'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        : order.status === 'preparing'
                        ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                        : ''
                    }
                  >
                    {order.status === 'confirmed'
                      ? 'Confirmed'
                      : order.status === 'pending'
                      ? 'Pending'
                      : order.status === 'ready'
                      ? 'Ready'
                      : order.status === 'preparing'
                      ? 'Preparing'
                      : order.status === 'completed'
                      ? 'Completed'
                      : order.status || 'Unknown'}
                  </Badge>

                  {order.status === 'pending' && (user?.is_admin || user?.is_kitchen) && (
                    <Button
                      onClick={handleConfirmOrder}
                      className="flex items-center gap-2"
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Confirm Order
                        </>
                      )}
                    </Button>
                  )}

                  {order.status === 'confirmed' && (
                    <Button
                      asChild
                      className="flex items-center gap-2"
                      disabled={isUpdatingStatus}
                    >
                      <Link href={`/orders/${order.id}/pay`}>
                        <CreditCardIcon className="w-4 h-4" />
                        Make Payment
                      </Link>
                    </Button>
                  )}

                  {order.status === 'ready' && (user?.is_admin || user?.is_kitchen) && (
                    <Button
                      onClick={handleMarkAsCompleted}
                      className="flex items-center gap-2"
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          Mark as Completed
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <div className="">
              <CardContent className="pt-6 space-y-6">
                {/* Payment Status */}
                <div>
                  <h4 className="font-medium mb-2">Payment Status</h4>
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                    {order.payments && order.payments.length > 0 ? (
                      order.payments.some((payment) => payment.status === 'paid') ? (
                        <>
                          <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-green-700 font-medium">Paid</span>
                          <span className="text-sm text-muted-foreground">
                            ($
                            {order.payments.find((p) => p.status === 'paid')?.amount
                              ? Number(order.payments.find((p) => p.status === 'paid')?.amount).toFixed(2)
                              : '0.00'}
                            )
                          </span>
                        </>
                      ) : order.payments.some((payment) => payment.status === 'pending') ? (
                        <>
                          <div className="w-5 h-5 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-yellow-700 font-medium">Payment Pending</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-700 font-medium">Payment Failed</span>
                        </>
                      )
                    ) : (
                      <>
                        <div className="w-5 h-5 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">No Payment</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="bg-muted/30 border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order Summary
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Total Items Ordered</div>
                      <div className="text-lg font-semibold">
                        {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Available Items</div>
                      <div className="text-lg font-semibold text-green-600">
                        {order.order_items?.filter((item) => item.is_available === true).reduce((sum, item) => sum + item.quantity, 0) || 0} items
                      </div>
                    </div>
                    {order.order_items?.some((item) => item.is_available === false) && (
                      <div className="space-y-1 sm:col-span-2">
                        <div className="text-sm text-muted-foreground">Unavailable Items</div>
                        <div className="text-lg font-semibold text-red-600">
                          {order.order_items?.filter((item) => item.is_available === false).reduce((sum, item) => sum + item.quantity, 0) || 0} items
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {order.order_items && order.order_items.length > 0 ? (
                      order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex gap-4 p-4 border rounded-lg bg-card ${
                            item.is_available === false
                              ? 'border-red-200 bg-red-50/30'
                              : item.is_available === true
                              ? 'border-green-200 bg-green-50/30'
                              : 'border-gray-200'
                          }`}
                        >
                          {/* Meal Image */}
                          <div className="flex-shrink-0">
                            {item.meal?.image ? (
                              <img
                                src={`/${item.meal.image}`}
                                alt={item.meal?.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                  const fallback = (e.currentTarget.nextElementSibling as HTMLElement);
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground ${item.meal?.image ? 'hidden' : ''}`}>
                              <ChefHatIcon className="size-6" />
                            </div>
                          </div>

                          {/* Meal Details */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <p className="font-medium">{item.meal?.name}</p>
                                <Badge
                                  variant={item.is_available === false ? 'destructive' : item.is_available === true ? 'default' : 'secondary'}
                                  className={item.is_available === false ? 'bg-red-100 text-red-800 hover:bg-red-100' : item.is_available === true ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                                >
                                  {item.is_available === false ? 'Not Available' : item.is_available === true ? 'Available' : 'Unknown'}
                                </Badge>
                              </div>

                              {user && (user.is_admin || user.is_kitchen) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openAvailabilityModal(item)}
                                  className="flex items-center gap-2"
                                  disabled={isUpdatingStatus}
                                >
                                  {isUpdatingStatus ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <Settings className="w-4 h-4" />
                                      Manage Availability
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </p>
                              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No items found in this order.</p>
                        <p className="text-xs mt-2">Order items count: {order.order_items?.length || 0}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                {order.instructions && (
                  <div>
                    <h4 className="font-medium mb-2">Special Instructions</h4>
                    <p className="p-3 border rounded-lg bg-muted/50 text-sm">{order.instructions}</p>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold text-lg mb-4">Order Summary & Payment</h4>

                  {/* Slot Selection for Ready Orders - Moved to Top */}
                  {order.status === 'ready' && !order.collection_slot_id && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 text-blue-800 mb-3">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Collection Time Slot Required</span>
                      </div>
                      <p className="text-sm text-blue-700 mb-4">Please select a 15-minute time slot for collecting your order</p>
                      <Button
                        onClick={() => setSlotSelectionModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            Select Time Slot
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Display Selected Collection Slot - Moved to Top */}
                  {order.collection_slot_id && order.collection_slot && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center justify-center gap-3 text-green-800">
                        <Calendar className="w-5 h-5" />
                        <div className="text-center">
                          <p className="font-medium">Collection Slot Confirmed</p>
                          <p className="text-sm">{order.collection_slot.start_time}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Items Total - Primary Amount */}
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-800 font-semibold text-lg">Amount to Pay</span>
                      <span className="text-green-800 font-bold text-2xl">${(order.available_total || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Total for available items ({order.order_items?.filter((item) => item.is_available === true).reduce((sum, item) => sum + item.quantity, 0) || 0} items)
                    </p>
                  </div>

                  {/* Original Order Total - Secondary */}
                  {order.total !== order.available_total && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 font-medium">Original Order Total</span>
                        <span className="text-gray-500 font-semibold text-lg">${(order.total || 0).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Some items became unavailable after you placed your order
                      </p>
                    </div>
                  )}

                  {/* Unavailable Items Notice */}
                  {order.total !== order.available_total && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 text-orange-800">
                        <span className="text-lg">⚠️</span>
                        <span className="font-medium">
                          Unavailable items: ${(order.total ?? 0) - (order.available_total ?? 0)} not charged
                        </span>
                      </div>
                    </div>
                  )}

                  {/* All Items Available - Single Amount */}
                  {order.total === order.available_total && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-600 font-medium">
                        All items in your order are available ✓
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button asChild className="flex-1">
                    <Link href="/orders">View All Orders</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/orders/create">Place New Order</Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>

      {/* Slot Selection Modal */}
      <Dialog open={slotSelectionModal} onOpenChange={setSlotSelectionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {selectedSlot ? 'Confirm Collection Slot' : 'Select Collection Time Slot'}
            </DialogTitle>
            <DialogDescription>
              {selectedSlot
                ? 'Please confirm your collection time slot selection.'
                : 'Choose a 15-minute time slot for collecting your order. Slots are limited and fill up quickly.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoadingSlots && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-blue-600 mt-2">Loading available slots...</p>
              </div>
            )}

            {!isLoadingSlots && availableSlots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No slots available</p>
                <p className="text-sm">Please check back later for available collection times</p>
              </div>
            )}

            {/* Slot Selection Step */}
            {!isLoadingSlots && availableSlots.length > 0 && !selectedSlot && (
              <div className="grid gap-2 sm:grid-cols-2">
                {availableSlots.map((slot) => {
                  const isAlmostFull = slot.available_capacity <= 2;
                  const isFull = slot.available_capacity === 0;

                  return (
                    <Button
                      key={slot.id}
                      variant={isFull ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSlot(slot)}
                      disabled={isFull}
                      className={`text-sm relative p-4 h-auto ${isFull ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-300'}`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span className="font-medium">{slot.time_range}</span>
                        {slot.available_capacity !== undefined && (
                          <span className={`text-xs ${isAlmostFull ? 'text-orange-600' : isFull ? 'text-gray-500' : 'text-green-600'}`}>
                            {slot.available_capacity} slots left
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Confirmation Step */}
            {selectedSlot && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Selected Time Slot</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-900">{selectedSlot.time_range}</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedSlot.available_capacity} slots remaining
                    </p>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>By confirming this slot, you agree to collect your order within the selected 15-minute window.</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setSlotSelectionModal(false);
              setSelectedSlot(null);
            }}>
              {selectedSlot ? 'Back' : 'Cancel'}
            </Button>

            {selectedSlot && (
              <Button
                onClick={() => {
                  handleAssignSlot(selectedSlot.id);
                  setSlotSelectionModal(false);
                  setSelectedSlot(null);
                }}
                className="bg-green-600 hover:bg-green-700"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirming...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Slot
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability Modal */}
      <OrderItemAvailabilityModal
        isOpen={availabilityModal.isOpen}
        onClose={closeAvailabilityModal}
        orderItem={availabilityModal.selectedItem}
        onAvailabilityChange={handleAvailabilityConfirmation}
      />
    </AppLayout>
  );
}
