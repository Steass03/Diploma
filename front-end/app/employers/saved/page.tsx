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
  Avatar,
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
import { User } from "@/types";
import BookmarkIcon from "@mui/icons-material/Bookmark";

export default function SavedJobseekersPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const [jobseekers, setJobseekers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSaved = async () => {
      if (user?.role !== "employer") return;
      setLoading(true);
      setError("");
      try {
        const response = await api.employers.listSavedJobseekers();
        setJobseekers(response.items);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Помилка завантаження збережених кандидатів");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  const handleUnsave = async (jobseekerId: string) => {
    try {
      await api.employers.unsaveJobseeker(jobseekerId);
      setJobseekers((prev) => prev.filter((j) => j._id !== jobseekerId));
    } catch (err) {
      console.error("Failed to unsave jobseeker:", err);
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
            Збережені кандидати
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && (
            <>
              {jobseekers.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    Немає збережених кандидатів
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {jobseekers.map((jobseeker) => (
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
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="start"
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ flex: 1 }}
                            onClick={() => router.push(`/jobseekers/${jobseeker._id}`)}
                          >
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
                            </Box>
                          </Stack>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnsave(jobseeker._id);
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



