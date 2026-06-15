export interface Transaction {
  id: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  sellerName?: string;
  itemType: 'Product' | 'Service';
  itemId: string;
  itemTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'OrderPlaced' | 'OrderConfirmed' | 'Shipped' | 'Delivered' | 'Finished' | 'Cancelled';
  trackingInfo?: string;
  deliveryAddress?: string;
  orderPlacedAt?: string;
  orderConfirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  finishedAt?: string;
  shippingCost?: number;
  createdAt: string;
}
