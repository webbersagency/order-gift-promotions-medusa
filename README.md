# Order Gift Promotions for Medusa v2

A Medusa v2 plugin that automatically adds free gift items to a customer's cart based on their order history. When a customer is about to place their Nth order, matching gift promotions are applied to the cart.

## How It Works

1. An admin creates an **order gift promotion** that targets a specific order count (e.g., "on a customer's 3rd order")
2. Each promotion has one or more **gift items** (product variants with quantities)
3. When a cart is created or updated, call `refreshGiftItems` to evaluate eligibility:
   - The customer's completed order history is counted (orders with payment status `captured`, `refunded`, or `partially_refunded`)
   - If `completed orders + 1` matches a promotion's target quantity, the gift items are added to the cart for free
   - Gift items are kept in sync: removed when no longer applicable, quantities corrected if changed
4. If you want to allow customers to remove gift items from their cart, before line item deletion set `ogp_disabled` metadata to `true` on the cart.

## Installation

```bash
npm install @webbers/order-gift-promotions-medusa
```
**Requirement:** Medusa v2.13.5 or higher.

## Setup

### 1. Register the module

In your Medusa backend's `medusa-config.ts`:

```ts
module.exports = defineConfig({
  projectConfig: {
    // ...
  },
  plugins: [
    // ... other plugins
    '@webbers/order-gift-promotions-medusa'
  ],
})
```

### 2. Run migrations

```bash
npx medusa db:migrate
```

### 3. Wire up cart refreshing

Call `refreshGiftItems` in the `beforeRefreshingPaymentCollection` hook. Example:

```ts
import {
  refreshCartFields,
  RefreshCartProps,
  refreshGiftItems,
} from "@webbers/order-gift-promotions-medusa/utils"

refreshCartItemsWorkflow.hooks.beforeRefreshingPaymentCollection(
  async ({input}, {container}) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [cart],
    } = await query.graph(
      {
        entity: Modules.CART,
        fields: refreshCartFields,
        filters: {
          id: input.cart_id,
        },
      },
      {
        throwIfKeyNotFound: true,
      }
    )

    const typedCart = cart as unknown as RefreshCartProps

    await refreshGiftItems(
      {
        cart: typedCart,
      },
      container
    )
  }
)
```

## Admin UI

The plugin registers an admin UI page at `/promotions/order-gift-promotions` where you can:

- View all order gift promotions
- Create a new promotion (set the target order count and gift items)
- Edit an existing promotion
- Delete a promotion

## API Endpoints

All endpoints require admin authentication.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/order-gift-promotions` | List all promotions |
| `POST` | `/admin/order-gift-promotions` | Create a promotion |
| `GET` | `/admin/order-gift-promotions/:id` | Get a single promotion |
| `POST` | `/admin/order-gift-promotions/:id` | Update a promotion |
| `DELETE` | `/admin/order-gift-promotions/:id` | Delete a promotion |

### Create/Update payload

```json
{
  "order_quantity": 3,
  "gift_items": [
    {
      "variant_id": "variant_01ABC...",
      "quantity": 1
    }
  ]
}
```

## Development

```bash
pnpm install
pnpm dev     # develop mode
pnpm build   # build plugin
```

## License

MIT — [Webbers B.V.](https://webbers.com)
