export default function FullPageLoader({
  label = "Yükleniyor…",
}: {
  label?: string;
}) {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "40px auto",
        padding: "0 18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* SVG spinner */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        aria-label={label}
        role="img"
        style={{ animation: "spin 0.9s linear infinite" }}
      >
        {/* arka halka */}
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="4"
        />
        {/* ön parça */}
        <path
          d="M40 22a18 18 0 0 0-18-18"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
