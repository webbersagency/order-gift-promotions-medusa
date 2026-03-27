import {defineRouteConfig} from "@medusajs/admin-sdk"
import {useMemo, useState} from "react"
import {
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
  usePrompt,
} from "@medusajs/ui"
import {
  ORDER_GIFT_PROMOTIONS_QUERY_KEY,
  OrderGiftPromotion,
  useOrderGiftPromotions,
} from "../../hooks/use-order-gift-promotions.ts"
import {ExclamationCircle, Pencil, Trash} from "@medusajs/icons"
import {Header} from "../../components/header"
import CreateOrderGiftPromotionModal from "../../components/create-order-gift-promotion-modal"
import {useQueryClient} from "@tanstack/react-query"
import {useOrderGiftPromotionMutations} from "../../hooks/use-order-gift-promotion-mutations.ts"
import {useNavigate} from "react-router-dom"
import navigateOrWindowOpen from "../../utils/navigateOrWindowOpen.ts"

const DEFAULT_PAGE_SIZE = 15

const OrderPromotionsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const prompt = usePrompt()
  const [
    isCreateOrderGiftPromotionModalOpen,
    setIsCreateOrderGiftPromotionModalOpen,
  ] = useState<boolean>(false)
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })
  const offset = useMemo(() => {
    return DEFAULT_PAGE_SIZE * pagination.pageIndex
  }, [pagination.pageIndex])
  const {data, refetch: refetchOrderGiftPromotions} = useOrderGiftPromotions({
    offset,
  })
  const orderGiftPromotions = data?.orderGiftPromotions || []
  const columnHelper = createDataTableColumnHelper<OrderGiftPromotion>()
  const {deleteMutation} = useOrderGiftPromotionMutations({
    onDeleteMutationSuccessCb: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          [ORDER_GIFT_PROMOTIONS_QUERY_KEY, DEFAULT_PAGE_SIZE, offset],
        ],
      })
      void refetchOrderGiftPromotions()
    },
  })

  const handleDelete = async (id: string) => {
    const confirmed = await prompt({
      title: "Are you sure?",
      description: `You are about to delete the order gift promotion ${id}. This action cannot be undone.`,
    })

    if (!confirmed) {
      return
    }

    deleteMutation.mutate(id)
  }

  const columns = [
    columnHelper.accessor("id", {
      header: "Id",
    }),
    columnHelper.accessor("order_quantity", {
      header: "Order Quantity",
    }),
    columnHelper.accessor("gift_items", {
      header: "Products",
      cell: ({getValue}) => {
        return (
          <>
            {getValue()
              ?.map(
                (item) =>
                  `${item.product_variant?.product?.title} (${item.product_variant?.title})`
              )
              .join(", ")}
          </>
        )
      },
    }),
    columnHelper.accessor("gift_items", {
      header: "Gift Quantity",
      cell: ({getValue}) => {
        return (
          <>
            {getValue()
              ?.map((item) => item.quantity)
              .join(", ")}
          </>
        )
      },
    }),
    columnHelper.action({
      actions: [
        {
          label: "Edit",
          onClick: (row) => {
            navigate(`/order-gift-promotions/${row.row.original.id}`)
          },
          icon: <Pencil />,
        },
        {
          label: "Delete",
          onClick: (row) => handleDelete(row.row.original.id),
          icon: <Trash />,
        },
      ],
    }),
  ]

  const table = useDataTable({
    columns,
    data: orderGiftPromotions,
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick: (event) => {
      const row = event.currentTarget as HTMLTableRowElement

      if (row.tagName === "TR") {
        const tdWithoutChildren = Array.from(row.children)
        const id = tdWithoutChildren[0].textContent

        if (id) {
          navigateOrWindowOpen(`/order-gift-promotions/${id}`, navigate, event)
        }
      }
    },
  })

  return (
    <>
      <Container className="divide-y p-0">
        <Header
          title="Order Promotions"
          actions={[
            {
              type: "custom",
              children: (
                <Button
                  size="small"
                  variant="secondary"
                  /* TODO: Create the create functionality*/
                  onClick={() => setIsCreateOrderGiftPromotionModalOpen(true)}
                >
                  Create
                </Button>
              ),
            },
          ]}
        />
        <DataTable instance={table} className={"!border-t-0"}>
          <DataTable.Table
            emptyState={{
              empty: {
                custom: (
                  <div className="flex flex-col items-center gap-y-3">
                    <ExclamationCircle />
                    <div className="flex flex-col items-center gap-y-1">
                      <p className="font-medium font-sans txt-compact-small">
                        No records
                      </p>
                      <p className="font-normal font-sans txt-small text-ui-fg-muted">
                        There are no records to show
                      </p>
                    </div>
                  </div>
                ),
              },
            }}
          />
          <DataTable.Pagination />
        </DataTable>
      </Container>
      <CreateOrderGiftPromotionModal
        isOpen={isCreateOrderGiftPromotionModalOpen}
        onOpenChange={setIsCreateOrderGiftPromotionModalOpen}
      />
    </>
  )
}

export const config = defineRouteConfig({
  label: "Order gifts",
  nested: "/promotions",
})

export default OrderPromotionsPage
