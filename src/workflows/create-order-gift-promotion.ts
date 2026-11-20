import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {createOrderGiftPromotionStep} from "./steps/create-order-gift-promotion-step"
import {clearOrderGiftPromotionsCacheStep} from "./steps/clear-order-gift-promotions-cache-step"

type CreateOrderGiftPromotionWorkflowInput = {
  order_quantity: number
  gift_items: {
    quantity: number
    variant_id: string
  }[]
}

export const createOrderGiftPromotionWorkflow = createWorkflow(
  "create-order-gift-promotion",
  function (input: CreateOrderGiftPromotionWorkflowInput) {
    const orderGiftPromotion = createOrderGiftPromotionStep(input)

    clearOrderGiftPromotionsCacheStep()

    return new WorkflowResponse(orderGiftPromotion)
  }
)
