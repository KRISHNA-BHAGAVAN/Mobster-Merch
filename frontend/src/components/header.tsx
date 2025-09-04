import React from "react";
// TODO: Replace HeroUI components with Material-UI
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { name: "Home", href: "#" },
    { name: "Merchandise", href: "#merchandise" },
    { name: "About", href: "#about" },
    { name: "Gallery", href: "#gallery" },
  ];

  return (
    <Navbar 
      isMenuOpen={isMenuOpen} 
      onMenuOpenChange={setIsMenuOpen}
      className="bg-background/90 backdrop-blur-md border-b border-primary/20"
      maxWidth="xl"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle 
          aria-label={isMenuOpen ? "Close menu" : "Open menu"} 
          className="text-foreground"
        />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <p className="font-storm text-2xl text-primary text-shadow-red">OG</p>
            <p className="font-ramisa text-lg text-foreground">They Call Him</p>
          </motion.div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarBrand>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <p className="font-storm text-3xl text-primary text-shadow-red">OG</p>
            <p className="font-ramisa text-xl text-foreground">They Call Him</p>
          </motion.div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <a href="#" className="text-foreground">
            <Icon icon="lucide:search" width={20} />
          </a>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          {menuItems.map((item, index) => (
            <a 
              key={index} 
              href={item.href}
              className="px-4 py-2 text-foreground hover:text-primary transition-colors"
            >
              {item.name}
            </a>
          ))}
        </NavbarItem>
        <NavbarItem>
          <button 
            as={Link} 
             
            href="#" 
            
            
            className="font-ramisa"
          >
            Cart (0)
          </button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-background/95 backdrop-blur-md pt-6">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={index}>
            <a
              href={item.href}
              className="w-full text-foreground hover:text-primary text-lg py-2 font-ramisa"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};