import { validateRequest } from "@/server/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/_components/_auth-actions";

export default async function Page() {
  const { user } = await validateRequest();

  if (!user) return redirect("/auth/login");

  return (
    <div>
      Hello, {user.username}
      <form action={logout}>
        <Button>Sign Out</Button>
      </form>
    </div>
  );
}
