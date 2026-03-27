import {MedusaService} from "@medusajs/framework/utils"
import {OrderGiftPromotion} from "./models/order-gift-promotion"
import {OrderGiftPromotionGiftItem} from "./models/order-gift-promotion-gift-item"

class OrderGiftPromotionModuleService extends MedusaService({
  OrderGiftPromotion: OrderGiftPromotion,
  OrderGiftPromotionGiftItem: OrderGiftPromotionGiftItem,
}) {}

export default OrderGiftPromotionModuleService
