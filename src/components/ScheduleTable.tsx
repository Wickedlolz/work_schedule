import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { User } from "firebase/auth";
import {
  cn,
  getBulgarianHolidays,
  detectAllShiftConflicts,
  calculateEmployeeWorkHours,
} from "@/lib/utils";
import type {
  Employee,
  ShiftType,
  ShiftValue,
  CustomShift,
  CustomShiftModalState,
  WorkHoursModalState,
} from "@/lib/types";
import { WEEKEND_DAYS } from "@/lib/constants";
import { Eye, EyeOff, Maximize, Minimize } from "lucide-react";
import { Button } from "./ui/button";

import { CustomShiftModal } from "./schedule/CustomShiftModal";
import { WorkHoursModal } from "./schedule/WorkHoursModal";
import { ConflictWarnings } from "./schedule/ConflictWarnings";
import { EmployeeRow } from "./schedule/EmployeeRow";

interface ScheduleTableProps {
  employees: Employee[];
  days: string[];
  handleShiftChange: (
    employeeId: string,
    date: string,
    value: ShiftValue,
    message?: string | null,
  ) => void;
  removeEmployee: (id: string) => void;
  tableRef: React.RefObject<HTMLTableElement | null>;
  isAuthenticated: boolean;
  isPublic: boolean;
  onTogglePublic: () => void;
  user: User | null;
}

