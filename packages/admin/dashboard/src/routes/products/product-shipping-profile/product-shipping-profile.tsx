import { Alert, Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

import { RouteDrawer } from "../../../components/modals"
import { useProduct } from "../../../hooks/api/products"
import { PRODUCT_DETAIL_FIELDS } from "../product-detail/constants"
import { ProductShippingProfileForm } from "./components/product-organization-form"

export const ProductShippingProfile = () => {
  const { id } = useParams()
  const { t } = useTranslation()

  const { product, isLoading, isError, error } = useProduct(id!, {
    fields: PRODUCT_DETAIL_FIELDS,
  })

  // Ne pas lancer l'erreur, afficher un message à la place
  // if (isError) {
  //   throw error
  // }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("products.shippingProfile.edit.header")}</Heading>
        </RouteDrawer.Title>
      </RouteDrawer.Header>
      {isError && (
        <div className="p-6">
          <Alert variant="warning">
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Backend Medusa non disponible</p>
              <p className="text-sm">
                Impossible de charger le produit. Le backend Medusa n&apos;est
                pas configuré ou accessible.
              </p>
            </div>
          </Alert>
        </div>
      )}
      {!isLoading && product && (
        <ProductShippingProfileForm product={product} />
      )}
    </RouteDrawer>
  )
}
