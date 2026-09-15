export function PageTitle({
  children,
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "md" | "lg";
}) {
  const sizeStyle =
    size === "lg"
      ? { fontSize: "clamp(1.75rem, 4vw, 3rem)", lineHeight: 1.35, letterSpacing: "0.02em" }
      : { fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: 1.3, letterSpacing: "0.01em" };

  return (
    <h1
      className={`text-title ${className}`}
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 700,
        ...sizeStyle,
      }}
    >
      {children}
    </h1>
  );
}
