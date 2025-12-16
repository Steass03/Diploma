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
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Помилка входу");
      } else {
        setError("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setLoading(false);
    }
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
            Увійти
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Пароль"
                type="password"
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Увійти"}
              </Button>
              <Typography
                align="center"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Немає акаунту?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => router.push("/auth/register")}
                >
                  Зареєструватися
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}
