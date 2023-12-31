"use strict";

// Lv 0
// const config = {
//   app: {
//     port: 8080,
//   },

//   db: {
//     host: "127.0.0.1",
//     port: "27017",
//     name: "db",
//   },
// };

// Lv 01

const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 8080,
  },

  db: {
    host: process.env.DEV_DB_HOST || "127.0.0.1",
    port: process.env.DEV_DB_PORT || "27017",
    name: process.env.DEV_DB_NAME || "shopDEV",
  },
};

const pro = {
  app: {
    port: process.env.PRO_APP_PORT || 3000,
  },

  db: {
    host: process.env.PRO_DB_HOST || "127.0.0.1",
    port: process.env.PRO_DB_HOST || "27017",
    name: process.env.PRO_DB_HOST || "shopPRO",
  },
};

const config = { dev, pro };

const env = process.env.NODE_ENV || "dev";

console.log(config[env], env);

module.exports = config[env];
