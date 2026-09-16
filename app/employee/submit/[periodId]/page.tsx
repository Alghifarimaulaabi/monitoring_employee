import { notFound } from "next/navigation";
import { getBouquetPeriodDetailAction } from "@/lib/actions/bouquet";
import BouquetPeriodDetailView from "@/components/bouquet-period-detail-view";

export const dynamic = "force-dynamic";

interface EmployeeBouquetPeriodDetailPageProps {
  params: Promise<{
    periodId: string;
  }>;
}

export async function generateMetadata({
  params,
}: EmployeeBouquetPeriodDetailPageProps) {
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

export default async function EmployeeBouquetPeriodDetailPage({
  params,
}: EmployeeBouquetPeriodDetailPageProps) {
  const { periodId } = await params;
  const res = await getBouquetPeriodDetailAction(periodId);

  if (!res.success || !res.period) {
    notFound();
  }

  return (
    <div className="py-2">
      <BouquetPeriodDetailView period={res.period} role="EMPLOYEE" />
    </div>
  );
}
