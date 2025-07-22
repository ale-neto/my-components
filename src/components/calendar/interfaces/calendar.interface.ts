// calendar.interfaces.ts
export interface ICalendarEvent {
  id?: string | number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color?: string;
  description?: string;
}

export interface IDayWithEvents {
  date: Date;
  events: ICalendarEvent[];
}

export interface IEventPosition {
  position: number;
  totalOverlapped: number;
}

export interface IMenuPosition {
  top: string;
  left: string;
}

export interface ITimeRange {
  startTime: number;
  endTime: number;
  interval?: number;
}

export interface IDateRange {
  startDate: string;
  endDate: string;
}

export interface IEventStyle {
  top: string;
  height: string;
  backgroundColor: string;
  color: string;
  borderRadius: string;
  padding: string;
  boxSizing: string;
  width: string;
  left: string;
  position: string;
  overflow: string;
  textOverflow: string;
  whiteSpace: string;
  border?: string;
  boxShadow?: string;
}

export interface ICalendarAction {
  name: string;
  method: (event: ICalendarEvent) => void;
}

export interface IMonthChangeEvent {
  month: string;
  year: number;
}

export interface IAddEventData {
  date: Date;
  startTime: string;
}

export type IExtendedCalendarEvent = ICalendarEvent & IEventPosition;
