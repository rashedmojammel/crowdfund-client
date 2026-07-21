"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isImgbbConfigured, uploadToImgBB } from "@/lib/imgbb";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  errorMessage?: string;
  disabled?: boolean;
}

/**
 * ImgBB file upload when NEXT_PUBLIC_IMGBB_KEY is set; otherwise a plain
 * URL input so the flow still works in mock mode.
 */
export function ImageUploader({ value, onChange, errorMessage, disabled }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isImgbbConfigured) {
    return (
      <div className="flex items-center gap-3">
        {value ? (
          <Avatar className="size-11">
            <AvatarImage src={value} alt="" />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        ) : null}
        <div className="grow">
          <Input
            type="url"
            placeholder="https://example.com/your-photo.jpg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-invalid={errorMessage ? true : undefined}
          />
          {errorMessage ? (
            <p role="alert" className="mt-1 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Paste an image URL — file upload activates once an ImgBB key is configured.
            </p>
          )}
        </div>
      </div>
    );
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      onChange(await uploadToImgBB(file));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const shownError = uploadError ?? errorMessage;

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <Avatar className="size-11">
          <AvatarImage src={value} alt="" />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {value ? "Replace picture" : "Upload picture"}
        </Button>
        {shownError ? (
          <p role="alert" className="text-sm text-destructive">
            {shownError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
