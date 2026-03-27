import {Button, FocusModal, Heading, Input, Label} from "@medusajs/ui"
import {Dispatch, SetStateAction} from "react"
import {Controller, FormProvider, useFieldArray, useForm} from "react-hook-form"
import {z} from "@medusajs/framework/zod"
import {useQueryClient} from "@tanstack/react-query"
import {Trash} from "@medusajs/icons"
import {useOrderGiftPromotionMutations} from "../../hooks/use-order-gift-promotion-mutations.ts"
import {ORDER_GIFT_PROMOTIONS_QUERY_KEY} from "../../hooks/use-order-gift-promotions.ts"
import ProductCombobox from "../product-combobox"

interface CreateOrderGiftPromotionProps {
  isOpen: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

const schema = z.object({
  order_quantity: z.number().min(1, "Order quantity is required"),
  gift_items: z.array(
    z.object({
      quantity: z.number().min(1, "Gift quantity is required"),
      variant_id: z.string().min(1, "Product variant is required"),
    })
  ),
})

export type CreateOrderGiftPromotionFormValues = z.infer<typeof schema>

const CreateOrderGiftPromotionModal = ({
  isOpen = false,
  onOpenChange,
}: CreateOrderGiftPromotionProps) => {
  const queryClient = useQueryClient()
  const form = useForm<CreateOrderGiftPromotionFormValues>()
  const {createMutation} = useOrderGiftPromotionMutations({
    onCreateMutationSuccessCb: async () => {
      await queryClient.invalidateQueries({
        queryKey: [[ORDER_GIFT_PROMOTIONS_QUERY_KEY]],
      })
      onOpenChange(false)
    },
  })

  const handleSubmit = (data: CreateOrderGiftPromotionFormValues) => {
    createMutation.mutate({
      ...data,
      gift_items: data.gift_items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
      })),
    })
  }

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
      <FocusModal open={isOpen} onOpenChange={onOpenChange}>
        <FocusModal.Content>
          <FocusModal.Header />
          <FocusModal.Body>
            <div className="flex-1 flex flex-col items-center p-16">
              <div className="flex w-full max-w-[720px] flex-col gap-y-8">
                <div>
                  <Heading level={"h1"}>Create order gift promotion</Heading>
                </div>
                <div className="flex flex-col gap-y-4">
                  <Controller
                    control={form.control}
                    name="order_quantity"
                    render={({field}) => {
                      const error = form.formState.errors[field.name]

                      return (
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-x-1 mb-2">
                            <Label>Order quantity</Label>
                          </div>
                          <Input
                            id={"order_quantity"}
                            type="number"
                            {...field}
                            min={0}
                            aria-invalid={!!error}
                          />
                          {error && (
                            <p className="text-red-500">{error.message}</p>
                          )}
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
                      >
                        + Add Gift Item
                      </Button>
                    </div>

                    {giftItemsFields.map((item, index) => (
                      <div key={item.id} className="flex gap-2 items-end">
                        <Controller
                          control={form.control}
                          name={`gift_items.${index}.quantity`}
                          render={({field}) => {
                            const error =
                              form.formState.errors?.gift_items?.[index]
                                ?.quantity
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
                                  <p className="text-red-500">
                                    {error.message}
                                  </p>
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
                              form.formState.errors?.gift_items?.[index]
                                ?.variant_id
                            return (
                              <div className="flex flex-col space-y-1 w-full">
                                <ProductCombobox<CreateOrderGiftPromotionFormValues>
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
                        >
                          <Trash />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FocusModal.Body>
          <FocusModal.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                type="submit"
                onClick={form.handleSubmit(handleSubmit)}
              >
                Create
              </Button>
            </div>
          </FocusModal.Footer>
        </FocusModal.Content>
      </FocusModal>
    </FormProvider>
  )
}

export default CreateOrderGiftPromotionModal
