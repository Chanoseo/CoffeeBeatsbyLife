import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import prisma from "@/lib/prisma";

export default async function UserHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/"); // Not logged in

  // Now session.user.id exists, safe to query
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) redirect("/"); // User not found

  if (dbUser.role === "admin") redirect("/dashboard"); // Admins cannot access user home

  return (
    <div>
      <h1>Welcome {dbUser.name ?? "User"}</h1>
      <p>Your role: {dbUser.role}</p>
      <LogoutButton />
    </div>
  );
}
