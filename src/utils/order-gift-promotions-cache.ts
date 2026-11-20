import {Modules} from "@medusajs/framework/utils"
import {MedusaContainer} from "@medusajs/framework/types"

export const ORDER_GIFT_PROMOTIONS_CACHE_KEY = "order-gift-promotions:list"

export const ORDER_GIFT_PROMOTIONS_CACHE_TTL = 5 * 60

export const clearOrderGiftPromotionsCache = async (
  container: MedusaContainer
) => {
  const cachingModuleService = container.resolve(Modules.CACHING, {
    allowUnregistered: true,
  })

  await cachingModuleService?.clear({key: ORDER_GIFT_PROMOTIONS_CACHE_KEY})
}
