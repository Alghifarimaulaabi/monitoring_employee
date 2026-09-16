import { notFound } from "next/navigation";
import { getBouquetPeriodDetailAction } from "@/lib/actions/bouquet";
import BouquetPeriodDetailView from "@/components/bouquet-period-detail-view";

export const dynamic = "force-dynamic";

interface OwnerBouquetPeriodDetailPageProps {
  params: Promise<{
    periodId: string;
  }>;
}

export async function generateMetadata({
  params,
}: OwnerBouquetPeriodDetailPageProps) {
  const { periodId } = await params;
  const res = await getBouquetPeriodDetailAction(periodId);
  if (!res.success || !res.period) {
    return {
      title: "Detail Buket Tidak Ditemukan - B-Tracker",
    };
  }
  return {
    title: `${res.period.title} - B-Tracker`,
  };
}

export default async function OwnerBouquetPeriodDetailPage({
  params,
}: OwnerBouquetPeriodDetailPageProps) {
  const { periodId } = await params;
  const res = await getBouquetPeriodDetailAction(periodId);

  if (!res.success || !res.period) {
    notFound();
  }

  return (
    <div className="py-2">
      <BouquetPeriodDetailView period={res.period} role="OWNER" />
    </div>
  );
}
