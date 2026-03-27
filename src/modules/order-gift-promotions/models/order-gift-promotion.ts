import {model} from "@medusajs/framework/utils"
import {OrderGiftPromotionGiftItem} from "./order-gift-promotion-gift-item"

export const OrderGiftPromotion = model
  .define("order_gift_promotion", {
    id: model.id({prefix: "ogpr"}).primaryKey(),
    order_quantity: model.number(),
    gift_items: model.hasMany(() => OrderGiftPromotionGiftItem),
  })
  .cascades({
    delete: ["gift_items"],
  })
