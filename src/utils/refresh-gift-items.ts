import {OrderDetailDTO} from "@medusajs/types"
import {ContainerRegistrationKeys, Modules} from "@medusajs/framework/utils"
import {formatOrderGiftPromotionGiftItemsToLineItems, OrderGiftPromotionGiftItemType,} from "./order-gift-promotions"
import {CreateLineItemForCartDTO, MedusaContainer} from "@medusajs/framework/types"
import {getLastPaymentStatus} from "@medusajs/core-flows"

export const refreshCartFields = [
  "id",
  "email",
  "currency_code",
  "metadata",
  "items.id",
  "items.variant_id",
  "items.metadata",
  "items.unit_price",
  "items.quantity",
  "items.is_tax_inclusive",
  "items.adjustments.id",
  "items.adjustments.code",
]

export type RefreshCartProps = {
  id: string
  email: string
  currency_code: string
  metadata?: Record<string, unknown> | null
  items: Array<{
    id: string
    variant_id: string
    metadata?: Record<string, unknown> | null
    unit_price: number
    quantity: number
    is_tax_inclusive: boolean
    adjustments: {
      code: string
      id: string
    }
  }>
}

export type RefreshGiftItemsInput = {
  /**
   * The cart's ID.
   */
  cart: RefreshCartProps
}

export const refreshGiftItems = async (
  data: RefreshGiftItemsInput,
  container: MedusaContainer
) => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const cartModuleService = container.resolve(Modules.CART)

  try {
    const cart = data.cart

    const {data: orderGiftPromotions} = await query.graph(
      {
        entity: "order_gift_promotion",
        fields: [
          "id",
          "order_quantity",
          "gift_items.*",
          "gift_items.product_variant.*",
          "gift_items.product_variant.prices.*",
          "gift_items.product_variant.product.*",
        ],
      },
      {
        cache: {
          enable: true,
        },
      }
    )

    const existingCartGiftItems =
      cart.items?.filter((i) => i?.metadata?.ogp_gift === true) ?? []

    // If no email, no order gift promotions or disabled on cart, drop any existing gift items and exit
    if (cart.metadata?.ogp_disabled === true || !cart?.email || !orderGiftPromotions || orderGiftPromotions.length === 0) {
      if (existingCartGiftItems.length > 0) {
        await cartModuleService.deleteLineItems(
          existingCartGiftItems.map((i) => i!.id)
        )
      }

      await cartModuleService.updateCarts(cart.id, {
        metadata: {...cart.metadata, ogp_id: null},
      })

      return
    }

    // Compute completed order history count
    const {data: orderHistory} = await query.graph({
      entity: Modules.ORDER,
      fields: ["id", "currency_code", "payment_collections.*"],
      filters: {
        status: {
          $ne: 'canceled'
        },
        email: cart.email,
      },
    })

    const applicableOrders = orderHistory.filter((o) => {
      const paymentStatus = getLastPaymentStatus(o as unknown as OrderDetailDTO)
      return ["captured", "partially_refunded"].includes(
        paymentStatus
      )
    })

    // Determine applicable promotion for "next" order
    const targetQuantity = applicableOrders.length + 1

    // +1 for the current order being placed. e.g. this cart would be their applicableOrders + this cart order.
    const applicableOrderGiftPromotion = orderGiftPromotions.find(
      (ogp) => ogp.order_quantity === targetQuantity
    )

    // Figure out what should be in the cart if promo applies
    const desiredGiftVariantIds =
      applicableOrderGiftPromotion?.gift_items
        ?.map((gi: any) => gi?.product_variant?.id)
        .filter(Boolean) ?? []

    // Remove no-longer-applicable gift items
    const giftItemsToRemove = existingCartGiftItems.filter(
      (item) => !desiredGiftVariantIds.includes(item?.variant_id)
    )

    if (giftItemsToRemove.length > 0) {
      await cartModuleService.deleteLineItems(
        giftItemsToRemove.map((i) => i!.id)
      )
    }

    // Add missing gift items (guard against duplicates even if metadata was wiped)
    if (applicableOrderGiftPromotion) {
      const remainingGiftItems = existingCartGiftItems.filter(
        (item) => !giftItemsToRemove.some((r) => r!.id === item!.id)
      )

      const alreadyPresentGiftVariantIds = new Set(
        remainingGiftItems.filter(Boolean).map((i) => i!.variant_id)
      )

      // Correct quantity of already-present gift items that differ from the promotion definition
      const quantityCorrections =
        (
          applicableOrderGiftPromotion.gift_items as OrderGiftPromotionGiftItemType[]
        )?.filter(
          (gi) =>
            gi?.product_variant?.id &&
            alreadyPresentGiftVariantIds.has(gi.product_variant.id)
        ) ?? []

      for (const gi of quantityCorrections) {
        const existingItem = remainingGiftItems.find(
          (i) => i!.variant_id === gi.product_variant!.id
        )
        if (existingItem && existingItem.quantity !== gi.quantity) {
          await cartModuleService.updateLineItems(existingItem.id, {
            quantity: gi.quantity,
          })
        }
      }

      const missingGiftVariants =
        (
          applicableOrderGiftPromotion.gift_items as OrderGiftPromotionGiftItemType[]
        )?.filter(
          (gi) =>
            gi?.product_variant?.id &&
            !alreadyPresentGiftVariantIds.has(gi.product_variant.id)
        ) ?? []

      if (missingGiftVariants.length > 0) {
        const giftItems: CreateLineItemForCartDTO[] =
          formatOrderGiftPromotionGiftItemsToLineItems(
            cart.id,
            cart.currency_code,
            missingGiftVariants
          )

        await cartModuleService.addLineItems(giftItems)
      }
    }

    // Persist marker for idempotency (or null if none)
    await cartModuleService.updateCarts(cart.id, {
      metadata: {
        ...cart.metadata,
        ogp_id: applicableOrderGiftPromotion?.id ?? null,
      },
    })
  } catch (e) {
    logger.error("Error adding gifting items to cart")
    logger.error(e)
  }
}
