import Link from "next/link";

export default function Header() {
  return (
    <header className="p-4">
      <Link href={"/about"}>About</Link>
    </header>
  );
}
