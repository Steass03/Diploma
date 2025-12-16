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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";

export default function CreateJobPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    descriptionText: "",
    companyName: "",
    companyWebsite: "",
    companyIndustry: "",
    location: {
      city: "",
      region: "",
      country: "",
      formatted: "",
    },
    workMode: "unspecified" as "remote" | "in-office" | "hybrid" | "unspecified",
    employmentType: "unspecified" as "fulltime" | "part-time" | "contract" | "internship" | "unspecified",
    salary: {
      currency: "UAH",
      min: "",
      max: "",
      rawText: "",
    },
    skills: [] as string[],
    tags: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

  if (user?.role !== "employer") {
    return (
      <MainLayout>
        <Container>
          <Alert severity="error">Доступ заборонено. Ця сторінка тільки для роботодавців.</Alert>
        </Container>
      </MainLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const offerData: any = {
        title: formData.title,
        descriptionText: formData.descriptionText || undefined,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite || undefined,
        companyIndustry: formData.companyIndustry || undefined,
        workMode: formData.workMode,
        employmentType: formData.employmentType,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      if (formData.location.city || formData.location.region || formData.location.country) {
        offerData.location = {
          city: formData.location.city || undefined,
          region: formData.location.region || undefined,
          country: formData.location.country || undefined,
          formatted: formData.location.formatted || undefined,
        };
      }

      if (formData.salary.min || formData.salary.max || formData.salary.rawText) {
        offerData.salary = {
          currency: formData.salary.currency || undefined,
          min: formData.salary.min ? Number(formData.salary.min) : undefined,
          max: formData.salary.max ? Number(formData.salary.max) : undefined,
          rawText: formData.salary.rawText || undefined,
        };
      }

      await api.offers.create(offerData);
      router.push("/employers/offers");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Помилка створення вакансії");
      } else {
        setError("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  return (
    <MainLayout>
      <Container
        maxWidth="md"
        sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
      >
        <Paper sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
          >
            Створити вакансію
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Назва вакансії"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={loading}
              />

              <TextField
                label="Назва компанії"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                disabled={loading}
              />

              <TextField
                label="Опис вакансії"
                multiline
                rows={6}
                fullWidth
                size={isMobile ? "small" : "medium"}
                value={formData.descriptionText}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionText: e.target.value })
                }
                disabled={loading}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Місто"
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value },
                      })
                    }
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Країна"
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    value={formData.location.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, country: e.target.value },
                      })
                    }
                    disabled={loading}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Режим роботи</InputLabel>
                    <Select
                      value={formData.workMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workMode: e.target.value as any,
                        })
                      }
                      label="Режим роботи"
                      disabled={loading}
                    >
                      <MenuItem value="unspecified">Не вказано</MenuItem>
                      <MenuItem value="remote">Віддалено</MenuItem>
                      <MenuItem value="in-office">В офісі</MenuItem>
                      <MenuItem value="hybrid">Гібридно</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Тип зайнятості</InputLabel>
                    <Select
                      value={formData.employmentType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employmentType: e.target.value as any,
                        })
                      }
                      label="Тип зайнятості"
                      disabled={loading}
                    >
                      <MenuItem value="unspecified">Не вказано</MenuItem>
                      <MenuItem value="fulltime">Повна зайнятість</MenuItem>
                      <MenuItem value="part-time">Часткова зайнятість</MenuItem>
                      <MenuItem value="contract">Контракт</MenuItem>
                      <MenuItem value="internship">Стажування</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Мін. зарплата"
                    type="number"
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    value={formData.salary.min}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary: { ...formData.salary, min: e.target.value },
                      })
                    }
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Макс. зарплата"
                    type="number"
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    value={formData.salary.max}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary: { ...formData.salary, max: e.target.value },
                      })
                    }
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Валюта</InputLabel>
                    <Select
                      value={formData.salary.currency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: { ...formData.salary, currency: e.target.value },
                        })
                      }
                      label="Валюта"
                      disabled={loading}
                    >
                      <MenuItem value="UAH">UAH</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Навички
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Додати навичку"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    sx={{ flex: 1 }}
                    disabled={loading}
                  />
                  <Button onClick={addSkill} disabled={loading}>
                    Додати
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {formData.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => removeSkill(index)}
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Опублікувати"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.back()}
                  fullWidth
                  disabled={loading}
                >
                  Скасувати
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}
