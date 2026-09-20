import { notFound } from "next/navigation";
import { getInvoicePeriodDetailAction } from "@/lib/actions/invoice";
import InvoiceEditorView from "@/components/invoice/invoice-editor-view";

export const dynamic = "force-dynamic";

interface OwnerInvoicePeriodPageProps {
  params: Promise<{
    periodId: string;
  }>;
}

export async function generateMetadata({
  params,
}: OwnerInvoicePeriodPageProps) {
  const { periodId } = await params;
  const res = await getInvoicePeriodDetailAction(periodId);
  if (!res.success || !res.period) {
    return {
      title: "Surat Tagihan Tidak Ditemukan - B-Tracker",
    };
  }
  return {
    title: `Surat Tagihan: ${res.period.title} - B-Tracker`,
  };
}

export default async function OwnerInvoicePeriodPage({
  params,
}: OwnerInvoicePeriodPageProps) {
  const { periodId } = await params;
  const res = await getInvoicePeriodDetailAction(periodId);

  if (!res.success || !res.period || !res.initialInvoiceData) {
    notFound();
  }

  return (
    <div className="py-2">
      <InvoiceEditorView
        period={res.period}
        initialInvoiceData={res.initialInvoiceData}
      />
    </div>
  );
}
