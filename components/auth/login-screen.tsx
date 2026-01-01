import { LoginForm } from "@/components/forms/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { QueryProvider } from "@/components/providers/providers";

export function LoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-lg w-full">
        <QueryProvider>
          <LoginForm />
        </QueryProvider>
      </div>
    </div>
  );
}
