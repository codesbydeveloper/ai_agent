import { useState, useRef } from 'react';

export default function ImportLeadsModal({ onImport, onClose, importing }) {
  const [file, setFile] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    setError('');
    if (f) {
      const name = f.name.toLowerCase();
      const isValid = name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls');
      if (!isValid) {
        setError('Please select a CSV or Excel file (.csv, .xlsx, .xls).');
        setFile(null);
        return;
      }
      setFile(f);
    } else {
      setFile(null);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV or Excel file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    // Keep required API fields hidden from UI.
    formData.append('name', 'Leads Bulk Campaign');
    formData.append('is_scheduled', String(!!isScheduled));
    formData.append('phone_number_id', '2410');
    onImport(formData);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Bulk upload (CSV/Excel)</h3>
        <p className="text-sm text-slate-600 mb-4">
          Upload a CSV or Excel file and trigger voice bulk upload.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Is scheduled
            </label>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={!file || importing} className="btn-primary-gradient rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">{importing ? 'Uploading…' : 'Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
