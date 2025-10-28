"use client";

import { CldUploadWidget } from "next-cloudinary";

interface UploadWidgetProps {
  onUploadSuccess: (url: string, publicId?: string) => void;
  folder: string;
  allowedFormats: string[];
}

export function UploadWidget({
  onUploadSuccess,
  folder,
  allowedFormats,
}: UploadWidgetProps) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET || "ml_default"}
      options={{
        folder: folder,
        clientAllowedFormats: allowedFormats,
        resourceType: "auto",
      }}
      onSuccess={(result) => {
        if (
          result.event === "success" &&
          result.info &&
          typeof result.info === "object" &&
          "secure_url" in result.info &&
          "public_id" in result.info
        ) {
          onUploadSuccess(result.info.secure_url, result.info.public_id);
        }
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          className="w-full group relative overflow-hidden border-2 border-dashed border-input bg-background hover:bg-accent/50 rounded-xl p-8 transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Upload Icon */}
            <div className="size-16 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors duration-200">
              <svg
                className="size-8 text-primary transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {/* Text Content */}
            <div className="text-center">
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                Choose File to Upload
              </h3>
              <p className="text-sm text-muted-foreground transition-colors duration-200 mt-1">
                Click here to browse and select your file
              </p>
              <div className="mt-3 flex items-center justify-center space-x-2">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {allowedFormats?.join(", ").toUpperCase() || "PNG, JPG, JPEG"}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">Max 10MB</span>
              </div>
            </div>
          </div>
        </button>
      )}
    </CldUploadWidget>
  );
}
