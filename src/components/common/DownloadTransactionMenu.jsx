import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileCode,
  Image,
  FileText,
  Table,
  Check,
  Sparkles,
  ArrowDownToLine,
  Database
} from 'lucide-react';
import { ChevronsUpDownIcon } from '../ui/ChevronsUpDownIcon';
import { recordDownload } from '../../services/downloadsManager';

/**
 * DownloadTransactionMenu
 * 
 * Reusable scientific export & download transaction dropdown powered by
 * animated ChevronsUpDownIcon. Handles multi-format downloads and automatic
 * user workspace isolation logging.
 */
export default function DownloadTransactionMenu({
  title = 'Export Data',
  filenameBase = 'chemspace_export',
  sourceModule = 'Scientific Module',
  formats = [
    { id: 'mol', label: 'MDL Molfile (.mol)', icon: FileCode, ext: 'mol', mime: 'chemical/x-mdl-molfile' },
    { id: 'smi', label: 'SMILES File (.smi)', icon: FileText, ext: 'smi', mime: 'text/plain' },
    { id: 'json', label: 'JSON Dataset (.json)', icon: Database, ext: 'json', mime: 'application/json' },
    { id: 'svg', label: 'SVG Vector (.svg)', icon: Image, ext: 'svg', mime: 'image/svg+xml' },
    { id: 'png', label: 'High-Res PNG (.png)', icon: Image, ext: 'png', mime: 'image/png' },
    { id: 'csv', label: 'CSV Spreadsheet (.csv)', icon: Table, ext: 'csv', mime: 'text/csv' }
  ],
  getData,
  className = '',
  buttonVariant = 'primary'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [completedFormat, setCompletedFormat] = useState(null);

  const menuRef = useRef(null);
  const iconRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (iconRef.current) {
        if (next) iconRef.current.startAnimation();
        else iconRef.current.stopAnimation();
      }
      return next;
    });
  };

  const handleDownload = async (format) => {
    try {
      setDownloadingFormat(format.id);
      
      let content = null;
      if (typeof getData === 'function') {
        content = await getData(format.id);
      } else if (getData && getData[format.id]) {
        content = getData[format.id];
      }

      if (!content) {
        throw new Error(`No data available for format ${format.id}`);
      }

      const fullFilename = `${filenameBase}.${format.ext}`;
      let blob;

      if (content instanceof Blob) {
        blob = content;
      } else if (typeof content === 'string') {
        blob = new Blob([content], { type: format.mime || 'text/plain' });
      } else {
        blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fullFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Record download in user workspace
      await recordDownload({
        filename: fullFilename,
        fileType: format.ext,
        sourceModule,
        contentBlob: typeof content === 'string' ? content : JSON.stringify(content),
        fileSize: blob.size
      });

      setCompletedFormat(format.id);
      setTimeout(() => setCompletedFormat(null), 2000);
    } catch (err) {
      console.error('Download transaction failed:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const buttonStyles = buttonVariant === 'orange' || buttonVariant === 'primary'
    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20'
    : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-orange-500/50 hover:bg-[var(--bg-hover)]';

  return (
    <div ref={menuRef} className={`relative inline-block text-left font-sans ${className}`}>
      {/* Main Download Button with Chevrons Up Down morph */}
      <button
        type="button"
        onClick={handleToggle}
        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 select-none ${buttonStyles}`}
        aria-expanded={isOpen}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>{title}</span>
        <div className="pl-1 border-l border-white/20 dark:border-white/10 flex items-center">
          <ChevronsUpDownIcon
            ref={iconRef}
            open={isOpen}
            duration={0.25}
            className="w-3.5 h-3.5"
          />
        </div>
      </button>

      {/* Dropdown Transaction Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
          <div className="px-3 py-1.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold">
              Download Formats
            </span>
            <span className="text-[9px] font-mono text-orange-500 font-semibold">
              Isolated Storage
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto no-scrollbar space-y-0.5 pt-1">
            {formats.map((fmt) => {
              const Icon = fmt.icon || FileCode;
              const isDownloading = downloadingFormat === fmt.id;
              const isDone = completedFormat === fmt.id;

              return (
                <button
                  key={fmt.id}
                  onClick={() => handleDownload(fmt)}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition cursor-pointer group text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex items-center justify-center text-orange-500 group-hover:border-orange-500/40 transition">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[11px] leading-tight group-hover:text-orange-500 transition">
                        {fmt.label}
                      </span>
                      <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                        .{fmt.ext}
                      </span>
                    </div>
                  </div>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 font-bold">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  ) : isDownloading ? (
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:text-orange-500 transition" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
