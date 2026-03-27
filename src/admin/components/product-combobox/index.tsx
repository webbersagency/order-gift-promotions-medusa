import {ControllerRenderProps, Path} from "react-hook-form"
import {useQuery} from "@tanstack/react-query"
import {sdk} from "../../lib/sdk.ts"
import {Label} from "@medusajs/ui"
import {Combobox} from "../combo-box"
import {useState} from "react"
import {OrderGiftPromotion} from "../../hooks/use-order-gift-promotions.ts"

type ProductComboboxProps<
  TFormValues extends Record<string, any> = Record<string, any>,
> = {
  giftItem?: OrderGiftPromotion["gift_items"][number]
  field: ControllerRenderProps<TFormValues, Path<TFormValues>>
  error?: {
    message?: string
  }
}

const ProductCombobox = <
  TFormValues extends Record<string, any> = Record<string, any>,
>({
  giftItem,
  field,
  error,
}: ProductComboboxProps<TFormValues>) => {
  const [searchValue, setSearchValue] = useState("")
  const [selectedProductId, setSelectedProductId] = useState<string | string[]>(
    giftItem?.product_variant.product?.id || ""
  )

  const {data} = useQuery({
    queryFn: () =>
      sdk.admin.product.list({
        q: searchValue,
        limit: 1000,
      }),
    queryKey: [["products", searchValue]],
  })

  const handleProductChange = (value: string | string[]) => {
    setSelectedProductId(value as string | string[])
  }

  return (
    <div className="flex space-x-2">
      <div className="flex flex-col space-y-1 w-full">
        <Label>Product ID</Label>
        <Combobox
          multiple={false}
          options={
            data?.products.map((p) => ({
              id: p.id,
              value: p.title,
              label: p.title,
            })) ?? []
          }
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          disabled={false}
          onChange={handleProductChange}
          value={selectedProductId}
        />
        {error && <p className="text-red-500">{error.message}</p>}
      </div>
      <div className="flex flex-col space-y-1 w-full">
        <Label>Product Variant ID</Label>
        <Combobox
          multiple={false}
          options={
            data?.products
              .find((p) => p.id === selectedProductId)
              ?.variants?.map((v) => ({
                id: v.id,
                value: v.title!,
                label: v.title!,
              })) ?? []
          }
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          disabled={!selectedProductId}
          {...field}
        />
      </div>
    </div>
  )
}

export default ProductCombobox
