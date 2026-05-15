import { useState, useRef } from "react";
import { Upload, File as FileIcon, Image, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { SubirDocumentoResponse } from "../../types/fraudeAlerts";

type UploadState = "idle" | "uploading" | "success" | "error";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png", "image/jpeg", "image/gif", "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return <Image size={24} className="text-blue-500" />;
  if (mime === "application/pdf") return <FileText size={24} className="text-red-500" />;
  return <FileIcon size={24} className="text-slate-400" />;
}

async function mockUpload(file: File): Promise<SubirDocumentoResponse> {
  await new Promise((r) => setTimeout(r, 1500));
  if (file.size > MAX_SIZE) throw new Error("El archivo excede el límite de 10 MB");
  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
    mockUrl: URL.createObjectURL(file),
  };
}

interface Props {
  onUpload?: (result: SubirDocumentoResponse) => void;
  resetKey?: number;
}

export default function SubirDocumento({ onUpload, resetKey }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SubirDocumentoResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const prevResetKey = useRef(resetKey);
  if (resetKey !== prevResetKey.current) {
    prevResetKey.current = resetKey;
    setState("idle");
    setFile(null);
    setResult(null);
    setErrorMsg("");
  }

  function reset() {
    setState("idle");
    setFile(null);
    setResult(null);
    setErrorMsg("");
  }

  function handleFile(selected: File) {
    if (!ACCEPTED_TYPES.includes(selected.type) && !selected.type.startsWith("image/")) {
      setState("error");
      setErrorMsg("Tipo de archivo no soportado");
      return;
    }
    setFile(selected);
    setState("uploading");
    setErrorMsg("");

    mockUpload(selected).then((res) => {
      setResult(res);
      setState("success");
      onUpload?.(res);
    }).catch((err) => {
      setState("error");
      setErrorMsg(err.message);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  const isImage = result?.mimeType.startsWith("image/");
  const isPdf = result?.mimeType === "application/pdf";

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-slate-500 mb-1">Documento Asociado</label>

      {state === "idle" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <Upload size={20} className="text-slate-300" />
          <p className="text-xs text-slate-500">
            Arrastra un archivo o haz clic para seleccionar
          </p>
          <p className="text-[10px] text-slate-400">PDF, imágenes, Word — máximo 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {state === "uploading" && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <Loader2 size={18} className="animate-spin text-slate-400" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">{file?.name}</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-slate-400 transition-all" />
            </div>
          </div>
        </div>
      )}

      {state === "success" && result && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-medium text-green-700">
              <CheckCircle size={14} /> Subido exitosamente
            </span>
            <button onClick={reset} className="text-green-500 hover:text-green-700 transition-colors">
              <X size={14} />
            </button>
          </div>

          {isImage ? (
            <div className="overflow-hidden rounded-lg border border-green-200 bg-white">
              <img
                src={result.mockUrl}
                alt={result.fileName}
                className="max-h-32 w-full object-contain"
              />
              <div className="flex items-center justify-between px-2 py-1.5 text-[10px] text-slate-500">
                <span className="truncate font-medium">{result.fileName}</span>
                <span>{formatSize(result.fileSize)}</span>
              </div>
            </div>
          ) : isPdf ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50">
                <FileText size={22} className="text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{result.fileName}</p>
                <p className="text-[10px] text-slate-400">{formatSize(result.fileSize)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                {fileIcon(result.mimeType)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{result.fileName}</p>
                <p className="text-[10px] text-slate-400">{formatSize(result.fileSize)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {state === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle size={14} className="shrink-0 text-red-500" />
          <p className="flex-1 text-xs text-red-700">{errorMsg}</p>
          <button onClick={reset} className="text-xs font-medium text-red-600 hover:underline">
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
