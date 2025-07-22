import { Injectable } from '@angular/core';
import { IDateRange } from '../interfaces';

interface MonthChangeEvent {
  month: string;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {

  generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        console.warn('Start date is after end date');
        return dates;
      }

      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    } catch (error) {
      console.error('Error generating date range:', error);
    }

    return dates;
  }

  getMonthYearInfo(date: Date): MonthChangeEvent {
    const month = date.toLocaleString('en-US', { month: 'long' });
    return {
      month: month.charAt(0).toUpperCase() + month.slice(1),
      year: date.getFullYear()
    };
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  safeParseDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }

  getDayOfWeekName(date: Date, locale = 'pt-BR'): string {
    return date.toLocaleDateString(locale, { weekday: 'long' });
  }

  validateDateRange(dateRange: IDateRange): boolean {
    try {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);

      return !isNaN(start.getTime()) &&
             !isNaN(end.getTime()) &&
             start <= end;
    } catch (error) {
      return false;
    }
  }
}
