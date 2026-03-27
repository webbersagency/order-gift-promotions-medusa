import {createWorkflow, WorkflowResponse} from "@medusajs/framework/workflows-sdk"
import {updateOrderGiftPromotionStep} from "./steps/update-order-gift-promotion-step"

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

    return new WorkflowResponse(orderGiftPromotion)
  }
)
