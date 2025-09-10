import React from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar,
  Box, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme
} from '@mui/material';
import { Menu as MenuIcon, ShoppingCart, AccountCircle, Logout, Login, PersonAdd } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileModal } from './ProfileModal';
import { Link } from 'react-router-dom';


interface NavbarProps {
  show?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ show = true }) => {
  if (!show) return null;

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: "Home", path: "/home", showNavbar: true },
    { name: "Shop", path: "/products", showNavbar: true },
    { name: "Collections", path: "/collections", showNavbar: true },
    { name: "Promotions", path: "/promotions", showNavbar: true },
    { name: "About", path: "/about", showNavbar: true },
  ];

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 2px 10px rgba(220, 38, 38, 0.2)",
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          py: 1,
          // px: { xs: 2, sm: 4 },
          display: "flex",
          alignItems: "center",
          // justifyContent: "space-between",
        }}
      >
        {/* Left: Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: { xs: 0, sm: 2 } }}>
          <Link to="/home">
          <Icon icon="mdi:pistol" className="text-red-500" style={{ fontSize: "28px", cursor:"pointer" }} />
          </Link>
          <Link to="/home">
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Ungai1', sans-serif",
              letterSpacing: "0.1em",
              fontWeight: 700,
              background: "linear-gradient(90deg, #fff 0%, #dc2626 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              display: { xs: "none", sm: "block" },
            }}
          >
            MOBSTER MERCH
          </Typography>
          </Link>
        </Box>

        {/* Center: Desktop Menu */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            gap: 3,
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {menuItems.map((item) => (
            <Box
              key={item.name}
              component="button"
              onClick={() => {
                navigate(item.path, { state: { showNavbar: item.showNavbar } }); // ✅ pass state
              }}
              sx={{
                color: "rgba(255,255,255,0.9)",
                letterSpacing: "0.1em",
                textDecoration: "none",
                px: 2,
                py: 1,
                borderRadius: "4px",
                transition: "all 0.3s ease",
                background: "none",
                border: "none",
                cursor: "pointer",
                "&:hover": { color: "#dc2626" },
                className: 'ungai-font',
              }}
            >
              <Typography
                variant="button"
                sx={{ fontFamily: "'Ungai1', sans-serif", fontSize: "0.85rem" }}
              >
                {item.name}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Right: Auth / Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 ,ml: "auto"}}>
          {isAuthenticated ? (
            <>
              {/* <IconButton
                onClick={() => navigate("/cart")}
                sx={{ color: "#dc2626" }}
              >
                <ShoppingCart />
              </IconButton> */}
              <IconButton
                onClick={handleClick}
                sx={{ color: "white" }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user?.name?.charAt(0) || "U"}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    sx: {
                      backgroundColor: "rgba(0,0,0,0.9)",
                      color: "white",
                      border: "1px solid #dc2626",
                    },
                  },
                }}
              >
                <MenuItem onClick={() => { setIsProfileOpen(true); handleClose(); }}>
                  <AccountCircle sx={{ mr: 1 }} /> Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate("/orders"); handleClose(); }}>
                  <Icon icon="lucide:package" className="mr-2" /> Orders
                </MenuItem>
                <MenuItem onClick={() => { navigate("/notifications"); handleClose(); }}>
                  <Icon icon="lucide:bell" className="mr-2" /> Notifications
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* <button
                onClick={() => navigate("/register")}
                className="px-3 py-1 text-white border border-red-500 rounded hover:bg-red-500 transition-colors text-sm"
              >
                Register
              </button> */}
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer transition-colors text-sm"
              >
                Login
              </button>
            </>
          )}
          {isMobile && (
            <IconButton
              onClick={() => setIsMenuOpen(true)}
              sx={{ color: "white", ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          PaperProps={{
            sx: {
              backgroundColor: "rgba(0,0,0,0.98)",
              backdropFilter: "blur(12px)",
              color: "white",
              width: 250,
              borderRight: "1px solid #dc2626",
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: "rgba(220,38,38,0.1)",
            }}
          >
            <Icon icon="mdi:pistol" className="text-red-500" style={{ fontSize: "28px" }} />
            <Typography variant="h6" sx={{ fontFamily: " sans-serif" }}>
              MOBSTER MERCH
            </Typography>
          </Box>
          <List sx={{ pt: 1 }}>
            {menuItems.map((item) => (
              <ListItem
                key={item.name}
                component="button"
                onClick={() => {
                  navigate(item.path, { state: { showNavbar: item.showNavbar } }); // ✅ pass state here too
                  setIsMenuOpen(false);
                }}
                sx={{ cursor: "pointer" }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontFamily: "'Ungai1', sans-serif" }}>
                      {item.name}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <div>
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
};
