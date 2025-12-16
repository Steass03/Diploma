"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { Offer } from "@/types";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function SavedOffersPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSaved = async () => {
      if (user?.role !== "jobseeker") return;
      setLoading(true);
      setError("");
      try {
        const response = await api.jobseekers.listSavedOffers();
        setOffers(response.items);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Помилка завантаження збережених вакансій");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  const handleUnsave = async (offerId: string) => {
    try {
      await api.jobseekers.unsaveOffer(offerId);
      setOffers((prev) => prev.filter((o) => o._id !== offerId));
    } catch (err) {
      console.error("Failed to unsave offer:", err);
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

  if (user?.role !== "jobseeker") {
    return (
      <MainLayout>
        <Container>
          <Alert severity="error">Доступ заборонено. Ця сторінка тільки для шукачів роботи.</Alert>
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
            Збережені вакансії
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && (
            <>
              {offers.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    Немає збережених вакансій
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {offers.map((offer) => (
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
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="start"
                        >
                          <Box
                            sx={{ flex: 1 }}
                            onClick={() => router.push(`/jobs/${offer._id}`)}
                          >
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {offer.title}
                            </Typography>
                            <Typography color="primary" gutterBottom>
                              {offer.companyName || "Не вказано"}
                            </Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                              <Chip
                                icon={<LocationOnIcon />}
                                label={getLocationString(offer.location)}
                                size="small"
                              />
                              <Chip
                                icon={<AttachMoneyIcon />}
                                label={getSalaryString(offer.salary)}
                                size="small"
                              />
                              {offer.workMode === "remote" && (
                                <Chip label="Віддалено" size="small" color="primary" variant="outlined" />
                              )}
                            </Stack>
                          </Box>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnsave(offer._id);
                            }}
                            color="primary"
                          >
                            <BookmarkIcon />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Container>
    </MainLayout>
  );
}



