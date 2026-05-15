import { useEffect, useRef } from "react";
import { X, File as FileIcon, Download } from "lucide-react";
import type { SubirDocumentoResponse } from "../../types/fraudeAlerts";

interface Props {
  doc: SubirDocumentoResponse;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VistaPreviaDocumento({ doc, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const isImage = doc.mimeType.startsWith("image/");
  const isPdf = doc.mimeType === "application/pdf";

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={(e) => e.target === backdropRef.current && onClose()}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{doc.fileName}</p>
              <p className="text-[11px] text-slate-400">{formatSize(doc.fileSize)}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-5">
            {isImage ? (
              <img
                src={doc.mockUrl}
                alt={doc.fileName}
                className="mx-auto max-h-[65vh] w-auto rounded-lg object-contain"
              />
            ) : isPdf ? (
              <iframe
                src={doc.mockUrl}
                title={doc.fileName}
                className="h-[65vh] w-full rounded-lg border border-slate-200"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                  <FileIcon size={40} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-900">{doc.fileName}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatSize(doc.fileSize)}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {doc.mimeType || "Tipo desconocido"}
                  </p>
                </div>
                <a
                  href={doc.mockUrl}
                  download={doc.fileName}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  <Download size={15} />
                  Descargar
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
