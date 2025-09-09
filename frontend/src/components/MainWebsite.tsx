import React from "react";
import { Navbar } from "./Navbar";
import { SectionWrapper } from "./SectionWrapper";
import { Home } from "../pages/Home";
import { Collections } from "./Collections";
import  {Promotions}  from "../pages/Promotions";
import { FeaturedMerchandisePage } from "../pages/FeaturedMerchandisePage";
import { Footer } from "../pages/Footer";


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
      <Collections />
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
