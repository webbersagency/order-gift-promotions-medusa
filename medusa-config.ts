import {defineConfig} from "@medusajs/framework/utils"

module.exports = defineConfig({
  featureFlags: {
    caching: true,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: "http://localhost:8000",
      adminCors: "http://localhost:9000",
      authCors: "http://localhost:9000",
    },
  },
  modules: [
    {
      resolve: "./src/modules/order-gift-promotions",
    },
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        in_memory: {
          enable: true,
        },
      },
    },
  ],
})
