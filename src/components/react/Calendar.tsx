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
  const [error, setError] = useState(false);

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
        ).then((res) => {
          if(!res.ok) throw new Error("Failed to fetch calendar");
          return res.json();
        });
        setApiData(data);
        setError(false);
      } catch (err) {
        console.error("FetchShifts error:", err);
        setApiData(null);
        setError(true);
      }
    };

    fetchShifts();

    const interval = setInterval(fetchShifts, 30000);
    return () => clearInterval(interval);
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

  if (error) {
    return (
      <div
        className={`${className} p-4 max-h-[70vh] bg-slate-200 rounded-xl flex items-center justify-center min-h-[400px]`}
      >
        <div className="flex flex-col items-center gap-4 text-center text-gray-500 p-6">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="font-bold text-lg text-gray-600">
              No se pudo cargar el horario
            </p>
            <p className="text-sm mt-1 max-w-xs mx-auto">
              Hubo un problema al conectar con el servidor. Por favor, intenta de
              nuevo más tarde o contáctanos por WhatsApp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} p-4 pr-0 max-h-[70vh] bg-slate-200 rounded-xl`}
    >
      <div className="flex flex-col gap-5 pr-4 h-full overflow-y-auto scroll-smooth">
        <span className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm mb-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={weekOffset <= 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed text-blue-600"
            aria-label="Semana anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <p className="font-bold text-lg text-gray-700 select-none text-center min-w-[200px] capitalize">
             {label.toLowerCase()}
          </p>

          <button
            type="button"
            onClick={goNext}
            disabled={weekOffset >= 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed text-blue-600"
            aria-label="Siguiente semana"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
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
