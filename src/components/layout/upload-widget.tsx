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
          className="w-full group relative overflow-hidden bg-linear-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-xl p-8 transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20"
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Upload Icon */}
            <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors duration-300">
              <svg
                className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
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
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-300">
                Choose File to Upload
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mt-1">
                Click here to browse and select your file
              </p>
              <div className="mt-3 flex items-center justify-center space-x-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {allowedFormats?.join(", ").toUpperCase() || "PNG, JPG, JPEG"}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">Max 10MB</span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className="absolute bottom-3 left-3 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Animated Background Effect */}
          <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"></div>
        </button>
      )}
    </CldUploadWidget>
  );
}
