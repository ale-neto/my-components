// month-view.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs';

// Reutilizar interfaces existentes
import {
  IAddEventData,
  ICalendarAction,
  ICalendarEvent,
  IDateRange,
} from '../interfaces';
import { CalendarUtilsService } from '../services/calendar-utils';
import { DateUtilsService } from '../services/date-utils';

// Reutilizar serviços existentes

// Constantes para o mês
const MONTH_CONSTANTS = {
  DAYS_IN_WEEK: 7,
  WEEKS_TO_SHOW: 6, // 6 semanas para cobrir qualquer mês
  MAX_VISIBLE_EVENTS: 3, // Eventos visíveis por dia antes de mostrar "+X more"
} as const;

// Interfaces específicas para mês
interface DayInMonth {
  date: Date;
  events: ICalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  dayNumber: number;
}

interface WeekInMonth {
  days: DayInMonth[];
}

interface MonthChangeEvent {
  month: string;
  year: number;
}

interface MenuPosition {
  top: string;
  left: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-month-view',
  templateUrl: './month.html',
  styleUrls: ['./month.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthViewComponent implements OnInit, OnChanges, OnDestroy {
  // Inputs (compatíveis com WeekView)
  @Input() events: ICalendarEvent[] = [];
  @Input() enableOnlyPeriodDate?: IDateRange;
  @Input() actions: ICalendarAction[] = [];
  @Input() maxVisibleEvents: number = MONTH_CONSTANTS.MAX_VISIBLE_EVENTS;

  // Outputs (compatíveis com WeekView)
  @Output() clickAddEvent = new EventEmitter<IAddEventData>();
  @Output() clickViewEvent = new EventEmitter<ICalendarEvent>();
  @Output() monthChanged = new EventEmitter<MonthChangeEvent>();
  @Output() dayClicked = new EventEmitter<Date>();

  // Estado do componente
  currentDate: Date = new Date();
  weeksInMonth: WeekInMonth[] = [];
  markedDays: Set<string> = new Set();
  menuVisible: boolean = false;
  selectedEvent: ICalendarEvent | null = null;
  menuPosition: MenuPosition = { top: '0px', left: '0px' };

  // Dias da semana
  readonly daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    public calendarUtils: CalendarUtilsService,
    private dateUtils: DateUtilsService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleInputChanges(changes);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.menuVisible && !this.isClickInsideMenu(event)) {
      this.closeMenu();
    }
  }

  // TrackBy functions para performance
  trackByWeek = (index: number, week: WeekInMonth): string =>
    week.days.map((d) => d.date.toISOString().split('T')[0]).join('-');

  trackByDay = (index: number, day: DayInMonth): string =>
    day.date.toISOString().split('T')[0];

  trackByEvent = (index: number, event: ICalendarEvent): string | number =>
    event.id || index;

  trackByAction = (index: number, action: ICalendarAction): string =>
    action.name;

  // Métodos de navegação
  goPreviousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.configureMonthGrid();
    this.emitMonthChange();
    this.cdr.markForCheck();
  }

  goCurrentMonth(): void {
    this.currentDate = new Date();
    this.configureMonthGrid();
    this.emitMonthChange();
    this.cdr.markForCheck();
  }

  goNextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.configureMonthGrid();
    this.emitMonthChange();
    this.cdr.markForCheck();
  }

  // Métodos de interação
  onDayClick(day: DayInMonth): void {
    this.dayClicked.emit(day.date);

    // Se o dia não tem eventos, emitir evento de adicionar
    if (day.events.length === 0) {
      this.addEvent(day.date);
    }
  }

  onEventClick(event: ICalendarEvent, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.clickViewEvent.emit(event);
  }

  onEventKeydown(event: ICalendarEvent, keyboardEvent: any): void {
    keyboardEvent.stopPropagation();
    keyboardEvent.preventDefault();
    this.clickViewEvent.emit(event);
  }

  onDayKeydown(day: DayInMonth, keyboardEvent: any): void {
    keyboardEvent.preventDefault();
    this.onDayClick(day);
  }

  onEventRightClick(event: ICalendarEvent, mouseEvent: MouseEvent): void {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    this.openMenu(mouseEvent, event);
  }

  addEvent(date: Date, startTime: string = '09:00'): void {
    this.clickAddEvent.emit({ date, startTime });
  }

  // Métodos do menu de contexto
  openMenu(event: MouseEvent, selectedEvent: ICalendarEvent): void {
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

  // Métodos utilitários
  getVisibleEvents(day: DayInMonth): ICalendarEvent[] {
    return day.events.slice(0, this.maxVisibleEvents);
  }

  getHiddenEventsCount(day: DayInMonth): number {
    return Math.max(0, day.events.length - this.maxVisibleEvents);
  }

  hasHiddenEvents(day: DayInMonth): boolean {
    return day.events.length > this.maxVisibleEvents;
  }

  getEventStyle(event: ICalendarEvent, index: number): Record<string, string> {
    const colors = [
      '#3b82f6',
      '#ef4444',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#84cc16',
    ];

    return {
      backgroundColor: event.color || colors[index % colors.length],
      color: '#ffffff',
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '0.125rem 0.25rem',
      borderRadius: '0.25rem',
      marginBottom: '0.125rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    };
  }

  getEventDisplayTitle(event: ICalendarEvent): string {
    // Mostrar horário + título para eventos do dia
    return `${event.startTime} ${event.title}`;
  }

  // Getters
  get currentMonthYear(): MonthChangeEvent {
    return this.dateUtils.getMonthYearInfo(this.currentDate);
  }

  get hasEvents(): boolean {
    return this.events && this.events.length > 0;
  }

  get hasActions(): boolean {
    return this.actions && this.actions.length > 0;
  }

  get totalEventsThisMonth(): number {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    return this.events.filter((event) => {
      const eventDate = this.dateUtils.safeParseDate(event.date);
      return (
        eventDate &&
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === month
      );
    }).length;
  }

  // Métodos privados de inicialização
  private initializeComponent(): void {
    if (this.enableOnlyPeriodDate?.startDate) {
      this.currentDate = new Date(
        this.enableOnlyPeriodDate.startDate + 'T00:00:00'
      );
    }

    if (this.enableOnlyPeriodDate) {
      this.updateMarkedDays(this.enableOnlyPeriodDate);
    }

    this.configureMonthGrid();
  }

  private handleInputChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.configureMonthGrid();
    }

    if (changes['enableOnlyPeriodDate']) {
      const dateRange = changes['enableOnlyPeriodDate'].currentValue;
      if (dateRange && this.dateUtils.validateDateRange(dateRange)) {
        this.updateMarkedDays(dateRange);
      }
    }

    this.cdr.markForCheck();
  }

  private updateMarkedDays(dateRange: IDateRange): void {
    this.markedDays = new Set(
      this.dateUtils.generateDateRange(dateRange.startDate, dateRange.endDate)
    );
  }

  private configureMonthGrid(): void {
    this.weeksInMonth = [];

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Primeiro dia do mês
    const firstDayOfMonth = new Date(year, month, 1);

    // Último dia do mês
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Primeiro dia da grade (pode ser do mês anterior)
    const firstDayOfGrid = new Date(firstDayOfMonth);
    firstDayOfGrid.setDate(firstDayOfGrid.getDate() - firstDayOfMonth.getDay());

    // Gerar 6 semanas (42 dias)
    const currentGridDate = new Date(firstDayOfGrid);

    for (let week = 0; week < MONTH_CONSTANTS.WEEKS_TO_SHOW; week++) {
      const weekDays: DayInMonth[] = [];

      for (let day = 0; day < MONTH_CONSTANTS.DAYS_IN_WEEK; day++) {
        const dayInMonth = this.createDayInMonth(currentGridDate, month);
        weekDays.push(dayInMonth);

        currentGridDate.setDate(currentGridDate.getDate() + 1);
      }

      this.weeksInMonth.push({ days: weekDays });
    }
  }

  private createDayInMonth(date: Date, currentMonth: number): DayInMonth {
    const dayDate = new Date(date);
    const isCurrentMonth = dayDate.getMonth() === currentMonth;
    const isToday = this.dateUtils.isToday(dayDate);
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
    const events = this.filterEventsOfDay(dayDate);

    return {
      date: dayDate,
      events,
      isCurrentMonth,
      isToday,
      isWeekend,
      dayNumber: dayDate.getDate(),
    };
  }

  private filterEventsOfDay(day: Date): ICalendarEvent[] {
    try {
      return this.events
        .filter((event) => {
          if (!event.date) {
            console.warn('Event without date found:', event);
            return false;
          }

          const eventDate = this.dateUtils.safeParseDate(event.date);
          return eventDate && this.dateUtils.isSameDay(eventDate, day);
        })
        .sort((a, b) => {
          // Ordenar eventos por horário
          return (
            this.calendarUtils.convertTimeToMinutes(a.startTime) -
            this.calendarUtils.convertTimeToMinutes(b.startTime)
          );
        });
    } catch (error) {
      console.error('Error filtering events:', error);
      return [];
    }
  }

  private emitMonthChange(): void {
    const { month, year } = this.currentMonthYear;
    this.monthChanged.emit({ month, year });
  }

  private calculateMenuPosition(event: MouseEvent): MenuPosition {
    const element = event.currentTarget as HTMLElement;
    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
      };
    }
    return { top: '0px', left: '0px' };
  }

  private isClickInsideMenu(event: Event): boolean {
    const target = event.target as HTMLElement;
    return target.closest('.context-menu') !== null;
  }

  // Métodos utilitários públicos
  checkMarkedDay(date: string): boolean {
    return this.markedDays.has(date);
  }

  isMarkedDay(day: DayInMonth): boolean {
    return this.checkMarkedDay(this.calendarUtils.formatDateToISO(day.date));
  }

  // Métodos para accessibility
  getDayAriaLabel(day: DayInMonth): string {
    const dayName = this.dateUtils.getDayOfWeekName(day.date);
    const dayNumber = day.dayNumber;
    const monthName = this.currentMonthYear.month;
    const eventsCount = day.events.length;

    let label = `${dayName}, ${dayNumber} de ${monthName}`;

    if (day.isToday) {
      label += ' (hoje)';
    }

    if (!day.isCurrentMonth) {
      label += ' (mês anterior/próximo)';
    }

    if (eventsCount > 0) {
      label += `, ${eventsCount} evento${eventsCount > 1 ? 's' : ''}`;
    }

    return label;
  }

  getEventAriaLabel(event: ICalendarEvent): string {
    return `Evento: ${event.title}, às ${event.startTime}`;
  }
}
