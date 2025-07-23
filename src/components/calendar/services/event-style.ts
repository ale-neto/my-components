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

  getEventStyle(event: ExtendedCalendarEvent, timeRange: ITimeRange, hoursArray?: string[]): Record<string, string> {
    const position = this.calculatePosition(event, timeRange, hoursArray);
    const dimensions = this.calculateDimensions(event, timeRange, hoursArray);
    const appearance = this.getEventAppearance(event);

    return {
      ...position,
      ...dimensions,
      ...appearance,
      position: 'absolute',
      overflow: 'hidden',
      boxSizing: 'border-box',
      zIndex: '20',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  }

  private calculatePosition(event: ExtendedCalendarEvent, timeRange: ITimeRange, hoursArray?: string[]): Record<string, string> {
    const startMinutes = this.calendarUtils.convertTimeToMinutes(event.startTime);
    const minHourMinutes = (timeRange.startTime || 0) * 60;
    const interval = timeRange.interval || 60;

    let top: number;

    // CORREÇÃO 1: Se temos o array de horas, usar índice (MAIS PRECISO)
    if (hoursArray) {
      const startIndex = hoursArray.findIndex(hour => hour === event.startTime);
      if (startIndex !== -1) {
        top = startIndex * 48; // 48px = h-12 do Tailwind
      } else {
        // Fallback: encontrar horário mais próximo
        top = this.calculateFallbackPosition(event.startTime, hoursArray, timeRange);
      }
    } else {
      // CORREÇÃO 2: Cálculo baseado no intervalo configurado
      const relativeTopMinutes = startMinutes - minHourMinutes;

      // Quantos slots de intervalo passaram desde o início
      const slotsFromStart = relativeTopMinutes / interval;
      top = Math.max(0, slotsFromStart * 48);
    }

    // Posicionamento horizontal para eventos sobrepostos
    const width = 100 / (event.totalOverlapped || 1);
    const left = (event.position || 0) * width;

    return {
      top: `${top}px`,
      left: `${left}%`,
    };
  }

  private calculateDimensions(event: ExtendedCalendarEvent, timeRange: ITimeRange, hoursArray?: string[]): Record<string, string> {
    const startMinutes = this.calendarUtils.convertTimeToMinutes(event.startTime);
    const endMinutes = this.calendarUtils.convertTimeToMinutes(event.endTime);
    const interval = timeRange.interval || 60;

    let height: number;

    // CORREÇÃO 1: Se temos o array de horas, calcular por índices
    if (hoursArray) {
      const startIndex = hoursArray.findIndex(hour => hour === event.startTime);
      const endIndex = hoursArray.findIndex(hour => hour === event.endTime);

      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        // Altura baseada no número de slots ocupados
        const slotSpan = endIndex - startIndex;
        height = Math.max(20, slotSpan * 48 - 2); // -2px para margem
      } else {
        // Fallback para duração manual
        height = this.calculateFallbackHeight(event, timeRange);
      }
    } else {
      // CORREÇÃO 2: Duração baseada no intervalo
      const durationMinutes = endMinutes - startMinutes;
      const durationInSlots = durationMinutes / interval;
      height = Math.max(20, durationInSlots * 48 - 2);
    }

    // Largura considerando sobreposições
    const width = 100 / (event.totalOverlapped || 1);

    return {
      height: `${height}px`,
      width: `${Math.max(width - 1, 10)}%`, // -1% para espaçamento, mínimo 10%
    };
  }

  private getEventAppearance(event: ExtendedCalendarEvent): Record<string, string> {
    return {
      backgroundColor: event.color || '#3b82f6', // blue-500
      color: this.getContrastColor(event.color || '#3b82f6'),
      borderRadius: '0.25rem', // rounded
      padding: '0.25rem 0.5rem', // py-1 px-2
      fontSize: '0.75rem', // text-xs
      fontWeight: '500', // font-medium
      lineHeight: '1.2',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    };
  }

  private getContrastColor(backgroundColor: string): string {
    // Remove # se presente
    const color = backgroundColor.replace('#', '');

    // Validação básica
    if (color.length !== 6 && color.length !== 3) {
      return '#ffffff';
    }

    try {
      let r: number, g: number, b: number;

      if (color.length === 3) {
        // Formato #RGB
        r = parseInt(color.charAt(0) + color.charAt(0), 16);
        g = parseInt(color.charAt(1) + color.charAt(1), 16);
        b = parseInt(color.charAt(2) + color.charAt(2), 16);
      } else {
        // Formato #RRGGBB
        r = parseInt(color.substr(0, 2), 16);
        g = parseInt(color.substr(2, 2), 16);
        b = parseInt(color.substr(4, 2), 16);
      }

      // Cálculo da luminância (fórmula W3C)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      return luminance > 0.5 ? '#000000' : '#ffffff';
    } catch (error) {
      console.warn('Invalid color format:', backgroundColor);
      return '#ffffff';
    }
  }

  // Métodos auxiliares para fallback

  private calculateFallbackPosition(startTime: string, hoursArray: string[], timeRange: ITimeRange): number {
    const startMinutes = this.calendarUtils.convertTimeToMinutes(startTime);

    // Encontrar o slot mais próximo
    let nearestIndex = 0;
    let minDifference = Infinity;

    hoursArray.forEach((hour, index) => {
      const hourMinutes = this.calendarUtils.convertTimeToMinutes(hour);
      const difference = Math.abs(hourMinutes - startMinutes);

      if (difference < minDifference) {
        minDifference = difference;
        nearestIndex = index;
      }
    });

    return nearestIndex * 48;
  }

  private calculateFallbackHeight(event: ExtendedCalendarEvent, timeRange: ITimeRange): number {
    const startMinutes = this.calendarUtils.convertTimeToMinutes(event.startTime);
    const endMinutes = this.calendarUtils.convertTimeToMinutes(event.endTime);
    const durationMinutes = endMinutes - startMinutes;
    const interval = timeRange.interval || 60;

    const durationInSlots = durationMinutes / interval;
    return Math.max(20, durationInSlots * 48 - 2);
  }

// Método para validar se evento pode ser renderizado
  validateEvent(event: ICalendarEvent, timeRange: ITimeRange, hoursArray?: string[]): boolean {
    const startMinutes = this.calendarUtils.convertTimeToMinutes(event.startTime);
    const endMinutes = this.calendarUtils.convertTimeToMinutes(event.endTime);

    // Validações básicas
    if (endMinutes <= startMinutes) {
      console.warn('Invalid event duration:', event.title, event.startTime, event.endTime);
      return false;
    }

    // Se temos array de horas, verificar se os horários existem
    if (hoursArray) {
      const startExists = hoursArray.includes(event.startTime);
      const endExists = hoursArray.includes(event.endTime);

      if (!startExists || !endExists) {
        console.warn('Event times not in hours array:', event.title, {
          startTime: event.startTime,
          endTime: event.endTime,
          startExists,
          endExists
        });
        return false;
      }
    }

    return true;
  }
}
