import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Link Hub backend running");
});

export default app;
