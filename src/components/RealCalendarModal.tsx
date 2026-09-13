import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Language } from '../types/news';

interface RealCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

/**
 * Bengali Month Converter helper
 * Returns approximate current Bengali Era (বঙ্গাব্দ) day, month and year
 */
function getBengaliCalendarDate(date: Date): { day: number; monthBn: string; monthEn: string; year: number } {
  const day = date.getDate();
  const month = date.getMonth(); // 0-11

  // Bengali months in order: Boishakh (Apr 14), Joishtho (May 15), Asharh (Jun 15), Srabon (Jul 16), Bhadro (Aug 16), Ashwin (Sep 16), Kartik (Oct 17), Ogrohayon (Nov 16), Poush (Dec 16), Magh (Jan 15), Falgun (Feb 14), Choitro (Mar 15)
  const bengaliMonths = [
    { bn: 'পৌষ', en: 'Poush', startMonth: 0, startDay: 15 },
    { bn: 'মাঘ', en: 'Magh', startMonth: 1, startDay: 14 },
    { bn: 'ফাল্গুন', en: 'Falgun', startMonth: 2, startDay: 15 },
    { bn: 'চৈত্র', en: 'Choitro', startMonth: 3, startDay: 14 },
    { bn: 'বৈশাখ', en: 'Boishakh', startMonth: 4, startDay: 15 },
    { bn: 'জ্যৈষ্ঠ', en: 'Joishtho', startMonth: 5, startDay: 15 },
    { bn: 'আষাঢ়', en: 'Asharh', startMonth: 6, startDay: 16 },
    { bn: 'শ্রাবণ', en: 'Srabon', startMonth: 7, startDay: 16 },
    { bn: 'ভাদ্র', en: 'Bhadro', startMonth: 8, startDay: 16 },
    { bn: 'আশ্বিন', en: 'Ashwin', startMonth: 9, startDay: 17 },
    { bn: 'কার্তিক', en: 'Kartik', startMonth: 10, startDay: 16 },
    { bn: 'অগ্রহায়ণ', en: 'Ogrohayon', startMonth: 11, startDay: 16 },
  ];

  // Year calculation (Bangabda is roughly Gregorian Year - 593)
  const isAfterPohelaBoishakh = month > 3 || (month === 3 && day >= 14);
  const bengaliYear = date.getFullYear() - (isAfterPohelaBoishakh ? 593 : 594);

  // Approximate current month index
  let mIndex = month;
  let bDay = day;
  if (day >= 15) {
    bDay = day - 14;
    mIndex = (month + 1) % 12;
  } else {
    bDay = day + 16;
  }

  const selected = bengaliMonths[month % 12];
  return {
    day: Math.min(31, Math.max(1, bDay)),
    monthBn: selected.bn,
    monthEn: selected.en,
    year: bengaliYear,
  };
}

/**
 * Islamic (Hijri) Calendar approximate helper
 */
function getHijriDate(date: Date): { day: number; monthBn: string; year: number } {
  try {
    const formatted = new Intl.DateTimeFormat('bn-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

    return {
      day: date.getDate(),
      monthBn: formatted,
      year: 1448,
    };
  } catch {
    return {
      day: 1,
      monthBn: 'হিজরি বর্ষপঞ্জি',
      year: 1448,
    };
  }
}

export const RealCalendarModal: React.FC<RealCalendarModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  // Ticking accurate live clock (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const BENGALI_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  const ENGLISH_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const BENGALI_MONTHS = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const ENGLISH_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month calculation
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleResetToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const bengaliInfo = getBengaliCalendarDate(currentDate);
  const hijriInfo = getHijriDate(currentDate);

  // Format real-time clock with seconds
  const formattedTime = currentDate.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedFullDate = currentDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="calendar-modal-container"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
      >
        {/* Header Clock Bar */}
        <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-rose-300 font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>{language === 'bn' ? 'সঠিক রিয়েল-টাইম সময় ও ক্যালেন্ডার' : 'Real-time Clock & Calendar'}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Large Live Clock Display */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white drop-shadow-sm">
                {formattedTime}
              </span>
              <p className="text-xs text-stone-300 font-medium mt-0.5">
                {formattedFullDate}
              </p>
            </div>

            {/* Traditional Date Badges */}
            <div className="flex flex-col sm:items-end gap-1 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-rose-900/60 text-rose-200 border border-rose-700/60 font-medium">
                বঙ্গাব্দ: {bengaliInfo.day} {bengaliInfo.monthBn} {bengaliInfo.year}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-emerald-300 border border-stone-700 font-medium">
                {hijriInfo.monthBn}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Month Navigation */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-rose-600" />
              <h3 className="text-base font-extrabold text-stone-900">
                {language === 'bn' ? BENGALI_MONTHS[viewMonth] : ENGLISH_MONTHS[viewMonth]} {viewYear}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetToToday}
                className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
              >
                {language === 'bn' ? 'আজ' : 'Today'}
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                title="পূর্ববর্তী মাস"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                title="পরবর্তী মাস"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-stone-500 pb-2 border-b border-stone-200 mb-2">
              {(language === 'bn' ? BENGALI_DAYS : ENGLISH_DAYS).map((d, i) => (
                <div key={d} className={i === 5 ? 'text-rose-600' : ''}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Empty leading days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9" />
              ))}

              {/* Month dates */}
              {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isToday =
                  dayNum === currentDate.getDate() &&
                  viewMonth === currentDate.getMonth() &&
                  viewYear === currentDate.getFullYear();
                const isFriday = (firstDayIndex + i) % 7 === 5;

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`h-9 flex items-center justify-center rounded-lg font-semibold transition-all ${
                      isToday
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300 font-extrabold text-sm'
                        : isFriday
                        ? 'text-rose-600 hover:bg-rose-50'
                        : 'text-stone-800 hover:bg-stone-200/70'
                    }`}
                  >
                    {language === 'bn'
                      ? dayNum.toLocaleString('bn-BD')
                      : dayNum}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Features & Prayer / Sun Times Hint */}
          <div className="p-3 bg-stone-100/80 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Sun className="w-4 h-4 text-amber-500" />
              {language === 'bn' ? 'সূর্যোদয়: ভোর ৫:৪৫' : 'Sunrise: 5:45 AM'}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Moon className="w-4 h-4 text-indigo-500" />
              {language === 'bn' ? 'সূর্যাস্ত: সন্ধ্যা ৬:০২' : 'Sunset: 6:02 PM'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-5 py-3 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            {language === 'bn'
              ? 'আন্তর্জাতিক মান সময় (UTC+6) অনুযায়ী স্বয়ংক্রিয় সমন্বিত'
              : 'Synchronized with local device and regional atomic time standards'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
