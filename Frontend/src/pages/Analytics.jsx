import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  TableContainer,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";
import {
  ShowChart,
  Mouse,
  Public,
  Assessment,
  ArrowBack,
} from "@mui/icons-material";
import api from "../api/axios";

const spaceTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#000000", paper: "#0a0a0a" },
    primary: { main: "#22c55e" },
    text: { primary: "#ffffff" },
  },
  typography: { fontFamily: '"Inter", sans-serif' },
});

const Analytics = () => {
  const { editToken } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/hub/edit/${editToken}`);
        console.log("📊 Analytics Data:", res.data); // Debug log
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error("❌ Analytics fetch failed:", err);
        setError(err.response?.data?.error || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (editToken) {
      fetchAnalytics();
    }
  }, [editToken]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#000",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#000",
          gap: 2,
        }}
      >
        <Typography color="error" variant="h6">
          {error || "Failed to load hub intelligence."}
        </Typography>
        <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Calculate top performer from detailedAnalytics
  const topLink =
    data?.detailedAnalytics?.length > 0
      ? [...data.detailedAnalytics].sort(
          (a, b) => b.totalClicks - a.totalClicks,
        )[0]
      : null;

  return (
    <ThemeProvider theme={spaceTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: { xs: "flex-start", md: "center" },
          bgcolor: "background.default",
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 0 },
        }}
      >
        <Container maxWidth="lg">
          {/* Header Section */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 6 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                color: "primary.main",
                border: "1px solid #1a1a1a",
                "&:hover": { bgcolor: "#1a1a1a" },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ borderLeft: "4px solid #22c55e", pl: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "primary.main",
                  textTransform: "uppercase",
                }}
              >
                Analytics Command
              </Typography>
              <Typography variant="body2" sx={{ color: "gray" }}>
                Intelligence for: {data.hubSummary?.title || "Unknown Hub"}
              </Typography>
            </Box>
          </Stack>

          {/* KPI Cards Grid */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {/* Total Visits Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: "1px solid #1a1a1a",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "#22c55e",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <ShowChart color="primary" />
                  <Typography variant="caption" color="gray" fontWeight="bold">
                    TOTAL VISITS
                  </Typography>
                </Stack>
                <Typography variant="h3" fontWeight="900">
                  {data.hubSummary?.totalVisits || 0}
                </Typography>
              </Paper>
            </Grid>

            {/* Total Clicks Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: "1px solid #1a1a1a",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "#22c55e",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <Mouse color="primary" />
                  <Typography variant="caption" color="gray" fontWeight="bold">
                    TOTAL CLICKS
                  </Typography>
                </Stack>
                <Typography variant="h3" fontWeight="900">
                  {data.hubSummary?.totalClicks || 0}
                </Typography>
              </Paper>
            </Grid>

            {/* Top Performer Card */}
            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 4,
                  bgcolor: "#0f1a12",
                  border: "1px solid #22c55e",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  <Public color="primary" />
                  <Typography
                    variant="caption"
                    color="primary"
                    fontWeight="bold"
                  >
                    TOP PERFORMER
                  </Typography>
                </Stack>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  noWrap
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: topLink ? "#fff" : "gray",
                  }}
                >
                  {topLink?.label || "No clicks yet"}
                </Typography>
                {topLink && (
                  <Typography
                    variant="caption"
                    color="gray"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {topLink.totalClicks} clicks • {topLink.ctr}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Performance Table Section */}
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: "bold",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Assessment color="primary" /> Performance Tiers
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 4,
              bgcolor: "#0a0a0a",
              border: "1px solid #1a1a1a",
              overflow: "auto",
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "#111" }}>
                <TableRow>
                  <TableCell
                    sx={{ color: "primary.main", fontWeight: "bold", py: 2 }}
                  >
                    LABEL
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "primary.main", fontWeight: "bold", py: 2 }}
                  >
                    CLICKS
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "primary.main", fontWeight: "bold", py: 2 }}
                  >
                    CTR
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "primary.main", fontWeight: "bold", py: 2 }}
                  >
                    STATUS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.detailedAnalytics &&
                data.detailedAnalytics.length > 0 ? (
                  data.detailedAnalytics.map((link, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        "&:hover": { bgcolor: "#111" },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                        {link.label || "Unnamed Link"}
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2 }}>
                        {link.totalClicks ?? 0}
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2 }}>
                        {link.ctr || "0.0%"}
                      </TableCell>

                      <TableCell align="right" sx={{ py: 2 }}>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            borderRadius: 10,
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            border: "1px solid",
                            borderColor:
                              link.performance === "High"
                                ? "#22c55e"
                                : link.performance === "Average"
                                  ? "#3b82f6"
                                  : "#ef4444",
                            color:
                              link.performance === "High"
                                ? "#22c55e"
                                : link.performance === "Average"
                                  ? "#3b82f6"
                                  : "#ef4444",
                            textTransform: "uppercase",
                            bgcolor:
                              link.performance === "High"
                                ? "rgba(34, 197, 94, 0.1)"
                                : link.performance === "Average"
                                  ? "rgba(59, 130, 246, 0.1)"
                                  : "rgba(239, 68, 68, 0.1)",
                          }}
                        >
                          {link.performance || "Learning"}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ py: 4, color: "gray" }}
                    >
                      No analytics data available yet. Start sharing your hub!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Analytics;
