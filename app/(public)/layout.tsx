import { PublicProviders } from "@/components/providers/providers";

export const dynamic = "force-static";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicProviders>
      {children}
    </PublicProviders>
  );
}
