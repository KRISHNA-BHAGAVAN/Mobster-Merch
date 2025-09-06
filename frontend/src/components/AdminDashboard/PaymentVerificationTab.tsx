import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { paymentVerificationService, PaymentVerification } from '../../services';



export const PaymentVerificationTab: React.FC = () => {
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchVerifications = async () => {
    try {
      const data = await paymentVerificationService.getPendingVerifications();
      setVerifications(data);
    } catch (error: any) {
      toast.error(error.message || 'Error fetching payment verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleVerification = async (verificationId: number, action: 'approve' | 'reject') => {
    setProcessing(true);
    
    try {
      await paymentVerificationService.verifyPayment(verificationId, action, adminNotes);
      toast.success(`Payment ${action}d successfully`);
      setSelectedVerification(null);
      setAdminNotes('');
      fetchVerifications();
    } catch (error: any) {
      toast.error(error.message || `Error ${action}ing payment`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading payment verifications...</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Payment Verifications</h2>
      
      {verifications.length === 0 ? (
        <p className="text-gray-400">No pending payment verifications</p>
      ) : (
        <div className="grid gap-4">
          {verifications.map((verification) => (
            <motion.div
              key={verification.verification_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700 p-4 rounded-lg border border-gray-600"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Order #{verification.order_id}
                  </h3>
                  <p className="text-gray-300">Amount: ₹{verification.amount}</p>
                  <p className="text-gray-300">Transaction ID: {verification.transaction_id}</p>
                  <p className="text-gray-300">Customer: {verification.name} ({verification.email})</p>
                  <p className="text-gray-300">Phone: {verification.phone}</p>
                  <p className="text-gray-400 text-sm">
                    Submitted: {new Date(verification.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVerification(verification)}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Review
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Payment Verification - Order #{selectedVerification.order_id}
            </h3>
            
            <div className="mb-4">
              <p className="text-white mb-2">Customer: {selectedVerification.name}</p>
              <p className="text-white mb-2">Email: {selectedVerification.email}</p>
              <p className="text-white mb-2">Phone: {selectedVerification.phone}</p>
              <p className="text-white mb-2">Amount: ₹{selectedVerification.amount}</p>
              <p className="text-white mb-4">Transaction ID: {selectedVerification.transaction_id}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-white font-semibold mb-2">Payment Screenshot:</h4>
              <img
                src={`http://localhost:5000/uploads/payments/${selectedVerification.screenshot_url.split('/').pop()}`}
                alt="Payment Screenshot"
                className="max-w-full h-72 rounded-lg border border-gray-600"
              />
            </div>

            <div className="mb-6">
              <label className="block text-white mb-2">Admin Notes (Optional):</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                rows={3}
                placeholder="Add notes about this verification..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleVerification(selectedVerification.verification_id, 'approve')}
                disabled={processing}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Approve Payment'}
              </button>
              <button
                onClick={() => handleVerification(selectedVerification.verification_id, 'reject')}
                disabled={processing}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Reject Payment'}
              </button>
              <button
                onClick={() => {
                  setSelectedVerification(null);
                  setAdminNotes('');
                }}
                className="py-3 px-6 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};