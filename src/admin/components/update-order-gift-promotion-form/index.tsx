import {OrderGiftPromotion} from "../../hooks/use-order-gift-promotions.ts"
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form"
import {z} from "@medusajs/framework/zod"
import {Button, Heading, Input, Label} from "@medusajs/ui"
import {Trash} from "@medusajs/icons"
import {zodResolver} from "@hookform/resolvers/zod"
import ProductCombobox from "../product-combobox"

export type UpdateOrderGiftPromotionFormSubmitHandler =
  SubmitHandler<UpdateOrderGiftPromotionFormValues>

interface UpdateOrderGiftPromotionFormProps {
  orderGiftPromotion: OrderGiftPromotion
  onSubmit: UpdateOrderGiftPromotionFormSubmitHandler
}

const schema = z.object({
  order_quantity: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Order quantity is required")
  ),
  gift_items: z.array(
    z.object({
      id: z.string().min(1, "Gift item id is required").optional(),
      quantity: z.preprocess(
        (val) => Number(val),
        z.number().min(1, "Gift quantity is required")
      ),
      variant_id: z.string().min(1, "Product is required"),
    })
  ),
})

export type UpdateOrderGiftPromotionFormValues = z.infer<typeof schema>

const UpdateOrderGiftPromotionForm = ({
  orderGiftPromotion,
  onSubmit,
}: UpdateOrderGiftPromotionFormProps) => {
  const form = useForm<UpdateOrderGiftPromotionFormValues>({
    defaultValues: {
      order_quantity: orderGiftPromotion.order_quantity || 0,
      gift_items: orderGiftPromotion.gift_items?.map((gi) => ({
        id: gi.id,
        quantity: gi.quantity,
        variant_id: gi.product_variant.id,
      })),
    },
    resolver: zodResolver(schema),
  })

  const {
    fields: giftItemsFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "gift_items",
  })

  return (
    <FormProvider {...form}>
      <div className="flex-1 flex flex-col items-center p-16">
        <div className="flex w-full max-w-[720px] flex-col gap-y-8">
          <div>
            <Heading level={"h1"}>Update order gift promotion</Heading>
          </div>
          <div className="flex flex-col gap-y-4">
            <Controller
              control={form.control}
              name="order_quantity"
              render={({field}) => {
                const error = form.formState.errors[field.name]

                return (
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-x-1">
                      <Label>Order quantity</Label>
                    </div>
                    <Input
                      id={"order_quantity"}
                      type="number"
                      {...field}
                      aria-invalid={!!error}
                      min={0}
                    />
                    {error && <p className="text-red-500">{error.message}</p>}
                  </div>
                )
              }}
            />

            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <Label>Gift Items</Label>
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      quantity: 1,
                      variant_id: "",
                    })
                  }
                  disabled={form.formState.isSubmitting}
                >
                  + Add Gift Item
                </Button>
              </div>

              {giftItemsFields.map((item, index) => {
                const giftItem = orderGiftPromotion.gift_items?.find(
                  (gi) => gi.product_variant.id === item.variant_id
                )

                return (
                  <div key={item.id} className="flex gap-2 items-end">
                    <Controller
                      control={form.control}
                      name={`gift_items.${index}.quantity`}
                      render={({field}) => {
                        const error =
                          form.formState.errors?.gift_items?.[index]?.quantity
                        return (
                          <div className="flex flex-col space-y-1">
                            <Label>Gift Quantity</Label>
                            <Input
                              type="number"
                              {...field}
                              aria-invalid={!!error}
                              min={0}
                            />
                            {error && (
                              <p className="text-red-500">{error.message}</p>
                            )}
                          </div>
                        )
                      }}
                    />
                    <Controller
                      control={form.control}
                      name={`gift_items.${index}.variant_id`}
                      render={({field}) => {
                        const error =
                          form.formState.errors?.gift_items?.[index]?.variant_id

                        return (
                          <div className="flex flex-col space-y-1 w-full">
                            <ProductCombobox<UpdateOrderGiftPromotionFormValues>
                              giftItem={giftItem}
                              field={field}
                              error={error}
                            />
                          </div>
                        )
                      }}
                    />
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => remove(index)}
                      className="h-8 w-12"
                      disabled={form.formState.isSubmitting}
                    >
                      <Trash />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="w-full justify-end flex">
            <Button
              variant="primary"
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              isLoading={form.formState.isSubmitting}
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

export default UpdateOrderGiftPromotionForm
