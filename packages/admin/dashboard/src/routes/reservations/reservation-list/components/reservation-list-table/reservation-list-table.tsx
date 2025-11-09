import { Button, Container, Heading, Text, Alert } from "@medusajs/ui"

import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { _DataTable } from "../../../../../components/table/data-table"
import { useReservationItems } from "../../../../../hooks/api/reservations"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { useReservationTableColumns } from "./use-reservation-table-columns"
import { useReservationTableFilters } from "./use-reservation-table-filters"
import { useReservationTableQuery } from "./use-reservation-table-query"

const PAGE_SIZE = 20

export const ReservationListTable = () => {
  const { t } = useTranslation()

  const { searchParams } = useReservationTableQuery({
    pageSize: PAGE_SIZE,
  })
  const { reservations, count, isPending, isError, error } =
    useReservationItems({
      ...searchParams,
    })

  const filters = useReservationTableFilters()
  const columns = useReservationTableColumns()

  const { table } = useDataTable({
    data: reservations || [],
    columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
  })

  // Ne pas lancer l'erreur, afficher un message à la place
  // if (isError) {
  //   throw error
  // }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{t("reservations.domain")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("reservations.subtitle")}
          </Text>
        </div>


        {isError && (


          <div className="px-6 py-4">


            <Alert variant="warning">


              <div className="flex flex-col gap-2">


                <p className="font-semibold">Backend Medusa non disponible</p>


                <p className="text-sm">


                  Impossible de charger les données. Le backend Medusa n&apos;est


                  pas configuré ou accessible.


                </p>


              </div>


            </Alert>


          </div>


        )}

        <Button variant="secondary" size="small" asChild>
          <Link to="create">{t("actions.create")}</Link>
        </Button>
      </div>
      <_DataTable
        table={table}
        columns={columns}
        pageSize={PAGE_SIZE}
        count={count}
        isLoading={isPending}
        filters={filters}
        pagination
        navigateTo={(row) => row.id}
        search={false}
      />
    </Container>
  )
}
