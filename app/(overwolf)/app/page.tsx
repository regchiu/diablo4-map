import dynamic from "next/dynamic";

const App = dynamic(() => import("./app"), {
  ssr: false,
});

export const metadata = {
  title: "Diablo 4 Map",
};

export default function Page() {
  return <App />;
}
