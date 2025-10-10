//defines routes and middleware
import express from "express";
import authRouter from "./routes/authRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import productRouter from "./routes/productRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
const app = express();

// Middlewares
app.use(express.json());

// Routes

// Health Check Endpoint (for Render)
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});
// all routes in authRoutes will start with "/auth"
// tells Express: “any request starting with /path should go to this mini-router file .”
app.use("/api/auth", authRouter);

app.use("/api/categories", categoryRouter);

app.use("/api/products", productRouter);
app.use("/api/search", searchRouter);

export default app;
