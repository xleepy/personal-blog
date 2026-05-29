import Link from "next/link";

export default function Header() {
  return (
    <header className="my-4">
      <p className="mb-2 text-right text-xs font-medium text-[var(--text-muted)]">
        Location is used only for local weather visuals.
      </p>
      <nav className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-lg flex justify-between gap-x-4">
        <Link href={"/"} className="text-[var(--text-primary)] font-medium hover:text-[var(--text-secondary)] transition-colors">Home</Link>
        <Link href={"/about"} className="text-[var(--text-primary)] font-medium hover:text-[var(--text-secondary)] transition-colors">About</Link>
      </nav>
    </header>
  );
}
