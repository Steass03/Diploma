"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Pagination,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { User, JobseekerFilters } from "@/types";
import { mockUsers } from "@/lib/mockData";
import { useDataMode } from "@/app/dataMode";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";

export default function JobseekersPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const [filters, setFilters] = useState<JobseekerFilters>({
    q: "",
    openToWork: true,
    employmentTypes: [],
    workModes: [],
    skills: [],
    sortBy: "newest",
    sortDir: "desc",
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [jobseekers, setJobseekers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const { mode: dataMode } = useDataMode();

  const fetchJobseekers = async () => {
    setLoading(true);
    setError("");
    
    // Якщо режим мок-даних, використовуємо їх напряму
    if (dataMode === "mock") {
      let mockJobseekers = mockUsers.filter(u => u.role === "jobseeker");
      
      // Фільтруємо за пошуковим запитом, якщо є
      if (filters.q) {
        const query = filters.q.toLowerCase();
        mockJobseekers = mockJobseekers.filter(
          (user) =>
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.description?.toLowerCase().includes(query) ||
            user.jobseekerProfile?.stack?.some((skill) => skill.toLowerCase().includes(query))
        );
      }
      
      // Фільтруємо за openToWork
      if (filters.openToWork !== undefined && filters.openToWork !== false) {
        mockJobseekers = mockJobseekers.filter(
          (user) => user.jobseekerProfile?.openToWork === true
        );
      }
      
      setJobseekers(mockJobseekers);
      setTotal(mockJobseekers.length);
      setPages(1);
      setLoading(false);
      return;
    }
    
    // Режим API - завантажуємо з API
    try {
      const params: any = { ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "" || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });
      const response = await api.jobseekers.list(params);
      // Якщо немає кандидатів, використовуємо мок-дані для демонстрації
      if (response.items.length === 0 && response.total === 0) {
        const mockJobseekers = mockUsers.filter(u => u.role === "jobseeker");
        setJobseekers(mockJobseekers);
        setTotal(mockJobseekers.length);
        setPages(1);
      } else {
        setJobseekers(response.items);
        setTotal(response.total);
        setPages(response.pages);
      }
    } catch (err) {
      // У випадку помилки показуємо мок-дані для демонстрації
      console.warn("Failed to fetch jobseekers, using mock data:", err);
      const mockJobseekers = mockUsers.filter(u => u.role === "jobseeker");
      setJobseekers(mockJobseekers);
      setTotal(mockJobseekers.length);
      setPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "employer") {
      fetchJobseekers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.sortBy, filters.sortDir, user, dataMode]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchJobseekers();
  };

  const handleSaveJobseeker = async (e: React.MouseEvent, jobseekerId: string) => {
    e.stopPropagation();
    if (!user || user.role !== "employer") return;

    const jobseeker = jobseekers.find((j) => j._id === jobseekerId);
    if (!jobseeker) return;

    try {
      if (jobseeker.isSaved) {
        await api.employers.unsaveJobseeker(jobseekerId);
      } else {
        await api.employers.saveJobseeker(jobseekerId);
      }
      setJobseekers((prev) =>
        prev.map((j) =>
          j._id === jobseekerId ? { ...j, isSaved: !j.isSaved } : j
        )
      );
    } catch (err) {
      console.error("Failed to save/unsave jobseeker:", err);
    }
  };

  if (user?.role !== "employer") {
    return (
      <MainLayout>
        <Container>
          <Alert severity="error">Доступ заборонено. Ця сторінка тільки для роботодавців.</Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
      >
        <Stack spacing={3}>
          <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
            Кандидати
          </Typography>

          {/* Search Bar */}
          <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                placeholder="Пошук кандидатів..."
                fullWidth
                size={isMobile ? "small" : "medium"}
                value={filters.q || ""}
                onChange={(e) =>
                  setFilters({ ...filters, q: e.target.value })
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <Stack
                direction="row"
                spacing={1}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  fullWidth={isMobile}
                >
                  {isMobile ? "Пошук" : <SearchIcon />}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  fullWidth={isMobile}
                >
                  {isMobile ? "Фільтри" : <FilterListIcon />}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Filters */}
          {showFilters && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom>
                Фільтри
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.openToWork !== false}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            openToWork: e.target.checked ? true : undefined,
                          })
                        }
                      />
                    }
                    label="Відкриті до роботи"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="Навички (через кому)"
                    placeholder="React, TypeScript, Node.js"
                    value={filters.skills?.join(", ") || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        skills: e.target.value
                          ? e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                          : undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="Зареєстровано після"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filters.createdAfter || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        createdAfter: e.target.value || undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="Зареєстровано до"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filters.createdBefore || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        createdBefore: e.target.value || undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Сортування</InputLabel>
                    <Select
                      value={filters.sortBy || "newest"}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          sortBy: e.target.value as any,
                        })
                      }
                      label="Сортування"
                    >
                      <MenuItem value="newest">Найновіші</MenuItem>
                      <MenuItem value="oldest">Найстаріші</MenuItem>
                      <MenuItem value="firstName">За ім'ям</MenuItem>
                      <MenuItem value="lastName">За прізвищем</MenuItem>
                      <MenuItem value="dateOfBirth">За датою народження</MenuItem>
                      <MenuItem value="createdAt">За датою реєстрації</MenuItem>
                      <MenuItem value="updatedAt">За датою оновлення</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Напрямок</InputLabel>
                    <Select
                      value={filters.sortDir || "desc"}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          sortDir: e.target.value as "asc" | "desc",
                        })
                      }
                      label="Напрямок"
                    >
                      <MenuItem value="desc">Спадання</MenuItem>
                      <MenuItem value="asc">Зростання</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilters({
                      q: "",
                      openToWork: true,
                      employmentTypes: [],
                      workModes: [],
                      skills: undefined,
                      createdAfter: undefined,
                      createdBefore: undefined,
                      updatedAfter: undefined,
                      updatedBefore: undefined,
                      sortBy: "newest",
                      sortDir: "desc",
                      page: 1,
                      limit: 20,
                    });
                  }}
                >
                  Очистити фільтри
                </Button>
              </Box>
            </Paper>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && (
            <>
              <Typography variant="h6">Знайдено кандидатів: {total}</Typography>
              <Stack spacing={2}>
                {jobseekers.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      Кандидати не знайдено
                    </Typography>
                  </Paper>
                ) : (
                  jobseekers.map((jobseeker) => (
                    <Card
                      key={jobseeker._id}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardContent
                        onClick={() => router.push(`/jobseekers/${jobseeker._id}`)}
                      >
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="start"
                          >
                            <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
                              <Avatar
                                src={jobseeker.imageUrl}
                                sx={{ width: 64, height: 64 }}
                              >
                                {jobseeker.firstName?.charAt(0) || "U"}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold">
                                  {jobseeker.firstName} {jobseeker.lastName}
                                </Typography>
                                {jobseeker.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1 }}
                                  >
                                    {jobseeker.description.length > 150
                                      ? `${jobseeker.description.substring(0, 150)}...`
                                      : jobseeker.description}
                                  </Typography>
                                )}
                                {jobseeker.jobseekerProfile?.stack && jobseeker.jobseekerProfile.stack.length > 0 && (
                                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
                                    {jobseeker.jobseekerProfile.stack.slice(0, 5).map((skill, idx) => (
                                      <Chip key={idx} label={skill} size="small" variant="outlined" />
                                    ))}
                                  </Stack>
                                )}
                              </Box>
                            </Stack>
                            <IconButton
                              onClick={(e) => handleSaveJobseeker(e, jobseeker._id)}
                              color={jobseeker.isSaved ? "primary" : "default"}
                            >
                              {jobseeker.isSaved ? (
                                <BookmarkIcon />
                              ) : (
                                <BookmarkBorderIcon />
                              )}
                            </IconButton>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>

              {pages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={pages}
                    page={filters.page || 1}
                    onChange={(_, page) =>
                      setFilters({ ...filters, page })
                    }
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>
              )}
            </>
          )}
        </Stack>
      </Container>
    </MainLayout>
  );
}


