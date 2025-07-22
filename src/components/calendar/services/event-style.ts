import { Injectable } from '@angular/core';
import { ICalendarEvent, ITimeRange } from '../interfaces';
import { CalendarUtilsService } from './calendar-utils';


interface ExtendedCalendarEvent extends ICalendarEvent {
  position?: number;
  totalOverlapped?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventStyleService {

  constructor(private calendarUtils: CalendarUtilsService) {}

  getEventStyle(event: ExtendedCalendarEvent, timeRange: ITimeRange): Record<string, string> {
    const position = this.calculatePosition(event, timeRange);
    const dimensions = this.calculateDimensions(event, timeRange);
    const appearance = this.getEventAppearance(event);

    return {
      ...position,
      ...dimensions,
      ...appearance,
      position: 'absolute',
      overflow: 'hidden',
      boxSizing: 'border-box',
    };
  }

  private calculatePosition(event: ExtendedCalendarEvent, timeRange: ITimeRange): Record<string, string> {
    const startMinutes = this.calendarUtils.convertTimeToMinutes(event.startTime);
    const minHourMinutes = (timeRange.startTime || 0) * 60;

    const relativeTopMinutes = startMinutes - minHourMinutes;
    const top = Math.max(0, (relativeTopMinutes / 60) * 48); // 48px = h-12 in Tailwind

    const width = 100 / (event.totalOverlapped || 1);
    const left = (event.position || 0) * width;

    return {
      top: `${top}px`,
      left: `${left}%`,
    };
  }

  private calculateDimensions(event: ExtendedCalendarEvent, timeRange: ITimeRange): Record<string, string> {
    const startMinutes = this.calendarUtils.convertTimeToMinutes(event.startTime);
    const endMinutes = this.calendarUtils.convertTimeToMinutes(event.endTime);

    const durationMinutes = endMinutes - startMinutes;
    const height = Math.max(0, (durationMinutes / 60) * 48); // 48px = h-12 in Tailwind

    const width = 100 / (event.totalOverlapped || 1);

    return {
      height: `${height}px`,
      width: `${width}%`,
    };
  }

  private getEventAppearance(event: ExtendedCalendarEvent): Record<string, string> {
    return {
      backgroundColor: event.color || '#007bff',
      color: this.getContrastColor(event.color || '#007bff'),
      borderRadius: '0.375rem', // rounded-md in Tailwind
      padding: '0.5rem', // p-2 in Tailwind
    };
  }

  private getContrastColor(backgroundColor: string): string {
    const color = backgroundColor.replace('#', '');

    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000' : '#fff';
  }
}
