// import package
import cors from "cors";

// import config
import config from "../config";

// import lib
import isEmpty from "../lib/isEmpty";

const corsOptions = {
  origin: function (origin, callback) {
    console.log("origin*********************: ", origin, config.CORS_ORIGIN);
    if (
      !isEmpty(config.CORS_ORIGIN) &&
      config.CORS_ORIGIN.indexOf(origin) != -1 /* || !origin */
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

export default cors(corsOptions);
