export default function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`relative w-10 block overflow-hidden h-6 rounded-full  cursor-pointer ${
        checked ? "bg-green-400" : "bg-neutral-500"
      }`}
    >
      <input
        type="checkbox"
        className={`absolute block w-6 h-6 rounded-full appearance-none cursor-pointer bg-white ${
          checked ? "right-0" : ""
        }`}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
