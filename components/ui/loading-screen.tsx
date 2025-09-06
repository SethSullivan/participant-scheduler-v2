// Loading Component
function Loading(pageName:string, specificText:string) {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events List Loading */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div> 

          {/* Create Event Section Loading */}
          <div className="flex justify-center items-start">
            <div className="w-full max-w-md">
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading Overlay with Spinner */}
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto"></div>
          </div>
          
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{pageName}</h3>
            <p className="text-sm text-gray-600">{specificText}...</p>
          </div>
        </div>
      </div>
    </div>
  );
}