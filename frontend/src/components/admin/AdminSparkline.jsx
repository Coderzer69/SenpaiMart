export function AdminSparkline({ data, color = "#FF6B4A", className = "" }) {
  const values = data?.length ? data : [0];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = 80;
  const height = 32;
  const padding = 2;

  const points = values
    .map((v, i) => {
      const x =
        padding + (i / Math.max(values.length - 1, 1)) * (width - padding * 2);
      const y =
        height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-8 w-20 ${className}`}
      aria-hidden
    >
      <polygon points={areaPoints} fill={`${color}22`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
