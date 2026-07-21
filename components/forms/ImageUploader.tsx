"use client";

import { useRef, useState } from "react";
import { Avatar, Button, Text, TextInput } from "@gravity-ui/uikit";
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
        {value ? <Avatar imgUrl={value} size="l" /> : null}
        <div className="grow">
          <TextInput
            size="l"
            type="url"
            placeholder="https://example.com/your-photo.jpg"
            value={value}
            onUpdate={onChange}
            disabled={disabled}
            validationState={errorMessage ? "invalid" : undefined}
            errorMessage={errorMessage}
          />
          <Text color="secondary" variant="caption-2">
            Paste an image URL — file upload activates once an ImgBB key is configured.
          </Text>
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
      {value ? <Avatar imgUrl={value} size="l" /> : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex flex-col gap-1">
        <Button
          size="l"
          view="outlined"
          loading={uploading}
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          {value ? "Replace picture" : "Upload picture"}
        </Button>
        {shownError ? (
          <Text color="danger" variant="caption-2">
            {shownError}
          </Text>
        ) : null}
      </div>
    </div>
  );
}
