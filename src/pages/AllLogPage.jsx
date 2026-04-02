import { useEffect, useMemo, useState } from 'react';
import { getVoiceCallById, getVoiceCalls } from '../services/voiceService';
import { resolveTotalForPagination } from '../utils/pagination';

const PAGE_SIZE = 10;
/** Pages of this size are fetched and merged when filtering by direction (whole dataset, then client slice). */
const FETCH_CHUNK = 100;
const MAX_FETCH_PAGES = 500;

function parseResponse(data) {
  const rows = Array.isArray(data?.data?.call_log_data)
    ? data.data.call_log_data
    : Array.isArray(data?.calls)
      ? data.calls
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

  const total = Number(
    data?.data?.total_records
    ?? data?.total_records
    ?? data?.pagination?.total
    ?? rows.length
  );

  return { rows, total: Number.isFinite(total) ? total : rows.length };
}

function formatCell(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Normalize API values like incoming/outgoing to inbound/outbound for filtering and labels. */
function rowDirectionKey(value) {
  const v = String(value || '').toLowerCase();
  if (v === 'incoming' || v === 'inbound') return 'inbound';
  if (v === 'outgoing' || v === 'outbound') return 'outbound';
  return v;
}

/** Load every page from GET /api/voice/calls (no direction param), then filter by Inbound/Outbound locally. */
async function fetchEntireLogAndFilter(direction) {
  const merged = [];
  let p = 1;
  while (p <= MAX_FETCH_PAGES) {
    const data = await getVoiceCalls({ page: p, page_size: FETCH_CHUNK });
    const parsed = parseResponse(data);
    const batch = parsed.rows;
    if (!batch.length) break;
    merged.push(...batch);
    if (batch.length < FETCH_CHUNK) break;
    p += 1;
  }
  return merged.filter((row) => rowDirectionKey(row?.call_direction) === direction);
}

function formatDirectionCell(value) {
  const k = rowDirectionKey(value);
  if (k === 'inbound') return 'Inbound';
  if (k === 'outbound') return 'Outbound';
  return formatCell(value);
}

function pad2(n) {
  return String(Math.max(0, Number(n) || 0)).padStart(2, '0');
}

function formatDurationHMS(value, row) {
  const secondsFromRow = Number(row?.call_duration_in_seconds);
  if (Number.isFinite(secondsFromRow) && secondsFromRow >= 0) {
    const h = Math.floor(secondsFromRow / 3600);
    const m = Math.floor((secondsFromRow % 3600) / 60);
    const s = Math.floor(secondsFromRow % 60);
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }

  const raw = String(value || '').trim();
  if (!raw) return '-';

  // Handles formats like "2.00:51.00" (minutes.seconds style from provider)
  const providerMatch = raw.match(/^(\d+)\.\d+:(\d+)\.\d+$/);
  if (providerMatch) {
    const mins = Number(providerMatch[1]);
    const secs = Number(providerMatch[2]);
    const total = (Number.isFinite(mins) ? mins : 0) * 60 + (Number.isFinite(secs) ? secs : 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = Math.floor(total % 60);
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }

  // Handles formats like "0:0", "12:31", "01:02:03"
  const parts = raw.split(':').map((p) => Number(String(p).replace(/[^\d]/g, '')));
  if (parts.every((n) => Number.isFinite(n))) {
    let h = 0; let m = 0; let s = 0;
    if (parts.length === 3) [h, m, s] = parts;
    else if (parts.length === 2) [m, s] = parts;
    else if (parts.length === 1) s = parts[0];
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }

  return raw;
}

function headerLabel(key) {
  return key.replaceAll('_', ' ');
}

function statusPill(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (value === 'failed') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function directionPill(direction) {
  const value = String(direction || '').toLowerCase();
  if (value === 'inbound' || value === 'incoming') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (value === 'outbound' || value === 'outgoing') return 'border-violet-200 bg-violet-50 text-violet-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function parseConversationFallback(conversation) {
  if (!conversation) return [];
  const text = String(conversation).replace(/\\n/g, '\n').replace(/^\[|\]$/g, '').replace(/^['"]|['"]$/g, '');
  const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
  const messages = [];
  lines.forEach((line, idx) => {
    if (line.startsWith('LLM:')) {
      messages.push({ id: `llm-${idx}`, role: 'bot', text: line.replace(/^LLM:\s*/, '') });
    } else if (line.startsWith('User:')) {
      messages.push({ id: `usr-${idx}`, role: 'user', text: line.replace(/^User:\s*/, '') });
    }
  });
  return messages;
}

function extractMessages(payload) {
  const rawCallData = payload?.data?.call_log_data
    ?? payload?.data
    ?? payload;

  // Detail endpoint may return `call_log_data` as an array with one item.
  const callData = Array.isArray(rawCallData) ? rawCallData[0] : rawCallData;

  const interactions = Array.isArray(callData?.interactions) ? callData.interactions : [];
  if (interactions.length > 0) {
    return interactions.flatMap((it, idx) => {
      const out = [];
      const userText = String(it?.user_query || '').trim();
      const botText = String(it?.bot_response || '').trim();
      if (userText) out.push({ id: `u-${idx}`, role: 'user', text: userText, at: it?.time_of_call || '' });
      if (botText) out.push({ id: `b-${idx}`, role: 'bot', text: botText, at: it?.time_of_call || '' });
      return out;
    });
  }

  return parseConversationFallback(callData?.call_conversation);
}

export default function AllLogPage() {
  const [modeAllRows, setModeAllRows] = useState([]);
  const [modeAllTotal, setModeAllTotal] = useState(0);
  const [fullFilteredRows, setFullFilteredRows] = useState([]);
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState('all');
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (direction !== 'all') return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getVoiceCalls({ page, page_size: PAGE_SIZE });
        if (cancelled) return;
        const parsed = parseResponse(data);
        setModeAllRows(parsed.rows);
        const rawT = Number(parsed.total) || parsed.rows.length;
        setModeAllTotal(
          resolveTotalForPagination(page, PAGE_SIZE, parsed.rows.length, rawT, data),
        );
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load call logs');
        setModeAllRows([]);
        setModeAllTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, direction]);

  useEffect(() => {
    if (direction === 'all') {
      setFullFilteredRows([]);
      return;
    }
    let cancelled = false;
    async function load() {
      setFullFilteredRows([]);
      setLoading(true);
      setError('');
      try {
        const merged = await fetchEntireLogAndFilter(direction);
        if (cancelled) return;
        setFullFilteredRows(merged);
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load call logs');
        setFullFilteredRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [direction]);

  useEffect(() => {
    if (direction === 'all') return;
    const tp = Math.max(1, Math.ceil(fullFilteredRows.length / PAGE_SIZE));
    if (page > tp) setPage(tp);
  }, [direction, fullFilteredRows.length, page]);

  const displayRows = useMemo(() => {
    if (direction === 'all') return modeAllRows;
    const start = (page - 1) * PAGE_SIZE;
    return fullFilteredRows.slice(start, start + PAGE_SIZE);
  }, [direction, modeAllRows, fullFilteredRows, page]);

  const totalRecords = direction === 'all' ? modeAllTotal : fullFilteredRows.length;

  const columns = useMemo(() => {
    const keys = new Set();
    const sample = displayRows.length
      ? displayRows
      : direction === 'all'
        ? modeAllRows
        : fullFilteredRows;
    sample.forEach((row) => Object.keys(row || {}).forEach((k) => keys.add(k)));
    const important = [
      'from_number',
      'to_number',
      'call_direction',
      'call_status',
      'time_of_call',
      'call_duration',
    ];
    const picked = important.filter((c) => keys.has(c));
    if (picked.length > 0) return picked;
    return [...keys].slice(0, 6);
  }, [displayRows, direction, modeAllRows, fullFilteredRows]);

  const totalPages = Math.max(1, Math.ceil((totalRecords || 0) / PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < totalPages && totalRecords > 0;

  async function handleViewChat(row) {
    const id = row?.id ?? row?.call_id;
    if (!id) return;
    setChatModalOpen(true);
    setChatMessages([]);
    setChatError('');
    setChatLoading(true);
    try {
      const data = await getVoiceCallById(id);
      const messages = extractMessages(data);
      setChatMessages(messages);
    } catch (err) {
      setChatError(err?.response?.data?.message || err?.message || 'Failed to load chat.');
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Call Log</h1>
       
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-violet-200/40 bg-white shadow-lg shadow-indigo-950/[0.04] ring-1 ring-violet-100/50">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50/40 via-white to-indigo-50/30 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm font-semibold text-slate-800">Call logs</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
              <label htmlFor="all-log-direction-filter" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Direction
              </label>
              <select
                id="all-log-direction-filter"
                value={direction}
                onChange={(e) => {
                  setDirection(e.target.value);
                  setPage(1);
                }}
                className="min-w-[10.5rem] cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:border-violet-300/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25"
              >
                <option value="all">All</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>
            </div>
            <span className="text-xs rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 font-semibold text-violet-700 w-fit">
              {loading ? 'Loading' : `${displayRows.length} row${displayRows.length === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-4 py-10 text-sm font-medium text-slate-500">Loading logs...</div>
        ) : displayRows.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-10 text-sm font-medium text-slate-500">
            {direction === 'all'
              ? 'No data returned from API.'
              : 'No calls match this direction across all loaded logs.'}
          </div>
        ) : (
          <div className="table-scroll-x overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Sr No
                  </th>
                  {columns.map((col) => (
                    <th key={col} className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600">
                      {headerLabel(col)}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, i) => (
                  <tr key={row?.call_id ?? row?.id ?? i} className="border-t border-slate-100 transition-colors hover:bg-violet-50/25">
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={`${i}-${col}`} className="max-w-[20rem] whitespace-nowrap px-4 py-3 text-center text-slate-700">
                        {col === 'call_status' ? (
                          <span className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusPill(row?.[col])}`}>
                            {formatCell(row?.[col])}
                          </span>
                        ) : col === 'call_direction' ? (
                          <span className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold ${directionPill(row?.[col])}`}>
                            {formatDirectionCell(row?.[col])}
                          </span>
                        ) : (
                          <span
                            className="inline-block max-w-[20rem] truncate align-middle font-medium"
                            title={col === 'call_duration' ? formatDurationHMS(row?.[col], row) : formatCell(row?.[col])}
                          >
                            {col === 'call_duration' ? formatDurationHMS(row?.[col], row) : formatCell(row?.[col])}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleViewChat(row)}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
          <p className="text-xs font-medium text-slate-500">
            Page {page} of {totalPages}
            {direction !== 'all' && totalRecords > 0 && (
              <span className="text-slate-400"> · {totalRecords} total</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev || loading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!canNext || loading || totalRecords === 0}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {chatModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40" onClick={() => setChatModalOpen(false)} aria-hidden="true" />
          <div className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[96vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/60 px-4 py-3 sm:px-5">
              <p className="text-sm font-semibold text-slate-900">Conversation</p>
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div
              className="max-h-[calc(92vh-3.75rem)] min-h-[50vh] overflow-y-auto overflow-x-hidden p-4 sm:min-h-[55vh] sm:p-5"
              style={{
                backgroundColor: '#efeae2',
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
                backgroundSize: '18px 18px',
              }}
            >
              {chatLoading ? (
                <div className="text-center text-sm font-medium text-slate-600">Loading chat...</div>
              ) : chatError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{chatError}</div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center text-sm font-medium text-slate-600">No chat messages available.</div>
              ) : (
                <div className="space-y-2">
                  {chatMessages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          m.role === 'user'
                            ? 'rounded-br-md bg-emerald-200/90 text-slate-900'
                            : 'rounded-bl-md bg-white text-slate-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
