import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function EmergencyButton({ onEmergency, loading, compact = false }) {
  return (
    <button
      type="button"
      onClick={() => onEmergency(15)}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
        compact ? 'px-4 py-2 text-xs' : 'px-4 py-2.5 text-xs'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Renegotiating Grid...</span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>🚨 Simulate New Emergency</span>
        </>
      )}
    </button>
  );
}
