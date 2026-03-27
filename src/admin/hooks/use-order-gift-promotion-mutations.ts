import {useMutation} from "@tanstack/react-query"
import {sdk} from "../lib/sdk.ts"
import {toast} from "@medusajs/ui"
import {CreateOrderGiftPromotionFormValues} from "../components/create-order-gift-promotion-modal"
import {UpdateOrderGiftPromotionFormValues} from "../components/update-order-gift-promotion-form"

interface UseOrderGiftPromotionMutationsProps {
  onDeleteMutationCb?: (res: unknown) => void | Promise<void>
  onDeleteMutationSuccessCb?: () => void | Promise<void>
  onCreateMutationCb?: (res: unknown) => void | Promise<void>
  onCreateMutationSuccessCb?: () => void | Promise<void>
  onUpdateMutationCb?: (res: unknown) => void | Promise<void>
  onUpdateMutationSuccessCb?: () => void | Promise<void>
}

export const useOrderGiftPromotionMutations = ({
  onDeleteMutationCb,
  onDeleteMutationSuccessCb,
  onCreateMutationCb,
  onCreateMutationSuccessCb,
  onUpdateMutationCb,
  onUpdateMutationSuccessCb,
}: UseOrderGiftPromotionMutationsProps = {}) => {
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await sdk.client.fetch(`/admin/order-gift-promotions/${id}`, {
        method: "DELETE",
      })

      if (onDeleteMutationCb) {
        return onDeleteMutationCb(res)
      }

      return res
    },
    onSuccess: async () => {
      toast.success("Successfully deleted order gift promotion")

      if (onDeleteMutationSuccessCb) {
        return onDeleteMutationSuccessCb()
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (
      data: UpdateOrderGiftPromotionFormValues & {id: string}
    ) => {
      const {id, ...updatedData} = data

      const res = await sdk.client.fetch(`/admin/order-gift-promotions/${id}`, {
        method: "POST",
        body: updatedData,
      })

      if (onUpdateMutationCb) {
        return onUpdateMutationCb(res)
      }

      return res
    },
    onSuccess: async () => {
      toast.success("Successfully updated order gift promotion")

      if (onUpdateMutationSuccessCb) {
        return onUpdateMutationSuccessCb()
      }
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateOrderGiftPromotionFormValues) => {
      const res = await sdk.client.fetch(`/admin/order-gift-promotions`, {
        method: "POST",
        body: {
          ...data,
          order_quantity: Number(data.order_quantity),
        },
      })

      if (onCreateMutationCb) {
        return onCreateMutationCb(res)
      }

      return res
    },
    onSuccess: async () => {
      toast.success("Successfully created order gift promotion")

      if (onCreateMutationSuccessCb) {
        return onCreateMutationSuccessCb()
      }
    },
  })

  return {
    deleteMutation,
    createMutation,
    updateMutation,
  }
}
