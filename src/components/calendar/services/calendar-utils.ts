import { Injectable } from '@angular/core';
import { ICalendarEvent } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CalendarUtilsService {

  generateHours(startTime = 0, endTime = 23, interval = 60): string[] {
    const hours: string[] = [];

    const validatedStart = Math.max(0, Math.min(23, startTime));
    const validatedEnd = Math.max(0, Math.min(23, endTime));

    const [start, end] = validatedStart > validatedEnd
      ? [validatedEnd, validatedStart]
      : [validatedStart, validatedEnd];

    const increment = interval / 60;

    for (let i = start; i <= end; i += increment) {
      const hour = Math.floor(i);
      const minutes = Math.round((i - hour) * 60);

      hours.push(this.formatTime(hour, minutes));
    }

    return hours;
  }

  convertTimeToMinutes(time: string): number {
    try {
      const [h, m] = time.split(':').map(n => parseInt(n, 10));
      return h * 60 + (m || 0);
    } catch (error) {
      console.warn(`Invalid time format: ${time}`);
      return 0;
    }
  }

  checkOverlap(event1: ICalendarEvent, event2: ICalendarEvent): boolean {
    const start1 = this.convertTimeToMinutes(event1.startTime);
    const end1 = this.convertTimeToMinutes(event1.endTime);
    const start2 = this.convertTimeToMinutes(event2.startTime);
    const end2 = this.convertTimeToMinutes(event2.endTime);

    return start1 < end2 && end1 > start2;
  }

  getFirstDayOfWeek(date: Date): Date {
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - date.getDay());
    return firstDay;
  }

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

  formatDateToISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + (days * 24 * 60 * 60 * 1000));
  }

  private formatTime(hour: number, minutes: number): string {
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

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

  private assignPositionsToGroups(groups: ICalendarEvent[][]): void {
    groups.forEach(group => {
      group.forEach((event, index) => {
        this.setEventPosition(event, index, group.length);
      });
    });
  }

  private setEventPosition(event: ICalendarEvent, position: number, total: number): void {
    (event as any).position = position;
    (event as any).totalOverlapped = total;
  }
}
