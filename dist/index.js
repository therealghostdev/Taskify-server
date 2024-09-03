"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const passportJwt_1 = __importDefault(require("./config/passport/passportJwt"));
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
require("./config/passport/passportGoogle");
const express_session_1 = __importDefault(require("express-session"));
const googleAuth_1 = require("./routes/googleAuth");
require("./config/passport/passportApple");
const appleAuth_1 = require("./routes/appleAuth");
const client_1 = require("./config/redis/client");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_1 = require("./routes/user");
const rate_limiter_1 = require("./config/rate-limiter");
const mongo_sanitize_1 = require("./config/mongo-sanitize");
const envFile = process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "..", envFile) });
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(rate_limiter_1.limiter);
app.use((0, express_session_1.default)({
    secret: process.env.RSA_PRIVATE_KEY || "",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60,
    },
}));
const port = process.env.PORT || 3000;
const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskify";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(dbUri);
            console.log("Mongoose connection success");
        }
        catch (err) {
            console.error("Something went wrong with the database connection", err);
        }
    });
}
main().catch((err) => console.error(err));
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
(0, client_1.startRedis)().catch((err) => console.log(err));
app.use((0, express_1.urlencoded)({ extended: true }));
(0, passportJwt_1.default)(passport_1.default);
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(mongo_sanitize_1.sanitizeInputs);
app.use((0, cors_1.default)({
    origin: "*", // will be replaced with final frontend url
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    credentials: true,
}));
app.use("/user", user_1.userRoute);
app.use("/taskify/v1/auth", appleAuth_1.appleAuthRouter);
app.use("/taskify/v1/auth", googleAuth_1.googleAuthRouter);
app.use("/", routes_1.default);
app.get("/", (req, res) => {
    res.send("Taskify server");
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    console.error("Global error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});
