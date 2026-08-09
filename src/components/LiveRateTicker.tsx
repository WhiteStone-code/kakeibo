import { useExchangeRate } from '../hooks/useExchangeRate';

const REFERENCES = ['EUR', 'USD', 'GBP'];

/** Muestra el tipo de cambio en vivo de la divisa elegida frente a EUR/USD/GBP
 * — pensado para verse justo debajo del selector de moneda en Ajustes. */
export default function LiveRateTicker({ base }: { base: string }) {
  const refs = REFERENCES.filter((c) => c !== base);

  return (
    <div className="flex flex-wrap gap-2">
      {refs.map((ref) => (
        <RateChip key={ref} base={base} to={ref} />
      ))}
    </div>
  );
}

function RateChip({ base, to }: { base: string; to: string }) {
  const { rate, status } = useExchangeRate(base, to);
  return (
    <span className="card-soft px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
      <span className="text-soft">1 {base} =</span>
      {status === 'loading' ? (
        <span className="text-soft">…</span>
      ) : rate !== null ? (
        <span className="font-bold text-accent">
          {rate.toLocaleString('es-ES', { maximumFractionDigits: 4 })} {to}
        </span>
      ) : (
        <span className="text-soft">sin dato</span>
      )}
    </span>
  );
}
