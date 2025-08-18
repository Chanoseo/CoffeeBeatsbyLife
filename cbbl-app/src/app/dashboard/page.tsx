import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      Welcome {session.user.email} (role: {session.user.role})
    </div>
  );
}
