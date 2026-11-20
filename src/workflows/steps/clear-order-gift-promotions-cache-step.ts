import {createStep, StepResponse} from "@medusajs/framework/workflows-sdk"
import {clearOrderGiftPromotionsCache} from "../../utils/order-gift-promotions-cache"

export const clearOrderGiftPromotionsCacheStep = createStep(
  "clear-order-gift-promotions-cache-step",
  async (_: void, {container}) => {
    await clearOrderGiftPromotionsCache(container)

    return new StepResponse()
  }
)
