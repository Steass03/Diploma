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
  Link,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    description: "",
    role: "jobseeker" as "employer" | "jobseeker",
    companyName: "",
    companyWebsite: "",
    companyDescription: "",
    stack: [] as string[],
    portfolioUrls: [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }

    if (formData.password.length < 8) {
      setError("Пароль повинен містити мінімум 8 символів");
      return;
    }

    if (formData.role === "employer" && !formData.companyName) {
      setError("Назва компанії обов'язкова для роботодавців");
      return;
    }

    setLoading(true);
    try {
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        role: formData.role,
        description: formData.description || undefined,
      };

      if (formData.role === "employer") {
        registerData.companyName = formData.companyName;
        if (formData.companyWebsite) registerData.companyWebsite = formData.companyWebsite;
        if (formData.companyDescription) registerData.companyDescription = formData.companyDescription;
      } else {
        if (formData.stack.length > 0) registerData.stack = formData.stack;
        if (formData.portfolioUrls.length > 0) registerData.portfolioUrls = formData.portfolioUrls;
      }

      await register(registerData);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Помилка реєстрації");
      } else {
        setError("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout>
      <Container
        maxWidth="sm"
        sx={{ py: { xs: 4, md: 8 }, px: { xs: 1, sm: 2 } }}
      >
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
          >
            Реєстрація
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Ім'я"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Прізвище"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Дата народження"
                type="date"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
              <TextField
                label="Опис (необов'язково)"
                multiline
                rows={2}
                fullWidth
                size={isMobile ? "small" : "medium"}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Пароль"
                type="password"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Підтвердити пароль"
                type="password"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                disabled={loading}
              />
              <FormControl>
                <FormLabel>Я роботодавець</FormLabel>
                <RadioGroup
                  row={!isMobile}
                  value={formData.role}
                  onChange={(e) =>
                    handleChange(
                      "role",
                      e.target.value as "employer" | "jobseeker"
                    )
                  }
                >
                  <FormControlLabel
                    value="jobseeker"
                    control={<Radio />}
                    label="Шукаю роботу"
                    disabled={loading}
                  />
                  <FormControlLabel
                    value="employer"
                    control={<Radio />}
                    label="Роботодавець"
                    disabled={loading}
                  />
                </RadioGroup>
              </FormControl>
              {formData.role === "employer" && (
                <>
                  <TextField
                    label="Назва компанії"
                    fullWidth
                    required
                    size={isMobile ? "small" : "medium"}
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    disabled={loading}
                  />
                  <TextField
                    label="Веб-сайт компанії (необов'язково)"
                    type="url"
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    value={formData.companyWebsite}
                    onChange={(e) => handleChange("companyWebsite", e.target.value)}
                    disabled={loading}
                  />
                  <TextField
                    label="Опис компанії (необов'язково)"
                    multiline
                    rows={2}
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    value={formData.companyDescription}
                    onChange={(e) => handleChange("companyDescription", e.target.value)}
                    disabled={loading}
                  />
                </>
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Зареєструватися"}
              </Button>
              <Typography
                align="center"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Вже є акаунт?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => router.push("/auth/login")}
                >
                  Увійти
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}
