import { apiCall } from './api';

export interface ConfirmPaymentData {
  order_id: number;
  transaction_ref?: string;
}

export const paymentService = {
  confirmPayment: (data: ConfirmPaymentData) => 
    apiCall('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getPendingPayments: () => 
    apiCall('/payments/pending'),

  markPaymentComplete: (paymentId: number) => 
    apiCall(`/payments/${paymentId}/mark-complete`, {
      method: 'POST'
    })
};