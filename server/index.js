import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";

import helmet from "helmet";

import errorMiddleware from "./middleware/errorMiddleware.js";
import router from "./Routes/index.js";
import dbConnection from "./dbConfig/index.js";

const __dirname = path.resolve(path.dirname(""));

dotenv.config();
const app = express();

app.use(express.static(path.join(__dirname,"views/build")));

const PORT = process.env.PORT || 6001;

//MONGODB connection setup
dbConnection();

app.use(helmet());
// app.use(helmet.crossOriginEmbedderPolicy({policy:"cross-origin"}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(router);

//error middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`);
});
