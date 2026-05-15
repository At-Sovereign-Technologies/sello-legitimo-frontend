import type { EstadoAlerta } from "../../types/fraudeAlerts";
import { statusConfig } from "../../utils/fraudeAlerts";

interface Props {
  status: EstadoAlerta;
}

export default function AlertaEstado({ status }: Props) {
  const c = statusConfig(status);
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}
