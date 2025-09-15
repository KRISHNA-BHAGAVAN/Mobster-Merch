import { apiCall } from './api';

export interface AddressData {
  address_line1: string;
  address_line2?: string;
  city: string;
  district?: string;
  state: string;
  country?: string;
  pincode: string;
}

export interface OrderResponse {
  message: string;
  order_id: string;
  total: number;
  upi_link: string;
  upi_id: string;
}

export const checkoutService = {
  prepareCheckout: async (addressData: AddressData): Promise<OrderResponse> => {
    return apiCall('/checkout/prepare-checkout', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  createOrderWithPayment: async (orderData: { address: AddressData; transaction_id: string; screenshot_url: string }) => {
    return apiCall('/checkout/create-order-with-payment', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getAddresses: async () => {
    return apiCall('/checkout/addresses');
  },

  createPhonePePayment: async (orderData: { orderId: string; amount: number }) => {
    return apiCall('/phonepe/initiate-payment', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
};