const ScheduleLoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 border border-rose-200">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-rose-600 rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-800 font-semibold text-lg">
          Зареждане на график...
        </p>
      </div>
    </div>
  );
};

export default ScheduleLoadingOverlay;
