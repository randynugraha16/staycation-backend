const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const methodOverride = require("method-override")

const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

// Setup MongoDB
const mongoose = require("mongoose")
mongoose.connect('mongodb+srv://admin-staycation:KodokLoncat11@cluster0.zxuba.mongodb.net/db_staycation?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });




const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
// Import route admin
const adminRouter = require("./routes/admin");
const apiRouter = require("./routes/api");

const app = express();

// Setup flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 100000000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(methodOverride("_method"))
app.use(logger("dev"));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: false })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


// Setup file for sb-admin
app.use(
  "/sb-admin",
  express.static(
    path.join(__dirname, "node_modules/startbootstrap-sb-admin/dist")
  )
);

app.use("/", indexRouter);
app.use("/users", usersRouter);
// setup admin route
app.use("/admin", adminRouter);

app.use("/api/v1", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
