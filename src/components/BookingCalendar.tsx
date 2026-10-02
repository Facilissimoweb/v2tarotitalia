import { useMemo } from "react";
import { siteContent } from "../data/siteContent";
import { HOUR_SLOTS, localIso, slotsForDate } from "../lib/storage";

const { consulti } = siteContent;

const WEEKDAYS = new Intl.DateTimeFormat("it-IT", { weekday: "short" });
const MONTH = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" });

type Props = {
  dateIso: string;
  slot: string;
  onDate: (iso: string) => void;
  onSlot: (slot: string) => void;
};

function firstOpenDay(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  const today = localIso();
  const last = new Date(y, m, 0).getDate();
  for (let d = 1; d <= last; d++) {
    const candidate = localIso(new Date(y, m - 1, d));
    if (candidate >= today && slotsForDate(candidate).length > 0) return candidate;
  }
  return iso;
}

function monthCells(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(y, m - 1, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      iso: localIso(d),
      day: d.getDate(),
      outside: d.getMonth() !== m - 1,
    };
  });
}

export function BookingCalendar({ dateIso, slot, onDate, onSlot }: Props) {
  const today = localIso();
  const activeIso = dateIso || today;
  const cells = useMemo(() => monthCells(activeIso), [activeIso]);
  const hours = slotsForDate(activeIso);
  const [y, m] = activeIso.split("-").map(Number);
  const prevMonthLast = localIso(new Date(y, m - 1, 0));
  const prevDisabled = prevMonthLast < today;
  const headers = useMemo(() => {
    const monday = new Date(2026, 0, 5);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return WEEKDAYS.format(d).replace(".", "");
    });
  }, []);

  return (
    <div>
      <div className="bg-paper p-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            disabled={prevDisabled}
            className="px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-ink/45 hover:text-ink disabled:text-ink/15"
            onClick={() => onDate(firstOpenDay(localIso(new Date(y, m - 2, 1))))}
            aria-label="Mese precedente"
          >
            ←
          </button>
          <p className="font-display text-lg capitalize text-ink">{MONTH.format(new Date(`${activeIso}T12:00:00`))}</p>
          <button
            type="button"
            className="px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-ink/45 hover:text-ink"
            onClick={() => onDate(firstOpenDay(localIso(new Date(y, m, 1))))}
            aria-label="Mese successivo"
          >
            →
          </button>
        </div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-sage">{consulti.calendario.giorno}</p>
        <div className="grid grid-cols-7 gap-1">
          {headers.map((h) => (
            <span key={h} className="py-1 text-center text-[9px] uppercase tracking-[0.14em] text-ink/40">
              {h}
            </span>
          ))}
          {cells.map((cell) => {
            const disabled = cell.iso < today || slotsForDate(cell.iso).length === 0;
            const selected = cell.iso === dateIso;
            return (
              <button
                key={cell.iso}
                type="button"
                disabled={disabled}
                onClick={() => onDate(cell.iso)}
                className={`h-10 text-sm ${
                  selected
                    ? "bg-ink text-on-ink"
                    : disabled
                      ? "text-ink/20"
                      : cell.outside
                        ? "text-ink/30 hover:bg-mist"
                        : "text-ink hover:bg-mist"
                }`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-sage">{consulti.calendario.orario}</p>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {HOUR_SLOTS.map((hour) => {
          const available = hours.includes(hour);
          return (
            <button
              key={hour}
              type="button"
              disabled={!available}
              onClick={() => onSlot(hour)}
              className={`py-3 text-xs tracking-wide ${
                slot === hour && available
                  ? "bg-ink text-on-ink"
                  : available
                    ? "bg-paper text-ink hover:bg-mist"
                    : "bg-mist text-ink/25"
              }`}
            >
              {hour}
            </button>
          );
        })}
      </div>
    </div>
  );
}
