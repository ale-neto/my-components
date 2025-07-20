import { Injectable } from '@angular/core';
import { IDateRange, IMonthChangeEvent } from '../interfaces/calendar.interface';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {

  /**
   * Gera array de datas entre duas datas
   */
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

  /**
   * Obtém informações do mês e ano de uma data
   */
  getMonthYearInfo(date: Date): IMonthChangeEvent {
    const month = date.toLocaleString('en-US', { month: 'long' });
    return {
      month: month.charAt(0).toUpperCase() + month.slice(1),
      year: date.getFullYear()
    };
  }

  /**
   * Verifica se uma data é hoje
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  /**
   * Verifica se duas datas são do mesmo dia
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  /**
   * Converte string de data para Date object de forma segura
   */
  safeParseDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }

  /**
   * Formata data para exibição
   */
  formatDateForDisplay(date: Date, locale = 'pt-BR'): string {
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  /**
   * Obtém o dia da semana em português
   */
  getDayOfWeekName(date: Date, locale = 'pt-BR'): string {
    return date.toLocaleDateString(locale, { weekday: 'long' });
  }

  /**
   * Valida se um range de datas é válido
   */
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

  /**
   * Obtém o primeiro e último dia da semana para uma data
   */
  getWeekBoundaries(date: Date): { start: Date; end: Date } {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return { start, end };
  }

  /**
   * Calcula diferença em dias entre duas datas
   */
  getDaysDifference(date1: Date, date2: Date): number {
    const timeDifference = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  }
}
