"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Loader2, AlertTriangle } from "lucide-react";
import { uploadResume, ApiError } from "@/lib/api-client";
import type { ResumeUploadResponse } from "@/types/resume";

interface Props {
  onUploaded: (result: ResumeUploadResponse) => void;
}

const ACCEPTED_TYPES = [".pdf", ".docx"];
const MAX_SIZE_MB = 10;

export function ResumeUploader({ onUploaded }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback(
    async (file: File) => {
      setError(null);
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_TYPES.includes(ext)) {
        setError(`Unsupported file type "${ext}". Please upload a PDF or DOCX.`);
        return;
      }
      if (file.size / (1024 * 1024) > MAX_SIZE_MB) {
        setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
        return;
      }

      setIsUploading(true);
      try {
        const result = (await uploadResume(file)) as ResumeUploadResponse;
        onUploaded(result);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onUploaded]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) validateAndUpload(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging
            ? "border-brand-400 bg-brand-500/10"
            : "border-slate-700 hover:border-slate-600 hover:bg-slate-900/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndUpload(file);
          }}
        />
        {isUploading ? (
          <>
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-brand-400" />
            <p className="text-sm text-slate-300">
              Parsing your resume and extracting your profile with AI…
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="mb-3 h-8 w-8 text-slate-500" />
            <p className="text-sm font-medium text-slate-200">
              Drag & drop your resume, or click to browse
            </p>
            <p className="mt-1 text-xs text-slate-500">PDF or DOCX, up to {MAX_SIZE_MB}MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-900 bg-rose-950/50 p-3 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
