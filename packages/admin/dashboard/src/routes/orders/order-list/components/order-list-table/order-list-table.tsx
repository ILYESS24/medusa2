import { Alert, Container, Heading } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { _DataTable } from "../../../../../components/table/data-table/data-table"
import { useOrders } from "../../../../../hooks/api/orders"
import { useOrderTableColumns } from "../../../../../hooks/table/columns/use-order-table-columns"
import { useOrderTableFilters } from "./use-order-table-filters"
import { useOrderTableQuery } from "../../../../../hooks/table/query/use-order-table-query"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { ConfigurableOrderListTable } from "./configurable-order-list-table"

import { DEFAULT_FIELDS } from "../../const"

const PAGE_SIZE = 20

export const OrderListTable = () => {
  const { t } = useTranslation()
  const isViewConfigEnabled = useFeatureFlag("view_configurations")

  // If feature flag is enabled, use the new configurable table
  if (isViewConfigEnabled) {
    return <ConfigurableOrderListTable />
  }

  const { searchParams, raw } = useOrderTableQuery({
    pageSize: PAGE_SIZE,
  })

  const { orders, count, isError, error, isLoading } = useOrders(
    {
      fields: DEFAULT_FIELDS,
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const filters = useOrderTableFilters()
  const columns = useOrderTableColumns({})

  const { table } = useDataTable({
    data: orders ?? [],
    columns,
    enablePagination: true,
    count,
    pageSize: PAGE_SIZE,
  })

  // Ne pas lancer l'erreur, afficher un message à la place
  // if (isError) {
  //   throw error
  // }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{t("orders.domain")}</Heading>
      </div>
      {isError && (
        <div className="px-6 py-4">
          <Alert variant="warning">
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Backend Medusa non disponible</p>
              <p className="text-sm">
                Impossible de charger les commandes. Le backend Medusa n&apos;est
                pas configuré ou accessible. Les données affichées peuvent être
                incomplètes.
              </p>
            </div>
          </Alert>
        </div>
      )}
      <_DataTable
        columns={columns}
        table={table}
        pagination
        navigateTo={(row) => `/orders/${row.original.id}`}
        filters={filters}
        count={count}
        search
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        orderBy={[
          { key: "display_id", label: t("orders.fields.displayId") },
          { key: "created_at", label: t("fields.createdAt") },
          { key: "updated_at", label: t("fields.updatedAt") },
        ]}
        queryObject={raw}
        noRecords={{
          message: t("orders.list.noRecordsMessage"),
        }}
      />
    </Container>
  )
}
