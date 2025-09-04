import React from 'react';
// TODO: Replace HeroUI components with Material-UI
import { Icon } from '@iconify/react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-content1 border-t border-primary/20 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:pistol" className="text-primary h-6 w-6" />
              <span className="title-font text-xl tracking-wider text-white">
                MOBSTER <span className="heading-font text-primary">MERCH</span>
              </span>
            </div>
            <p className="text-foreground/70 mb-4">
              Official merchandise store for the epic samurai film "They Call Him OG" starring Pawan Kalyan.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram">
                <Icon icon="lucide:instagram" className="text-foreground/70 hover:text-primary transition-colors h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter">
                <Icon icon="lucide:twitter" className="text-foreground/70 hover:text-primary transition-colors h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook">
                <Icon icon="lucide:facebook" className="text-foreground/70 hover:text-primary transition-colors h-5 w-5" />
              </a>
              <a href="#" aria-label="YouTube">
                <Icon icon="lucide:youtube" className="text-foreground/70 hover:text-primary transition-colors h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="heading-font text-lg mb-4">SHOP</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">All Products</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Apparel</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Accessories</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Collectibles</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Limited Editions</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="heading-font text-lg mb-4">INFORMATION</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">About the Movie</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Cast & Crew</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Behind the Scenes</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">News & Updates</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Press Kit</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="heading-font text-lg mb-4">CUSTOMER SERVICE</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Shipping Policy</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Returns & Exchanges</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Size Guide</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary/10 text-center text-foreground/60 text-sm">
          <p>© 2024 They Call Him OG. All rights reserved. Official licensed merchandise.</p>
        </div>
      </div>
    </footer>
  );
};