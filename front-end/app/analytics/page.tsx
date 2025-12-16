"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  Container,
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { AnalyticsData } from "@/types";
import { api, ApiError } from "@/lib/api";
import { mergeAnalyticsData, mockAnalyticsData } from "@/lib/mockData";
import { useDataMode } from "@/app/dataMode";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

const COLORS = ["#1976d2", "#9c27b0", "#2e7d32", "#ed6c02", "#d32f2f", "#0288d1", "#7b1fa2"];

const getSourceLabel = (source: string) => {
  switch (source) {
    case "internal":
      return "Внутрішні";
    case "linkedin_api":
      return "LinkedIn";
    case "internships_api":
      return "Стажування";
    default:
      return source;
  }
};

const getWorkModeLabel = (mode: string) => {
  switch (mode) {
    case "remote":
      return "Віддалено";
    case "in-office":
      return "В офісі";
    case "hybrid":
      return "Гібридно";
    default:
      return "Не вказано";
  }
};

const getEmploymentTypeLabel = (type: string) => {
  switch (type) {
    case "fulltime":
      return "Повна зайнятість";
    case "part-time":
      return "Часткова";
    case "contract":
      return "Контракт";
    case "internship":
      return "Стажування";
    default:
      return "Не вказано";
  }
};

export default function AnalyticsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [timeRange, setTimeRange] = useState("30d");
  const [groupBy, setGroupBy] = useState("month");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(mockAnalyticsData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { mode: dataMode } = useDataMode();

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    
    // Якщо режим мок-даних, використовуємо їх напряму
    if (dataMode === "mock") {
      setAnalytics(mockAnalyticsData);
      setLoading(false);
      return;
    }
    
    // Режим API - завантажуємо з API
    try {
      const data = await api.analytics.get({ timeRange, groupBy });
      // Використовуємо мок-дані як fallback, якщо дані порожні
      const mergedData = mergeAnalyticsData(data);
      setAnalytics(mergedData);
    } catch (err) {
      // У випадку помилки використовуємо мок-дані
      console.warn("Failed to fetch analytics, using mock data:", err);
      setAnalytics(mockAnalyticsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, groupBy, dataMode]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading && !analytics) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  // Завжди показуємо дані (або реальні, або мок-дані)
  if (!analytics) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">Помилка завантаження даних</Alert>
        </Container>
      </MainLayout>
    );
  }

  // Prepare chart data
  const jobsBySourceData = analytics.jobsBySource.map((item) => ({
    name: getSourceLabel(item.source),
    value: item.count,
    percentage: item.percentage,
  }));

  const jobsByWorkModeData = analytics.jobsByWorkMode.map((item) => ({
    name: getWorkModeLabel(item.workMode),
    value: item.count,
    percentage: item.percentage,
  }));

  const jobsByTypeData = analytics.jobsByType.map((item) => ({
    name: getEmploymentTypeLabel(item.type),
    value: item.count,
    percentage: item.percentage,
  }));

  const topSkillsData = analytics.topSkills.slice(0, 10).map((item) => ({
    name: item.skill,
    value: item.count,
  }));

  const topCompaniesData = analytics.topCompanies.slice(0, 10).map((item) => ({
    name: item.companyName,
    value: item.count,
  }));

  const jobsByLocationData = analytics.jobsByLocation.map((item) => ({
    name: item.location,
    value: item.count,
  }));

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold">
              📊 Аналітика ринку праці
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Tooltip title="Оновити дані">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Період</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Період"
                >
                  <MenuItem value="7d">7 днів</MenuItem>
                  <MenuItem value="30d">30 днів</MenuItem>
                  <MenuItem value="90d">90 днів</MenuItem>
                  <MenuItem value="1y">1 рік</MenuItem>
                  <MenuItem value="all">Весь період</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Групування</InputLabel>
                <Select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  label="Групування"
                >
                  <MenuItem value="day">По днях</MenuItem>
                  <MenuItem value="week">По тижнях</MenuItem>
                  <MenuItem value="month">По місяцях</MenuItem>
                  <MenuItem value="year">По роках</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.1)",
                  }}
                />
                <CardContent>
                  <Typography color="inherit" gutterBottom variant="body2">
                    Всього вакансій
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {analytics.totalJobs.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${analytics.activeJobs} активних`}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.1)",
                  }}
                />
                <CardContent>
                  <Typography color="inherit" gutterBottom variant="body2">
                    Всього користувачів
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {analytics.totalUsers.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${analytics.totalEmployers} роботодавців`}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.1)",
                  }}
                />
                <CardContent>
                  <Typography color="inherit" gutterBottom variant="body2">
                    Середня зарплата
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {analytics.salaryTrends.length > 0
                      ? analytics.salaryTrends[analytics.salaryTrends.length - 1].averageSalary.toLocaleString()
                      : "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    UAH
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.1)",
                  }}
                />
                <CardContent>
                  <Typography color="inherit" gutterBottom variant="body2">
                    Активних шукачів
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {analytics.activeJobseekers.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${analytics.newJobsThisMonth} нових вакансій`}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Salary Trends - Line Chart */}
          {analytics.salaryTrends.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📈 Динаміка зарплат за період
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.salaryTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "currentColor" }} style={{ fontSize: "0.875rem" }} />
                  <YAxis tick={{ fill: "currentColor" }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `${value.toLocaleString()} UAH`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="averageSalary"
                    stroke="#1976d2"
                    strokeWidth={3}
                    name="Середня зарплата"
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="minSalary"
                    stroke="#9c27b0"
                    strokeWidth={2}
                    name="Мінімальна"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="maxSalary"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    name="Максимальна"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Charts Row 1 */}
          <Grid container spacing={3}>
            {/* Pie Chart - Jobs by Source */}
            {jobsBySourceData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🥧 Розподіл по джерелам
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={jobsBySourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {jobsBySourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Pie Chart - Jobs by Work Mode */}
            {jobsByWorkModeData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🏠 Розподіл по режиму роботи
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={jobsByWorkModeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {jobsByWorkModeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={3}>
            {/* Bar Chart - Jobs by Type */}
            {jobsByTypeData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📊 Розподіл по типу зайнятості
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobsByTypeData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fill: "currentColor" }} style={{ fontSize: "0.875rem" }} />
                      <YAxis tick={{ fill: "currentColor" }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {jobsByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Bar Chart - Top Skills */}
            {topSkillsData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    💻 Топ навичок
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topSkillsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" tick={{ fill: "currentColor" }} />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fill: "currentColor", fontSize: "0.75rem" }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" fill="#1976d2" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Jobs Over Time */}
          {analytics.jobsOverTime.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📈 Динаміка публікації вакансій
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.jobsOverTime}>
                  <defs>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "currentColor" }} style={{ fontSize: "0.875rem" }} />
                  <YAxis tick={{ fill: "currentColor" }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#1976d2"
                    fillOpacity={1}
                    fill="url(#colorJobs)"
                    name="Всього вакансій"
                  />
                  <Area
                    type="monotone"
                    dataKey="activeCount"
                    stroke="#2e7d32"
                    fillOpacity={0.5}
                    fill="#2e7d32"
                    name="Активних"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Users Over Time */}
          {analytics.usersOverTime.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                👥 Динаміка реєстрації користувачів
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.usersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "currentColor" }} style={{ fontSize: "0.875rem" }} />
                  <YAxis tick={{ fill: "currentColor" }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#1976d2" strokeWidth={3} name="Всього" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="employers" stroke="#9c27b0" strokeWidth={2} name="Роботодавці" />
                  <Line type="monotone" dataKey="jobseekers" stroke="#2e7d32" strokeWidth={2} name="Шукачі" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Charts Row 3 */}
          <Grid container spacing={3}>
            {/* Top Companies */}
            {topCompaniesData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🏢 Топ компаній
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCompaniesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" tick={{ fill: "currentColor" }} />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fill: "currentColor", fontSize: "0.75rem" }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" fill="#ed6c02" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Jobs by Location */}
            {jobsByLocationData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📍 Топ міст
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobsByLocationData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fill: "currentColor" }} style={{ fontSize: "0.875rem" }} />
                      <YAxis tick={{ fill: "currentColor" }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" fill="#d32f2f" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Engagement Stats */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💾 Статистика збережень
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Збережено вакансій
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {analytics.totalSavedOffers.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Збережено кандидатів
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {analytics.totalSavedJobseekers.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Середня кількість збережень
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {analytics.averageSavesPerJobseeker.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      на одного шукача
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </Container>
    </MainLayout>
  );
}
