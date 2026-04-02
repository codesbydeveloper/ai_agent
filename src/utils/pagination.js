/**
 * Many APIs omit total count or return the current page size (e.g. 10) as `total`,
 * which makes the UI think there is only one page and disables Next incorrectly.
 * Honors explicit has_next/hasNext when present; otherwise infers from a full page + ambiguous total.
 *
 * When `total` is missing, zero, or smaller than the rows on this page, we default to at least
 * `(page - 1) * pageSize + listLength` so Next/last-page behavior stays consistent.
 */
export function resolveTotalForPagination(page, pageSize, listLength, rawTotal, data) {
  const minTotalFromPage = (page - 1) * pageSize + listLength;

  const hasNext =
    data?.pagination?.has_next ??
    data?.pagination?.hasNext ??
    data?.data?.has_next ??
    data?.data?.hasNext ??
    data?.has_next ??
    data?.hasNext ??
    data?.meta?.has_next ??
    data?.meta?.hasNext;

  if (hasNext === false) {
    const t = Number(rawTotal);
    const base = Number.isFinite(t) && t >= 0 ? t : minTotalFromPage;
    return Math.max(base, minTotalFromPage);
  }
  if (hasNext === true) {
    const t = Number(rawTotal);
    const base = Number.isFinite(t) && t >= 0 ? t : minTotalFromPage;
    return Math.max(base, minTotalFromPage, page * pageSize + 1);
  }
  let t = Number(rawTotal);
  if (!Number.isFinite(t) || t < 0) t = minTotalFromPage;
  else t = Math.max(t, minTotalFromPage);
  if (listLength === pageSize && t === listLength) {
    return page * pageSize + 1;
  }
  return t;
}
