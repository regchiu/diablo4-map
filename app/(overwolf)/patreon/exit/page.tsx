import dynamic from "next/dynamic";

const Exit = dynamic(() => import("./exit"), {
  ssr: false,
});

export const metadata = {
  title: "Patreon - Diablo 4 Map",
};

export default function PatreonExit() {
  return <Exit />;
}
