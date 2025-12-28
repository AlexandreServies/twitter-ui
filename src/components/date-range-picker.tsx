"use client";

import { useState, useRef, useEffect } from "react";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval } from "date-fns";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  availableDates: string[];
}

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "All time", days: 0 },
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DateRangePicker({ startDate, endDate, onChange, availableDates }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableDateSet = new Set(availableDates);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (days: number) => {
    if (days === 0) {
      if (availableDates.length > 0) {
        const sorted = [...availableDates].sort();
        onChange({
          start: startOfDay(new Date(sorted[0])),
          end: endOfDay(new Date(sorted[sorted.length - 1])),
        });
      }
    } else {
      onChange({
        start: startOfDay(subDays(new Date(), days - 1)),
        end: endOfDay(new Date()),
      });
    }
    setIsOpen(false);
  };

  const handleDayClick = (date: Date) => {
    if (selectingStart) {
      onChange({ start: startOfDay(date), end: null });
      setSelectingStart(false);
    } else {
      if (startDate && date < startDate) {
        onChange({ start: startOfDay(date), end: endOfDay(startDate) });
      } else {
        onChange({ start: startDate, end: endOfDay(date) });
      }
      setSelectingStart(true);
    }
  };

  const formatDisplayDate = () => {
    if (startDate && endDate) {
      if (isSameDay(startDate, endDate)) {
        return format(startDate, "MMM d, yyyy");
      }
      return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
    }
    return "Select date range";
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of month
    const startDay = start.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availableDateSet.has(dateStr);
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return isWithinInterval(date, { start: startDate, end: endDate });
  };

  const isDateSelected = (date: Date) => {
    if (startDate && isSameDay(date, startDate)) return true;
    if (endDate && isSameDay(date, endDate)) return true;
    return false;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition-colors"
      >
        <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
          {formatDisplayDate()}
        </span>
        <ChevronDown className={`w-4 h-4 text-[hsl(var(--muted-foreground))] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-xl shadow-2xl overflow-hidden">
          <div className="flex">
            {/* Presets */}
            <div className="p-4 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)] min-w-[140px]">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">Quick Select</p>
              <div className="space-y-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset.days)}
                    className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--foreground))] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                </button>
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="w-9 h-9 flex items-center justify-center text-xs font-medium text-[hsl(var(--muted-foreground))]">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, i) => {
                  if (!date) {
                    return <div key={`empty-${i}`} className="w-9 h-9" />;
                  }

                  const available = isDateAvailable(date);
                  const selected = isDateSelected(date);
                  const inRange = isDateInRange(date);
                  const isToday = isSameDay(date, new Date());

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => available && handleDayClick(date)}
                      disabled={!available}
                      className={`
                        w-9 h-9 text-sm rounded-lg transition-all
                        ${!available ? "text-[hsl(var(--muted-foreground)/0.3)] cursor-not-allowed" : "cursor-pointer"}
                        ${selected ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold" : ""}
                        ${inRange && !selected ? "bg-[hsl(var(--primary)/0.15)]" : ""}
                        ${!selected && !inRange && available ? "hover:bg-[hsl(var(--muted))]" : ""}
                        ${isToday && !selected ? "ring-1 ring-[hsl(var(--primary))]" : ""}
                        ${available && !selected ? "text-[hsl(var(--foreground))]" : ""}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--muted)/0.1)]">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {selectingStart ? "Select start date" : "Select end date"}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
