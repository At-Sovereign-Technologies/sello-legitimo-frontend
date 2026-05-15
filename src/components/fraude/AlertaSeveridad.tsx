import type { Severidad } from "../../types/fraudeAlerts";
import { severityConfig } from "../../utils/fraudeAlerts";

interface Props {
  level: Severidad;
}

export default function AlertaSeveridad({ level }: Props) {
  const c = severityConfig(level);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${c.bg} ${c.text} ${c.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
