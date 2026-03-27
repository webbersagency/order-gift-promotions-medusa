import {z} from "@medusajs/framework/zod"
import {createFindParams} from "@medusajs/medusa/api/utils/validators"

export const PostAdminCreateOrderGiftPromotionBody = z.object({
  order_quantity: z.number(),
  gift_items: z.array(
    z.object({
      quantity: z.number(),
      variant_id: z.string(),
    })
  ),
})

export type PostAdminCreateOrderGiftPromotionBodyType = z.infer<
  typeof PostAdminCreateOrderGiftPromotionBody
>

export const GetOrderGiftPromotionsSchema = createFindParams()