const ScheduleTable = ({
  employees,
  days,
  handleShiftChange,
  removeEmployee,
  tableRef,
  isAuthenticated,
  isPublic,
  onTogglePublic,
  user,
}: ScheduleTableProps) => {
  // Calculate holidays once for the current month/year
  const holidays = useMemo(() => {
    if (days.length === 0) return new Set<string>();
    const year = new Date(days[0]).getFullYear();
    return new Set(getBulgarianHolidays(year));
  }, [days]);

  // Detect shift conflicts
  const conflicts = useMemo(() => {
    return detectAllShiftConflicts(employees, days);
  }, [employees, days]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenScale, setFullscreenScale] = useState(1);
  const [isRotated, setIsRotated] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const isMobilePortrait = useCallback(() => {
    return window.innerWidth < 768 && window.innerHeight > window.innerWidth;
  }, []);

  const calculateScale = useCallback(
    (natWidth: number, natHeight: number, rotated: boolean) => {
      if (!fullscreenRef.current || natWidth === 0) return;
      const container = fullscreenRef.current;
      // When rotated, the table's width maps to the screen's height and vice-versa
      const availableWidth = rotated
        ? container.clientHeight - 80
        : container.clientWidth - 35;
      const availableHeight = rotated
        ? container.clientWidth - 16
        : container.clientHeight - 790;
      const scale = Math.min(
        availableWidth / natWidth,
        availableHeight / natHeight,
        1,
      );
      setFullscreenScale(scale);
    },
    [],
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        setFullscreenScale(1);
        setIsRotated(false);
        setNaturalSize({ width: 0, height: 0 });
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Recalculate on resize when in fullscreen
  useEffect(() => {
    if (!isFullscreen || naturalSize.width === 0) return;
    const onResize = () => {
      const rotated = isMobilePortrait();
      setIsRotated(rotated);
      calculateScale(naturalSize.width, naturalSize.height, rotated);
    };
    const timer = setTimeout(onResize, 150);
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [isFullscreen, naturalSize, calculateScale, isMobilePortrait]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      if (tableRef.current) {
        const nat = {
          width: tableRef.current.scrollWidth,
          height: tableRef.current.scrollHeight,
        };
        setNaturalSize(nat);
        const rotated = isMobilePortrait();
        setIsRotated(rotated);
        await fullscreenRef.current?.requestFullscreen();
        setTimeout(() => calculateScale(nat.width, nat.height, rotated), 150);
      }
    } else {
      await document.exitFullscreen();
    }
  }, [tableRef, calculateScale, isMobilePortrait]);

  const [customShiftModal, setCustomShiftModal] =
    useState<CustomShiftModalState>({
      open: false,
      employeeId: "",
      date: "",
    });

  const [workHoursModal, setWorkHoursModal] = useState<WorkHoursModalState>({
    open: false,
    employeeId: "",
  });

  const handleSelectChange = useCallback(
    (
      employeeId: string,
      date: string,
      value: ShiftType,
      message?: string | null,
    ) => {
      if (value === "Custom") {
        // Get existing custom shift if any
        const employee = employees.find((e) => e.id === employeeId);
        const existingShift = employee?.shifts[date];
        const existingCustomShift =
          existingShift && typeof existingShift === "object"
            ? existingShift
            : undefined;

        setCustomShiftModal({
          open: true,
          employeeId,
          date,
          existingShift: existingCustomShift,
        });
      } else {
        handleShiftChange(employeeId, date, value, message);
      }
    },
    [employees, handleShiftChange],
  );

  const handleWorkHoursClick = useCallback((employeeId: string) => {
    setWorkHoursModal({ open: true, employeeId });
  }, []);

  const handleCustomShiftSave = (customShift: CustomShift) => {
    handleShiftChange(
      customShiftModal.employeeId,
      customShiftModal.date,
      customShift,
      undefined,
    );
    setCustomShiftModal({ open: false, employeeId: "", date: "" });
  };

  return (
    <section
      ref={fullscreenRef}
      className={cn(
        "w-full",
        isFullscreen && "bg-white flex flex-col p-4 overflow-auto",
      )}
    >
      {/* Toolbar: Fullscreen + Public/Private Toggle */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          onClick={toggleFullscreen}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isFullscreen ? (
            <>
              <Minimize className="h-4 w-4" />
              Изход от цял екран
            </>
          ) : (
            <>
              <Maximize className="h-4 w-4" />
              Цял екран
            </>
          )}
        </Button>

        {/* Public/Private Toggle Button - Only for admins */}
        {user && (
          <Button
            onClick={onTogglePublic}
            variant={isPublic ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            {isPublic ? (
              <>
                <Eye className="h-4 w-4" />
                Публичен
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                Частен
              </>
            )}
          </Button>
        )}
      </div>

      <div
        className={cn(
          "w-full relative",
          !isFullscreen &&
            (!isPublic && !user
              ? "overflow-hidden min-h-[400px]"
              : "overflow-x-auto overflow-y-hidden"),
          isFullscreen && "overflow-hidden flex-1",
        )}
      >
        {/* Scale wrapper - only active in fullscreen */}
        <div
          ref={tableWrapperRef}
          style={
            isFullscreen && naturalSize.width > 0
              ? isRotated
                ? {
                    // Rotate 90° counter-clockwise so the table's long axis spans
                    // the screen height (which is wider in portrait fullscreen)
                    transform: `rotate(-90deg) scale(${fullscreenScale})`,
                    transformOrigin: "top left",
                    // After rotation the element's top-left moves; shift it back
                    // so it starts at the visible top-left of the screen
                    position: "absolute",
                    top: `${naturalSize.width * fullscreenScale}px`,
                    left: "0px",
                    width: `${naturalSize.width}px`,
                    height: `${naturalSize.height}px`,
                  }
                : {
                    transform: `scale(${fullscreenScale})`,
                    transformOrigin: "top left",
                    width: `${naturalSize.width}px`,
                    height: `${naturalSize.height}px`,
                  }
              : {}
          }
        >
          <table
            ref={tableRef}
            id="schedule-table"
            className="min-w-[900px] w-full border border-gray-300 text-xs sm:text-sm"
            role="table"
            aria-label="Работен график"
          >
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr role="row">
                <th
                  scope="col"
                  className="sticky left-0 z-20 bg-gray-100 text-left p-2 border border-gray-300 whitespace-nowrap"
                >
                  Служител
                </th>
                <th
                  scope="col"
                  className="bg-gray-100 text-center p-2 border border-gray-300 whitespace-nowrap"
                  style={{ left: "auto" }}
                >
                  Часове/ден
                </th>
                {days.map((day) => {
                  const date = new Date(day);
                  const dayOfWeek = date.getDay();
                  const isWeekend = WEEKEND_DAYS.includes(dayOfWeek as 0 | 6);
                  const isHoliday = holidays.has(day);
                  const isRedDay = isWeekend || isHoliday;

                  // Bulgarian day abbreviations
                  const dayNames = [
                    "Нд",
                    "Пон",
                    "Вто",
                    "Сря",
                    "Чет",
                    "Пет",
                    "Съб",
                  ];
                  const dayName = dayNames[dayOfWeek];

                  return (
                    <th
                      key={day}
                      className={cn(
                        "text-center p-1 border border-gray-300 whitespace-nowrap text-xs",
                        isRedDay && "bg-red-100",
                      )}
                      scope="col"
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{date.getDate()}</span>
                        <span className="text-[10px] text-gray-600">
                          {dayName}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <EmployeeRow
                  key={emp.id}
                  employee={emp}
                  days={days}
                  holidays={holidays}
                  conflicts={conflicts}
                  isAuthenticated={isAuthenticated}
                  onShiftChange={handleSelectChange}
                  onRemove={removeEmployee}
                  onWorkHoursClick={handleWorkHoursClick}
                />
              ))}
            </tbody>
          </table>
        </div>
        {/* end scale wrapper */}

        {/* Private Schedule Overlay - Show when schedule is private and user is not admin */}
        {!isPublic && !user && (
          <div className="absolute inset-0 bg-white/98 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl p-8 max-w-md text-center">
              <div className="mb-4">
                <EyeOff className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Графикът е частен
              </h3>
              <p className="text-gray-600 text-lg">
                Този график все още не е готов и е достъпен само за
                администратори.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Total Work Hours Summary - Only show when schedule is public or user is admin */}
      {employees.length > 0 && (isPublic || user) && (
        <div className="mt-6 mb-4 flex justify-center">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 px-6 py-4">
            <p className="text-base font-semibold text-gray-700">
              Общо работни часове:{" "}
              <span className="text-3xl font-bold text-rose-600 ml-2">
                {employees.reduce((total, employee) => {
                  const workHoursStats = calculateEmployeeWorkHours(
                    employee,
                    days,
                  );
                  return total + workHoursStats.actual;
                }, 0)}
                ч
              </span>
            </p>
          </div>
        </div>
      )}

      <ConflictWarnings conflicts={conflicts} employees={employees} />

      {/* Work Hours Info Modal */}
      <WorkHoursModal
        open={workHoursModal.open}
        employee={
          employees.find((e) => e.id === workHoursModal.employeeId) || null
        }
        days={days}
        onClose={() => setWorkHoursModal({ open: false, employeeId: "" })}
      />

      <CustomShiftModal
        open={customShiftModal.open}
        onOpenChange={(open) =>
          setCustomShiftModal((prev) => ({ ...prev, open }))
        }
        onSave={handleCustomShiftSave}
        initialStartTime={customShiftModal.existingShift?.startTime}
        initialEndTime={customShiftModal.existingShift?.endTime}
      />
    </section>
  );
};

export default ScheduleTable;
