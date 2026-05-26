"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ImageUpload({
  file,
  onChange,
  hasError,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  hasError?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  const handleFiles = (files: FileList | null) => {
    onChange(files?.[0] ?? null);
  };

  return (
    <div>
      <input
        ref={inputRef}
        id="image_file"
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-sm transition-colors",
          dragOver
            ? "border-(--color-primary600) bg-(--color-primary100)"
            : hasError
              ? "border-red-400 bg-red-50"
              : "border-(--color-neutral150) bg-(--color-neutral100) hover:border-(--color-primary200) hover:bg-(--color-primary100)",
        )}
      >
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <Image
              src={preview}
              alt="Logo preview"
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg object-contain"
              unoptimized
            />
            <span className="text-xs text-(--color-neutral600)">
              {file?.name}{" "}
              <span className="text-(--color-primary600) underline">
                Change
              </span>
            </span>
          </div>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-8 w-8 text-(--color-neutral400)"
              aria-hidden="true"
            >
              <path
                d="M12 16V8m0 0-3 3m3-3 3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-medium text-(--color-neutral700)">
              Upload a File
            </span>
            <span className="text-xs text-(--color-neutral500)">
              Drag and drop or click to browse — PNG, JPEG, SVG, WebP · max 2 MB
            </span>
          </>
        )}
      </button>

      {file && (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-1 text-xs text-(--color-neutral600) hover:text-red-600"
        >
          Remove image
        </button>
      )}
    </div>
  );
}
