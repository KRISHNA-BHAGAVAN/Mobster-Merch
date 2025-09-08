import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export const RefundPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer transition-colors mb-6"
        >
          <Icon icon="lucide:arrow-left" className="h-5 w-5" />
          Back
        </button>
        <h1 className="heading-font text-4xl text-center mb-8">Refund and Cancellation Policy</h1>
        <div className="font-serif prose prose-invert max-w-none text-foreground/80 leading-relaxed space-y-6 text-base">
          <p>
            This refund and cancellation policy outlines how you can cancel or seek a refund for a product / service
            that you have purchased through the Platform. Under this policy:
          </p>
          
          <ul className="list-disc list-inside space-y-4 ml-4">
            <li>
              Cancellations will only be considered if the request is made 14 days of placing the order.
              However, cancellation requests may not be entertained if the orders have been communicated to
              such sellers / merchant(s) listed on the Platform and they have initiated the process of shipping
              them, or the product is out for delivery. In such an event, you may choose to reject the product at
              the doorstep.
            </li>
            
            <li>
              MOBSTER MERCH does not accept cancellation requests for perishable items like flowers,
              eatables, etc. However, the refund / replacement can be made if the user establishes that the quality
              of the product delivered is not good.
            </li>
            
            <li>
              In case of receipt of damaged or defective items, please report to our customer service team. The
              request would be entertained once the seller/ merchant listed on the Platform, has checked and
              determined the same at its own end. This should be reported within 14 days of receipt of products.
            </li>
            
            <li>
              In case you feel that the product received is not as shown on the site or as per your expectations,
              you must bring it to the notice of our customer service within 14 days of receiving the product.
              The customer service team after looking into your complaint will take an appropriate decision.
            </li>
            
            <li>
              In case of complaints regarding the products that come with a warranty from the manufacturers,
              please refer the issue to them.
            </li>
            
            <li>
              In case of any refunds approved by MOBSTER MERCH, it will take 14 days for the refund to be
              processed to you.
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
};