export default function Badge({ text, color = "#7b6cff", bg = "rgba(123,108,255,0.18)", border = "transparent" }) {
  return (
    <span className="tag" style={{ background: bg, color, border: `1px solid ${border}` }}>
      {text}
    </span>
  );
}