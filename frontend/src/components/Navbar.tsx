import React from 'react';
import { Navbar as HeroNavbar, NavbarContent, NavbarItem, NavbarBrand, Button, Link, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileModal } from './ProfileModal';
import { API_BASE_URL } from '../services';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: "Home", href: "#" },
    { name: "Shop", href: "#featured" },
    { name: "Collections", href: "#collections" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <HeroNavbar 
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      className="bg-background/80 backdrop-blur-md border-b border-primary/20"
      maxWidth="xl"
      isBordered
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-primary"
        />
        <NavbarBrand>
          <div className="flex items-center gap-2">
            <span class="icon-[emojione-monotone--dragon]"></span>
            <Icon icon="mdi:ninja" className="text-primary h-6 w-6" />
            <span className="title-font text-xl tracking-wider text-white">
              MOBSTER <span className="heading-font text-primary">MERCH</span>
            </span>
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.name}>
            <Link 
              href={item.href}
              className="text-foreground/80 hover:text-primary transition-colors duration-200 heading-font tracking-wider"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        {isAuthenticated ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <span className="text-sm text-foreground/70">Welcome, {user?.name}</span>
            </NavbarItem>
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform"
                    color="primary"
                    name={!user?.image_url ? user?.name?.charAt(0).toUpperCase() : undefined}
                    size="sm"
                    src={user?.image_url ? `${API_BASE_URL.replace('/api', '')}${user.image_url}` : undefined}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-sans">{user?.email}</p>
                  </DropdownItem>
                  <DropdownItem key="settings" onPress={() => setIsProfileOpen(true)}>
                    My Profile
                  </DropdownItem>
                  <DropdownItem key="orders" onPress={() => navigate('/orders')}>
                    My Orders
                  </DropdownItem>
                  <DropdownItem key="notifications" onPress={() => navigate('/notifications')}>
                    Notifications
                  </DropdownItem>
                  <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <Button 
              variant="flat" 
              color="primary"
              className="heading-font tracking-wider mr-2"
              onPress={() => navigate('/register')}
            >
              Register
            </Button>
            <Button 
              variant="flat" 
              color="primary"
              className="heading-font tracking-wider"
              onPress={() => navigate('/login')}
            >
              LOGIN
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarMenu className="bg-background/95 backdrop-blur-md pt-6">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              href={item.href}
              className="w-full heading-font tracking-wider text-lg py-2 text-foreground/80 hover:text-primary"
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </HeroNavbar>
  );
};