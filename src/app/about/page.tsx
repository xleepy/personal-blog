import Win98Window from "@/components/Win98Window";
import Link from "next/link";
import Image from "next/image";
import { GitHub } from "react-feather";
import avatar from "./avatar.png";

export const metadata = {
  title: "About me",
};

export default function Page() {
  return (
    <div className="win98-page-window-wrap">
      <Win98Window title="About Me - Properties" className="w-full max-w-3xl">
        <div className="win98-about-card">
          <div className="win98-avatar-frame">
            <Image src={avatar} alt="Avatar" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h1 className="text-xl font-bold">About me</h1>
            <p>Frontend developer</p>
            <div className="win98-inset-panel p-3">
              <p className="mb-2 font-bold">Internet shortcut</p>
              <Link
                className="win98-link inline-flex items-center gap-2"
                target="_blank"
                href="https://github.com/xleepy"
              >
                <GitHub size={18} /> GitHub
              </Link>
            </div>
          </div>
        </div>
      </Win98Window>
    </div>
  );
}
