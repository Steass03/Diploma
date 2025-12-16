"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  Container,
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import EditIcon from "@mui/icons-material/Edit";
import { User } from "@/types";
import { api, ApiError } from "@/lib/api";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [savedOffersCount, setSavedOffersCount] = useState(0);
  const [myOffersCount, setMyOffersCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        // Fetch full user profile
        const userData = await api.users.getById(authUser._id);
        setUser(userData);

        // Fetch counts based on role
        if (authUser.role === "jobseeker") {
          try {
            const savedResponse = await api.jobseekers.listSavedOffers();
            setSavedOffersCount(savedResponse.items.length);
          } catch (err) {
            // Ignore errors for saved offers count
          }
        } else if (authUser.role === "employer") {
          try {
            const offersResponse = await api.employers.listMyOffers({ page: 1, limit: 1 });
            setMyOffersCount(offersResponse.total);
          } catch (err) {
            // Ignore errors for offers count
          }
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Помилка завантаження профілю");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [authUser, authLoading]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Navigate based on tab
    if (newValue === 0 && authUser?.role === "employer") {
      router.push("/employers/offers");
    } else if (newValue === 1 && authUser?.role === "jobseeker") {
      router.push("/jobseekers/saved");
    } else if (newValue === 1 && authUser?.role === "employer") {
      router.push("/employers/saved");
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  if (!authUser) {
    return (
      <MainLayout>
        <Container>
          <Alert severity="error">Будь ласка, увійдіть в систему</Alert>
        </Container>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <Container>
          <Alert severity="error">{error || "Помилка завантаження профілю"}</Alert>
        </Container>
      </MainLayout>
    );
  }

  const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

  return (
    <MainLayout>
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
      >
        <Stack spacing={3}>
          {/* Profile Header */}
          <Paper sx={{ p: { xs: 2, sm: 4 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ xs: "center", sm: "center" }}
            >
              <Avatar
                src={user.imageUrl}
                sx={{
                  width: { xs: 80, sm: 120 },
                  height: { xs: 80, sm: 120 },
                  fontSize: { xs: 32, sm: 48 },
                }}
              >
                {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
                >
                  {displayName}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                {user.contacts?.phone && (
                  <Typography variant="body2" color="text.secondary">
                    {user.contacts.phone}
                  </Typography>
                )}
                {user.description && (
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {user.description}
                  </Typography>
                )}
                {user.role === "employer" && user.employerProfile?.companyName && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {user.employerProfile.companyName}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push("/settings")}
                fullWidth={isMobile}
              >
                Редагувати
              </Button>
            </Stack>
          </Paper>

          {/* Tabs */}
          <Paper>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
            >
              {user.role === "employer" ? (
                [
                  <Tab key="offers" label="Мої вакансії" />,
                  <Tab key="saved" label="Збережені кандидати" />,
                ]
              ) : (
                <Tab label="Збережені вакансії" />
              )}
            </Tabs>

            {user.role === "employer" ? (
              <>
                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h6" gutterBottom>
                    Мої вакансії
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    У вас {myOffersCount} вакансій
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => router.push("/employers/offers")}
                    sx={{ mt: 2 }}
                  >
                    Переглянути всі вакансії
                  </Button>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Збережені кандидати
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => router.push("/employers/saved")}
                    sx={{ mt: 2 }}
                  >
                    Переглянути збережених кандидатів
                  </Button>
                </TabPanel>
              </>
            ) : (
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>
                  Збережені вакансії
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  У вас {savedOffersCount} збережених вакансій
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push("/jobseekers/saved")}
                  sx={{ mt: 2 }}
                >
                  Переглянути всі збережені
                </Button>
              </TabPanel>
            )}
          </Paper>

          {/* Stats */}
          <Grid container spacing={2}>
            {user.role === "employer" ? (
              <>
                <Grid item xs={12} sm={6} md={6}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="text.secondary"
                        gutterBottom
                        variant="body2"
                      >
                        Мої вакансії
                      </Typography>
                      <Typography variant="h4">{myOffersCount}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="text.secondary"
                        gutterBottom
                        variant="body2"
                      >
                        Збережені кандидати
                      </Typography>
                      <Typography variant="h4">-</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            ) : (
              <Grid item xs={12} sm={6} md={6}>
                <Card>
                  <CardContent>
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      Збережені вакансії
                    </Typography>
                    <Typography variant="h4">{savedOffersCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Stack>
      </Container>
    </MainLayout>
  );
}
