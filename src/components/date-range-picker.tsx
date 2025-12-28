"use client";

import {useEffect, useRef, useState} from "react";
import DatePicker from "react-datepicker";
import {endOfDay, format, startOfDay, subDays} from "date-fns";
import {Calendar, ChevronDown} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

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
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startDate, endDate]);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableDateSet = new Set(availableDates);

    useEffect(() => {
        setDateRange([startDate, endDate]);
    }, [startDate, endDate]);

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
          const start = startOfDay(new Date(sorted[0]));
          const end = endOfDay(new Date(sorted[sorted.length - 1]));
          setDateRange([start, end]);
          onChange({start, end});
      }
    } else {
        const start = startOfDay(subDays(new Date(), days - 1));
        const end = endOfDay(new Date());
        setDateRange([start, end]);
        onChange({start, end});
    }
    setIsOpen(false);
  };

    const handleDateChange = (update: [Date | null, Date | null]) => {
        setDateRange(update);
        if (update[0] && update[1]) {
            onChange({start: startOfDay(update[0]), end: endOfDay(update[1])});
    }
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

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availableDateSet.has(dateStr);
  };

  return (
      <div ref={containerRef} className="relative inline-block date-picker-wrapper">
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
                <DatePicker
                    selectsRange
                    startDate={dateRange[0]}
                    endDate={dateRange[1]}
                    onChange={handleDateChange}
                    filterDate={isDateAvailable}
                    inline
                    monthsShown={1}
                    calendarClassName="dark-calendar"
                />
            </div>
          </div>

          {/* Footer */}
            <div
                className="px-4 py-3 border-t border-[hsl(var(--border))] flex items-center justify-end bg-[hsl(var(--muted)/0.1)]">
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
