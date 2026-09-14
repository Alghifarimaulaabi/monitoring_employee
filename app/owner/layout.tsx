import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import OwnerHeader from "@/components/owner-header";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== "OWNER") {
    redirect("/employee/tasks");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OwnerHeader
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
