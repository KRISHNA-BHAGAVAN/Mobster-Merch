import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';


interface FooterProps {
  showNavbar?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showNavbar }) =>{
    const navigate = useNavigate();
    const location = useLocation();
    const shouldShowNavbar = showNavbar ?? location.state?.showNavbar ?? false;
  
  return (
    <>
      <div className="bg-content1 border-t border-primary/20 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="mdi:pistol" className="text-primary h-6 w-6" />
                <span className="text-xl tracking-wider text-white" style={{ fontFamily: "Ungai1"}}>
                  MOBSTER{" "}
                  <span className="text-primary" style={{ fontFamily: "Ungai1"}}>MERCH</span>
                </span>
              </div>

              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/mobstermerch_store?igsh=YjhwYWVnNTlkb3dl&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Icon
                    icon="lucide:instagram"
                    className="text-foreground/70 hover:text-red-600 transition-colors h-5 w-5"
                  />
                </a>
                <a
                  href="https://x.com/mobstermerch?s=21"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Icon
                    icon="lucide:twitter"
                    className="text-foreground/70 hover:text-red-600 transition-colors h-5 w-5"
                  />
                </a>
                {/* <a href="#" aria-label="Facebook">
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
                </a> */}
              </div>
            </div>

            <div>
              <h3 className="heading-font text-lg">SHOP</h3>
              <div className="samurai-divider w-8 mb-3"></div>
              <ul className="space-y-2">
                {/* <li>
                  <Link
                    to="/products"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    All Products
                  </Link>
                </li>
                
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    Accessories
                  </a>
                </li> */}
                <li>
                  <Link
                    to="/collections"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    Collections
                  </Link>
                </li>
                <li>
                  <Link
                    to="/featured-merchandise"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    Products
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="heading-font text-lg">INFORMATION</h3>
              <div className="samurai-divider w-20 mb-3"></div>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/T&C"
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
                {/* <li>
                  <Link
                    to="/return_policy"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping_policy"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    Shipping Policy
                  </Link>
                </li> */}
               
              </ul>
            </div>

            <div>
              <h3 className="heading-font text-lg">CUSTOMER SERVICE</h3>
              <div className="samurai-divider w-28 mb-3"></div>
              <ul className="space-y-2">
                {/* <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link
                    to="/shipping_policy"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    Shipping Policy
                  </Link>
                </li>
                  <li>
                    <Link
                      to="/return_policy"
                      className="text-foreground/70 hover:text-red-600 transition-colors"
                    >
                      Returns & Exchanges
                    </Link>
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
                  </li> */}
                <li>
                  <Link
                    to="/refund_policy"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    Return and Refund Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping_policy"
                    className="text-foreground/70 hover:text-red-600 transition-colors"
                  >
                    Shipping Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-primary/10 text-center text-foreground/60 text-sm ">
            <p>
              © 2025 Mobster Merch. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};