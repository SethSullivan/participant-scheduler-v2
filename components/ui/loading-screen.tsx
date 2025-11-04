// Loading Component
export default function LoadingSpinner({
  pageName,
  specificText,
}: {
  pageName?: string;
  specificText?: string;
}) {
  return (
    <div className="min-h-screen p-6 bg-gray-50" data-testid="loading-screen">
      {/* Loading Overlay with Spinner */}
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto"></div>
          </div>

          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{pageName}</h3>
            <p className="text-sm text-gray-600">{specificText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
