import type { ShoppingItem } from '../types';
import { formatMoney } from './format';
import { useStore } from '../store/useStore';
import { translate } from '../i18n/translations';

/** Arma un texto plano de la lista, agrupado por tienda (lo que de verdad
 * ayuda al ir a comprar: "en Lidl: ..., en la panadería: ..."), listo para
 * pegar en WhatsApp o donde sea.
 *
 * Ojo: el redirector wa.me de WhatsApp corrompe algunos emojis (🛒, 📍...)
 * al reenviar el texto — comprobado directamente contra su servidor, no es
 * cosa del navegador. Por eso aquí se usa solo texto llano + *negrita* de
 * WhatsApp (asteriscos) y viñetas "-", que sí sobreviven siempre. */
export function buildShoppingListText(
  items: ShoppingItem[],
  currency: string,
  title: string
): string {
  const lang = useStore.getState().settings.language;
  const pending = items.filter((i) => !i.checked);
  if (pending.length === 0) return `*${title}*\n\n${translate('shopping.share.noPending', lang)}`;

  const byStore = new Map<string, ShoppingItem[]>();
  const noStore: ShoppingItem[] = [];
  for (const item of pending) {
    if (item.store) {
      const list = byStore.get(item.store) ?? [];
      list.push(item);
      byStore.set(item.store, list);
    } else {
      noStore.push(item);
    }
  }

  const lines: string[] = [`*${title}*`, ''];
  const renderItem = (i: ShoppingItem) =>
    `- ${i.name}${i.estPrice !== null ? ` (${formatMoney(i.estPrice, currency)})` : ''}`;

  for (const [store, list] of byStore) {
    lines.push(`*${store}*`);
    list.forEach((i) => lines.push(renderItem(i)));
    lines.push('');
  }
  if (noStore.length > 0) {
    if (byStore.size > 0) lines.push(`*${translate('shopping.share.noStoreAssigned', lang)}*`);
    noStore.forEach((i) => lines.push(renderItem(i)));
  }

  return lines.join('\n').trim();
}
