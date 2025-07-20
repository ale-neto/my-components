import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ICalendarEvent } from '../interfaces';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-week-view',
  templateUrl: './week.html',
})
export class WeekViewComponent implements OnInit, OnChanges {
  @Input() events: ICalendarEvent[] = [];
  @Input() enableOnlyPeriodDate?: { startDate: string; endDate: string };
  @Input() enableOnlyPeriodTime: { startTime: number; endTime: number; interval?: number } = {
    startTime: 0,
    endTime: 23,
    interval: 60,
  };
  @Input() actions: { name: string; method: (event: any) => void }[] = [];
  @Output() clickAddEvent = new EventEmitter<{
    date: Date;
    startTime: string;
  }>();
  @Output() clickViewEvent = new EventEmitter<ICalendarEvent>();
  @Output() monthChanged = new EventEmitter<{ month: string; year: number }>();

  daysOfWeek: { date: Date; events: ICalendarEvent[] }[] = [];
  markedDays: string[] = [];
  hours: string[] = [];
  currentDay: string = '';
  currentDate: Date = new Date();
  menuVisible: boolean = false;
  selectedEvent: any;
  menuPosition = { top: '0px', left: '0px' };

  constructor() {
    this.hours = this.generateHours(
      this.enableOnlyPeriodTime.startTime,
      this.enableOnlyPeriodTime.endTime,
      this.enableOnlyPeriodTime.interval || 60
    );
  }

  ngOnInit() {
    const { startDate, endDate } = this.enableOnlyPeriodDate || {};
    const now = new Date();
    this.currentDay = now.toISOString().split('T')[0];
    this.currentDate = startDate ? new Date(startDate + 'T00:00:00') : now;

    if (startDate && endDate) {
      this.markDaysBetween({ startDate, endDate });
    }
    this.configureDaysOfWeek();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.configureDaysOfWeek();
    }
    if (changes['enableOnlyPeriodTime']) {
      const period = changes['enableOnlyPeriodTime'].currentValue;
      this.hours = this.generateHours(
        period?.startTime,
        period?.endTime,
        period?.interval || 60
      );
    }

