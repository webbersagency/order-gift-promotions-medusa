import {PostAdminCreateOrderGiftPromotionBodyType} from "./validators"
import {MedusaRequest, MedusaResponse} from "@medusajs/framework/http"
import {createOrderGiftPromotionWorkflow} from "../../../workflows/create-order-gift-promotion"

export const POST = async (
  req: MedusaRequest<PostAdminCreateOrderGiftPromotionBodyType>,
  res: MedusaResponse
) => {
  const {result} = await createOrderGiftPromotionWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json({
    order_promotion: result,
  })
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query")

  const {data: orderGiftPromotions, metadata: {count, take, skip} = {}} =
    await query.graph({
      entity: "order_gift_promotion",
      ...req.queryConfig,
    })

  res.json({
    orderGiftPromotions,
    count: count,
    limit: take,
    offset: skip,
  })
}
