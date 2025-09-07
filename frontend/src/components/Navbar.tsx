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
import { API_BASE_URL } from '../services';

export const Navbar: React.FC = () => {
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
    { name: "Home", href: "#" },
    { name: "Shop", href: "#featured" },
    { name: "Collections", href: "#collections" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
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
          px: { xs: 2, sm: 4 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            ml: { xs: 0, sm: 2 },
          }}
        >
          <Icon
            icon="mdi:pistol"
            className="text-red-500"
            style={{ fontSize: "28px" }}
          />
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Ungai', sans-serif",
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
              component="a"
              href={item.href}
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontFamily: "'Ungai', sans-serif",
                letterSpacing: "0.1em",
                textDecoration: "none",
                px: 2,
                py: 1,
                borderRadius: "4px",
                transition: "all 0.3s ease",
                "&:hover": {
                  color: "#dc2626",
                },
              }}
            >
              <Typography
                variant="button"
                sx={{ fontFamily: "'Ungai', sans-serif", fontSize: "0.85rem" }}
              >
                {item.name}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Right: Auth / Profile */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mr: { xs: 0, sm: 2 },
          }}
        >
          {isAuthenticated ? (
            <>
              <Typography
                variant="body2"
                sx={{
                  display: { xs: "none", sm: "inline" },
                  mr: 1,
                  opacity: 0.9,
                  color: "white",
                  fontFamily: "'Ungai', sans-serif",
                }}
              >
                Welcome, {user?.name}
              </Typography>
              <IconButton onClick={handleClick}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    border: "2px solid #dc2626",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                  src={
                    user?.image_url
                      ? `${API_BASE_URL.replace("/api", "")}${user.image_url}`
                      : undefined
                  }
                >
                  {!user?.image_url
                    ? user?.name?.charAt(0).toUpperCase()
                    : undefined}
                </Avatar>
              </IconButton>
              <Menu
                className=""
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #dc2626",
                    mt: 0.5,
                    mr: { xs: "2px", sm: "5px", md: "12px" },
                    "& .MuiMenuItem-root": {
                      color: "white",
                      fontFamily: "'Ungai', sans-serif",
                      "&:hover": { backgroundColor: "rgba(220,38,38,0.1)" },
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    setIsProfileOpen(true);
                  }}
                >
                  <AccountCircle sx={{ mr: 1, color: "#dc2626" }} /> My Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/orders");
                  }}
                >
                  <ShoppingCart sx={{ mr: 1, color: "#dc2626" }} /> My Orders
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/notifications");
                  }}
                >
                  <Icon icon="mdi:bell" className="text-red-500 mr-2" />{" "}
                  Notifications
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    handleLogout();
                  }}
                  sx={{ color: "#dc2626 !important" }}
                >
                  <Logout sx={{ mr: 1 }} /> Log Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <IconButton
                sx={{
                  border: "1px solid #dc2626",
                  color: "#dc2626",
                  "&:hover": { backgroundColor: "rgba(220,38,38,0.1)" },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  padding: { xs: "4px", sm: "8px" },
                }}
                onClick={() =>
                  navigate("/login", { state: { mode: "register" } })
                }
              >
                <PersonAdd sx={{ fontSize: { xs: "16px", sm: "20px" } }} />
                <Typography
                  sx={{ display: { xs: "none", sm: "inline" }, ml: 0.5 }}
                >
                  Register
                </Typography>
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: "#dc2626",
                  "&:hover": { backgroundColor: "#b91c1c" },
                  padding: { xs: "4px", sm: "8px" },
                }}
                onClick={() => navigate("/login")}
              >
                <Login
                  sx={{ color: "white", fontSize: { xs: "16px", sm: "20px" } }}
                />
                <Typography
                  sx={{
                    display: { xs: "none", sm: "inline" },
                    ml: 0.5,
                    color: "white",
                  }}
                >
                  Login
                </Typography>
              </IconButton>
            </>
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
            <Icon
              icon="mdi:pistol"
              className="text-red-500"
              style={{ fontSize: "28px" }}
            />
            <Typography variant="h6" sx={{ fontFamily: "'Ungai', sans-serif" }}>
              MOBSTER MERCH
            </Typography>
          </Box>
          <List sx={{ pt: 1 }}>
            {menuItems.map((item) => (
              <ListItem
                key={item.name}
                component="a"
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontFamily: "'Ungai', sans-serif" }}>
                      {item.name}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <div className="">
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
};
