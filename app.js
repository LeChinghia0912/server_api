const path = require("path");
const express = require("express");
const cors = require("cors");
// body-parser not needed on Express 4.16+
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const routes = require("./routes");
const { initDb } = require("./config/db");
const { initRedis } = require("./config/redis");
const { notFoundHandler } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// View engine setup (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// Root route -> UI home
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// API routes
app.use("/api/v1", routes);

// UI routes (protected where needed)
const uiRoutes = require('./routes/uiRoutes');
app.use('/app', uiRoutes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
Promise.all([initDb(), initRedis()])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
