export default function Skeleton({ w = "100%", h = 14, r = 8, style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}