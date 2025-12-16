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
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { Offer } from "@/types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function MyOffersPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchOffers = async () => {
      if (user?.role !== "employer") return;
      setLoading(true);
      setError("");
      try {
        const response = await api.employers.listMyOffers({ page, limit: 20 });
        setOffers(response.items);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Помилка завантаження вакансій");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [user, page]);

  const handleDelete = async (offerId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю вакансію?")) return;

    try {
      await api.offers.delete(offerId);
      setOffers((prev) => prev.filter((o) => o._id !== offerId));
    } catch (err) {
      console.error("Failed to delete offer:", err);
      alert("Помилка видалення вакансії");
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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
              Мої вакансії
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push("/jobs/create")}
            >
              Створити вакансію
            </Button>
          </Stack>

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
                  <Typography color="text.secondary" gutterBottom>
                    У вас немає вакансій
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push("/jobs/create")}
                    sx={{ mt: 2 }}
                  >
                    Створити вакансію
                  </Button>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {offers.map((offer) => (
                    <Card key={offer._id}>
                      <CardContent>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          spacing={2}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {offer.title}
                            </Typography>
                            <Typography color="text.secondary" gutterBottom>
                              {offer.companyName}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
                              {offer.location?.city && (
                                <Chip
                                  icon={<LocationOnIcon />}
                                  label={offer.location.city}
                                  size="small"
                                />
                              )}
                              {offer.workMode === "remote" && (
                                <Chip label="Віддалено" size="small" color="primary" variant="outlined" />
                              )}
                              <Chip
                                label={offer.isActive ? "Активна" : "Неактивна"}
                                size="small"
                                color={offer.isActive ? "success" : "default"}
                              />
                            </Stack>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => router.push(`/jobs/${offer._id}/edit`)}
                              size={isMobile ? "small" : "medium"}
                            >
                              Редагувати
                            </Button>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(offer._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
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



