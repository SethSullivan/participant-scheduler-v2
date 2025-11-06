import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import MobileDetector from "@/components/mobile-detector";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen min-w-screen flex flex-col items-center">
      <MobileDetector>
        <div className="flex-1 w-full flex flex-col items-center">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-14">
            <div className="w-full max-w-5xl flex justify-between items-center px-1 text-sm">
              <div className="flex items-center font-semibold">
                <Link href={"/"}>Participant Scheduler</Link>
              </div>
              <AuthButton />
            </div>
          </nav>

          <div className="flex-1 flex flex-col max-w-5xl w-full">
            {children}
          </div>
        </div>
      </MobileDetector>
    </main>
  );
}
