import { apiCall } from './api';

export interface PaymentVerification {
  verification_id: number;
  order_id: string;
  user_id: number;
  transaction_id: string;
  screenshot_url: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  name: string;
  email: string;
  phone: string;
}

export const paymentVerificationService = {
  submitPayment: async (paymentData: { address: any; transaction_id: string; screenshot: File }) => {
    const formData = new FormData();
    formData.append('address', JSON.stringify(paymentData.address));
    formData.append('transaction_id', paymentData.transaction_id);
    formData.append('screenshot', paymentData.screenshot);

    return apiCall('/payment-verification/submit-payment', {
      method: 'POST',
      body: formData,
    });
  },

  getPendingVerifications: async (): Promise<PaymentVerification[]> => {
    return apiCall('/payment-verification/admin/pending');
  },

  verifyPayment: async (verificationId: number, action: 'approve' | 'reject', adminNotes?: string) => {
    return apiCall(`/payment-verification/admin/verify/${verificationId}`, {
      method: 'POST',
      body: JSON.stringify({ action, admin_notes: adminNotes }),
    });
  },

  getPaymentStatus: async (orderId: string) => {
    return apiCall(`/payment-verification/status/${orderId}`);
  },
};