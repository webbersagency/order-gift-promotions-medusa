import {createStep, StepResponse} from "@medusajs/framework/workflows-sdk"
import {ORDER_GIFT_PROMOTION_MODULE} from "../../modules/order-gift-promotions"
import {ContainerRegistrationKeys, Modules} from "@medusajs/framework/utils"
import OrderGiftPromotionModuleService from "../../modules/order-gift-promotions/service"

interface UpdateOrderGiftPromotionInputStep {
  id: string
  order_quantity: number
  gift_items: {
    id?: string
    quantity: number
    variant_id: string
  }[]
}

export const updateOrderGiftPromotionStep = createStep(
  "update-order-gift-promotion-step",
  async (input: UpdateOrderGiftPromotionInputStep, {container}) => {
    const orderGiftPromotionModuleService: OrderGiftPromotionModuleService =
      container.resolve(ORDER_GIFT_PROMOTION_MODULE)
    const linkService = container.resolve(ContainerRegistrationKeys.LINK)

    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [prevData],
    } = await query.graph({
      entity: "order_gift_promotion",
      fields: [
        "id",
        "order_quantity",
        "gift_items.*",
        "gift_items.product_variant.*",
      ],
      filters: {
        id: {
          $eq: input.id,
        },
      },
    })

    for (const giftItem of input.gift_items) {
      // To create a new gift item
      if (!giftItem.id) {
        const newGiftItem =
          await orderGiftPromotionModuleService.createOrderGiftPromotionGiftItems(
            {
              quantity: giftItem.quantity,
              promotion_id: input.id,
            }
          )

        await linkService.create({
          [ORDER_GIFT_PROMOTION_MODULE]: {
            order_gift_promotion_gift_item_id: newGiftItem.id,
          },
          [Modules.PRODUCT]: {
            product_variant_id: giftItem.variant_id,
          },
        })

        continue
      }

      const previousGiftItem = prevData.gift_items?.find(
        (gi) => gi?.id === giftItem.id
      )

      if (!previousGiftItem) {
        continue
      }

      // To update a gift item
      if (giftItem.quantity !== previousGiftItem.quantity) {
        await orderGiftPromotionModuleService.updateOrderGiftPromotionGiftItems(
          {
            id: giftItem.id,
            quantity: giftItem.quantity,
            promotion_id: input.id,
          }
        )
      }

      // If the variant.id changed, delete an old link and create a new link
      if (
        previousGiftItem?.product_variant?.id &&
        previousGiftItem.product_variant.id !== giftItem.variant_id
      ) {
        await linkService.delete({
          [ORDER_GIFT_PROMOTION_MODULE]: {
            order_gift_promotion_gift_item_id: previousGiftItem.id,
          },
          [Modules.PRODUCT]: {
            product_variant_id: previousGiftItem.product_variant.id,
          },
        })

        await linkService.create({
          [ORDER_GIFT_PROMOTION_MODULE]: {
            order_gift_promotion_gift_item_id: giftItem.id,
          },
          [Modules.PRODUCT]: {
            product_variant_id: giftItem.variant_id,
          },
        })
      }
    }

    if (prevData.gift_items?.length >= 1) {
      const currentGiftItemIds = input.gift_items
        .filter(
          (
            gi
          ): gi is {
            id: string
            quantity: number
            variant_id: string
          } => !!gi.id
        )
        .map((gi) => gi.id)

      const removedGiftItemIds =
        prevData.gift_items?.filter(
          (prevGiftItem) =>
            prevGiftItem !== null &&
            !currentGiftItemIds.includes(prevGiftItem.id)
        ) ?? []

      const deletionPromises = removedGiftItemIds.flatMap((giftItem) => {
        if (!giftItem?.id) {
          return []
        }

        return [
          orderGiftPromotionModuleService.softDeleteOrderGiftPromotionGiftItems(
            giftItem.id
          ),
          linkService.delete({
            [ORDER_GIFT_PROMOTION_MODULE]: {
              order_gift_promotion_gift_item_id: giftItem.id,
            },
          }),
        ]
      })

      await Promise.all(deletionPromises)
    }

    const orderGiftPromotion =
      await orderGiftPromotionModuleService.updateOrderGiftPromotions({
        id: input.id,
        order_quantity: input.order_quantity,
      })

    return new StepResponse(orderGiftPromotion, prevData)
  }
)
