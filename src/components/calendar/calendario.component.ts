import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  IAddEventData,
  ICalendarAction,
  ICalendarEvent,
  IDateRange,
  ITimeRange,
} from './interfaces';

@Component({
  standalone: false,
  selector: 'app-calendar',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarioComponent {
  @Input() timeRange: ITimeRange = {
    startTime: 9,
    endTime: 17,
    interval: 30,
  };
  @Input() dateRange: IDateRange = {
    startDate: '2025-07-01',
    endDate: '2025-07-31',
  };
  @Input() events: ICalendarEvent[] = [];
  @Input() eventActions: ICalendarAction[] = [];
  @Output() addEvent = new EventEmitter<IAddEventData>();
  @Output() viewEvent = new EventEmitter<ICalendarEvent>();
  currentView: 'month' | 'week' = 'month';
  maxVisibleEvents: number = 3;

  showEventModal: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  modalData: any = null;

  private addHoursToTime(time: string, hours: number): string {
    const [h, m] = time.split(':').map((n) => parseInt(n, 10));
    const newHour = (h + hours) % 24;
    return `${newHour.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}`;
  }

  private getRandomColor(): string {
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
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  get eventsThisMonth(): number {
    const now = new Date();
    return this.events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getFullYear() === now.getFullYear()
      );
    }).length;
  }

  get eventsThisWeek(): number {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

    return this.events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    }).length;
  }

  setView(view: 'month' | 'week'): void {
    console.log('Visualização alterada para:', view);
    this.currentView = view;
    this.showToastMessage(
      `📱 Visualização alterada para ${view === 'month' ? 'Mês' : 'Semana'}`
    );
  }

  onAddEvent(eventData: IAddEventData): void {
    this.addEvent.emit(eventData);
  }

  onViewEvent(event: ICalendarEvent): void {
    this.viewEvent.emit(event);
  }

  onMonthChanged(monthData: { month: string; year: number }): void {
    console.log('Mês/Período alterado:', monthData);
    this.showToastMessage(
      `📅 Navegando para ${monthData.month} ${monthData.year}`
    );
  }

  onDayClicked(date: Date): void {
    console.log('Dia clicado:', date);

    const eventsOnDay = this.events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });

    if (eventsOnDay.length > 0) {
      this.showToastMessage(
        `📅 ${eventsOnDay.length} evento(s) em ${date.toLocaleDateString(
          'pt-BR'
        )}`
      );
    } else {
      // Mudar para visualização semanal neste dia se não houver eventos
      this.currentView = 'week';
      this.showToastMessage(
        `📊 Mudando para visualização semanal de ${date.toLocaleDateString(
          'pt-BR'
        )}`
      );
    }
  }

  viewEventDetails(event: ICalendarEvent): void {
    this.onViewEvent(event);
  }

  editEvent(event: any): void {
    console.log('Editando evento:', event);
    this.modalData = event;
    this.showEventModal = true;
    this.showToastMessage('✏️ Abrindo editor...');
  }

  duplicateEvent(event: ICalendarEvent): void {
    console.log('Duplicando evento:', event);

    const duplicated: ICalendarEvent = {
      ...event,
      id: Date.now().toString(),
      title: `${event.title} (Cópia)`,
      startTime: this.addHoursToTime(event.startTime, 1),
      endTime: this.addHoursToTime(event.endTime, 1),
    };

    this.events = [...this.events, duplicated];
    this.showToastMessage('📋 Evento duplicado!');
  }

  shareEvent(event: ICalendarEvent): void {
    console.log('Compartilhando evento:', event);

    const shareText = `📅 ${event.title}\n🗓️ ${event.date}\n⏰ ${event.startTime} - ${event.endTime}`;

    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      this.showToastMessage('🔗 Evento copiado para área de transferência!');
    }
  }

  deleteEvent(event: ICalendarEvent): void {
    if (confirm(`Tem certeza que deseja excluir "${event.title}"?`)) {
      this.events = this.events.filter((e) => e.id !== event.id);
      this.showToastMessage('❌ Evento excluído!');
    }
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.modalData = null;
  }

  editEventFromModal(): void {
    this.showToastMessage(
      '✏️ Funcionalidade de edição seria implementada aqui'
    );
    this.closeEventModal();
  }

  exportCalendar(): void {
    const dataStr = JSON.stringify(this.events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `calendario-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    this.showToastMessage('📥 Calendário exportado!');
  }

  addSampleEvents(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sampleEvents: ICalendarEvent[] = [
      {
        id: Date.now().toString(),
        title: 'Reunião de Emergência',
        date: today.toISOString().split('T')[0],
        startTime: '16:00',
        endTime: '17:00',
        color: '#ef4444',
        description: 'Reunião urgente sobre projeto X',
      },
      {
        id: (Date.now() + 1).toString(),
        title: 'Café da Manhã Equipe',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '09:00',
        color: '#10b981',
        description: 'Café da manhã casual com a equipe',
      },
    ];

    this.events.push(...sampleEvents);
    this.showToastMessage('📝 Eventos de exemplo adicionados!');
  }

  clearAllEvents(): void {
    if (confirm('Tem certeza que deseja limpar todos os eventos?')) {
      this.events = [];
      this.showToastMessage('🗑️ Todos os eventos foram removidos!');
    }
  }

  filterEventsByPeriod(
    period: 'today' | 'thisWeek' | 'thisMonth' | 'all'
  ): void {
    const now = new Date();

    switch (period) {
      case 'today':
        const today = now.toISOString().split('T')[0];
        this.events = this.events.filter((event) => event.date === today);
        this.showToastMessage('📅 Mostrando apenas eventos de hoje');
        break;

      case 'thisWeek':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(
          now.setDate(now.getDate() - now.getDay() + 6)
        );
        this.events = this.events.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });
        this.showToastMessage('📊 Mostrando apenas eventos desta semana');
        break;

      case 'thisMonth':
        this.events = this.events.filter((event) => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getMonth() === now.getMonth() &&
            eventDate.getFullYear() === now.getFullYear()
          );
        });
        this.showToastMessage('📅 Mostrando apenas eventos deste mês');
        break;

      case 'all':
        // Recarregar todos os eventos (normalmente viria de uma API)
        this.showToastMessage('🔄 Mostrando todos os eventos');
        break;
    }
  }

  syncViewToCurrentDate(): void {
    // Quando mudar de visualização, manter a data atual sincronizada
    if (this.currentView === 'week') {
      // Lógica para sincronizar semana atual
      this.showToastMessage('🔄 Sincronizando visualização semanal');
    } else {
      // Lógica para sincronizar mês atual
      this.showToastMessage('🔄 Sincronizando visualização mensal');
    }
  }

  announceViewChange(): void {
    const announcement = `Visualização alterada para ${
      this.currentView === 'month' ? 'mensal' : 'semanal'
    }.
                         ${this.events.length} eventos carregados.`;

    // Em uma implementação real, você usaria um serviço de anúncios para screen readers
    console.log('Accessibility announcement:', announcement);
  }
}
