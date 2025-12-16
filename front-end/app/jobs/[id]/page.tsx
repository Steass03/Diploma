"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { api, ApiError } from "@/lib/api";
import { Offer } from "@/types";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ShareIcon from "@mui/icons-material/Share";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const offerId = params?.id as string;
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if user is authenticated before allowing access
    if (!authLoading && !user) {
      showToast("Будь ласка, увійдіть в систему для перегляду деталей вакансії", "warning");
      router.push("/auth/login");
      return;
    }

    const fetchOffer = async () => {
      if (!user) return; // Don't fetch if not authenticated
      
      setLoading(true);
      setError("");
      try {
        const data = await api.offers.getById(offerId, true);
        // Backend should always provide isSaved (true/false) for authenticated jobseekers
        setOffer({ ...data, isSaved: data.isSaved ?? false });
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            // Token expired, will be handled by global handler
            return;
          }
          setError(err.message);
        } else {
          setError("Помилка завантаження вакансії");
        }
      } finally {
        setLoading(false);
      }
    };

    if (offerId && user) {
      fetchOffer();
    }
  }, [offerId, user, authLoading, router, showToast]);

  const handleSaveOffer = async () => {
    if (!user || user.role !== "jobseeker" || !offer) return;

    setSaving(true);
    try {
      if (offer.isSaved) {
        await api.jobseekers.unsaveOffer(offer._id);
        setOffer({ ...offer, isSaved: false });
      } else {
        await api.jobseekers.saveOffer(offer._id);
        setOffer({ ...offer, isSaved: true });
      }
    } catch (err) {
      console.error("Failed to save/unsave offer:", err);
      if (err instanceof ApiError) {
        alert(err.message || "Помилка збереження вакансії");
      } else {
        alert("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setSaving(false);
    }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleDateString("uk-UA");
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

  if (!user) {
    // Will redirect, but show loading in the meantime
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

  if (error || !offer) {
    return (
      <MainLayout>
        <Container>
          <Alert severity="error">{error || "Вакансію не знайдено"}</Alert>
        </Container>
      </MainLayout>
    );
  }

  const createdBy = typeof offer.createdBy === "object" ? offer.createdBy : null;

  return (
    <MainLayout>
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
      >
        <Breadcrumbs sx={{ mb: { xs: 2, md: 3 } }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => router.push("/search")}
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Пошук
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            {offer.title}
          </Typography>
        </Breadcrumbs>

        <Stack spacing={3}>
          {/* Header */}
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "start" }}
              spacing={2}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
                >
                  {offer.title}
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  {offer.companyName || createdBy?.employerProfile?.companyName || "Не вказано"}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 2 }}
                  flexWrap="wrap"
                  gap={1}
                >
                  <Chip
                    icon={<LocationOnIcon />}
                    label={getLocationString(offer.location)}
                    size={isMobile ? "small" : "medium"}
                  />
                  {offer.workMode === "remote" && (
                    <Chip
                      label="Віддалено"
                      color="primary"
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                  {offer.workMode === "hybrid" && (
                    <Chip
                      label="Гібридно"
                      color="primary"
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                  <Chip
                    label={
                      offer.employmentType === "fulltime"
                        ? "Повна зайнятість"
                        : offer.employmentType === "part-time"
                        ? "Часткова"
                        : offer.employmentType === "contract"
                        ? "Контракт"
                        : offer.employmentType === "internship"
                        ? "Стажування"
                        : "Не вказано"
                    }
                    size={isMobile ? "small" : "medium"}
                  />
                </Stack>
              </Box>
              <Stack direction="row" spacing={1}>
                {user?.role === "jobseeker" && (
                  <IconButton
                    onClick={handleSaveOffer}
                    disabled={saving}
                    color={offer.isSaved ? "primary" : "default"}
                  >
                    {offer.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                )}
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>

          {/* Salary */}
          {offer.salary && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <AttachMoneyIcon color="success" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Зарплата
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {getSalaryString(offer.salary)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Description */}
          {offer.descriptionText && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                Опис
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, whiteSpace: "pre-wrap" }}
              >
                {offer.descriptionText}
              </Typography>
            </Paper>
          )}

          {/* Skills */}
          {offer.skills && offer.skills.length > 0 && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                Навички
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {offer.skills.map((skill, index) => (
                  <Chip key={index} label={skill} />
                ))}
              </Stack>
            </Paper>
          )}

          {/* Company Info */}
          {createdBy && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                Про роботодавця
              </Typography>
              <Typography variant="body1">
                {createdBy.firstName} {createdBy.lastName}
              </Typography>
              {createdBy.employerProfile?.companyName && (
                <Typography variant="body2" color="text.secondary">
                  {createdBy.employerProfile.companyName}
                </Typography>
              )}
              {createdBy.employerProfile?.companyWebsite && (
                <Link
                  href={createdBy.employerProfile.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {createdBy.employerProfile.companyWebsite}
                </Link>
              )}
            </Paper>
          )}

          {/* Actions */}
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {offer.applyUrl && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  href={offer.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Відгукнутися
                </Button>
              )}
              {user?.role === "jobseeker" && (
                <Button
                  variant={offer.isSaved ? "outlined" : "contained"}
                  size="large"
                  fullWidth
                  onClick={handleSaveOffer}
                  disabled={saving}
                  startIcon={offer.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  color={offer.isSaved ? "primary" : "primary"}
                >
                  {saving ? "Завантаження..." : offer.isSaved ? "Видалити зі збережених" : "Зберегти вакансію"}
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Stats */}
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 4 }}
            >
              {offer.postedAt && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Опубліковано
                  </Typography>
                  <Typography variant="h6">{formatDate(offer.postedAt)}</Typography>
                </Box>
              )}
              {offer.validThrough && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Дійсна до
                  </Typography>
                  <Typography variant="h6">{formatDate(offer.validThrough)}</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </MainLayout>
  );
}
