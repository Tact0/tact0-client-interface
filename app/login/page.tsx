import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server-auth";
import { LoginForm } from "@/components/forms/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { ROUTES } from "@/lib/constants";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(ROUTES.CHAT);
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12 relative">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-lg w-full">
        <LoginForm />
      </div>
    </div>
  );
}

