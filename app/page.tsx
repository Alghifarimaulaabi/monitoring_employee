import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function RootPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const isOwner =
    session.user.role === "OWNER" || session.user.role === "admin";

  if (isOwner) {
    redirect("/owner/employees");
  }

  redirect("/employee/tasks");
}
