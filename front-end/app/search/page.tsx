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
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Pagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { Offer, JobFilters } from "@/types";
import { mockOffers } from "@/lib/mockData";
import { useDataMode } from "@/app/dataMode";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function SearchPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const [filters, setFilters] = useState<JobFilters>({
    q: "",
    workMode: undefined,
    employmentType: undefined,
    isActive: true,
    page: 1,
    limit: 20,
    sortBy: "postedAt",
    sortDir: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const { mode: dataMode } = useDataMode();

  const fetchOffers = async () => {
    setLoading(true);
    setError("");
    
    // Якщо режим мок-даних, використовуємо їх напряму
    if (dataMode === "mock") {
      // Фільтруємо мок-дані за пошуковим запитом, якщо є
      let filteredOffers = mockOffers;
      if (filters.q) {
        const query = filters.q.toLowerCase();
        filteredOffers = mockOffers.filter(
          (offer) =>
            offer.title.toLowerCase().includes(query) ||
            offer.companyName?.toLowerCase().includes(query) ||
            offer.descriptionText?.toLowerCase().includes(query) ||
            offer.skills?.some((skill) => skill.toLowerCase().includes(query))
        );
      }
      setOffers(filteredOffers);
      setTotal(filteredOffers.length);
      setPages(1);
      setLoading(false);
      return;
    }
    
    // Режим API - завантажуємо з API
    try {
      const params: any = {
        ...filters,
        q: filters.q || undefined,
      };
      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });
      const response = await api.offers.list(params);
      // Якщо немає вакансій, використовуємо мок-дані для демонстрації
      if (response.items.length === 0 && response.total === 0) {
        setOffers(mockOffers);
        setTotal(mockOffers.length);
        setPages(1);
      } else {
        setOffers(response.items);
        setTotal(response.total);
        setPages(response.pages);
      }
    } catch (err) {
      // У випадку помилки показуємо мок-дані для демонстрації
      console.warn("Failed to fetch offers, using mock data:", err);
      setOffers(mockOffers);
      setTotal(mockOffers.length);
      setPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.sortBy, filters.sortDir, dataMode]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchOffers();
  };

  const handleSaveOffer = async (e: React.MouseEvent, offerId: string) => {
    e.stopPropagation();
    if (!user || user.role !== "jobseeker") {
      router.push("/auth/login");
      return;
    }

    const offer = offers.find((o) => o._id === offerId);
    if (!offer) return;

    try {
      if (offer.isSaved) {
        await api.jobseekers.unsaveOffer(offerId);
      } else {
        await api.jobseekers.saveOffer(offerId);
      }
      // Update local state
      setOffers((prev) =>
        prev.map((o) =>
          o._id === offerId ? { ...o, isSaved: !o.isSaved } : o
        )
      );
    } catch (err) {
      console.error("Failed to save/unsave offer:", err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не вказано";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Сьогодні";
    if (diffDays === 1) return "Вчора";
    if (diffDays < 7) return `${diffDays} днів тому`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} тижнів тому`;
    return `${Math.floor(diffDays / 30)} місяців тому`;
  };

  const getLocationString = (location?: Offer["location"]) => {
    if (!location) return "Не вказано";
    return location.formatted || location.city || location.region || location.country || "Не вказано";
  };

  const getSalaryString = (salary?: Offer["salary"]) => {
    if (!salary) return "Не вказано";
    if (salary.rawText) return salary.rawText;
    if (salary.min && salary.max) {
      return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency || ""}`;
    }
    if (salary.min) {
      return `від ${salary.min.toLocaleString()} ${salary.currency || ""}`;
    }
    return "Не вказано";
  };

  return (
    <MainLayout>
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
      >
        <Stack spacing={3}>
          {/* Search Bar */}
          <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                placeholder="Пошук вакансій..."
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
                  sx={{ minWidth: { sm: "auto" } }}
                >
                  {isMobile ? "Пошук" : <SearchIcon />}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  fullWidth={isMobile}
                  sx={{ minWidth: { sm: "auto" } }}
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
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Режим роботи</InputLabel>
                    <Select
                      value={filters.workMode || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          workMode: e.target.value || undefined,
                        })
                      }
                      label="Режим роботи"
                    >
                      <MenuItem value="">Всі</MenuItem>
                      <MenuItem value="remote">Віддалено</MenuItem>
                      <MenuItem value="in-office">В офісі</MenuItem>
                      <MenuItem value="hybrid">Гібридно</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Тип зайнятості</InputLabel>
                    <Select
                      value={filters.employmentType || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          employmentType: e.target.value || undefined,
                        })
                      }
                      label="Тип зайнятості"
                    >
                      <MenuItem value="">Всі</MenuItem>
                      <MenuItem value="fulltime">Повна зайнятість</MenuItem>
                      <MenuItem value="part-time">Часткова зайнятість</MenuItem>
                      <MenuItem value="contract">Контракт</MenuItem>
                      <MenuItem value="internship">Стажування</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="Місто"
                    value={filters.locationCity || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        locationCity: e.target.value || undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="Країна"
                    value={filters.locationCountry || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        locationCountry: e.target.value || undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="Мінімальна зарплата"
                    type="number"
                    value={filters.salaryMin || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        salaryMin: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="Максимальна зарплата"
                    type="number"
                    value={filters.salaryMax || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        salaryMax: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="Компанія"
                    value={filters.companyName || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        companyName: e.target.value || undefined,
                      })
                    }
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
                    label="Опубліковано після"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filters.postedAfter || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        postedAfter: e.target.value || undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="Опубліковано до"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filters.postedBefore || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        postedBefore: e.target.value || undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Сортування</InputLabel>
                    <Select
                      value={filters.sortBy || "postedAt"}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          sortBy: e.target.value as any,
                        })
                      }
                      label="Сортування"
                    >
                      <MenuItem value="postedAt">За датою публікації</MenuItem>
                      <MenuItem value="createdAt">За датою створення</MenuItem>
                      <MenuItem value="title">За назвою</MenuItem>
                      <MenuItem value="companyName">За компанією</MenuItem>
                      <MenuItem value="salary">За зарплатою</MenuItem>
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
                      workMode: undefined,
                      employmentType: undefined,
                      locationCity: undefined,
                      locationCountry: undefined,
                      salaryMin: undefined,
                      salaryMax: undefined,
                      companyName: undefined,
                      skills: undefined,
                      postedAfter: undefined,
                      postedBefore: undefined,
                      isActive: true,
                      page: 1,
                      limit: 20,
                      sortBy: "postedAt",
                      sortDir: "desc",
                    });
                  }}
                >
                  Очистити фільтри
                </Button>
              </Box>
            </Paper>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Offers List */}
          {!loading && (
            <>
              <Typography variant="h6">
                Знайдено вакансій: {total}
              </Typography>
              <Stack spacing={2}>
                {offers.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      Вакансії не знайдено
                    </Typography>
                  </Paper>
                ) : (
                  offers.map((offer) => (
                    <Card
                      key={offer._id}
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
                        onClick={() => router.push(`/jobs/${offer._id}`)}
                      >
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="start"
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                gutterBottom
                                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                              >
                                {offer.title}
                              </Typography>
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={1}
                                sx={{ mb: 1 }}
                              >
                                <Typography
                                  color="primary"
                                  fontWeight="medium"
                                  component="span"
                                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                                >
                                  {offer.companyName || "Не вказано"}
                                </Typography>
                                {!isMobile && (
                                  <Typography color="text.secondary" component="span">
                                    •
                                  </Typography>
                                )}
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                >
                                  <LocationOnIcon fontSize="small" color="action" />
                                  <Typography
                                    color="text.secondary"
                                    component="span"
                                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                                  >
                                    {getLocationString(offer.location)}
                                  </Typography>
                                </Stack>
                                {offer.workMode === "remote" && (
                                  <Chip
                                    label="Віддалено"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                                  />
                                )}
                              </Stack>
                            </Box>
                            {user?.role === "jobseeker" && (
                              <IconButton
                                onClick={(e) => handleSaveOffer(e, offer._id)}
                                color={offer.isSaved ? "primary" : "default"}
                              >
                                {offer.isSaved ? (
                                  <BookmarkIcon />
                                ) : (
                                  <BookmarkBorderIcon />
                                )}
                              </IconButton>
                            )}
                          </Stack>

                          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <AttachMoneyIcon fontSize="small" color="success" />
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                              >
                                {getSalaryString(offer.salary)}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <WorkIcon fontSize="small" color="action" />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                              >
                                {offer.employmentType === "fulltime"
                                  ? "Повна зайнятість"
                                  : offer.employmentType === "part-time"
                                  ? "Часткова"
                                  : offer.employmentType === "contract"
                                  ? "Контракт"
                                  : offer.employmentType === "internship"
                                  ? "Стажування"
                                  : "Не вказано"}
                              </Typography>
                            </Stack>
                            {offer.skills && offer.skills.length > 0 && (
                              <Chip
                                label={offer.skills[0]}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                              />
                            )}
                          </Stack>

                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(offer.postedAt)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>

              {/* Pagination */}
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
