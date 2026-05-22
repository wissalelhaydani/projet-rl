export default function StatusDot({ online }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: online ? "rgba(16,216,118,0.1)" : "rgba(248,113,113,0.12)",
        border: `1px solid ${online ? "rgba(16,216,118,0.25)" : "rgba(248,113,113,0.3)"}`,
        color: online ? "#10d876" : "#f87171",
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 99,
        letterSpacing: "0.3px",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "currentColor",
          animation: online ? "pulse 2s infinite" : "none",
        }}
      />
      {online ? "API Online" : "API Offline"}
    </span>
  );
}