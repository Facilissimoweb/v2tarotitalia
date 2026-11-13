import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { siteContent } from "../data/siteContent";
import { siteDateTime } from "../lib/locale";
import {
  deleteAgendaHold,
  fetchAgendaHolds,
  insertAgendaHold,
  isSiteBooking,
  occupiedByHold,
  subscribeAgenda,
  type AgendaHold,
  type AgendaSource,
} from "../lib/agendaHolds";
import { fetchOccupiedSlots, type OccupiedSlot } from "../lib/occupiedSlots";
import { HOUR_SLOTS, localIso } from "../lib/storage";
import { Button } from "./Button";

const { admin, consulti } = siteContent;
const WEEKDAYS = siteDateTime({ weekday: "short" });
const MONTH = siteDateTime({ month: "long", year: "numeric" });
const DAY = siteDateTime({ weekday: "long", day: "numeric", month: "long" });

function monthRange(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return { from: localIso(new Date(y, m - 1, 1)), to: localIso(new Date(y, m, 0)) };
}

function monthCells(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const start = new Date(y, m - 1, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { iso: localIso(d), day: d.getDate(), outside: d.getMonth() !== m - 1 };
  });
}

export function AdminAgenda() {
  const today = localIso();
  const [dateIso, setDateIso] = useState(today);
  const [slot, setSlot] = useState("10:00");
  const [minutes, setMinutes] = useState<30 | 60>(30);
  const [source, setSource] = useState<AgendaSource>("offline");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [occupied, setOccupied] = useState<OccupiedSlot[]>([]);
  const [holds, setHolds] = useState<AgendaHold[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [y, m] = dateIso.split("-").map(Number);
  const cells = useMemo(() => monthCells(dateIso), [dateIso]);
  const headers = useMemo(() => {
    const monday = new Date(2026, 0, 5);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return WEEKDAYS.format(d).replace(".", "");
    });
  }, []);

  const load = useCallback(async () => {
    const { from, to } = monthRange(dateIso);
    const [nextOccupied, nextHolds] = await Promise.all([
      fetchOccupiedSlots(from, to),
      fetchAgendaHolds(from, to),
    ]);
    setOccupied(nextOccupied);
    setHolds(nextHolds);
  }, [dateIso]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => subscribeAgenda(() => void load()), [load]);

  async function onHold(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (dateIso < today) {
      setError(admin.slotOccupato);
      return;
    }
    setBusy(true);
    const result = await insertAgendaHold({ dateIso, slot, minutes, name, note, source });
    setBusy(false);
    if ("error" in result && result.error === "taken") {
      setError(admin.slotOccupato);
      return;
    }
    if ("error" in result) {
      setError(admin.errore);
      return;
    }
    setName("");
    setNote("");
    setMessage(admin.salvata);
    await load();
  }

  async function onFree(id: string) {
    setError(null);
    setMessage(null);
    const result = await deleteAgendaHold(id);
    if ("error" in result) {
      setError(admin.errore);
      return;
    }
    await load();
  }

  const monthHolds = holds.filter((hold) => hold.dateIso.slice(0, 7) === dateIso.slice(0, 7));

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div>
        <div className="mb-6 flex items-center justify-between gap-2">
          <button
            type="button"
            className="px-3 py-2 text-[0.625rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink"
            onClick={() => setDateIso(localIso(new Date(y, m - 2, 1)))}
          >
            ←
          </button>
          <p className="font-display text-lg capitalize text-ink">{MONTH.format(new Date(`${dateIso}T12:00:00`))}</p>
          <button
            type="button"
            className="px-3 py-2 text-[0.625rem] uppercase tracking-[0.16em] text-ink/45 hover:text-ink"
            onClick={() => setDateIso(localIso(new Date(y, m, 1)))}
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {headers.map((h) => (
            <span key={h} className="py-1 text-center text-[0.625rem] uppercase tracking-[0.08em] text-ink/40">
              {h}
            </span>
          ))}
          {cells.map((cell) => {
            const taken = occupied.some((item) => item.dateIso === cell.iso);
            const selected = cell.iso === dateIso;
            return (
              <button
                key={cell.iso}
                type="button"
                disabled={cell.outside || cell.iso < today}
                onClick={() => setDateIso(cell.iso)}
                className={`aspect-square text-sm ${
                  selected ? "bg-graphite text-on-ink" : taken ? "bg-mist text-ink" : "text-ink/80 hover:bg-mist"
                } ${cell.outside || cell.iso < today ? "opacity-30" : ""}`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
        <p className="mt-8 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
          {DAY.format(new Date(`${dateIso}T12:00:00`))}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {HOUR_SLOTS.map((hour) => {
            const hold = occupiedByHold(holds, dateIso, hour);
            const site = isSiteBooking(occupied, holds, dateIso, hour);
            const selected = hour === slot;
            return (
              <button
                key={hour}
                type="button"
                disabled={Boolean(hold) || site}
                onClick={() => setSlot(hour)}
                className={`px-3 py-3 text-sm ${
                  selected ? "bg-graphite text-on-ink" : hold || site ? "bg-mist text-ink/45" : "bg-paper text-ink hover:bg-mist"
                }`}
              >
                {hour}
                {hold || site ? (
                  <span className="mt-1 block text-[0.5625rem] uppercase tracking-[0.12em]">
                    {hold ? admin.origineStudio : admin.origineSito}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <form className="space-y-5 bg-paper p-6 md:p-8" onSubmit={(event) => void onHold(event)}>
          <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{admin.giorno}</p>
          <p className="font-display text-xl text-ink">{DAY.format(new Date(`${dateIso}T12:00:00`))} · {slot}</p>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">{admin.durata}</legend>
            {consulti.opzioni.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMinutes(option.minuti === 60 ? 60 : 30)}
                className={`px-4 py-3 text-[0.625rem] uppercase tracking-[0.14em] ${
                  minutes === option.minuti ? "bg-graphite text-on-ink" : "bg-paper text-ink"
                }`}
              >
                {option.titolo}
              </button>
            ))}
          </fieldset>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">{admin.blocco}</legend>
            <button
              type="button"
              onClick={() => setSource("offline")}
              className={`px-4 py-3 text-[0.625rem] uppercase tracking-[0.14em] ${
                source === "offline" ? "bg-graphite text-on-ink" : "bg-paper text-ink"
              }`}
            >
              {admin.offline}
            </button>
            <button
              type="button"
              onClick={() => setSource("block")}
              className={`px-4 py-3 text-[0.625rem] uppercase tracking-[0.14em] ${
                source === "block" ? "bg-graphite text-on-ink" : "bg-paper text-ink"
              }`}
            >
              {admin.blocco}
            </button>
          </fieldset>
          <label className="block">
            <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{admin.nome}</span>
            <input
              className="mt-2 w-full border-0 border-b border-ink/20 bg-transparent py-2 text-ink outline-none"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{admin.nota}</span>
            <input
              className="mt-2 w-full border-0 border-b border-ink/20 bg-transparent py-2 text-ink outline-none"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-ink">{error}</p> : null}
          {message ? <p className="text-sm text-ink/70">{message}</p> : null}
          <Button type="submit" disabled={busy}>
            {admin.occupa}
          </Button>
        </form>

        <ul className="mt-10 space-y-4">
          {monthHolds.length === 0 ? (
            <li className="text-sm text-ink/60">{admin.vuota}</li>
          ) : (
            monthHolds.map((hold) => (
              <li key={hold.id} className="flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
                <div>
                  <p className="text-sm text-ink">
                    {hold.dateIso} · {hold.slot} · {hold.minutes}′
                  </p>
                  <p className="mt-1 text-[0.625rem] uppercase tracking-[0.14em] text-ember-soft">
                    {hold.source === "block" ? admin.blocco : admin.offline}
                  </p>
                  {hold.name ? <p className="mt-2 text-sm text-ink/75">{hold.name}</p> : null}
                  {hold.note ? <p className="mt-1 text-sm text-ink/60">{hold.note}</p> : null}
                </div>
                <button
                  type="button"
                  className="text-[0.625rem] uppercase tracking-[0.16em] text-ink/50 hover:text-ink"
                  onClick={() => void onFree(hold.id)}
                >
                  {admin.libera}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
