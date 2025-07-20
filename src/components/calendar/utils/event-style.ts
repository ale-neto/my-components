import { Injectable } from '@angular/core';
import { IExtendedCalendarEvent, IEventStyle, ITimeRange } from '../interfaces/calendar.interface';
import { CALENDAR_CONSTANTS, CALENDAR_THEMES } from '../constants/calendar';
import { CalendarUtilsService } from './calendar-utils';

@Injectable({
  providedIn: 'root'
})
export class EventStyleService {

  constructor(private calendarUtils: CalendarUtilsService) {}

  /**
   * Gera estilos CSS para um evento
   */
  getEventStyle(event: IExtendedCalendarEvent, timeRange: ITimeRange): IEventStyle {
    const position = this.calculatePosition(event, timeRange);
    const dimensions = this.calculateDimensions(event, timeRange);
    const appearance = this.getEventAppearance(event);

    return {
      ...position,
      ...dimensions,
      ...appearance,
      position: 'absolute',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    };
  }

  /**
   * Calcula posição do evento na grade
   */
  private calculatePosition(event: IExtendedCalendarEvent, timeRange: ITimeRange): Pick<IEventStyle, 'top' | 'left'> {
    const startMinutes = this.calendarUtils.convertTimeToMinutes(event.startTime);
    const minHourMinutes = (timeRange.startTime || 0) * CALENDAR_CONSTANTS.MINUTES_IN_HOUR;

    const relativeTopMinutes = startMinutes - minHourMinutes;
    const top = Math.max(0, (relativeTopMinutes / CALENDAR_CONSTANTS.MINUTES_IN_HOUR) * CALENDAR_CONSTANTS.HOUR_HEIGHT_PX);

    const width = 100 / (event.totalOverlapped || 1);
    const left = (event.position || 0) * width;

    return {
      top: `${top}px`,
      left: `${left}%`,
    };
  }

  /**
   * Calcula dimensões do evento
   */
  private calculateDimensions(event: IExtendedCalendarEvent, timeRange: ITimeRange): Pick<IEventStyle, 'height' | 'width'> {
    const startMinutes = this.calendarUtils.convertTimeToMinutes(event.startTime);
    const endMinutes = this.calendarUtils.convertTimeToMinutes(event.endTime);

    const durationMinutes = endMinutes - startMinutes;
    const height = Math.max(0, (durationMinutes / CALENDAR_CONSTANTS.MINUTES_IN_HOUR) * CALENDAR_CONSTANTS.HOUR_HEIGHT_PX);

    const width = 100 / (event.totalOverlapped || 1);

    return {
      height: `${height}px`,
      width: `${width}%`,
    };
  }

  /**
   * Define aparência visual do evento
   */
  private getEventAppearance(event: IExtendedCalendarEvent): Pick<IEventStyle, 'backgroundColor' | 'color' | 'borderRadius' | 'padding'> {
    return {
      backgroundColor: event.color || CALENDAR_CONSTANTS.DEFAULT_EVENT_COLOR,
      color: this.getContrastColor(event.color || CALENDAR_CONSTANTS.DEFAULT_EVENT_COLOR),
      borderRadius: CALENDAR_CONSTANTS.EVENT_BORDER_RADIUS,
      padding: CALENDAR_CONSTANTS.EVENT_PADDING,
    };
  }

  /**
   * Calcula cor de contraste para texto
   */
  private getContrastColor(backgroundColor: string): string {
    // Remove # se presente
    const color = backgroundColor.replace('#', '');

    // Converte para RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Calcula luminância
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000' : '#fff';
  }

  /**
   * Aplica tema predefinido ao evento
   */
  getThemedEventStyle(event: IExtendedCalendarEvent, timeRange: ITimeRange, theme: keyof typeof CALENDAR_THEMES = 'DEFAULT'): IEventStyle {
    const baseStyle = this.getEventStyle(event, timeRange);
    const themeColors = CALENDAR_THEMES[theme];

    return {
      ...baseStyle,
      backgroundColor: themeColors.backgroundColor,
      color: themeColors.textColor,
      borderRadius: themeColors.borderRadius,
    };
  }

  /**
   * Gera estilos para evento em conflito/sobreposição
   */
  getConflictEventStyle(event: IExtendedCalendarEvent, timeRange: ITimeRange): IEventStyle {
    const baseStyle = this.getEventStyle(event, timeRange);

    return {
      ...baseStyle,
      backgroundColor: CALENDAR_THEMES.WARNING.backgroundColor,
      color: CALENDAR_THEMES.WARNING.textColor,
      border: '2px solid #ffc107',
      boxShadow: '0 2px 4px rgba(255, 193, 7, 0.3)',
    };
  }
}
