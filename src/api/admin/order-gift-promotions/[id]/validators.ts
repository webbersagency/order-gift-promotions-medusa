import {z} from "@medusajs/framework/zod"

export const GetOrderGiftPromotionQuerySchema = z.object({})

export const PostAdminUpdateOrderGiftPromotionBodySchema = z.object({
  order_quantity: z.number().min(1, "Order quantity is required"),
  gift_items: z.array(
    z.object({
      id: z.string().min(1, "Gift item id is required").optional(),
      quantity: z.preprocess(
        (val) => Number(val),
        z.number().min(1, "Gift quantity is required")
      ),
      variant_id: z.string().min(1, "Product variant is required"),
    })
  ),
})

export type PostAdminUpdateOrderGiftPromotionBody = z.infer<
  typeof PostAdminUpdateOrderGiftPromotionBodySchema
>
