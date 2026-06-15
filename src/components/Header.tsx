import GlassContainer from "@/components/GlassContainer";
import Link from "next/link";
import { AlertTriangle } from "react-feather";

const locationDisclaimer =
  "Your location is requested to load local weather visuals. Coordinates are sent to the weather API and are not stored by this site; if unavailable, Prague weather is used.";

export default function Header() {
  return (
    <header className="relative z-30 my-4 flex w-full flex-col gap-2 xl:block">
      <GlassContainer
        as="nav"
        className="glass-panel mx-auto flex w-full max-w-5xl justify-between gap-x-4 p-4"
      >
        <Link
          href={"/"}
          className="font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--text-secondary)]"
        >
          Home
        </Link>
        <Link
          href={"/about"}
          className="font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--text-secondary)]"
        >
          About
        </Link>
      </GlassContainer>
      <div className="group relative self-end xl:absolute xl:right-0 xl:top-1/2 xl:-translate-y-1/2">
        <GlassContainer
          as="button"
          type="button"
          aria-label="Location usage disclaimer"
          aria-description={locationDisclaimer}
          className="glass-control glass-interactive grid size-11 place-items-center p-0 transition-colors focus:outline-none lg:size-12"
        >
          <AlertTriangle
            aria-hidden="true"
            className="size-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.45)] lg:size-6"
          />
        </GlassContainer>
        <div
          aria-hidden="true"
          className="glass-tooltip pointer-events-none absolute right-0 top-full z-20 mt-2 w-[min(calc(100vw-2rem),20rem)] rounded-lg p-3 text-sm leading-relaxed opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {locationDisclaimer}
        </div>
      </div>
    </header>
  );
}
