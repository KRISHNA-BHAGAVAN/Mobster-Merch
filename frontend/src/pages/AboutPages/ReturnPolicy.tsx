import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ReturnPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-sans text-4xl font-bold text-center mb-8">Refund & Return Policy</h1>
        <div className="font-serif prose prose-invert max-w-none text-foreground/80 leading-relaxed space-y-6 text-base">
          <p>
            Please note that we do not offer refunds or accept returns once an order has been placed. All sales are final.
          </p>
          <p>
            We encourage you to review your order carefully before confirming your purchase.
          </p>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">For Damage and Defective product</h2>
            <ul className="list-disc list-inside space-y-4 ml-4">
              <li>
                If you receive a defective, damaged, or incorrect product, you may request an refund within 8 days of receiving the item.
              </li>
              <li>
                And If a refund is approved, the amount will be credited within 10 business days
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Cancellation Policy</h2>
            <p>
              Cancellations will only be accepted if the request is made within 7 days of placing the order. However, cancellation requests may not be accepted if the order has already been processed by the seller/merchant, is in the shipping stage, or is out for delivery. In such cases, you may refuse the delivery at the doorstep.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};