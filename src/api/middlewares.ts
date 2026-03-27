import {MiddlewareVerb, validateAndTransformBody, validateAndTransformQuery,} from "@medusajs/framework/http"
import {defineMiddlewares} from "@medusajs/medusa"
import {
  GetOrderGiftPromotionsSchema,
  PostAdminCreateOrderGiftPromotionBody,
} from "./admin/order-gift-promotions/validators"
import {
  GetOrderGiftPromotionQuerySchema,
  PostAdminUpdateOrderGiftPromotionBodySchema,
} from "./admin/order-gift-promotions/[id]/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/order-gift-promotions",
      methods: ["POST"] as MiddlewareVerb[],
      middlewares: [
        validateAndTransformBody(PostAdminCreateOrderGiftPromotionBody),
      ],
    },
    {
      matcher: "/admin/order-gift-promotions",
      methods: ["GET"] as MiddlewareVerb[],
      middlewares: [
        validateAndTransformQuery(GetOrderGiftPromotionsSchema, {
          defaults: [
            "id",
            "order_quantity",
            "gift_items.*",
            "gift_items.product_variant.*",
            "gift_items.product_variant.product.*",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/order-gift-promotions/:id",
      methods: ["GET"] as MiddlewareVerb[],
      middlewares: [
        validateAndTransformQuery(GetOrderGiftPromotionQuerySchema, {
          defaults: [
            "id",
            "order_quantity",
            "gift_items.*",
            "gift_items.product_variant.*",
            "gift_items.product_variant.product.*",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/order-gift-promotions/:id",
      methods: ["POST"] as MiddlewareVerb[],
      middlewares: [
        validateAndTransformBody(PostAdminUpdateOrderGiftPromotionBodySchema),
      ],
    },
  ],
})
