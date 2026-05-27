import Link from "next/link";

export default function Header() {
  return (
    <header className="my-4">
      <nav className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-lg flex justify-between gap-x-4">
        <Link href={"/"} className="text-slate-900 font-medium hover:text-slate-700 transition-colors">Home</Link>
        <Link href={"/about"} className="text-slate-900 font-medium hover:text-slate-700 transition-colors">About</Link>
      </nav>
    </header>
  );
}
