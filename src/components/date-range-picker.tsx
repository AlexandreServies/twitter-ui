"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import "react-day-picker/style.css";

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

export function DateRangePicker({ startDate, endDate, onChange, availableDates }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
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
      // All time - use min/max from available dates
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

  const handleDayPickerSelect = (range: DateRange | undefined) => {
    onChange({
      start: range?.from || null,
      end: range?.to || null,
    });
  };

  const formatDisplayDate = () => {
    if (startDate && endDate) {
      if (startDate.getTime() === endDate.getTime()) {
        return format(startDate, "MMM d, yyyy");
      }
      return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
    }
    return "Select date range";
  };

  // Convert available dates to Date objects for the picker
  const availableDateSet = new Set(availableDates);
  const disabledMatcher = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return !availableDateSet.has(dateStr);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition-colors"
      >
        <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
          {formatDisplayDate()}
        </span>
        <ChevronDown className={`w-4 h-4 text-[hsl(var(--muted-foreground))] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-xl shadow-xl overflow-hidden">
          <div className="flex">
            {/* Presets */}
            <div className="p-3 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 px-2">Quick Select</p>
              <div className="space-y-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset.days)}
                    className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--foreground))] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="p-3">
              <DayPicker
                mode="range"
                selected={{ from: startDate || undefined, to: endDate || undefined }}
                onSelect={handleDayPickerSelect}
                disabled={disabledMatcher}
                numberOfMonths={1}
                showOutsideDays={false}
                classNames={{
                  root: "rdp-custom",
                  months: "flex gap-4",
                  month: "space-y-2",
                  caption: "flex justify-center relative items-center h-10",
                  caption_label: "text-sm font-medium text-[hsl(var(--foreground))]",
                  nav: "flex items-center gap-1",
                  nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-[hsl(var(--muted))] rounded-md flex items-center justify-center",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex",
                  head_cell: "text-[hsl(var(--muted-foreground))] w-8 font-normal text-xs",
                  row: "flex w-full mt-1",
                  cell: "text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 p-0 font-normal rounded-md hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] transition-colors",
                  day_selected: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]",
                  day_today: "border border-[hsl(var(--primary))]",
                  day_outside: "text-[hsl(var(--muted-foreground))] opacity-50",
                  day_disabled: "text-[hsl(var(--muted-foreground))] opacity-30 cursor-not-allowed hover:bg-transparent",
                  day_range_middle: "bg-[hsl(var(--primary)/0.2)] rounded-none",
                  day_range_start: "rounded-r-none",
                  day_range_end: "rounded-l-none",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>

          {/* Apply Button */}
          <div className="p-3 border-t border-[hsl(var(--border))] flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
