import React from 'react';
import { Navbar } from '../../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';

interface ShippingPolicyProps {
  showNavbar?: boolean;
}

export const ShippingPolicy: React.FC<ShippingPolicyProps> = ({ showNavbar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldShowNavbar = showNavbar ?? location.state?.showNavbar ?? false;

  return (
    <div className="min-h-screen bg-background text-justify hyphenate-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {shouldShowNavbar && <Navbar />}
      <div className="container mx-auto px-4 max-w-4xl">
        
        <h1 className="font-sans text-4xl font-bold text-center mb-8">Shipping&nbsp; Policy</h1>
        <div className="font-serif prose prose-invert max-w-none text-foreground/80 leading-relaxed space-y-6 text-base">
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Order&nbsp; Processing</h2>
            <p>
              We strive to process and ship orders as quickly as possible. Most orders are expected to be delivered within <strong>8-10 business days</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Shipping &nbsp; and  &nbsp;&nbsp;Delivery&nbsp; Disclaimer</h2>
            <p>
              The Platform Owner shall not be held liable for any delay in delivery caused by the courier company, postal authority, or any other third-party logistics provider. All orders will be delivered to the address provided by the buyer at the time of purchase.
            </p>
            <p>
              For our services, delivery and access confirmation will be sent to the registered email address provided during account creation or purchase.
            </p>
            <p>
              Please note that any shipping charges imposed by the seller or the Platform Owner, as applicable, are <strong>non-refundable under any circumstances</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};