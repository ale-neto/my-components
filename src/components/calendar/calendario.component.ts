import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  currentView: 'month' | 'week' = 'month';
  maxVisibleEvents: number = 3;

  @Input() timeRange: ITimeRange = {
    startTime: 9,
    endTime: 17,
    interval: 30,
  };

  @Input() dateRange: IDateRange = {
    startDate: '2025-07-01',
    endDate: '2025-07-31',
  };

  @Input() events: ICalendarEvent[] = [
    {
      id: '1',
      title: 'Daily Stand-up',
      date: '2025-07-21',
      startTime: '09:00',
      endTime: '09:30',
      color: '#3b82f6',
      description: 'Reunião diária da equipe',
    },
    {
      id: '2',
      title: 'Code Review',
      date: '2025-07-21',
      startTime: '10:00',
      endTime: '11:30',
      color: '#8b5cf6',
      description: 'Revisão do código da nova funcionalidade',
    },
    {
      id: '3',
      title: 'Almoço Cliente',
      date: '2025-07-21',
      startTime: '12:00',
      endTime: '14:00',
      color: '#10b981',
      description: 'Reunião de negócios',
    },
    {
      id: '4',
      title: 'Apresentação Q2',
      date: '2025-07-21',
      startTime: '15:00',
      endTime: '16:30',
      color: '#f59e0b',
      description: 'Apresentação dos resultados',
    },
    {
      id: '5',
      title: 'Sprint Planning',
      date: '2025-07-22',
      startTime: '09:00',
      endTime: '12:00',
      color: '#ef4444',
      description: 'Planejamento do próximo sprint',
    },
    {
      id: '6',
      title: '1:1 com Manager',
      date: '2025-07-22',
      startTime: '14:00',
      endTime: '15:00',
      color: '#6366f1',
      description: 'Conversa individual',
    },
    {
      id: '7',
      title: 'Workshop React',
      date: '2025-07-23',
      startTime: '09:30',
      endTime: '12:30',
      color: '#8b5cf6',
      description: 'Workshop interno',
    },
    {
      id: '8',
      title: 'Dentista',
      date: '2025-07-23',
      startTime: '16:00',
      endTime: '17:00',
      color: '#06b6d4',
      description: 'Consulta odontológica',
    },
    {
      id: '9',
      title: 'Team Building',
      date: '2025-07-24',
      startTime: '14:00',
      endTime: '18:00',
      color: '#10b981',
      description: 'Atividade de integração',
    },
    {
      id: '10',
      title: 'Deploy Produção',
      date: '2025-07-25',
      startTime: '10:00',
      endTime: '12:00',
      color: '#ef4444',
      description: 'Deploy da nova versão',
    },
    // Eventos adicionais para demonstrar o mês
    {
      id: '11',
      title: 'Reunião Mensal',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      color: '#3b82f6',
      description: 'Reunião mensal da diretoria',
    },
    {
      id: '12',
      title: 'Treinamento',
      date: '2025-07-15',
      startTime: '14:00',
      endTime: '17:00',
      color: '#8b5cf6',
      description: 'Treinamento de novas tecnologias',
    },
    {
      id: '13',
      title: 'Retrospectiva',
      date: '2025-07-31',
      startTime: '15:00',
      endTime: '16:00',
      color: '#f59e0b',
      description: 'Retrospectiva do mês',
    },
  ];

  @Input() eventActions: ICalendarAction[] = [
    {
      name: '👁️ Visualizar',
      method: (event: ICalendarEvent) => this.viewEventDetails(event),
    },
    {
      name: '✏️ Editar',
      method: (event: ICalendarEvent) => this.editEvent(event),
    },
    {
      name: '📋 Duplicar',
      method: (event: ICalendarEvent) => this.duplicateEvent(event),
    },
    {
      name: '🔗 Compartilhar',
      method: (event: ICalendarEvent) => this.shareEvent(event),
    },
    {
      name: '❌ Excluir',
      method: (event: ICalendarEvent) => this.deleteEvent(event),
    },
  ];

  showEventModal: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  modalData: any = null;

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
    this.currentView = view;
    this.showToastMessage(
      `📱 Visualização alterada para ${view === 'month' ? 'Mês' : 'Semana'}`
    );
  }

  onAddEvent(eventData: IAddEventData): void {
    console.log('Adicionando evento:', eventData);

    const newEvent: ICalendarEvent = {
      id: Date.now().toString(),
      title: 'Novo Evento',
      date: eventData.date.toISOString().split('T')[0],
      startTime: eventData.startTime,
      endTime: this.addHoursToTime(eventData.startTime, 1),
      color: this.getRandomColor(),
      description: 'Clique para editar este evento',
    };

    this.events = [...this.events, newEvent];
    this.showToastMessage('✅ Evento criado com sucesso!');
  }

  onViewEvent(event: ICalendarEvent): void {
    console.log('Visualizando evento:', event);
    this.modalData = event;
    this.showEventModal = true;
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

  // Ações do menu de contexto
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

  // Modal
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

  // Utilitários
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

  // Métodos de demonstração
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

  // Métodos para filtrar eventos por período
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

  // Sincronização entre visualizações
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

  // Métodos para acessibilidade
  announceViewChange(): void {
    const announcement = `Visualização alterada para ${
      this.currentView === 'month' ? 'mensal' : 'semanal'
    }.
                         ${this.events.length} eventos carregados.`;

    // Em uma implementação real, você usaria um serviço de anúncios para screen readers
    console.log('Accessibility announcement:', announcement);
  }

  // Método para debug
  debugCalendarState(): void {
    console.log('=== CALENDAR DEBUG STATE ===');
    console.log('Current View:', this.currentView);
    console.log('Events Count:', this.events.length);
    console.log('Events This Month:', this.eventsThisMonth);
    console.log('Events This Week:', this.eventsThisWeek);
    console.log('Time Range:', this.timeRange);
    console.log('Date Range:', this.dateRange);
    console.log('Max Visible Events (Month):', this.maxVisibleEvents);
    console.log('All Events:', this.events);
  }
}
