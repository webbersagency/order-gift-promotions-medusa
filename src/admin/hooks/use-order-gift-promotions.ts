import {useQuery} from "@tanstack/react-query"
import {sdk} from "../lib/sdk.ts"
import {AdminProductVariant} from "@medusajs/types"

const DEFAULT_PAGE_SIZE = 15

export type OrderGiftPromotion = {
  id: string
  order_quantity: number
  gift_items: {
    quantity: number
    promotion_id: string
    id: string
    created_at: string
    deleted_at: null | string
    updated_at: string
    product_variant: AdminProductVariant
  }[]
}

export type OrderGiftPromotionResponse = {
  orderGiftPromotions: OrderGiftPromotion[]
  limit: number
  offset: number
  count: number
}

type UseOrderGiftPromotionsProps = {
  offset: number
  limit?: number
}

export const ORDER_GIFT_PROMOTIONS_QUERY_KEY = "order-gift-promotions"

export const useOrderGiftPromotions = ({
  offset,
  limit,
}: UseOrderGiftPromotionsProps) => {
  return useQuery<OrderGiftPromotionResponse>({
    queryFn: () =>
      sdk.client.fetch(`/admin/order-gift-promotions`, {
        query: {
          limit: limit || DEFAULT_PAGE_SIZE,
          offset,
        },
      }),
    queryKey: [[ORDER_GIFT_PROMOTIONS_QUERY_KEY, limit, offset]],
  })
}
