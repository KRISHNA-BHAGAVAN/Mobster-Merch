import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { TermsAndConditions } from './AboutPages/TermsAndConditions';
import { PrivacyPolicy } from './AboutPages/PrivacyPolicy';
import { ReturnPolicy } from './AboutPages/ReturnPolicy';
import { ShippingPolicy } from './AboutPages/ShippingPolicy';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
export const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const navigate = useNavigate();
  const tabs = [
    { id: 'terms', label: 'Terms & Conditions', component: TermsAndConditions },
    { id: 'privacy', label: 'Privacy Policy', component: PrivacyPolicy },
    { id: 'return', label: 'Return Policy', component: ReturnPolicy },
    { id: 'shipping', label: 'Shipping Policy', component: ShippingPolicy },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TermsAndConditions;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer transition-colors mb-6"
          >
          <Icon icon="lucide:arrow-left" className="h-5 w-5" />
          Back
        </button> */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-600 items-center justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="bg-background">
          <ActiveComponent showNavbar={false} />
        </div>
      </div>
    </div>
  );
};