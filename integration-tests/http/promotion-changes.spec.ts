import {medusaIntegrationTestRunner} from "@medusajs/test-utils"
import {ContainerRegistrationKeys, Modules} from "@medusajs/framework/utils"
import {MedusaContainer} from "@medusajs/framework/types"
import {
  refreshCartFields,
  RefreshCartProps,
  refreshGiftItems,
} from "../../src/utils/refresh-gift-items"
import {createOrderGiftPromotionWorkflow} from "../../src/workflows/create-order-gift-promotion"
import {updateOrderGiftPromotionWorkflow} from "../../src/workflows/update-order-gift-promotion"
import {deleteOrderGiftPromotionWorkflow} from "../../src/workflows/delete-order-gift-promotion"
import {ORDER_GIFT_PROMOTION_MODULE} from "../../src/modules/order-gift-promotions"
import OrderGiftPromotionModuleService from "../../src/modules/order-gift-promotions/service"

jest.setTimeout(120 * 1000)

const refreshAndListGifts = async (
  container: MedusaContainer,
  cartId: string
) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const cartModuleService = container.resolve(Modules.CART)

  const {
    data: [cart],
  } = await query.graph({
    entity: "cart",
    fields: refreshCartFields,
    filters: {id: cartId},
  })

  await refreshGiftItems(
    {cart: cart as unknown as RefreshCartProps},
    container
  )

  const items = await cartModuleService.listLineItems({cart_id: cartId})

  return items
    .filter((item) => item.metadata?.ogp_gift === true)
    .map((item) => ({
      variant_id: item.variant_id,
      quantity: Number(item.quantity),
    }))
}

medusaIntegrationTestRunner({
  testSuite: ({getContainer}) => {
    describe("promotion changes between cart refreshes", () => {
      it("applies a created, edited and deleted promotion on the next cart refresh", async () => {
        const container = getContainer()
        const productModuleService = container.resolve(Modules.PRODUCT)
        const cartModuleService = container.resolve(Modules.CART)

        const [product] = await productModuleService.createProducts([
          {
            title: "Gifts",
            variants: [
              {title: "Booklet", sku: "gift-booklet"},
              {title: "Shopper", sku: "gift-shopper"},
            ],
          },
        ])
        const booklet = product.variants.find((v) => v.sku === "gift-booklet")!
        const shopper = product.variants.find((v) => v.sku === "gift-shopper")!

        const cart = await cartModuleService.createCarts({
          currency_code: "eur",
          email: "new-customer@example.com",
        })

        expect(await refreshAndListGifts(container, cart.id)).toEqual([])

        const {result: promotion} = await createOrderGiftPromotionWorkflow(
          container
        ).run({
          input: {
            order_quantity: 1,
            gift_items: [{variant_id: booklet.id, quantity: 1}],
          },
        })

        expect(await refreshAndListGifts(container, cart.id)).toEqual([
          {variant_id: booklet.id, quantity: 1},
        ])

        const [giftItem] = await container
          .resolve<OrderGiftPromotionModuleService>(ORDER_GIFT_PROMOTION_MODULE)
          .listOrderGiftPromotionGiftItems({promotion_id: promotion.id})

        await updateOrderGiftPromotionWorkflow(container).run({
          input: {
            id: promotion.id,
            order_quantity: 1,
            gift_items: [
              {id: giftItem.id, variant_id: shopper.id, quantity: 2},
            ],
          },
        })

        expect(await refreshAndListGifts(container, cart.id)).toEqual([
          {variant_id: shopper.id, quantity: 2},
        ])

        await updateOrderGiftPromotionWorkflow(container).run({
          input: {
            id: promotion.id,
            order_quantity: 2,
            gift_items: [
              {id: giftItem.id, variant_id: shopper.id, quantity: 2},
            ],
          },
        })

        expect(await refreshAndListGifts(container, cart.id)).toEqual([])

        await updateOrderGiftPromotionWorkflow(container).run({
          input: {
            id: promotion.id,
            order_quantity: 1,
            gift_items: [
              {id: giftItem.id, variant_id: shopper.id, quantity: 2},
            ],
          },
        })

        expect(await refreshAndListGifts(container, cart.id)).toEqual([
          {variant_id: shopper.id, quantity: 2},
        ])

        await deleteOrderGiftPromotionWorkflow(container).run({
          input: {orderGiftPromotion: promotion},
        })

        expect(await refreshAndListGifts(container, cart.id)).toEqual([])
      })
    })
  },
})
