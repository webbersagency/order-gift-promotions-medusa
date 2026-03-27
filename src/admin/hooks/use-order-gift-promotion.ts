import {useQuery} from "@tanstack/react-query"
import {OrderGiftPromotion} from "./use-order-gift-promotions.ts"
import {sdk} from "../lib/sdk.ts"

type UseOrderGiftPromotionResponse = {
  orderGiftPromotion: OrderGiftPromotion
}

export const ORDER_GIFT_PROMOTION_QUERY_KEY = "order-gift-promotion"

export const useOrderGiftPromotion = (id: string) => {
  return useQuery<UseOrderGiftPromotionResponse>({
    queryFn: () => sdk.client.fetch(`/admin/order-gift-promotions/${id}`),
    queryKey: [[ORDER_GIFT_PROMOTION_QUERY_KEY, id]],
  })
}
