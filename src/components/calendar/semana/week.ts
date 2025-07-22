// week-view.component.ts (Optimized version with existing interfaces)
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Import existing interfaces from your project
import {
  ICalendarEvent,
  IDateRange,
  ITimeRange,
  ICalendarAction,
  IAddEventData,
  IDayWithEvents
} from '../interfaces';

// Import our improved services
import { CalendarUtilsService } from '../services/calendar-utils';
import { DateUtilsService } from '../services/date-utils';
import { EventStyleService } from '../services/event-style';
import { WeekViewStateService } from '../services/week-view-state';

// Constants
const CALENDAR_CONSTANTS = {
  DAYS_IN_WEEK: 7,
  HOUR_HEIGHT_PX: 48, // Changed to match Tailwind's h-12 (48px)
  MINUTES_IN_HOUR: 60,
  MS_IN_DAY: 24 * 60 * 60 * 1000,
  DEFAULT_INTERVAL: 60,
  MIN_HOUR: 0,
  MAX_HOUR: 23,
} as const;

// Extended event interface for internal use
interface ExtendedCalendarEvent extends ICalendarEvent {
  position?: number;
  totalOverlapped?: number;
}

// Menu position interface
interface MenuPosition {
  top: string;
  left: string;
}

// Month change event interface
interface MonthChangeEvent {
  month: string;
  year: number;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-week-view',
  templateUrl: './week.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WeekViewStateService] // Provide state service at component level
})
export class WeekViewComponent implements OnInit, OnChanges, OnDestroy {

  // Inputs (maintaining compatibility with existing interface)
  @Input() events: ICalendarEvent[] = [];
  @Input() enableOnlyPeriodDate?: IDateRange;
  @Input() enableOnlyPeriodTime: ITimeRange = {
    startTime: 0,
    endTime: 23,
    interval: CALENDAR_CONSTANTS.DEFAULT_INTERVAL,
  };
  @Input() actions: ICalendarAction[] = [];

  // Outputs (maintaining compatibility)
  @Output() clickAddEvent = new EventEmitter<IAddEventData>();
  @Output() clickViewEvent = new EventEmitter<ICalendarEvent>();
  @Output() monthChanged = new EventEmitter<MonthChangeEvent>();

