import React from 'react';

interface CompanyDescProps {
  showNavbar?: boolean;
}

export const CompanyDesc: React.FC<CompanyDescProps> = ({ showNavbar = true }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-justify">
      <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Welcome to Mobster Merch – Where Street Culture Meets Premium Quality</h1>
        <div className="text-gray-300 text-lg leading-relaxed space-y-6">
          <p>
            At Mobster Merch, we're more than just a brand; we're a movement. Born from the streets and crafted for the bold, our mission is to deliver high-quality T-shirts and untearable stickers, wall posters, bookmarks that let you wear and stick your attitude.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">T-Shirts: Crafted for Comfort & Durability</h3>
              <p>Our T-shirts are made from premium cotton yarn, bio-washed or combed for extra softness and durability. Designed for those who demand both style and substance, each tee is a testament to quality craftsmanship.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Untearable Stickers: Stick with Strength</h3>
              <p>Our untearable stickers are built to last. Made from ultra-durable materials, they're perfect for personalizing your gear without worrying about wear and tear.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Why Choose Mobster Merch?</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Premium Quality:</strong> Only the best materials for our products.</li>
                <li><strong>Street-Inspired Designs:</strong> Bold, edgy, and unapologetically original.</li>
                <li><strong>Built to Last:</strong> Durability you can trust.</li>
              </ul>
            </div>
          </div>
          
          <p className="text-center font-medium text-white">
            Whether you're looking to upgrade your wardrobe or add some flair to your gear, Mobster Merch has you covered. Stick it. Wear it. Be it.
          </p>
        </div>
      </div>
    </div>
  );
};