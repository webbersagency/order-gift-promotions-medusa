import {defineLink} from "@medusajs/framework/utils"
import OrderPromotionsModule from "../modules/order-gift-promotions"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  {
    linkable: OrderPromotionsModule.linkable.orderGiftPromotionGiftItem,
    isList: true,
  },
  ProductModule.linkable.productVariant
)
