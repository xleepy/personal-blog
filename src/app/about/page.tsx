import Link from "next/link";
import Image from "next/image";
import { GitHub } from "react-feather";
import avatar from "./avatar.png";

export const metadata = {
  title: "About me",
};

export default function Page() {
  return (
    <div className="flex gap-2">
      <div className="flex-none">
        <Image src={avatar} alt="Avatar" />
      </div>
      <div className="flex-1 px-3 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">About me</h1>
        <p>Frontend dev</p>
        <ul>
          <li>
            <Link
              className="flex gap-x-2"
              target="_blank"
              href={"https://github.com/xleepy"}
            >
              <GitHub />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
