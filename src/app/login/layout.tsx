import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingreso admin",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-4">
      {children}
    </div>
  );
}