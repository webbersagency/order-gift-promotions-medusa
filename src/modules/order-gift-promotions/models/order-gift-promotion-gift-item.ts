import {model} from "@medusajs/framework/utils"
import {OrderGiftPromotion} from "./order-gift-promotion"

export const OrderGiftPromotionGiftItem = model.define(
  "order_gift_promotion_gift_item",
  {
    id: model.id({prefix: "opgi"}).primaryKey(),
    quantity: model.number(),
    order_gift_promotion: model.belongsTo(() => OrderGiftPromotion, {
      mappedBy: "gift_items",
      foreignKeyName: "promotion_id",
    }),
  }
)
