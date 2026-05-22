export default function Spinner({ size = 18, color = "#fff" }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid rgba(255,255,255,0.2)`,
        borderTopColor: color,
        display: "inline-block",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}