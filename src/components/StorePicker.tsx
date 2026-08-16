import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { PRESET_STORES, storesForCountry } from '../data/stores';
import { useT } from '../i18n/useT';

/** Selector de "dónde comprarlo": cadenas conocidas (Lidl, Mercadona, Coop,
 * Migros...) en chips, más las tiendas propias que el usuario ya haya
 * escrito antes (la panadería, la carnicería del barrio...), y un campo
 * para añadir una nueva tienda propia sobre la marcha. */
export default function StorePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (store: string | null) => void;
}) {
  const customStores = useStore((s) => s.customStores);
  const country = useStore((s) => s.settings.country);
  const { t } = useT();
  const [customInput, setCustomInput] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);

  // Tus propias tiendas (la del barrio, la que tiene productos portugueses
  // cerca de casa...) van primero — las conoces mejor que cualquier cadena
  // genérica. Luego, las cadenas habituales en tu país, si lo has elegido.
  const orderedPresets = useMemo(() => storesForCountry(country), [country]);

  const addCustom = () => {
    const name = customInput.trim();
    if (!name) return;
    onChange(name);
    setCustomInput('');
    setAddingCustom(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="btn-accent px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"
          >
            {value} ✕
          </button>
        )}
        {!value &&
          customStores
            .filter((cs) => !PRESET_STORES.some((p) => p.name === cs))
            .map((cs) => (
              <button
                type="button"
                key={cs}
                onClick={() => onChange(cs)}
                className="card-soft px-3 py-1.5 rounded-full text-xs font-bold hover:text-accent"
              >
                📍 {cs}
              </button>
            ))}
        {!value &&
          orderedPresets.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => onChange(s.name)}
              className="card-soft px-3 py-1.5 rounded-full text-xs font-bold hover:text-accent"
            >
              {s.emoji} {s.name}
            </button>
          ))}
        {!value && !addingCustom && (
          <button
            type="button"
            onClick={() => setAddingCustom(true)}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-accent border-2 border-dashed border-theme"
          >
            {t('shopping.addOwnStore')}
          </button>
        )}
      </div>
      {addingCustom && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder={t('shopping.ownStorePlaceholder')}
            className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent text-sm"
          />
          <button type="button" onClick={addCustom} className="btn-accent px-3 rounded-xl text-sm font-bold">
            {t('common.create')}
          </button>
        </div>
      )}
    </div>
  );
}
