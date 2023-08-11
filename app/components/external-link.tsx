export default function ExternalLink({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  return (
    <a
      key={href}
      href={href}
      target="_blank"
      className="flex items-center gap-1 text-gray-300 hover:text-white"
    >
      {text}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
        <path d="M11 13l9 -9"></path>
        <path d="M15 4h5v5"></path>
      </svg>
    </a>
  );
}
