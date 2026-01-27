import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Grid,
  Divider,
  CircularProgress,
  Dialog,
} from "@mui/material";
import {
  Save,
  Analytics,
  Add,
  DeleteForever,
  Hub,
  Link as LinkIcon,
} from "@mui/icons-material";
import api from "../api/axios";
import RuleManager from "./RuleManager";
import { CheckCircleOutline, ErrorOutline } from "@mui/icons-material";

const spaceTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#000000", paper: "#0a0a0a" },
    primary: { main: "#22c55e" },
    text: { primary: "#ffffff", secondary: "#a1a1aa" },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
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
  },
});

const Editor = () => {
  const { editToken } = useParams(); // ✅ Get both params from URL
  const navigate = useNavigate();

  // 1. Single source of truth for Hub Identity
  const [hubData, setHubData] = useState({ title: "", description: "" });
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    success: true,
    message: "",
  });

  // 2. ONLY ONE useEffect needed
  useEffect(() => {
    const initPage = async () => {
      try {
        // ✅ Use both editToken and hubId in the URL
        const res = await api.get(`/hub/edit/${editToken}`);
        console.log("📥 Loaded editor data:", res.data);

        // Populate the identity fields correctly
        setHubData({
          title: res.data.hubSummary.title || "",
          description: res.data.hubSummary.description || "",
        });
        setLinks(res.data.links || []);
      } catch (err) {
        console.error("❌ Access denied:", err);
        // Optionally redirect to home if unauthorized
        // navigate('/');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [editToken]); // ✅ Dependencies are both params

  // 3. Robust Handle Sync with CLEAN payload
  const handleSync = async () => {
    setSaving(true);
    try {
      // ✅ Clean the links - remove MongoDB fields that frontend has
      const cleanLinks = links.map((link) => ({
        label: link.label || "",
        url: link.url || "",
        priority: Number(link.priority) || 0,
        rules: Array.isArray(link.rules) ? link.rules : [],
        // ✅ Don't send: _id, hubId, createdAt, updatedAt, clickCount, etc.
      }));

      // ✅ Send title, description, AND clean links
      const payload = {
        title: hubData.title,
        description: hubData.description,
        links: cleanLinks, // ✅ Clean links only
      };

      console.log("📤 Transmitting clean payload:", payload);

      // ✅ Use both editToken and hubId in the URL
      const res = await api.put(
        `/hub/edit/${editToken}/sync`,
        payload,
      );

      console.log("✅ Sync successful:", res.data);

      setPopup({
        open: true,
        success: true,
        message: "Hub identity and Link intelligence updated successfully.",
      });

      // ✅ Update local state with the new links from backend
      if (res.data.links) {
        setLinks(res.data.links);
      }
    } catch (err) {
      console.error("❌ Sync error:", err);
      setPopup({
        open: true,
        success: false,
        message:
          err.response?.data?.error ||
          "Transmission failure. Verify database connection.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = () =>
    setLinks([...links, { label: "", url: "", priority: 0, rules: [] }]);

  const handleRemoveLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
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

  if (loading)
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

  return (
    <ThemeProvider theme={spaceTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", py: 8, px: 2, width: "98vw" }}>
        <Container maxWidth="md">
          {/* Header Section */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 6 }}
          >
            <Box sx={{ borderLeft: "4px solid #22c55e", pl: 3 }}>
              <Typography
                variant="h3"
                color="primary"
                sx={{ textTransform: "uppercase" }}
              >
                Hub Editor
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 1 }}
              >
                Modify your Hub identity and refine your intelligent routing
                rules.
              </Typography>
            </Box>
            {/* View Analytics Button [Requirement Meta] */}
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              onClick={() => navigate(`/stats/${editToken}`)}
              sx={{
                borderColor: "#262626",
                color: "primary.main",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              View Analytics
            </Button>
          </Stack>

          {/* Identity Section */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              border: "1px solid #1a1a1a",
              bgcolor: "#0a0a0a",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              {/* <Hub color="primary" /> */}
              <Typography variant="h6">Global Settings</Typography>
            </Stack>
            <Stack spacing={4}>
              <TextField
                fullWidth
                label="Hub Title"
                variant="outlined"
                value={hubData.title} // Ensure this is tied to state
                onChange={(e) =>
                  setHubData({ ...hubData, title: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                variant="outlined"
                value={hubData.description} // Ensure this is tied to state
                onChange={(e) =>
                  setHubData({ ...hubData, description: e.target.value })
                }
              />
            </Stack>
          </Paper>

          <Dialog
            open={popup.open}
            onClose={() => setPopup({ ...popup, open: false })}
            PaperProps={{
              sx: {
                bgcolor: "#0a0a0a",
                border: `1px solid ${popup.success ? "#22c55e" : "#ef4444"}`,
                borderRadius: 4,
                p: 3,
                textAlign: "center",
              },
            }}
          >
            <Box sx={{ py: 2 }}>
              {popup.success ? (
                <CheckCircleOutline
                  sx={{ fontSize: 60, color: "#22c55e", mb: 2 }}
                />
              ) : (
                <ErrorOutline sx={{ fontSize: 60, color: "#ef4444", mb: 2 }} />
              )}
              <Typography
                variant="h5"
                color="white"
                fontWeight="900"
                gutterBottom
              >
                {popup.success ? "SYNC COMPLETE" : "SYNC FAILED"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                {popup.message}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                color={popup.success ? "primary" : "error"}
                onClick={() => setPopup({ ...popup, open: false })}
              >
                Continue
              </Button>
            </Box>
          </Dialog>

          {/* Links Section [cite: 25] */}
          <Stack spacing={3}>
            {links.map((link, lIdx) => (
              <Paper
                key={lIdx}
                sx={{ p: 4, border: "1px solid #1a1a1a", bgcolor: "#0a0a0a" }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Typography
                    variant="overline"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    Sublink #{lIdx + 1}
                  </Typography>
                  <Button
                    startIcon={<DeleteForever />}
                    color="error"
                    size="small"
                    onClick={() => handleRemoveLink(lIdx)}
                  >
                    Delete
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
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Destination URL"
                      variant="outlined"
                      value={link.url}
                      onChange={(e) => updateLink(lIdx, "url", e.target.value)}
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

          {/* Action Buttons */}
          <Box sx={{ mt: 6, display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleAddLink}
              sx={{ py: 2, borderStyle: "dashed" }}
            >
              + Add New Sublink
            </Button>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<Save />}
              onClick={handleSync}
              disabled={saving}
              sx={{
                py: 2,
                fontWeight: 700,
                boxShadow: "0 0 20px rgba(34, 197, 94, 0.2)",
              }}
            >
              {saving ? "Syncing..." : "Save Hub Intelligence"}
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
