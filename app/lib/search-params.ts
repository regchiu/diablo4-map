import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useUpdateSearchParams() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateSearchParams = useCallback(
    (name: string | string[], value: string | string[], replace = false) => {
      const params = new URLSearchParams(searchParams.toString());
      if (typeof name === "string" && typeof value === "string") {
        if (value.length === 0) {
          params.delete(name);
        } else {
          params.set(name, value);
        }
      } else if (Array.isArray(name) && Array.isArray(value)) {
        name.forEach((n, i) => {
          if (value[i].length === 0) {
            params.delete(n);
          } else {
            params.set(n, value[i]);
          }
        });
      }
      if (searchParams.toString() === params.toString()) {
        return;
      }
      const url = pathname + "?" + params.toString();
      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [searchParams, pathname]
  );

  return updateSearchParams;
}
