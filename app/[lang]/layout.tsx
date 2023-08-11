import { LOCALES } from "../lib/i18n";

export { generateMetadata } from "@/app/lib/meta";
export { default } from "../(web)/layout";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}
