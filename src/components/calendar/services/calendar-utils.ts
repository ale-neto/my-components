// calendar-utils.service.ts
import { Injectable } from '@angular/core';
import { CALENDAR_CONSTANTS } from '../constants/calendar';
import { ICalendarEvent, IExtendedCalendarEvent } from '../interfaces/calendar.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarUtilsService {

  /**
   * Gera array de horários formatados baseado no intervalo
   */
  generateHours(startTime = 0, endTime = 23, interval = 60): string[] {
    const hours: string[] = [];

    const validatedStart = this.validateHour(startTime);
    const validatedEnd = this.validateHour(endTime);

    const [start, end] = validatedStart > validatedEnd
      ? [validatedEnd, validatedStart]
      : [validatedStart, validatedEnd];

    const increment = interval / CALENDAR_CONSTANTS.MINUTES_IN_HOUR;

    for (let i = start; i <= end; i += increment) {
      const hour = Math.floor(i);
      const minutes = Math.round((i - hour) * CALENDAR_CONSTANTS.MINUTES_IN_HOUR);

      hours.push(this.formatTime(hour, minutes));
    }

    return hours;
  }

  /**
   * Converte string de tempo para minutos
   */
  convertTimeToMinutes(time: string): number {
    try {
      const [h, m] = time.split(':').map(n => parseInt(n, 10));
      return h * CALENDAR_CONSTANTS.MINUTES_IN_HOUR + (m || 0);
    } catch (error) {
      console.warn(`Invalid time format: ${time}`);
      return 0;
    }
  }

  /**
   * Verifica se dois eventos se sobrepõem
   */
  checkOverlap(event1: ICalendarEvent, event2: ICalendarEvent): boolean {
    const start1 = this.convertTimeToMinutes(event1.startTime);
    const end1 = this.convertTimeToMinutes(event1.endTime);
    const start2 = this.convertTimeToMinutes(event2.startTime);
    const end2 = this.convertTimeToMinutes(event2.endTime);

    return start1 < end2 && end1 > start2;
  }

  /**
   * Obtém o primeiro dia da semana (domingo)
   */
  getFirstDayOfWeek(date: Date): Date {
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - date.getDay());
    return firstDay;
  }

  /**
   * Calcula posições para eventos sobrepostos
   */
  calculateOverlaps(events: ICalendarEvent[]): void {
    if (events.length <= 1) {
      if (events.length === 1) {
        this.setEventPosition(events[0], 0, 1);
      }
      return;
    }

    const sortedEvents = [...events].sort((a, b) =>
      this.convertTimeToMinutes(a.startTime) - this.convertTimeToMinutes(b.startTime)
    );

    const groups = this.groupOverlappingEvents(sortedEvents);
    this.assignPositionsToGroups(groups);
  }

  /**
   * Formata data para string ISO (YYYY-MM-DD)
   */
  formatDateToISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Verifica se duas datas são do mesmo dia
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return this.formatDateToISO(date1) === this.formatDateToISO(date2);
  }

  /**
   * Adiciona dias a uma data (imutável)
   */
  addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + (days * CALENDAR_CONSTANTS.MS_IN_DAY));
  }

  /**
   * Adiciona semanas a uma data (imutável)
   */
  addWeeks(date: Date, weeks: number): Date {
    return this.addDays(date, weeks * CALENDAR_CONSTANTS.DAYS_IN_WEEK);
  }

  /**
   * Valida se a hora está no range válido
   */
  private validateHour(hour: number): number {
    return Math.max(CALENDAR_CONSTANTS.MIN_HOUR, Math.min(CALENDAR_CONSTANTS.MAX_HOUR, hour));
  }

  /**
   * Formata hora e minutos para string HH:MM
   */
  private formatTime(hour: number, minutes: number): string {
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Agrupa eventos que se sobrepõem
   */
  private groupOverlappingEvents(sortedEvents: ICalendarEvent[]): ICalendarEvent[][] {
    const groups: ICalendarEvent[][] = [];

    for (const event of sortedEvents) {
      let groupFound = false;

      for (const group of groups) {
        if (group.some(groupEvent => this.checkOverlap(event, groupEvent))) {
          group.push(event);
          groupFound = true;
          break;
        }
      }

      if (!groupFound) {
        groups.push([event]);
      }
    }

    return groups;
  }

  /**
   * Atribui posições dentro de cada grupo
   */
  private assignPositionsToGroups(groups: ICalendarEvent[][]): void {
    groups.forEach(group => {
      group.forEach((event, index) => {
        this.setEventPosition(event, index, group.length);
      });
    });
  }

  /**
   * Define posição e total de sobreposições para um evento
   */
  private setEventPosition(event: ICalendarEvent, position: number, total: number): void {
    (event as any).position = position;
    (event as any).totalOverlapped = total;
  }
}
