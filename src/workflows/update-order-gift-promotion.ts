import {createWorkflow, WorkflowResponse} from "@medusajs/framework/workflows-sdk"
import {updateOrderGiftPromotionStep} from "./steps/update-order-gift-promotion-step"
import {clearOrderGiftPromotionsCacheStep} from "./steps/clear-order-gift-promotions-cache-step"

type UpdateOrderGiftPromotionWorkflowInput = {
  id: string
  order_quantity: number
  gift_items: {
    id?: string
    quantity: number
    variant_id: string
  }[]
}

export const updateOrderGiftPromotionWorkflow = createWorkflow(
  "update-order-gift-promotion",
  function (input: UpdateOrderGiftPromotionWorkflowInput)  {
    const orderGiftPromotion = updateOrderGiftPromotionStep(input)

    clearOrderGiftPromotionsCacheStep()

    return new WorkflowResponse(orderGiftPromotion)
  }
)
