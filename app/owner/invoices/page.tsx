import { getInvoicePeriodsAction } from "@/lib/actions/invoice";
import InvoiceCardsView from "@/components/invoice/invoice-cards-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manajemen Tagihan Buket - B-Tracker",
};

export default async function OwnerInvoicesPage() {
  const res = await getInvoicePeriodsAction();
  const periods = res.success ? res.periods : [];

  return <InvoiceCardsView periods={periods} />;
}
