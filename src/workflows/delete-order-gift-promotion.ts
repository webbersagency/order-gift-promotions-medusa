import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {InferTypeOf} from "@medusajs/types"
import {OrderGiftPromotion} from "../modules/order-gift-promotions/models/order-gift-promotion"
import {deleteOrderGiftPromotionStep} from "./steps/delete-order-gift-promotion-step"

type DeleteOrderGiftPromotionWorkflowInput = {
  orderGiftPromotion: InferTypeOf<typeof OrderGiftPromotion>
}

export const deleteOrderGiftPromotionWorkflow = createWorkflow(
  "delete-order-gift-promotion",
  function (input: DeleteOrderGiftPromotionWorkflowInput)  {
    const orderGiftPromotion = deleteOrderGiftPromotionStep(input)

    return new WorkflowResponse(orderGiftPromotion)
  }
)
