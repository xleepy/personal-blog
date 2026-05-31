import GlassContainer from "@/components/GlassContainer";
import Link from "next/link";
import Image from "next/image";
import { GitHub } from "react-feather";
import avatar from "./avatar.png";

export const metadata = {
  title: "About me",
};

export default function Page() {
  return (
    <GlassContainer className="p-6 flex gap-4">
      <div className="flex-none">
        <Image src={avatar} alt="Avatar" className="rounded-lg" />
      </div>
      <div className="flex-1 px-3 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">About me</h1>
        <p className="text-[var(--text-secondary)]">Frontend dev</p>
        <ul>
          <li>
            <Link
              className="flex gap-x-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              target="_blank"
              href={"https://github.com/xleepy"}
            >
              <GitHub />
            </Link>
          </li>
        </ul>
      </div>
    </GlassContainer>
  );
}
