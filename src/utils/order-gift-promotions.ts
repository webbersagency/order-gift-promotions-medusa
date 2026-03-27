import {OrderGiftPromotionGiftItem} from "../modules/order-gift-promotions/models/order-gift-promotion-gift-item"
import {CreateLineItemForCartDTO, InferTypeOf} from "@medusajs/types"

export type OrderGiftPromotionGiftItemType = InferTypeOf<
  typeof OrderGiftPromotionGiftItem
> & {
  product_variant?: {
    id: string
    sku: string
    title: string
    product?: {
      id: string
      title: string
      description: string
      handle: string
      thumbnail: string
    }
  }
}

export const formatOrderGiftPromotionGiftItemsToLineItems = (
  cartId: string,
  currencyCode: string,
  giftItems: OrderGiftPromotionGiftItemType[]
): CreateLineItemForCartDTO[] => {
  return giftItems.map((g: OrderGiftPromotionGiftItemType) => ({
    cart_id: cartId,
    quantity: g.quantity,
    title: g.product_variant?.title as string,
    product_title:
      g.product_variant?.product?.title ?? (g.product_variant?.title as string),
    product_description: g.product_variant?.product?.description as string,
    product_handle: g.product_variant?.product?.handle as string,
    thumbnail: g.product_variant?.product?.thumbnail as string,
    product_id: g.product_variant?.product?.id as string,
    variant_id: g.product_variant?.id as string,
    variant_sku: g.product_variant?.sku as string,
    // @ts-ignore
    compare_at_unit_price: g.product_variant?.prices?.filter(
      (p) => p.currency_code === currencyCode && !p.price_list_id
    )?.[0]?.amount as number,
    is_custom_price: true,
    unit_price: 0,
    metadata: {
      is_gift: true,
    },
  }))
}
