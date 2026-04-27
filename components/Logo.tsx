type LogoProps = {
  size?: "sm" | "md";
  withWordmark?: boolean;
};

export default function Logo({ size = "md", withWordmark = true }: LogoProps) {
  const boxSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "sm" ? 16 : 18;

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`${boxSize} flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)]`}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
            fill="currentColor"
          />
        </svg>
      </span>
      {withWordmark && (
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold text-[var(--color-text)]">
            Facebook Ads
          </span>
          <span className="text-[15px] font-semibold text-[var(--color-text)]">
            Content Score
          </span>
        </span>
      )}
    </div>
  );
}
