export default {
  schema: "./schema.js",
  out: "./migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./server.sqlite",
  },
};
