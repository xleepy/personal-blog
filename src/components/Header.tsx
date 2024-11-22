import Link from "next/link";

export default function Header() {
  return (
    <header className="my-4">
      <nav className="gap-x-4 flex justify-between">
        <div>
          <Link href={"/"}>Home</Link>
        </div>
        <div>
          <Link href={"/about"}>About</Link>
        </div>
      </nav>
    </header>
  );
}
