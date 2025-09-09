import React from "react";
import { Navbar } from "./Navbar";
// import { SectionWrapper } from "./SectionWrapper";
import { Home } from "../pages/Home";
import  {Promotions}  from "../pages/Promotions";
import { FeaturedMerchandisePage } from "../pages/FeaturedMerchandisePage";
import { Footer } from "../pages/Footer";
import { CollectionsPage } from "../pages/CollectionsPage";
import { ProductCollections } from "./ProductCollections";


export const MainWebsite: React.FC = () => {
  return (
    // <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-background text-foreground">
    <div>
      <Navbar />

      {/* <SectionWrapper id="home"> */}
      <Home showNavbar={false} />
      {/* </SectionWrapper> */}

      {/* <SectionWrapper id="featured"> */}
      <FeaturedMerchandisePage showNavbar={false} />
      {/* </SectionWrapper> */}

      {/* <SectionWrapper id="collections"> */}
      <ProductCollections />
      {/* </SectionWrapper> */}

      {/* <SectionWrapper id="promotions"> */}
      <Promotions showNavbar={false} />
      {/* </SectionWrapper> */}

      {/* <SectionWrapper id="about"> */}
      <Footer showNavbar={false} />
      {/* </SectionWrapper> */}
    </div>
  );
};
