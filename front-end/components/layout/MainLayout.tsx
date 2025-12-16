"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/app/theme";
import { DataModeToggle } from "@/app/dataMode";
import { useAuth } from "@/contexts/AuthContext";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import BookmarkIcon from "@mui/icons-material/Bookmark";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, loading, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = !!user;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    router.push("/");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const navigationItems = [
    { label: "Пошук", path: "/search", icon: <SearchIcon /> },
    ...(user?.role === "employer"
      ? [
          { label: "Кандидати", path: "/jobseekers", icon: <PeopleIcon /> },
          { label: "Збережені", path: "/employers/saved", icon: <BookmarkIcon /> },
        ]
      : []),
    ...(user?.role === "jobseeker"
      ? [{ label: "Збережені", path: "/jobseekers/saved", icon: <BookmarkIcon /> }]
      : []),
    { label: "Аналітика", path: "/analytics", icon: <AnalyticsIcon /> },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            component="div"
            sx={{
              flexGrow: 0,
              mr: { xs: 1, md: 4 },
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => router.push("/")}
          >
            JobSearch
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", gap: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => router.push(item.path)}
                  sx={{
                    textTransform: "none",
                    bgcolor:
                      pathname === item.path
                        ? "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ThemeToggle />
            <DataModeToggle />
            {isAuthenticated ? (
              <>
                <IconButton onClick={handleMenuOpen} color="inherit">
                  <Avatar
                    src={user?.imageUrl}
                    sx={{
                      width: { xs: 28, md: 32 },
                      height: { xs: 28, md: 32 },
                    }}
                  >
                    {user?.firstName?.charAt(0) || "U"}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => { router.push("/profile"); handleMenuClose(); }}>
                    Профіль
                  </MenuItem>
                  <MenuItem onClick={() => { router.push("/settings"); handleMenuClose(); }}>
                    Налаштування
                  </MenuItem>
                  {user?.role === "employer" && (
                    <MenuItem onClick={() => { router.push("/jobs/create"); handleMenuClose(); }}>
                      Створити вакансію
                    </MenuItem>
                  )}
                  {user?.role === "employer" && (
                    <MenuItem onClick={() => { router.push("/employers/offers"); handleMenuClose(); }}>
                      Мої вакансії
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Вийти</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                startIcon={<PersonIcon />}
                onClick={() => router.push("/auth/login")}
                size={isMobile ? "small" : "medium"}
                sx={{ textTransform: "none" }}
              >
                {isMobile ? "" : "Увійти"}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={pathname === item.path}
                  onClick={() => handleNavClick(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
