export { generateMetadata } from "@/app/lib/meta";

export default function Node({
  params: { name },
}: {
  params: { name: string };
}) {
  return <div>{decodeURIComponent(name)}</div>;
}
