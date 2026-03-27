import Medusa from "@medusajs/js-sdk"

const baseUrl: string = __BACKEND_URL__ || "/"

export const sdk = new Medusa({
  baseUrl,
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
})
