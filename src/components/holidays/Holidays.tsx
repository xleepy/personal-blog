"use client";
import { Configuration, HolidayResponse, HolidaysApi } from "@/api/holidays";
import Link from "next/link";
import { Suspense, use, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AlertTriangle } from "react-feather";

type HolidaysListProps = {
  holidaysPromise: Promise<HolidayResponse[]>;
};

const HolidaysList = ({ holidaysPromise }: HolidaysListProps) => {
  const holidays = use(holidaysPromise);
  return (
    <ul>
      {holidays?.map((holiday) => (
        <li key={holiday.id}>{holiday.name.at(0)?.text}</li>
      ))}
    </ul>
  );
};

type FallbackProps = {
  error: Error;
};

export const Fallback = ({ error }: FallbackProps) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
    </div>
  );
};

const HolidaysApp = () => {
  const holidaysApi = useMemo(() => {
    return new HolidaysApi(
      new Configuration({ basePath: "https://openholidaysapi.org" })
    );
  }, []);

  const holidaysPromise = useMemo(() => {
    return holidaysApi.publicHolidaysGet({
      countryIsoCode: "DE",
      validFrom: new Date(new Date().getFullYear(), 0, 1),
      validTo: new Date(new Date().getFullYear(), 11, 31),
      subdivisionCode: "DE-BE",
    });
  }, [holidaysApi]);

  return (
    <section className="flex flex-col gap-4">
      <h1 className="flex gap-2">
        <AlertTriangle /> WIP: Holiday challenge from
        <Link
          target="_blank"
          href="https://reactpractice.dev/exercise/build-a-public-holidays-app/"
        >
          reactpractive
        </Link>
      </h1>
      <ErrorBoundary FallbackComponent={Fallback}>
        <Suspense>
          <HolidaysList holidaysPromise={holidaysPromise} />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
};

export default HolidaysApp;
