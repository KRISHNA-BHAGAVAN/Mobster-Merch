import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturedProducts } from './FeaturedProducts';
import { ProductCategories } from './ProductCategories';
// import { AboutMovie } from './AboutMovie';
import { Footer } from './Footer';
import { FloatingCart } from './FloatingCart';
import Carousel from "./Carousel";

export const MainWebsite: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 japanese-pattern pointer-events-none"></div>
      <Navbar />
      {/* <HeroSection /> */}
      <Carousel />
      <FeaturedProducts />
      <ProductCategories />
      {/* <AboutMovie /> */}
      <Footer />
      <FloatingCart />
    </div>
  );
};