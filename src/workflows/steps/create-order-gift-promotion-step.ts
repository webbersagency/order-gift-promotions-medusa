import {createStep, StepResponse} from "@medusajs/framework/workflows-sdk"
import {ContainerRegistrationKeys, Modules} from "@medusajs/framework/utils"
import OrderGiftPromotionModuleService from "../../modules/order-gift-promotions/service"
import {ORDER_GIFT_PROMOTION_MODULE} from "../../modules/order-gift-promotions"
import {LinkDefinition} from "@medusajs/framework/types"
import {dismissRemoteLinkStep} from "@medusajs/medusa/core-flows"

type CreateOrderGiftPromotionStepInput = {
  order_quantity: number
  gift_items: {
    quantity: number
    variant_id: string
  }[]
}

export const createOrderGiftPromotionStep = createStep(
  "create-order-gift-promotion-step",
  async (
    {order_quantity, gift_items}: CreateOrderGiftPromotionStepInput,
    {container}
  ) => {
    const linkService = container.resolve(ContainerRegistrationKeys.LINK)
    const OrderGiftPromotionModuleService: OrderGiftPromotionModuleService =
      container.resolve(ORDER_GIFT_PROMOTION_MODULE)

    const orderPromotion =
      await OrderGiftPromotionModuleService.createOrderGiftPromotions({
        order_quantity,
      })

    const links: LinkDefinition[] = []

    for (const gift_item of gift_items) {
      const giftItem =
        await OrderGiftPromotionModuleService.createOrderGiftPromotionGiftItems(
          {
            quantity: gift_item.quantity,
            promotion_id: orderPromotion.id,
          }
        )

      const createdLink = await linkService.create({
        [ORDER_GIFT_PROMOTION_MODULE]: {
          order_gift_promotion_gift_item_id: giftItem.id,
        },
        [Modules.PRODUCT]: {
          product_variant_id: gift_item.variant_id,
        },
      })

      links.push(...createdLink as LinkDefinition[])
    }

    return new StepResponse(orderPromotion, {
      id: orderPromotion.id,
      links,
    })
  },
  async (input, {container}) => {
    if (!input?.id) {
      return
    }

    const OrderGiftPromotionModuleService: OrderGiftPromotionModuleService =
      container.resolve(ORDER_GIFT_PROMOTION_MODULE)

    await OrderGiftPromotionModuleService.deleteOrderGiftPromotions(input.id)

    if (!input.links?.length) {
      return
    }

    const linkService = container.resolve(ContainerRegistrationKeys.LINK)
    await linkService.dismiss(input.links)
  }
)
