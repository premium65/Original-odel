// import package
import express from "express";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import passport from "passport";
import bodyParser from "body-parser";
// import cors from "./config/cors";

// import config
import config from "./config";
import dbConnection from "./config/dbConnection";
import { createSocketIO } from "./config/socketIO";
// import routes
import authAPI from "./routes/auth.route";
import userAPI from "./routes/user.route";
import adminAPI from "./routes/admin.route";
import walletAPI from "./routes/wallet.route";
import dashboardAPI from "./routes/dashboard.route";

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10mb" }));
// app.use((req, res, next) => {
//   const ip = req.ip;
//   console.log("ip:---------- ", ip);
// });
// const allowedOrigins = [
//   "https://controls.liveaccorsmart.pro",
//   "https://www.liveaccorworld.online",
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     // If the origin is in the allowedOrigins array or not provided (for non-browser requests), allow the request
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

// app.use(cors(corsOptions));
// app.use(cors());
// app.use(
//   cors({
//     credentials: true,
//     origin: [process.env.FRONT_URL, process.env.ADMIN_URL],
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   })
// );
// passport
app.use(passport.initialize());
require("./config/passport").usersAuth(passport);
require("./config/passport").adminAuth(passport);

app.use(express.static(__dirname + "/public"));

app.use("/api/auth", authAPI);
app.use("/api/user", userAPI);
app.use("/api/admin", adminAPI);
app.use("/api/dashboard", dashboardAPI);
app.use("/api/wallet", walletAPI);

//App Use
app.use("/app/user", userAPI);
app.use("/app/auth", authAPI);
app.use("/app/dashboard", dashboardAPI);
app.use(function (req, res, next) {
  if (req.headers["x-forwarded-proto"] === "https") {
    res.redirect("http://" + req.hostname + req.url);
  } else {
    next();
  }
});
app.get("/", (req, res) => {
  return res.send("Successfully Testing");
});

let server = http.createServer(app);
createSocketIO(server);
// DATABASE CONNECTION
dbConnection((done) => {
  if (done) {
    server = server.listen(config.PORT, function () {
      console.log(
        "\x1b[34m%s\x1b[0m",
        `server is running on port ${config.PORT}`
      );
    });
  }
});
