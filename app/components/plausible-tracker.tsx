"use client";
import type { EventOptions, PlausibleOptions } from "plausible-tracker";
import Plausible from "plausible-tracker";
import { useEffect } from "react";

let plausible: ReturnType<typeof Plausible> | null = null;
export const initPlausible = (domain: string, apiHost: string) => {
  plausible = Plausible({
    domain,
    apiHost,
  });
  plausible.enableAutoPageviews();
};

export const trackEvent = (
  eventName: string,
  options?: EventOptions | undefined,
  eventData?: PlausibleOptions | undefined
) => {
  if (plausible) {
    plausible.trackEvent(eventName, options, eventData);
  }
};

export const trackOutboundLinkClick = (url: string) => {
  trackEvent("Outbound Link: Click", { props: { url: url } });
};

export default function PlausibleTracker({
  domain,
  apiHost,
}: {
  domain?: string;
  apiHost?: string;
}) {
  useEffect(() => {
    if (domain && apiHost) {
      initPlausible(domain, apiHost);
    }
  }, []);

  return <></>;
}
