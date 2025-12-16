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
  Avatar,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { User } from "@/types";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";

export default function JobseekerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const jobseekerId = params?.id as string;
  const [jobseeker, setJobseeker] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJobseeker = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.jobseekers.getById(jobseekerId);
        setJobseeker({ ...data, isSaved: data.isSaved || false });
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

    if (jobseekerId) {
      fetchJobseeker();
    }
  }, [jobseekerId]);

  const handleSaveJobseeker = async () => {
    if (!user || user.role !== "employer" || !jobseeker) return;

    setSaving(true);
    try {
      if (jobseeker.isSaved) {
        await api.employers.unsaveJobseeker(jobseeker._id);
        setJobseeker({ ...jobseeker, isSaved: false });
      } else {
        await api.employers.saveJobseeker(jobseeker._id);
        setJobseeker({ ...jobseeker, isSaved: true });
      }
    } catch (err) {
      console.error("Failed to save/unsave jobseeker:", err);
      if (err instanceof ApiError) {
        alert(err.message || "Помилка збереження кандидата");
      } else {
        alert("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

  if (error || !jobseeker) {
    return (
      <MainLayout>
        <Container>
          <Alert severity="error">{error || "Профіль не знайдено"}</Alert>
        </Container>
      </MainLayout>
    );
  }

  const profile = jobseeker.jobseekerProfile;

  return (
    <MainLayout>
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ xs: "center", sm: "start" }}
            >
              <Avatar
                src={jobseeker.imageUrl}
                sx={{ width: { xs: 100, sm: 150 }, height: { xs: 100, sm: 150 } }}
              >
                {jobseeker.firstName?.charAt(0) || "U"}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="start"
                >
                  <Box>
                    <Typography
                      variant="h4"
                      gutterBottom
                      sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
                    >
                      {jobseeker.firstName} {jobseeker.lastName}
                    </Typography>
                    {profile?.openToWork && (
                      <Chip label="Відкритий до роботи" color="success" sx={{ mb: 2 }} />
                    )}
                  </Box>
                  {user?.role === "employer" && (
                    <IconButton
                      onClick={handleSaveJobseeker}
                      disabled={saving}
                      color={jobseeker.isSaved ? "primary" : "default"}
                    >
                      {jobseeker.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  )}
                </Stack>
                {jobseeker.description && (
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {jobseeker.description}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>

          {/* Contact Info */}
          {(jobseeker.contacts?.email || jobseeker.contacts?.phone) && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Контакти
              </Typography>
              <Stack spacing={1}>
                {jobseeker.contacts.email && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon />
                    <Link href={`mailto:${jobseeker.contacts.email}`}>
                      {jobseeker.contacts.email}
                    </Link>
                  </Stack>
                )}
                {jobseeker.contacts.phone && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIcon />
                    <Link href={`tel:${jobseeker.contacts.phone}`}>
                      {jobseeker.contacts.phone}
                    </Link>
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}

          {/* Skills */}
          {profile?.stack && profile.stack.length > 0 && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Навички
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {profile.stack.map((skill, index) => (
                  <Chip key={index} label={skill} />
                ))}
              </Stack>
            </Paper>
          )}

          {/* Preferences */}
          {profile && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Переваги
              </Typography>
              <Stack spacing={2}>
                {profile.preferences.employmentTypes.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Тип зайнятості
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {profile.preferences.employmentTypes.map((type, index) => (
                        <Chip key={index} label={type} variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}
                {profile.preferences.workModes.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Режим роботи
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {profile.preferences.workModes.map((mode, index) => (
                        <Chip key={index} label={mode} variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}

          {/* Education */}
          {profile?.studies && profile.studies.length > 0 && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Освіта
              </Typography>
              <Stack spacing={2}>
                {profile.studies.map((study, index) => (
                  <Box key={index}>
                    <Typography variant="h6">{study.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {study.organization}
                      {study.yearFrom && study.yearTo && (
                        <> • {study.yearFrom} - {study.yearTo}</>
                      )}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Portfolio */}
          {profile?.portfolioUrls && profile.portfolioUrls.length > 0 && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Портфоліо
              </Typography>
              <Stack spacing={1}>
                {profile.portfolioUrls.map((url, index) => (
                  <Link key={index} href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                  </Link>
                ))}
              </Stack>
            </Paper>
          )}

          {/* CV */}
          {profile?.cvUrls && profile.cvUrls.length > 0 && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>
                Резюме
              </Typography>
              <Stack spacing={1}>
                {profile.cvUrls.map((url, index) => {
                  // Extract filename from URL if possible, or use default
                  const getFilename = (url: string) => {
                    try {
                      // Try to extract from Cloudinary URL transformation
                      const match = url.match(/fl_attachment:([^/]+)/);
                      if (match) {
                        return decodeURIComponent(match[1]);
                      }
                      // Fallback: extract from URL path
                      const urlParts = url.split("/");
                      const lastPart = urlParts[urlParts.length - 1];
                      const filename = lastPart.split("?")[0];
                      return filename.endsWith(".pdf") ? filename : `CV_${index + 1}.pdf`;
                    } catch {
                      return `CV_${index + 1}.pdf`;
                    }
                  };
                  
                  return (
                    <Button
                      key={index}
                      variant="outlined"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={getFilename(url)}
                      component="a"
                    >
                      Завантажити CV {index + 1}
                    </Button>
                  );
                })}
              </Stack>
            </Paper>
          )}

          {/* Actions */}
          {user?.role === "employer" && (
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant={jobseeker.isSaved ? "outlined" : "contained"}
                  size="large"
                  fullWidth
                  onClick={handleSaveJobseeker}
                  disabled={saving}
                  startIcon={jobseeker.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  color="primary"
                >
                  {saving ? "Завантаження..." : jobseeker.isSaved ? "Видалити зі збережених" : "Зберегти кандидата"}
                </Button>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </MainLayout>
  );
}

