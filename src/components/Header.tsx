import Link from "next/link";

export default function Header() {
  return (
    <header className="p-4">
      <nav>
        <Link href={"/about"}>About</Link>
      </nav>
    </header>
  );
}
