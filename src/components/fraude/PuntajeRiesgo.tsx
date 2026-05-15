import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { riskColor } from "../../utils/fraudeAlerts";

interface Props {
  score: number;
  compact?: boolean;
}

export default function PuntajeRiesgo({ score, compact }: Props) {
  const color = riskColor(score);
  const Icon = score >= 66 ? AlertCircle : score >= 31 ? AlertTriangle : Info;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold ${color}`}>
        <Icon size={14} />
        {score}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${color}`}
    >
      <Icon size={14} />
      Riesgo: {score}/100
    </div>
  );
}
