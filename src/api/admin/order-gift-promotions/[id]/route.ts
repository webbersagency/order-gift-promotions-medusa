import {MedusaRequest, MedusaResponse} from "@medusajs/framework/http"
import OrderGiftPromotionModuleService from "../../../../modules/order-gift-promotions/service"
import {ORDER_GIFT_PROMOTION_MODULE} from "../../../../modules/order-gift-promotions"
import {deleteOrderGiftPromotionWorkflow} from "../../../../workflows/delete-order-gift-promotion"
import {ContainerRegistrationKeys} from "@medusajs/framework/utils"
import {updateOrderGiftPromotionWorkflow} from "../../../../workflows/update-order-gift-promotion"
import {PostAdminUpdateOrderGiftPromotionBody} from "./validators"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const {id} = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [orderGiftPromotion],
  } = await query.graph({
    entity: "order_gift_promotion",
    ...req.queryConfig,
    filters: {
      id: id,
    },
  })

  res.json({
    orderGiftPromotion,
  })
}

export const POST = async (
  req: MedusaRequest<PostAdminUpdateOrderGiftPromotionBody>,
  res: MedusaResponse
) => {
  const {id} = req.params

  const {result} = await updateOrderGiftPromotionWorkflow(req.scope).run({
    input: {
      id,
      ...req.validatedBody,
    },
  })

  res.json({
    orderGiftPromotion: result,
  })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const {id} = req.params
  const orderGiftPromotionModuleService: OrderGiftPromotionModuleService =
    req.scope.resolve(ORDER_GIFT_PROMOTION_MODULE)

  const orderGiftPromotion =
    await orderGiftPromotionModuleService.retrieveOrderGiftPromotion(id)

  const {result} = await deleteOrderGiftPromotionWorkflow(req.scope).run({
    input: {
      orderGiftPromotion,
    },
  })

  res.json({
    orderGiftPromotion: result,
  })
}
