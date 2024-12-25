"use client";
import { CountryResponse, HolidayResponse } from "@/api/holidays";
import { Suspense, use, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HolidaysApiProvider, useHolidaysApi } from "./HolidaysApiProvider";

// https://reactpractice.dev/exercise/build-a-public-holidays-app/
type HolidaysListProps = {
  holidaysPromise: Promise<HolidayResponse[]>;
};

const HolidaysList = ({ holidaysPromise }: HolidaysListProps) => {
  const holidays = use(holidaysPromise);
  return (
    <ul className="mx-auto">
      {holidays?.map(({ name, startDate, id }) => {
        const enLocalizedName =
          name.find(({ language }) => language === "EN") ?? name[0];
        return (
          <li key={id}>{`${startDate.toDateString()} - ${
            enLocalizedName.text
          }`}</li>
        );
      })}
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

type CountrySelectorProps = {
  countriesPromise: Promise<CountryResponse[]>;
  initialCountryIsoCode: string;
  onCountrySelect?: (isoCode: string) => void;
};

const CountrySelector = ({
  countriesPromise,
  initialCountryIsoCode,
  onCountrySelect,
}: CountrySelectorProps) => {
  const countries = use(countriesPromise);

  if (!Array.isArray(countries)) {
    const error = countries as any;
    throw new Error(`${error.status} - ${error.title}`);
  }

  return (
    <select
      className="bg-black"
      defaultValue={initialCountryIsoCode}
      onChange={(event) => {
        onCountrySelect?.(event.target.value);
      }}
    >
      {countries?.map(({ isoCode, name }) => {
        const [localizedName] = name;
        return (
          <option key={isoCode} value={isoCode}>
            {localizedName.text}
          </option>
        );
      })}
    </select>
  );
};

const Countries = ({
  onCountrySelect,
  initialCountryIsoCode,
}: Pick<CountrySelectorProps, "onCountrySelect" | "initialCountryIsoCode">) => {
  const allCountriesPromise = useMemo(() => {
    return fetch("https://openholidaysapi.org/Countries", {
      headers: {
        Accept: "application/json",
      },
    }).then((response) => response.json());
  }, []);

  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <Suspense fallback={"Loading..."}>
        <CountrySelector
          initialCountryIsoCode={initialCountryIsoCode}
          onCountrySelect={onCountrySelect}
          countriesPromise={allCountriesPromise}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

const HolidaysApp = () => {
  const holidaysApi = useHolidaysApi();
  const [countryIsoCode, setCountryIsoCode] = useState("DE");

  const holidaysPromise = useMemo(() => {
    return holidaysApi.publicHolidaysGet({
      countryIsoCode: countryIsoCode,
      validFrom: new Date(new Date().getFullYear(), 0, 1),
      validTo: new Date(new Date().getFullYear(), 11, 31),
    });
  }, [holidaysApi, countryIsoCode]);

  return (
    <section className="flex flex-col gap-4 min-h-64">
      <Countries
        initialCountryIsoCode={countryIsoCode}
        onCountrySelect={setCountryIsoCode}
      />
      <ErrorBoundary FallbackComponent={Fallback}>
        <Suspense fallback={"Loading..."}>
          <HolidaysList holidaysPromise={holidaysPromise} />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
};

const HolidaysAppWithProvider = () => {
  return (
    <HolidaysApiProvider>
      <HolidaysApp />
    </HolidaysApiProvider>
  );
};

export default HolidaysAppWithProvider;
