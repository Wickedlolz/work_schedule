import type { Employee } from "@/lib/types";

interface ConflictWarningsProps {
  conflicts: Map<string, string>;
  employees: Employee[];
}

export const ConflictWarnings = ({
  conflicts,
  employees,
}: ConflictWarningsProps) => {
  if (conflicts.size === 0) return null;

  return (
    <div className="mt-4 bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-orange-600 text-xl">⚠️</span>
        <div>
          <h3 className="font-semibold text-orange-800">
            Открити конфликти в графика ({conflicts.size})
          </h3>
          <p className="text-sm text-orange-700 mt-1">
            Следните смени имат проблеми, които трябва да бъдат коригирани:
          </p>
        </div>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {Array.from(conflicts.entries()).map(([key, message]) => {
          const [employeeId, ...dateParts] = key.split("-");
          const date = dateParts.join("-");
          const employee = employees.find((e) => e.id === employeeId);
          if (!employee) return null;

          const [year, month, day] = date.split("-").map(Number);
          const formattedDate = new Date(year, month - 1, day).toLocaleDateString("bg-BG", {
            day: "numeric",
            month: "long",
          });

          return (
            <div
              key={key}
              className="bg-white border border-orange-200 rounded p-3 text-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-gray-900">
                    {employee.name}
                  </span>
                  <span className="text-gray-600 mx-2">•</span>
                  <span className="text-gray-700">{formattedDate}</span>
                </div>
              </div>
              <p className="text-orange-700 mt-1">{message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
