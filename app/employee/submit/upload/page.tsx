import BouquetSubmitForm from "@/components/bouquet-submit-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unggah Foto Buket - B-Tracker",
};

interface UploadBouquetPageProps {
  searchParams: Promise<{
    periodId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function UploadBouquetPage({
  searchParams,
}: UploadBouquetPageProps) {
  const params = await searchParams;

  return (
    <div className="py-2">
      <BouquetSubmitForm
        periodId={params.periodId}
        startDate={params.startDate}
        endDate={params.endDate}
      />
    </div>
  );
}