  // Component state
  daysOfWeek: IDayWithEvents[] = [];
  markedDays: string[] = [];
  hours: string[] = [];
  currentDay: string = '';
  currentDate: Date = new Date();
  menuVisible: boolean = false;
  selectedEvent: ICalendarEvent | null = null;
  menuPosition: MenuPosition = { top: '0px', left: '0px' };

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    public calendarUtils: CalendarUtilsService,
    private dateUtils: DateUtilsService,
    private eventStyleService: EventStyleService,
    private stateService: WeekViewStateService
  ) {
    this.initializeHours();
  }

  ngOnInit(): void {
    this.initializeComponent();
    // this.subscribeToStateChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleInputChanges(changes);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateService.destroy();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.menuVisible && !this.isClickInsideMenu(event)) {
      this.closeMenu();
    }
  }

  // TrackBy functions for performance optimization
  trackByDate = (index: number, day: IDayWithEvents): string =>
    this.calendarUtils.formatDateToISO(day.date);

  trackByEvent = (index: number, event: ICalendarEvent): string | number =>
    event.id || index;

  trackByHour = (index: number, hour: string): string => hour;

  trackByAction = (index: number, action: ICalendarAction): string => action.name;

  // Navigation methods (maintaining existing API)
  goPreviousWeek(): void {
    this.currentDate = new Date(this.currentDate.getTime() - (CALENDAR_CONSTANTS.DAYS_IN_WEEK * CALENDAR_CONSTANTS.MS_IN_DAY));
    this.configureDaysOfWeek();
    this.emitMonthChange();
    this.cdr.markForCheck();
  }

  goCurrentWeek(): void {
    this.currentDate = new Date();
    this.configureDaysOfWeek();
    this.emitMonthChange();
    this.cdr.markForCheck();
  }

  goNextWeek(): void {
    this.currentDate = new Date(this.currentDate.getTime() + (CALENDAR_CONSTANTS.DAYS_IN_WEEK * CALENDAR_CONSTANTS.MS_IN_DAY));
    this.configureDaysOfWeek();
    this.emitMonthChange();
    this.cdr.markForCheck();
  }

  // Event interaction methods
  onTimeSlotClick(date: Date, hour: string): void {
    this.addEvent(date, hour);
  }

  onTimeSlotDoubleClick(date: Date, hour: string): void {
    this.addEvent(date, hour);
  }

  onEventClick(event: ICalendarEvent): void {
    this.viewEvent(event);
  }

  onEventRightClick(mouseEvent: MouseEvent, event: ICalendarEvent): void {
    mouseEvent.preventDefault();
    this.openMenu(mouseEvent, event);
  }

  // Public API methods (maintaining compatibility)
  addEvent(date: Date, startTime: string): void {
    console.log('addEvent', date, startTime);
    this.clickAddEvent.emit({ date, startTime });
  }

  viewEvent(event: ICalendarEvent): void {
    this.clickViewEvent.emit(event);
  }

  openMenu(event: MouseEvent, selectedEvent: ICalendarEvent): void {
    event.stopPropagation();
    this.menuVisible = true;
    this.selectedEvent = selectedEvent;

    const position = this.calculateMenuPosition(event);
    this.menuPosition = position;
    this.cdr.markForCheck();
  }

  executeAction(callback: (selectedEvent: ICalendarEvent) => void): void {
    if (this.selectedEvent) {
      callback(this.selectedEvent);
    }
    this.closeMenu();
  }

  closeMenu(): void {
    this.menuVisible = false;
    this.selectedEvent = null;
    this.cdr.markForCheck();
  }

  // Utility methods for template
  checkMarkedDay(date: string): boolean {
    return this.markedDays.includes(date);
  }

  isSameDay(day: string): boolean {
    return day === this.currentDay;
  }

  isToday(date: Date): boolean {
    return this.dateUtils.isToday(date);
  }

  get hasEventsThisWeek(): boolean {
    return this.getEventsForCurrentWeek().length > 0;
  }

  get weekStatusMessage(): string {
    const eventsCount = this.getEventsForCurrentWeek().length;
    const weekRange = this.getCurrentWeekRange();

    if (eventsCount === 0) {
      return `📅 No events this week (${weekRange})`;
    } else if (eventsCount === 1) {
      return `📌 1 event this week (${weekRange})`;
    } else {
      return `📊 ${eventsCount} events this week (${weekRange})`;
    }
  }


  getDayName(date: Date): string {
    return this.dateUtils.getDayOfWeekName(date);
  }

  getDayNumber(date: Date): number {
    return date.getDate();
  }

  getEventStyle(event: ExtendedCalendarEvent): Record<string, string> {
    return this.eventStyleService.getEventStyle(event, this.enableOnlyPeriodTime);
  }

  // Accessibility helpers
  getEventAriaLabel(event: ICalendarEvent): string {
    return `Event: ${event.title}, from ${event.startTime} to ${event.endTime}`;
  }

  getTimeSlotAriaLabel(date: Date, hour: string): string {
    const dayName = this.getDayName(date);
    const dayNumber = this.getDayNumber(date);
    return `${dayName}, ${dayNumber} at ${hour}`;
  }

  getDayAriaLabel(date: Date): string {
    const dayName = this.getDayName(date);
    const dayNumber = this.getDayNumber(date);
    const isCurrentDay = this.isToday(date);
    return `${dayName}, ${dayNumber}${isCurrentDay ? ' (today)' : ''}`;
  }

  // Getters for template
  get currentMonthYear(): MonthChangeEvent {
    return this.dateUtils.getMonthYearInfo(this.currentDate);
  }

  get hasEvents(): boolean {
    return this.events && this.events.length > 0;
  }

  get hasActions(): boolean {
    return this.actions && this.actions.length > 0;
  }

  private getEventsForCurrentWeek(): ICalendarEvent[] {
    const weekStart = this.calendarUtils.getFirstDayOfWeek(this.currentDate);
    const weekEnd = this.calendarUtils.addDays(weekStart, 6);

    return this.events.filter(event => {
      const eventDate = this.dateUtils.safeParseDate(event.date);
      if (!eventDate) return false;
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
  }

  // Range da semana formatado
  private getCurrentWeekRange(): string {
    const weekStart = this.calendarUtils.getFirstDayOfWeek(this.currentDate);
    const weekEnd = this.calendarUtils.addDays(weekStart, 6);

    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleDateString('pt-BR', { month: 'short' })}`;
    } else {
      return `${weekStart.getDate()} ${weekStart.toLocaleDateString('pt-BR', { month: 'short' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('pt-BR', { month: 'short' })}`;
    }
  }
  // Private initialization methods
  private initializeComponent(): void {
    const now = new Date();
    this.currentDay = now.toISOString().split('T')[0];

    if (this.enableOnlyPeriodDate?.startDate) {
      this.currentDate = new Date(this.enableOnlyPeriodDate.startDate + 'T00:00:00');
    } else {
      this.currentDate = new Date(now);
    }

    if (this.enableOnlyPeriodDate) {
      this.markDaysBetween(this.enableOnlyPeriodDate);
    }

    this.configureDaysOfWeek();
  }

  private initializeHours(): void {
    this.hours = this.calendarUtils.generateHours(
      this.enableOnlyPeriodTime.startTime,
      this.enableOnlyPeriodTime.endTime,
      this.enableOnlyPeriodTime.interval || CALENDAR_CONSTANTS.DEFAULT_INTERVAL
    );
  }

  // private subscribeToStateChanges(): void {
  //   // If using state service, subscribe to changes here
  //   // For now, we'll use the component's local state
  // }

  private handleInputChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.configureDaysOfWeek();
    }

    if (changes['enableOnlyPeriodTime']) {
      this.initializeHours();
    }

    if (changes['enableOnlyPeriodDate']) {
      const dateRange = changes['enableOnlyPeriodDate'].currentValue;
      if (dateRange) {
        this.markDaysBetween(dateRange);
      }
    }

    this.cdr.markForCheck();
  }

  private markDaysBetween(dateRange: IDateRange): void {
    this.markedDays = this.dateUtils.generateDateRange(dateRange.startDate, dateRange.endDate);
  }

  private configureDaysOfWeek(): void {
    this.daysOfWeek = [];
    const firstDayOfWeek = this.calendarUtils.getFirstDayOfWeek(this.currentDate);

    for (let i = 0; i < CALENDAR_CONSTANTS.DAYS_IN_WEEK; i++) {
      const currentDate = this.calendarUtils.addDays(firstDayOfWeek, i);
      const eventsOfDay = this.filterEventsOfDay(currentDate);

      this.calendarUtils.calculateOverlaps(eventsOfDay);

      this.daysOfWeek.push({
        date: currentDate,
        events: eventsOfDay,
      });
    }
  }

  private filterEventsOfDay(day: Date): ICalendarEvent[] {
    try {
      return this.events.filter((event) => {
        if (!event.date) {
          console.warn('Event without date found:', event);
          return false;
        }

        const eventDate = this.dateUtils.safeParseDate(event.date);
        return eventDate && this.dateUtils.isSameDay(eventDate, day);
      });
    } catch (error) {
      console.error('Error filtering events:', error);
      return [];
    }
  }

  private emitMonthChange(): void {
    const monthYear = this.currentMonthYear;
    this.monthChanged.emit(monthYear);
  }

  private calculateMenuPosition(event: MouseEvent): MenuPosition {
    const element = event.currentTarget as HTMLElement;
    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`
      };
    }
    return { top: '0px', left: '0px' };
  }

  private isClickInsideMenu(event: Event): boolean {
    const target = event.target as HTMLElement;
    return target.closest('.context-menu') !== null;
  }
}
