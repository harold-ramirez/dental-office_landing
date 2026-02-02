import { useEffect, useState, useMemo } from "react";

interface Props {
  className?: string;
  selectedDate?: string;
  onSelect?: (date: string) => void;
}

interface Shift {
  dateHour: string;
  status: boolean;
}

interface ApiResponse {
  currentWeek: {
    [key: string]: Shift[];
  };
  nextWeek: {
    [key: string]: Shift[];
  };
}

export default function (props: Props) {
  const { className, selectedDate, onSelect } = props;
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  const getStartOfWeek = (date: Date) => {
    const day = date.getDay();
    const diffToMonday = (day + 6) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const start = getStartOfWeek(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + weekOffset * 7,
    ),
  );
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const monthName = (d: Date) =>
    capitalize(d.toLocaleString("es-BO", { month: "long" }));
  let label = "";
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = monthName(start);
  const endMonth = monthName(end);
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  if (startYear !== endYear) {
    label = `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  } else if (startMonth !== endMonth) {
    label = `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
  } else {
    label = `${startMonth} ${startDay} - ${endDay}, ${endYear}`;
  }

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const apiUrl = (import.meta as any).env?.PUBLIC_API_URL ?? "";
        const normApi =
          apiUrl.startsWith("http://") || apiUrl.startsWith("https://")
            ? apiUrl
            : `http://${apiUrl}`;
        const data = await fetch(
          `${normApi}/appointment-requests/calendar`,
        ).then((res) => res.json());
        setApiData(data);
      } catch (err) {
        console.error("FetchShifts error:", err);
        setApiData(null);
      }
    };
    fetchShifts();
  }, []);

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const dayLabels = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const groupedDays = useMemo(() => {
    if (!apiData) return [];

    const weekData = weekOffset === 0 ? apiData.currentWeek : apiData.nextWeek;

    return days.map((day, index) => {
      const shifts = weekData[day] || [];
      return { day: dayLabels[index], shifts };
    });
  }, [apiData, weekOffset]);

  const goPrev = () =>
    setWeekOffset((o) => {
      const next = Math.max(0, o - 1);
      return next;
    });
  const goNext = () =>
    setWeekOffset((o) => {
      const next = Math.min(1, o + 1);
      return next;
    });

  return (
    <div
      className={`${className} p-4 pr-0 max-h-[70vh] bg-slate-200 rounded-xl`}
    >
      <div className="flex flex-col gap-5 pr-4 h-full overflow-y-auto scroll-smooth">
        <span className="flex justify-between items-center">
          <button
            type="button"
            onClick={goPrev}
            disabled={weekOffset <= 0}
            className="disabled:opacity-40 px-2 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Semana anterior"
          >
            {"<"}
          </button>
          <p className="font-medium text-xl select-none">{label}</p>
          <button
            type="button"
            onClick={goNext}
            disabled={weekOffset >= 1}
            className="disabled:opacity-40 px-2 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Siguiente semana"
          >
            {">"}
          </button>
        </span>

        {/* Responsive Grid Container with Scroll */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[700px] gap-2 grid grid-cols-7">
            {groupedDays.map((dayObj, index) => {
              const dayDate = new Date(start);
              dayDate.setDate(start.getDate() + index);

              const formattedDate = dayDate
                .toLocaleDateString("es-BO", { day: "numeric", month: "short" })
                .replace(".", "");

              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 col-span-1 text-center"
                >
                  <p className="font-semibold">
                    {dayObj.day}
                    <br />
                    <span className="font-normal text-gray-600 text-sm capitalize">
                      {formattedDate}
                    </span>
                  </p>
                  {dayObj.shifts.map((shift, hIndex) => {
                    const shiftDate = new Date(shift.dateHour);
                    const iso = shiftDate.toISOString();
                    const hour = shiftDate.getHours();
                    const minute = shiftDate.getMinutes();
                    const timeStr = `${String(hour).padStart(2, "0")}:${String(
                      minute,
                    ).padStart(2, "0")}`;

                    const isSelected = selectedDate === iso;

                    return (
                      <button
                        type="button"
                        key={hIndex}
                        disabled={!shift.status}
                        onClick={() => {
                          onSelect && onSelect(iso);
                        }}
                        className={`rounded-sm text-center duration-500 px-4 py-2 ${
                          shift.status
                            ? "hover:bg-blue-500 hover:text-slate-100 hover:font-bold hover:text-lg "
                            : "bg-gray-300 text-gray-400 pointer-events-none"
                        } ${
                          isSelected
                            ? "bg-blue-500 text-slate-100 font-bold text-lg"
                            : "bg-blue-200 text-blue-600 cursor-pointer"
                        }`}
                      >
                        {timeStr}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
