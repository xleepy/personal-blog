import Link from "next/link";

export default function Header() {
  return (
    <header className="p-4">
      <nav className="gap-x-4 flex">
        <Link href={"/"}>Home</Link>
        <Link href={"/about"}>About</Link>
      </nav>
    </header>
  );
}
