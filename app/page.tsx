import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function RootPage() {
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role === "OWNER") {
    redirect("/owner/employees");
  }

  redirect("/employee/tasks");
}