    if (changes['enableOnlyPeriodDate']) {
      const { startDate, endDate } =
        changes['enableOnlyPeriodDate'].currentValue || {};
      if (startDate && endDate) {
        this.markDaysBetween({ startDate, endDate });
      }
    }
  }

  private markDaysBetween({
    startDate,
    endDate,
  }: {
    startDate: string;
    endDate: string;
  }): void {
    this.markedDays = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    const current = new Date(start);
    while (current <= end) {
      this.markedDays.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  }

  private emitMonthChange() {
    const month = this.currentDate.toLocaleString('en-US', { month: 'long' });
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = month.charAt(0).toUpperCase() + month.slice(1);
    this.monthChanged.emit({ month: currentMonth, year: currentYear });
  }

  private generateHours(startTime = 0, endTime = 23, interval = 60): string[] {
    const hours: string[] = [];

    startTime = Math.max(0, Math.min(23, startTime));
    endTime = Math.max(0, Math.min(23, endTime));

    if (startTime > endTime) {
      [startTime, endTime] = [endTime, startTime];
    }

    const increment = interval / 60;

    for (let i = startTime; i <= endTime; i += increment) {
      const hour = Math.floor(i);
      const minutes = Math.round((i - hour) * 60);

      const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
      const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

      hours.push(`${hourStr}:${minutesStr}`);
    }

    return hours;
  }

  private configureDaysOfWeek() {
    this.daysOfWeek = [];
    const firstDayOfWeek = this.getFirstDayOfWeek(this.currentDate);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(firstDayOfWeek);
      currentDate.setDate(firstDayOfWeek.getDate() + i);

      const eventsOfDay = this.filterEventsOfDay(currentDate);

      this.calculateOverlaps(eventsOfDay);

      this.daysOfWeek.push({
        date: currentDate,
        events: eventsOfDay,
      });
    }
  }

  private calculateOverlaps(events: ICalendarEvent[]) {
    if (!events.length) return;

    const groupedEvents: { [key: string]: ICalendarEvent[] } = {};

    for (const event of events) {
      let groupFound = false;

      for (const group in groupedEvents) {
        if (this.checkOverlap(event, groupedEvents[group][0])) {
          groupedEvents[group].push(event);
          groupFound = true;
          break;
        }
      }

      if (!groupFound) {
        const newGroupId = `group_${Object.keys(groupedEvents).length}`;
        groupedEvents[newGroupId] = [event];
      }
    }

    for (const group in groupedEvents) {
      const groupEvents = groupedEvents[group];

      if (groupEvents.length > 1) {
        groupEvents.sort((a, b) => {
          return (
            this.convertTimeToMinutes(a.startTime) -
            this.convertTimeToMinutes(b.startTime)
          );
        });

        for (let i = 0; i < groupEvents.length; i++) {
          (groupEvents[i] as any).position = i;
          (groupEvents[i] as any).totalOverlapped = groupEvents.length;
        }
      } else {
        (groupEvents[0] as any).position = 0;
        (groupEvents[0] as any).totalOverlapped = 1;
      }
    }
  }

  private checkOverlap(
    event1: ICalendarEvent,
    event2: ICalendarEvent
  ): boolean {
    const start1 = this.convertTimeToMinutes(event1.startTime);
    const end1 = this.convertTimeToMinutes(event1.endTime);
    const start2 = this.convertTimeToMinutes(event2.startTime);
    const end2 = this.convertTimeToMinutes(event2.endTime);

    return start1 < end2 && end1 > start2;
  }

  private convertTimeToMinutes(time: string): number {
    const [h, m] = time.split(':').map((n) => parseInt(n, 10));
    return h * 60 + (m || 0);
  }

  private getFirstDayOfWeek(date: Date): Date {
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - date.getDay());
    return firstDay;
  }

  private filterEventsOfDay(day: Date) {
    return this.events.filter((event) => {
      const eventDate = new Date(event.date + 'T00:00:00');
      return eventDate.toDateString() === day.toDateString();
    });
  }

  checkMarkedDay(date: string): boolean {
    return this.markedDays.includes(date);
  }

  goPreviousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.configureDaysOfWeek();
    this.emitMonthChange();
  }

  goCurrentWeek() {
    this.currentDate = new Date();
    this.configureDaysOfWeek();
    this.emitMonthChange();
  }

  goNextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.configureDaysOfWeek();
    this.emitMonthChange();
  }

  getEventStyle(event: any) {
    const startTime = parseInt(event.startTime.split(':')[0], 10);
    const minutesStart = parseInt(event.startTime.split(':')[1], 10) || 0;
    const endTime = parseInt(event.endTime.split(':')[0], 10);
    const minutesEnd = parseInt(event.endTime.split(':')[1], 10) || 0;

    const minHour = this.enableOnlyPeriodTime?.startTime || 0;

    const relativeTop = startTime - minHour + minutesStart / 60;
    const top = relativeTop * 50;

    const durationHours = endTime - startTime + (minutesEnd - minutesStart) / 60;
    const height = durationHours * 50;

    const width = 100 / (event.totalOverlapped || 1);
    const left = (event.position || 0) * width;

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: event.color || '#007bff',
      color: '#fff',
      borderRadius: '4px',
      padding: '5px',
      boxSizing: 'border-box',
      width: `${width}%`,
      left: `${left}%`,
    };
  }

  addEvent(date: Date, startTime: string) {
    this.clickAddEvent.emit({ date, startTime });
  }

  isSameDay(day: string): boolean {
    return day === this.currentDay;
  }

  viewEvent(event: any) {
    this.clickViewEvent.emit(event);
  }

  openMenu(event: MouseEvent, selectedEvent: any) {
    event.stopPropagation();
    this.menuVisible = true;
    this.selectedEvent = event;
    const element = event.currentTarget as HTMLElement;
    if (element) {
      const rect = element.getBoundingClientRect();
      this.menuPosition = {
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`
      };
    }
  }

  executeAction(callback: (selectedEvent: any) => void) {
    callback(this.selectedEvent);
    this.menuVisible = false;
  }

  closeMenu() {
    this.menuVisible = false;
  }
}
