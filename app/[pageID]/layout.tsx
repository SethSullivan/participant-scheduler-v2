import { AuthButton } from "@/components/auth-button";
// import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen min-w-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-14">
          <div className="w-full max-w-5xl flex justify-between items-center px-1 text-sm">
            <div className="flex items-center font-semibold">
              <Link href={"/"}>Participant Scheduler</Link>
            </div>
            <AuthButton />
          </div>
        </nav>

        {/* NOTE: w-full makes it so that the child containers on the screen always take up the width of the screen
        (bc i have main as min-w-screen), whether it's loading or showing a calendar. 
        NOrmally this would push content off the screen to  the right, but max-w-5xl 
        makes it so that it sits nicely with padding  */}
        <div className="flex-1 flex flex-col max-w-5xl w-full">
          {children}
        </div>

        {/* <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>Powered by Seth Sullivan</p>
          <ThemeSwitcher />
        </footer> */}
      </div>
    </main>
  );
}
