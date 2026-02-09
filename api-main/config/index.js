import "dotenv/config";
let key = {};
let envKey = {
  PORT: process.env.PORT,
  REDIS_URL: process.env.REDIS_URL,
  DATABASE_URI: process.env.DATABASE_URI,
  SERVER_URL: process.env.BASE_URL,
  ADMIN_URL: process.env.ADMIN_URL,
  IMAGE_URL: process.env.BASE_URL,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  MINIMUM_BALANCE: 10000,
  // CORS_ORIGIN: [process.env.FRONT_URL, process.env.ADMIN_URL],
  CORS_ORIGIN: [
    "https://controls.liveaccorsmart.pro",
    "https://www.liveaccorworld.online",
  ],
};

if (process.env.NODE_ENV === "production") {
  console.log("\x1b[35m%s\x1b[0m", `Set ${process.env.NODE_ENV} Config`);

  key = {
    SITE_NAME: "ACCOR",
    secretOrKey: "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3",
    cryptoSecretKey: "1234567812345678",
    RUN_CRON: true,
    RECAPTCHA_SECRET_KEY: "",
    PREMIUM_TASK: {
      HOTEL_NAMES: ["Finch inn", "Four Seasons", "Atlas Hotel", "Azure Inn"],
      DESCRIPTION:
        "As a commercial enterprise, hotels are also dependent on advertising and on potential customers becoming aware of their hotel and booking it. Therefore, most hotels are also represented on the Internet. Often with their own website and on hotel search and booking portals as well as on blogs, yellow pages and online industry directories. Here it is important to present the hotel appealingly and to provide it with good descriptions of hotels.",
      HOTEL_IMAGES: [
        "public/hotelImages/download.jpeg",
        "public/hotelImages/download (1).jpeg",
        "public/hotelImages/download (2).jpeg",
        "public/hotelImages/download (3).jpeg",
        "public/hotelImages/download (4).jpeg",
        "public/hotelImages/download (5).jpeg",
      ],
      LANDSCAPE_IMAGE: "public/landscapeImage/images (1).jpeg",
      LOCATION_IMAGE: "public/locationImage/map.png",
    },
    IMAGE: {
      DEFAULT_SIZE: 1 * 1024 * 1024, // 1 MB,
      URL_PATH: "/images/profile/",
      PROFILE_SIZE: 1 * 1024 * 1024, // 1 MB
      PROFILE_PATH: "public/profile",
      PROFILE_URL_PATH: "/profile/",

      ID_DOC_SIZE: 5 * 1024 * 1024, // 12 MB,
      NORMAL_PIC_PATH: "public/pictures",
      LANDSCAPE_PIC_PATH: "public/landscape",

      CURRENCY_SIZE: 0.02 * 1024 * 1024, // 20 KB
      CURRENCY_PATH: "public/currency/",
      CURRENCY_URL_PATH: "/currency/",
      DEPOSIT_PATH: "public/deposit",
      DEPOSIT_URL_PATH: "/deposit/",
      SETTINGS_URL_PATH: "public/settings",
      LAUNCHPAD_SIZE: 20 * 1024 * 1024, // 500 KB
      LAUNCHPAD_PATH: "public/launchpad",
      LAUNCHPAD_URL_PATH: "/launchpad/",
      SUPPORT_PATH: "public/support",
      SUPPORT_URL_PATH: "/support/",
      NORMAL_IMAGE: 20 * 1024 * 1024, // 500 KB
      LANDSCAPE_IMAGE: 2 * 1024 * 1024, // 2 MB
      P2P_PATH: "public/p2p",
      P2P_URL_PATH: "/p2p/",
    },

    NODE_TWOFA: {
      NAME: "ACCOR",
      QR_IMAGE:
        "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=",
    },
  };
} else {
  console.log("\x1b[35m%s\x1b[0m", `Set Development Config`);
  const API_URL = "http://localhost";
  key = {
    SITE_NAME: "ACCOR",
    secretOrKey: "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3",
    cryptoSecretKey: "1234567812345678",
    RUN_CRON: false,
    PREMIUM_TASK: {
      HOTEL_NAMES: ["HOTEL_1", "HOTEL_2", "HOTEL_3"],
      DESCRIPTION:
        "As a commercial enterprise, hotels are also dependent on advertising and on potential customers becoming aware of their hotel and booking it. Therefore, most hotels are also represented on the Internet. Often with their own website and on hotel search and booking portals as well as on blogs, yellow pages and online industry directories. Here it is important to present the hotel appealingly and to provide it with good descriptions of hotels.",
      HOTEL_IMAGES: [],
      LANDSCAPE_IMAGE: "",
      LOCATION_IMAGE: "",
    },
    IMAGE: {
      DEFAULT_SIZE: 1 * 1024 * 1024, // 1 MB,
      URL_PATH: "/images/profile/",
      PROFILE_SIZE: 1 * 1024 * 1024, // 1 MB
      PROFILE_PATH: "public/profile",
      PROFILE_URL_PATH: "/profile/",
      NORMAL_PIC_PATH: "public/pictures",
      LANDSCAPE_PIC_PATH: "public/landscape",
      NORMAL_IMAGE: 20 * 1024 * 1024, // 500 KB
      LANDSCAPE_IMAGE: 2 * 1024 * 1024, // 2 MB
    },
  };
}

export default {
  ...envKey,
  ...key,
};
