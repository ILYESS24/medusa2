import { PencilSquare, Trash } from "@medusajs/icons"
import { AdminCampaign } from "@medusajs/types"
import { Alert, Button, Container, Heading, toast, usePrompt } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ActionMenu } from "../../../../components/common/action-menu"
import { _DataTable } from "../../../../components/table/data-table"
import {
  useCampaigns,
  useDeleteCampaign,
} from "../../../../hooks/api/campaigns"
import { useCampaignTableColumns } from "../../../../hooks/table/columns/use-campaign-table-columns"
import { useCampaignTableQuery } from "../../../../hooks/table/query/use-campaign-table-query"
import { useDataTable } from "../../../../hooks/use-data-table"

const PAGE_SIZE = 20

export const CampaignListTable = () => {
  const { t } = useTranslation()
  const { raw, searchParams } = useCampaignTableQuery({ pageSize: PAGE_SIZE })

  const {
    campaigns,
    count,
    isPending: isLoading,
    isError,
    error,
  } = useCampaigns(searchParams, {
    placeholderData: keepPreviousData,
  })

  const columns = useColumns()

  const { table } = useDataTable({
    data: campaigns ?? [],
    columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">{t("campaigns.domain")}</Heading>
        <Link to="/campaigns/create">
          <Button size="small" variant="secondary">
            {t("actions.create")}
          </Button>
        </Link>
      </div>
      {isError && (
        <div className="px-6 py-4">
          <Alert variant="warning">
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Backend Medusa non disponible</p>
              <p className="text-sm">
                Impossible de charger les campagnes. Le backend Medusa n&apos;est
                pas configuré ou accessible.
              </p>
            </div>
          </Alert>
        </div>
      )}
      <_DataTable
        table={table}
        columns={columns}
        count={count}
        pageSize={PAGE_SIZE}
        pagination
        search
        navigateTo={(row) => row.id}
        isLoading={isLoading}
        queryObject={raw}
        orderBy={[
          { key: "name", label: t("fields.name") },
          { key: "created_at", label: t("fields.createdAt") },
          { key: "updated_at", label: t("fields.updatedAt") },
        ]}
      />
    </Container>
  )
}

const CampaignActions = ({ campaign }: { campaign: AdminCampaign }) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const { mutateAsync } = useDeleteCampaign(campaign.id)

  const handleDelete = async () => {
    const confirm = await prompt({
      title: t("general.areYouSure"),
      description: t("campaigns.deleteCampaignWarning", {
        name: campaign.name,
      }),
      verificationInstruction: t("general.typeToConfirm"),
      verificationText: campaign.name,
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!confirm) {
      return
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        toast.success(
          t("campaigns.delete.successToast", { name: campaign.name })
        )
      },
      onError: (e) => {
        toast.error(e.message)
      },
    })
  }

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <PencilSquare />,
              label: t("actions.edit"),
              to: `/campaigns/${campaign.id}/edit`,
            },
          ],
        },
        {
          actions: [
            {
              icon: <Trash />,
              label: t("actions.delete"),
              onClick: handleDelete,
            },
          ],
        },
      ]}
    />
  )
}

const columnHelper = createColumnHelper<AdminCampaign>()

const useColumns = () => {
  const base = useCampaignTableColumns()

  return useMemo(
    () => [
      ...base,
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          return <CampaignActions campaign={row.original} />
        },
      }),
    ],
    [base]
  )
}
