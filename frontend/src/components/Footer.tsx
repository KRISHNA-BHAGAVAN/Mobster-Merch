import React from 'react';
// TODO: Replace HeroUI components with Material-UI
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer
      id="contact"
      className="bg-content1 border-t border-primary/20 pt-16 pb-8"
    >
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
              Official merchandise store for the epic samurai film "They Call
              Him OG" starring Pawan Kalyan.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram">
                <Icon
                  icon="lucide:instagram"
                  className="text-foreground/70 hover:text-red-600 transition-colors h-5 w-5"
                />
              </a>
              <a href="#" aria-label="Twitter">
                <Icon
                  icon="lucide:twitter"
                  className="text-foreground/70 hover:text-red-600 transition-colors h-5 w-5"
                />
              </a>
              <a href="#" aria-label="Facebook">
                <Icon
                  icon="lucide:facebook"
                  className="text-foreground/70 hover:text-red-600 transition-colors h-5 w-5"
                />
              </a>
              <a href="#" aria-label="YouTube">
                <Icon
                  icon="lucide:youtube"
                  className="text-foreground/70 hover:text-red-600 transition-colors h-5 w-5"
                />
              </a>
            </div>
          </div>

          <div>
            <h3 className="heading-font text-lg ">SHOP</h3>
            <div className="samurai-divider w-8  mb-3"></div>

            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  All Products
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Apparel
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Accessories
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Collectibles
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Limited Editions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="heading-font text-lg ">INFORMATION</h3>
            <div className="samurai-divider w-20  mb-3"></div>

            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms_and_conditions"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Terms and conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy_policy"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund_policy"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Shipping Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Press Kit
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="heading-font text-lg ">CUSTOMER SERVICE</h3>
            <div className="samurai-divider w-28  mb-3"></div>

            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Shipping Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-red-600 transition-colors"
                >
                  Size Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/10 text-center text-foreground/60 text-sm">
          <p>
            © 2025 They Call Him OG. All rights reserved. Official licensed
            merchandise.
          </p>
        </div>
      </div>
    </footer>
  );
};