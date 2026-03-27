import OrderGiftPromotionModuleService from "./service"
import {Module} from "@medusajs/framework/utils"

export const ORDER_GIFT_PROMOTION_MODULE = "order_gift_promotion"

export default Module(ORDER_GIFT_PROMOTION_MODULE, {
  service: OrderGiftPromotionModuleService,
})
