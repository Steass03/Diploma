"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  Container,
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  Grid,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, refreshUser, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile form data
  const [formData, setFormData] = useState({
    description: "",
    "contacts.email": "",
    "contacts.phone": "",
    stack: [] as string[],
    portfolioUrls: [] as string[],
    openToWork: false,
    employmentTypes: [] as string[],
    workModes: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");
  const [portfolioInput, setPortfolioInput] = useState("");

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        description: user.description || "",
        "contacts.email": user.contacts?.email || "",
        "contacts.phone": user.contacts?.phone || "",
        stack: user.jobseekerProfile?.stack || [],
        portfolioUrls: user.jobseekerProfile?.portfolioUrls || [],
        openToWork: user.jobseekerProfile?.openToWork || false,
        employmentTypes:
          user.jobseekerProfile?.preferences.employmentTypes || [],
        workModes: user.jobseekerProfile?.preferences.workModes || [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      if (formData.description)
        formDataToSend.append("description", formData.description);
      if (formData["contacts.email"])
        formDataToSend.append("contacts.email", formData["contacts.email"]);
      if (formData["contacts.phone"])
        formDataToSend.append("contacts.phone", formData["contacts.phone"]);

      if (user.role === "jobseeker") {
        if (formData.stack.length > 0) {
          formData.stack.forEach((skill) => {
            formDataToSend.append("stack", skill);
          });
        }
        if (formData.portfolioUrls.length > 0) {
          formData.portfolioUrls.forEach((url) => {
            formDataToSend.append("portfolioUrls", url);
          });
        }
        formDataToSend.append("openToWork", String(formData.openToWork));
        if (formData.employmentTypes.length > 0) {
          formData.employmentTypes.forEach((type) => {
            formDataToSend.append("preferences.employmentTypes", type);
          });
        }
        if (formData.workModes.length > 0) {
          formData.workModes.forEach((mode) => {
            formDataToSend.append("preferences.workModes", mode);
          });
        }
      }

      await api.users.updateProfile(user._id, formDataToSend);
      await refreshUser();
      setSuccess("Профіль успішно оновлено");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Помилка оновлення профілю");
      } else {
        setError("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Нові паролі не співпадають");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Новий пароль повинен містити мінімум 8 символів");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.auth.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess("Пароль успішно змінено");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Помилка зміни паролю");
      } else {
        setError("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", e.target.files[0]);
      await api.users.updateProfile(user._id, formDataToSend);
      await refreshUser();
      setSuccess("Фото успішно оновлено");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Помилка завантаження фото");
      } else {
        setError("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("cv", e.target.files[0]);
      await api.users.updateProfile(user._id, formDataToSend);
      await refreshUser();
      setSuccess("CV успішно завантажено");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Помилка завантаження CV");
      } else {
        setError("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.stack.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        stack: [...formData.stack, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      stack: formData.stack.filter((_, i) => i !== index),
    });
  };

  const addPortfolio = () => {
    if (
      portfolioInput.trim() &&
      !formData.portfolioUrls.includes(portfolioInput.trim())
    ) {
      setFormData({
        ...formData,
        portfolioUrls: [...formData.portfolioUrls, portfolioInput.trim()],
      });
      setPortfolioInput("");
    }
  };

  const removePortfolio = (index: number) => {
    setFormData({
      ...formData,
      portfolioUrls: formData.portfolioUrls.filter((_, i) => i !== index),
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    return (
      <MainLayout>
        <Container>
          <Alert severity="error">Будь ласка, увійдіть в систему</Alert>
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
          <Typography
            variant="h4"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
          >
            Налаштування
          </Typography>

          <Paper>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
            >
              <Tab icon={<PersonIcon />} iconPosition="start" label="Профіль" />
              <Tab icon={<LockIcon />} iconPosition="start" label="Безпека" />
            </Tabs>

            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              {/* Profile Tab */}
              <TabPanel value={tabValue} index={0}>
                <Stack spacing={3}>
                  {/* Profile Image */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "center", sm: "center" },
                      gap: 2,
                    }}
                  >
                    <Avatar
                      src={user.imageUrl}
                      sx={{
                        width: { xs: 80, sm: 120 },
                        height: { xs: 80, sm: 120 },
                        fontSize: { xs: 32, sm: 48 },
                      }}
                    >
                      {user.firstName?.charAt(0) || "U"}
                    </Avatar>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      disabled={loading}
                    >
                      Змінити фото
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                  </Box>

                  {/* Description */}
                  <TextField
                    label="Опис"
                    multiline
                    rows={4}
                    fullWidth
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={loading}
                  />

                  {/* Contacts */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        value={formData["contacts.email"]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            "contacts.email": e.target.value,
                          })
                        }
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Телефон"
                        fullWidth
                        value={formData["contacts.phone"]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            "contacts.phone": e.target.value,
                          })
                        }
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>

                  {/* Jobseeker-specific fields */}
                  {user.role === "jobseeker" && (
                    <>
                      {/* CV Upload */}
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Резюме (CV)
                        </Typography>
                        {user.jobseekerProfile?.cvUrls &&
                          user.jobseekerProfile.cvUrls.length > 0 && (
                            <Stack spacing={1} sx={{ mb: 2 }}>
                              {user.jobseekerProfile.cvUrls.map(
                                (url, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ flex: 1 }}
                                    >
                                      CV {index + 1}
                                    </Typography>
                                    <Button
                                      size="small"
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      component="a"
                                    >
                                      Завантажити
                                    </Button>
                                  </Box>
                                )
                              )}
                            </Stack>
                          )}
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          disabled={loading}
                        >
                          Завантажити CV
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.doc,.docx"
                            onChange={handleCvUpload}
                          />
                        </Button>
                      </Box>

                      {/* Skills */}
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
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          gap={1}
                        >
                          {formData.stack.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              onDelete={() => removeSkill(index)}
                              size="small"
                            />
                          ))}
                        </Stack>
                      </Box>

                      {/* Portfolio */}
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Портфоліо
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          <TextField
                            size="small"
                            placeholder="URL портфоліо"
                            value={portfolioInput}
                            onChange={(e) => setPortfolioInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addPortfolio();
                              }
                            }}
                            sx={{ flex: 1 }}
                            disabled={loading}
                          />
                          <Button onClick={addPortfolio} disabled={loading}>
                            Додати
                          </Button>
                        </Stack>
                        <Stack spacing={1}>
                          {formData.portfolioUrls.map((url, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {url}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => removePortfolio(index)}
                                disabled={loading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Зберегти зміни"
                    )}
                  </Button>
                </Stack>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={tabValue} index={1}>
                <Stack spacing={3}>
                  <Typography variant="h6">Зміна паролю</Typography>

                  <TextField
                    label="Поточний пароль"
                    type="password"
                    fullWidth
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    disabled={passwordLoading}
                  />

                  <TextField
                    label="Новий пароль"
                    type="password"
                    fullWidth
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    disabled={passwordLoading}
                    helperText="Мінімум 8 символів"
                  />

                  <TextField
                    label="Підтвердити новий пароль"
                    type="password"
                    fullWidth
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    disabled={passwordLoading}
                  />

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    fullWidth
                  >
                    {passwordLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Змінити пароль"
                    )}
                  </Button>

                  <Divider sx={{ my: 2 }} />

                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    onClick={handleLogout}
                    fullWidth
                  >
                    Вийти з акаунту
                  </Button>
                </Stack>
              </TabPanel>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </MainLayout>
  );
}
