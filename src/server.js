import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import { join } from "path";
import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  forbiddenErrorHandler,
  genericServerErrorHandler,
} from "./errorHandlers.js";

import netflixRouter from "./services/netflix/index.js";

const server = express();

const port = process.env.PORT || 3001;

// *********************** CORS *****************************

const whitelist = [process.env.FE_DEV_URL, process.env.CLOUDINARY_URL]; // we are allowing local FE and the deployed FE to access to our API

console.log(whitelist);

const corsOpts = {
  origin: function (origin, next) {
    console.log("CURRENT ORIGIN: ", process.env.FE_DEV_URL);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      // if received origin is in the whitelist we are going to allow that request
      next(null, true);
    } else {
      // if it is not, we are going to reject that request
      next(new Error(`Origin ${origin} not allowed!`));
    }
  },
};

// const publicFolderPath = join(process.cwd(), "public");

// ***************** GLOBAL MIDDLEWARES ***********************

// server.use(express.static(publicFolderPath));

server.use(cors(corsOpts)); // Add this to make your FE be able to communicate with BE
server.use(express.json()); // If I do not specify this line BEFORE the routes, all the requests' bodies will be UNDEFINED

// ***************** ENDPOINTS *********************
server.use("/media", netflixRouter);

// *********************** ERROR MIDDLEWARES *************************

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(genericServerErrorHandler);

console.table(listEndpoints(server));

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
