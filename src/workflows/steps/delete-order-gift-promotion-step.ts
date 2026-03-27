import { InferTypeOf } from "@medusajs/types"
import { OrderGiftPromotion } from "../../modules/order-gift-promotions/models/order-gift-promotion"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import OrderGiftPromotionModuleService from "../../modules/order-gift-promotions/service"
import { ORDER_GIFT_PROMOTION_MODULE } from "../../modules/order-gift-promotions"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type DeleteOrderGiftPromotionStepInput = {
  orderGiftPromotion: InferTypeOf<typeof OrderGiftPromotion>
}

export const deleteOrderGiftPromotionStep = createStep(
  "delete-order-gift-promotion-step",
  async (
    { orderGiftPromotion }: DeleteOrderGiftPromotionStepInput,
    { container }
  ) => {
    const orderGiftPromotionModuleService: OrderGiftPromotionModuleService =
      container.resolve(ORDER_GIFT_PROMOTION_MODULE)
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    const orderGiftPromotionGiftItems =
      await orderGiftPromotionModuleService.listOrderGiftPromotionGiftItems({
        promotion_id: orderGiftPromotion.id,
      })

    await orderGiftPromotionModuleService.softDeleteOrderGiftPromotions(
      orderGiftPromotion.id
    )

    await Promise.all(
      orderGiftPromotionGiftItems.map(async (gi) => {
        await link.delete({
          [ORDER_GIFT_PROMOTION_MODULE]: {
            order_gift_promotion_gift_item_id: gi.id,
          },
        })
      })
    )

    return new StepResponse(orderGiftPromotion, {
      orderGiftPromotion,
      giftItems: orderGiftPromotionGiftItems,
    })
  },
  async (input, { container }) => {
    if (!input?.orderGiftPromotion || !input?.giftItems?.length) {
      return
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const orderGiftPromotionModuleService: OrderGiftPromotionModuleService =
      container.resolve(ORDER_GIFT_PROMOTION_MODULE)

    await orderGiftPromotionModuleService.restoreOrderGiftPromotions(
      input.orderGiftPromotion.id
    )

    await Promise.all(
      input.giftItems.map(async (gi) => {
        await link.restore({
          [ORDER_GIFT_PROMOTION_MODULE]: {
            order_gift_promotion_gift_item_id: gi.id,
          },
        })
      })
    )
  }
)
