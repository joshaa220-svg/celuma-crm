import { CrmDashboard } from "@/components/crm-dashboard";
import { getServerSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getServerSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <CrmDashboard currentUser={user} />;
}
