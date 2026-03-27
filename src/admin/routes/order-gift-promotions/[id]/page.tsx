import { useNavigate, useParams } from "react-router-dom"
import { Container, usePrompt } from "@medusajs/ui"
import { Header } from "../../../components/header"
import {
  ORDER_GIFT_PROMOTION_QUERY_KEY,
  useOrderGiftPromotion,
} from "../../../hooks/use-order-gift-promotion.ts"
import { Trash } from "@medusajs/icons"
import { useOrderGiftPromotionMutations } from "../../../hooks/use-order-gift-promotion-mutations.ts"
import UpdateOrderGiftPromotionForm, {
  UpdateOrderGiftPromotionFormSubmitHandler,
} from "../../../components/update-order-gift-promotion-form"
import { useQueryClient } from "@tanstack/react-query"

const OrderGiftPromotionsDetailPage = () => {
  const { id } = useParams()
  const prompt = usePrompt()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data, refetch: refetchOrderGiftPromotion } = useOrderGiftPromotion(id!)
  const orderGiftPromotion = data?.orderGiftPromotion
  const { deleteMutation, updateMutation } = useOrderGiftPromotionMutations({
    onDeleteMutationSuccessCb: () => {
      navigate("/order-gift-promotions")
    },
    onUpdateMutationSuccessCb: async () => {
      await queryClient.invalidateQueries({
        queryKey: [[ORDER_GIFT_PROMOTION_QUERY_KEY, id]],
      })
    },
  })

  if (!orderGiftPromotion || !id) {
    return null
  }

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: "Are you sure?",
      description: `You are about to delete the order gift promotion ${orderGiftPromotion.id}. This action cannot be undone.`,
    })

    if (!confirmed || !id) {
      return
    }

    deleteMutation.mutate(id)
  }

  const handleSubmit: UpdateOrderGiftPromotionFormSubmitHandler = async (
    data
  ) => {
    updateMutation.mutate({
      id,
      ...data,
    })

    await refetchOrderGiftPromotion()
  }

  return (
    <>
      <Container className="divide-y p-0">
        <Header
          title={`Order gift promotion ${orderGiftPromotion.id}`}
          actions={[
            {
              type: "action-menu",
              props: {
                groups: [
                  {
                    actions: [
                      {
                        label: "Delete",
                        icon: <Trash />,
                        onClick: () => handleDelete(),
                      },
                    ],
                  },
                ],
              },
            },
          ]}
        />
      </Container>
      <Container>
        <UpdateOrderGiftPromotionForm
          orderGiftPromotion={orderGiftPromotion}
          onSubmit={handleSubmit}
        />
      </Container>
    </>
  )
}

export default OrderGiftPromotionsDetailPage
