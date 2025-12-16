"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkIcon from "@mui/icons-material/Bookmark";

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <MainLayout>
        <Box
          sx={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography>Завантаження...</Typography>
        </Box>
      </MainLayout>
    );
  }

  if (user) {
    // Logged in user view
    return (
      <MainLayout>
        <Box
          sx={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
          <Container
            maxWidth="lg"
            sx={{ py: { xs: 4, md: 8 }, px: { xs: 1, sm: 2 }, flex: 1 }}
          >
            <Stack spacing={4}>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  component="h1"
                  color="primary"
                  gutterBottom
                  sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" } }}
                >
                  Вітаємо, {user.firstName}!
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                  }}
                >
                  {user.role === "employer"
                    ? "Знайдіть ідеальних кандидатів для вашої компанії"
                    : "Знайдіть роботу мрії"}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid
                  size={{ xs: 12, sm: 6, md: user.role === "employer" ? 4 : 6 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => router.push("/search")}
                  >
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <SearchIcon
                          sx={{ fontSize: 48, color: "primary.main" }}
                        />
                        <Typography variant="h6">Пошук вакансій</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Перегляньте доступні вакансії
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {user.role === "employer" && (
                  <>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        sx={{
                          height: "100%",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: 6,
                          },
                        }}
                        onClick={() => router.push("/jobseekers")}
                      >
                        <CardContent>
                          <Stack
                            spacing={2}
                            alignItems="center"
                            textAlign="center"
                          >
                            <PeopleIcon
                              sx={{ fontSize: 48, color: "primary.main" }}
                            />
                            <Typography variant="h6">Кандидати</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Перегляньте профілі кандидатів
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        sx={{
                          height: "100%",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: 6,
                          },
                        }}
                        onClick={() => router.push("/jobs/create")}
                      >
                        <CardContent>
                          <Stack
                            spacing={2}
                            alignItems="center"
                            textAlign="center"
                          >
                            <WorkIcon
                              sx={{ fontSize: 48, color: "primary.main" }}
                            />
                            <Typography variant="h6">
                              Створити вакансію
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Опублікуйте нову вакансію
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}

                {user.role === "jobseeker" && (
                  <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <Card
                      sx={{
                        height: "100%",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                      onClick={() => router.push("/jobseekers/saved")}
                    >
                      <CardContent>
                        <Stack
                          spacing={2}
                          alignItems="center"
                          textAlign="center"
                        >
                          <BookmarkIcon
                            sx={{ fontSize: 48, color: "primary.main" }}
                          />
                          <Typography variant="h6">
                            Збережені вакансії
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Перегляньте збережені вакансії
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: user.role === "employer" ? 6 : 12,
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => router.push("/profile")}
                  >
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Typography variant="h6">Мій профіль</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Переглянути та редагувати профіль
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </Container>
        </Box>
      </MainLayout>
    );
  }

  // Not logged in view
  return (
    <MainLayout>
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ py: { xs: 4, md: 8 }, px: { xs: 1, sm: 2 }, flex: 1 }}
        >
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              color="primary"
              sx={{ fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" } }}
            >
              Job Search Platform
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" } }}
            >
              Знайдіть роботу мрії або знайдіть ідеального кандидата
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/search")}
                fullWidth={isMobile}
              >
                Пошук вакансій
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/auth/login")}
                fullWidth={isMobile}
              >
                Увійти
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </MainLayout>
  );
}
