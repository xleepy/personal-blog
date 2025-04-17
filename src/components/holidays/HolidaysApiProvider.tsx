"use client";
import { Configuration, HolidaysApi } from "@/api/holidays";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

const HolidaysApiContext = createContext<HolidaysApi | null>(null);

export const HolidaysApiProvider = ({ children }: PropsWithChildren) => {
  const holidaysApi = useMemo(() => {
    return new HolidaysApi(
      new Configuration({ basePath: "https://openholidaysapi.org" })
    );
  }, []);
  return (
    <HolidaysApiContext.Provider value={holidaysApi}>
      {children}
    </HolidaysApiContext.Provider>
  );
};

export const useHolidaysApi = () => {
  const context = useContext(HolidaysApiContext);
  if (!context) {
    throw new Error("useHolidaysApi must be used within a HolidaysApiProvider");
  }
  return context;
};
