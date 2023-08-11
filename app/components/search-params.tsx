"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useOverwolfRouter } from "../(overwolf)/components/overwolf-router";
import { API_BASE_URI } from "../lib/env";
import { useUpdateSearchParams } from "../lib/search-params";
import { ALL_FILTERS, useAccountStore } from "../lib/storage";
import useFilters from "./use-filters";

export default function SearchParams() {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const router = useOverwolfRouter();
  const [filters] = useFilters();
  const code = searchParams.get("code");
  const filtersParam = searchParams.get("filters");
  const accountStore = useAccountStore();

  const isOverwolf = "update" in router;
  useEffect(() => {
    if (isOverwolf || filters.join(",") === filtersParam) {
      return;
    }

    let filtersString = "";
    if (filters.length === 0) {
      filtersString = "none";
    } else if (filters.length !== ALL_FILTERS.length) {
      filtersString = filters.join(",");
    }
    updateSearchParams("filters", filtersString);
  }, [filters, filtersParam]);

  useEffect(() => {
    if (isOverwolf || !code) {
      return;
    }
    updateSearchParams(["code", "state"], ["", ""]);
    fetch(`${API_BASE_URI}/api/patreon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, redirectURI: API_BASE_URI }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          accountStore.setIsPatron(true);
        } else {
          console.log(res);
          alert(res.error ?? "Something went wrong, please try again.");
          accountStore.setIsPatron(false);
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err?.message || "Something went wrong, please try again.");
      });
  }, [code]);

  useEffect(() => {
    if (accountStore.isPatron) {
      fetch(`${API_BASE_URI}/api/patreon`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            accountStore.setIsPatron(true);
          } else {
            console.log(res);
            accountStore.setIsPatron(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  return <></>;
}
