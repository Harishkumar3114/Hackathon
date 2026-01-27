import React, { useState } from "react";
import {
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Dialog,
  Grid,
  Divider,
} from "@mui/material";
import api from "../api/axios";
import RuleManager from "../pages/RuleManager";

const spaceTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#000000", paper: "#0a0a0a" },
    primary: { main: "#22c55e" },
    text: { primary: "#ffffff", secondary: "#a1a1aa" },
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#262626" },
            "&:hover fieldset": { borderColor: "#404040" },
            "&.Mui-focused fieldset": { borderColor: "#22c55e" },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8 },
      },
    },
  },
});

const Admin = () => {
  const [hubData, setHubData] = useState({ title: "", description: "" });
  const [links, setLinks] = useState([
    { label: "", url: "", priority: 1, rules: [] },
  ]);
  const [showPopup, setShowPopup] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddLink = () =>
    setLinks([...links, { label: "", url: "", priority: 0, rules: [] }]);

  const handleRemoveLink = (index) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const handleAddRule = (linkIndex, type) => {
    const newLinks = [...links];
    let config = {};
    if (type === "device") config = { allowedDevice: "mobile" };
    if (type === "location") config = { allowedCountry: "IN" };
    if (type === "time") config = { startHour: 9, endHour: 17 };
    newLinks[linkIndex].rules.push({ type, config });
    setLinks(newLinks);
  };

  const handleUpdateRule = (linkIndex, ruleIndex, field, value) => {
    const newLinks = [...links];
    newLinks[linkIndex].rules[ruleIndex].config[field] = value;
    setLinks(newLinks);
  };

  const handleRemoveRule = (linkIndex, ruleIndex) => {
    const newLinks = [...links];
    newLinks[linkIndex].rules.splice(ruleIndex, 1);
    setLinks(newLinks);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 🔧 FIX: Properly sanitize and structure the payload
      const sanitizedLinks = links.map((link) => ({
        label: String(link.label || "").trim(),
        url: String(link.url || "").trim(),
        priority: Number(link.priority) || 0,
        rules: Array.isArray(link.rules) ? link.rules : [],
      }));

      // 🔧 FIX: Explicit payload construction
      const payload = {
        title: String(hubData.title || "").trim(),
        description: String(hubData.description || "").trim(),
        links: sanitizedLinks,
      };

      // 🐛 DEBUG: Log the payload to console
      console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));

      // 🔧 FIX: Explicitly set Content-Type header
      const hubRes = await api.post("/hub/create", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Response received:", hubRes.data);

      setResponse(hubRes.data);
      setShowPopup(true);
    } catch (err) {
      console.error("❌ Initialization error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      // Show user-friendly error
      alert(
        `Failed to create hub: ${err.response?.data?.error || err.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={spaceTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 8 },
          px: { xs: 2, sm: 3 },
          width: "98vw",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="md">
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                mb: 2,
                fontSize: { xs: "2.25rem", md: "3.5rem" },
                textTransform: "uppercase",
                letterSpacing: "-0.05em",
              }}
            >
              Smart Link Hub
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.8,
                fontSize: "1rem",
              }}
            >
              Create one master link that intelligently adapts to your audience.
              Define your Hub's identity, add your sub-links, and set rules to
              target specific locations, times, or devices. After registration,
              you'll receive a **Public Link** to share and a **Private Control
              Link** to manage your hub and view analytics.
            </Typography>
          </Box>

          {/* Hub Identity Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              mb: 4,
              border: "1px solid #1a1a1a",
              borderRadius: 2,
              bgcolor: "#0a0a0a",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mb: 4,
                pb: 2,
                borderBottom: "2px solid #22c55e",
                display: "inline-block",
              }}
            >
              Hub Identity
            </Typography>

            <Stack spacing={4}>
              <TextField
                fullWidth
                label="Hub Title"
                variant="outlined"
                placeholder="Enter your hub name"
                value={hubData.title}
                onChange={(e) =>
                  setHubData({ ...hubData, title: e.target.value })
                }
                InputProps={{
                  style: { fontSize: 18, fontWeight: 500 },
                }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                variant="outlined"
                placeholder="Describe the purpose of your hub"
                value={hubData.description}
                onChange={(e) =>
                  setHubData({ ...hubData, description: e.target.value })
                }
              />
            </Stack>
          </Paper>

          {/* Links Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mb: 3,
                pb: 2,
                borderBottom: "2px solid #22c55e",
                display: "inline-block",
              }}
            >
              Link Configuration
            </Typography>

            <Stack spacing={3} sx={{ mt: 3 }}>
              {links.map((link, lIdx) => (
                <Paper
                  key={lIdx}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 2,
                    border: "1px solid #1a1a1a",
                    bgcolor: "#0a0a0a",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "#262626" },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                      }}
                    >
                      Link {lIdx + 1}
                    </Typography>

                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleRemoveLink(lIdx)}
                      disabled={links.length === 1}
                      sx={{
                        fontSize: "0.75rem",
                        opacity: 0.7,
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      Remove Link
                    </Button>
                  </Stack>

                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Label"
                        variant="outlined"
                        value={link.label}
                        onChange={(e) =>
                          updateLink(lIdx, "label", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Destination URL"
                        variant="outlined"
                        value={link.url}
                        onChange={(e) =>
                          updateLink(lIdx, "url", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Priority"
                        variant="outlined"
                        value={link.priority}
                        onChange={(e) =>
                          updateLink(
                            lIdx,
                            "priority",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        helperText="Higher = Top"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ mb: 3, borderColor: "#1a1a1a" }} />

                  <RuleManager
                    rules={link.rules}
                    onAdd={(type) => handleAddRule(lIdx, type)}
                    onUpdate={(rIdx, field, value) =>
                      handleUpdateRule(lIdx, rIdx, field, value)
                    }
                    onRemove={(rIdx) => handleRemoveRule(lIdx, rIdx)}
                  />
                </Paper>
              ))}
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                mt: 3,
                py: 2,
                borderStyle: "dashed",
                borderColor: "#262626",
                color: "text.secondary",
                "&:hover": {
                  borderColor: "#404040",
                  bgcolor: "rgba(34, 197, 94, 0.05)",
                },
              }}
              onClick={handleAddLink}
            >
              Add Another Link
            </Button>
          </Box>

          {/* Submit Button */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{
                py: 2,
                px: 6,
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
                "&:hover": {
                  boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)",
                },
              }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating Hub..." : "Create Hub"}
            </Button>
          </Box>

          {/* Success Dialog */}
          <Dialog
            open={showPopup}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: "#0a0a0a",
                border: "1px solid #22c55e",
                borderRadius: 3,
                p: { xs: 3, md: 5 },
                m: 2,
              },
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "rgba(34, 197, 94, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                  }}
                />
              </Box>

              <Typography
                variant="h5"
                fontWeight={600}
                color="primary"
                sx={{ textAlign: "center", mb: 2 }}
              >
                Hub Created Successfully
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 4,
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                Your Hub is live! Please save the links below immediately. The
                **Private Control Link** is your only way to edit rules or see
                analytics. For your security, this link cannot be recovered if
                lost.
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{
                      textTransform: "uppercase",
                      color: "text.secondary",
                      letterSpacing: "0.1em",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Public URL
                  </Typography>
                  <Paper
                    sx={{
                      p: 2.5,
                      bgcolor: "#000",
                      border: "1px solid #1a1a1a",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        fontSize: "0.95rem",
                      }}
                    >
                      {window.location.origin}/{response?.slug}
                    </Typography>
                  </Paper>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      textTransform: "uppercase",
                      color: "primary.main",
                      letterSpacing: "0.15em",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Private Control Link (Management & Analytics)
                  </Typography>
                  <Paper
                    sx={{
                      p: 2.5,
                      bgcolor: "#000",
                      border: "1px dashed #22c55e",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        color: "#fff",
                        fontSize: "0.85rem",
                      }}
                    >
                      {window.location.origin}/edit/{response?.editToken}
                    </Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", mt: 1, display: "block" }}
                  >
                    Use this link to manage your rules and view real-time
                    performance analytics.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => window.location.reload()}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Close
                </Button>
              </Stack>
            </Box>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Admin;
