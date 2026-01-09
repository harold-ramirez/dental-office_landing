import { useEffect, useState, useMemo } from "react";

interface Props {
  className?: string;
  selectedDate?: string;
  onSelect?: (date: string) => void;
}

export default function (props: Props) {
  const { className, selectedDate, onSelect } = props;
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const [shifts, setShifts] = useState<
    {
      Id: number;
      day: string;
      hour: string;
      status: boolean;
    }[]
  >([]);

  const getStartOfWeek = (date: Date) => {
    const day = date.getDay(); // 0 (dom) - 6 (sáb)
    const diffToMonday = (day + 6) % 7; // convierte domingo(0) -> 6, lunes(1) -> 0, ...
    const start = new Date(date);
    start.setDate(date.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // calcula el inicio de la semana considerando weekOffset
  const start = getStartOfWeek(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + weekOffset * 7
    )
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
        const data = await fetch(`${normApi}/shifts`).then((res) => res.json());
        setShifts(data);
      } catch (err) {
        // console.error("FetchShifts error:", err);
        setShifts([]);
      }
    };
    fetchShifts();
  }, []);

  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const groupedDays = useMemo(() => {
    return days.map((day) => {
      const items = shifts.filter(
        (s) => String(s.day).toLowerCase() === day.toLowerCase()
      );
      items.sort((a, b) => (a.hour > b.hour ? 1 : a.hour < b.hour ? -1 : 0));
      return { day, items };
    });
  }, [shifts]);

  // parsea horas como "09:00", "9:00", "9", "9:00 AM", "12 PM", etc.
  const parseHourString = (s: string) => {
    const raw = s.trim();
    const ampmMatch = raw.match(/\b(AM|PM|am|pm)\b/);
    if (ampmMatch) {
      const t = raw.replace(/\b(AM|PM|am|pm)\b/, "").trim();
      const parts = t.split(":");
      let hh = parseInt(parts[0] || "0", 10);
      const mm = parts[1] ? parseInt(parts[1], 10) : 0;
      const ampm = ampmMatch[0].toLowerCase();
      if (ampm === "pm" && hh < 12) hh += 12;
      if (ampm === "am" && hh === 12) hh = 0;
      return { hour: hh, minute: mm || 0 };
    }
    const parts = raw.split(":");
    const hour = parseInt(parts[0] || "0", 10) || 0;
    const minute = parts[1] ? parseInt(parts[1], 10) || 0 : 0;
    return { hour, minute };
  };

  // navegación con límites: no retroceder (min 0) y max 2 semanas adelante
  const goPrev = () =>
    setWeekOffset((o) => {
      const next = Math.max(0, o - 1);
      return next;
    });
  const goNext = () =>
    setWeekOffset((o) => {
      const next = Math.min(2, o + 1);
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
            disabled={weekOffset >= 2}
            className="disabled:opacity-40 px-2 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Siguiente semana"
          >
            {">"}
          </button>
        </span>
        <div className="gap-2 grid grid-cols-7">
          {groupedDays.map((dayObj, index) => {
            // fecha concreta del día que se muestra en la columna
            const dayDate = new Date(start);
            dayDate.setDate(start.getDate() + index);

            // formato corto de la fecha al lado del día: "10 nov."
            const formattedDate = dayDate
              .toLocaleDateString("es-BO", { day: "numeric", month: "short" })
              .replace(".", "");

            return (
              <span
                key={index}
                className="flex flex-col gap-2 col-span-1 text-center"
              >
                <p className="font-semibold">
                  {dayObj.day}
                  <br />
                  <span className="font-normal text-gray-600 text-sm">
                    {formattedDate}
                  </span>
                </p>
                {dayObj.items.map((item, hIndex) => {
                  const { hour, minute } = parseHourString(String(item.hour));
                  const dt = new Date(dayDate);
                  dt.setHours(hour, minute, 0, 0);
                  const iso = dt.toISOString();

                  const isSelected = selectedDate === iso;

                  return (
                    <button
                      type="button"
                      key={hIndex}
                      disabled={!item.status}
                      onClick={() => {
                        onSelect && onSelect(iso);
                      }}
                      className={`rounded-sm text-center duration-500 px-4 py-2 ${
                        item.status
                          ? "hover:bg-blue-500 hover:text-slate-100 hover:font-bold hover:text-lg "
                          : "bg-gray-300 text-gray-400"
                      } ${
                        isSelected
                          ? "bg-blue-500 text-slate-100 font-bold text-lg"
                          : "bg-blue-200 text-blue-600 cursor-pointer"
                      }`}
                    >
                      {item.hour}
                    </button>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
