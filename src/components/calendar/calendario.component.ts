import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IAddEventData, ICalendarAction, ICalendarEvent, ITimeRange } from './interfaces';
import { VisualizacaoMensalComponent } from './mes';
import { WeekViewComponent } from './semana';

@Component({
  standalone: false,
  selector: 'app-calendar',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarioComponent {
  // @ViewChild(VisualizacaoMensalComponent)
  // mesComponent!: VisualizacaoMensalComponent;
  // @ViewChild(WeekViewComponent)
  // semanaComponent!: WeekViewComponent;
  // @Input() viewMode: 'mes' | 'semana' = 'semana';
  // @Input() eventos: ICalendarEvent[] = [];
  // @Input() desabilitarAdicionarEvento = false;
  // @Input() desabilitarIrParaProximoMes = false;
  // @Input() desabilitarIrParaMesAnterior = false;
  // @Input() configPeriodoDiaSemana!: {
  //   inicio: number;
  //   fim: number;
  //   intervalo?: number;
  // };
  // @Input() periodoMarcadoParaEventos!: { dataInicial: string; dataFim: string };
  // @Input() acoesEvento: { nome: string; metodo: (evento: any) => void }[] = [];
  // @Output() cliqueAdicionarEvento = new EventEmitter<{ data: Date }>();
  // @Output() cliqueVisualizarEvento = new EventEmitter<ICalendarEvent>();
  // mesAtual: string = '';
  // anoAtual: number = 0;

  // constructor(private cdr: ChangeDetectorRef) {}

  // ngOnInit() {
  //   const referencia = this.periodoMarcadoParaEventos?.dataInicial
  //     ? new Date(this.periodoMarcadoParaEventos?.dataInicial + 'T00:00:00')
  //     : new Date();

  //   const nomeMes = referencia.toLocaleString('pt-BR', { month: 'long' });
  //   this.mesAtual = nomeMes.toUpperCase();
  //   this.anoAtual = referencia.getFullYear();
  // }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (
  //     changes['eventos'] ||
  //     changes['configPeriodoDiaSemana'] ||
  //     changes['periodoMarcadoParaEventos']
  //   ) {
  //     this.cdr.markForCheck();
  //   }
  // }

  // mudarVisao(tipo: 'semana' | 'mes') {
  //   const referencia = this.periodoMarcadoParaEventos?.dataInicial
  //     ? new Date(this.periodoMarcadoParaEventos?.dataInicial + 'T00:00:00')
  //     : new Date();

  //   const nomeMes = referencia.toLocaleString('pt-BR', { month: 'long' });
  //   this.mesAtual = nomeMes.toUpperCase();
  //   this.anoAtual = referencia.getFullYear();
  //   this.viewMode = tipo;
  // }

  // getCurrentMonth(): string {
  //   return new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
  // }

  // goToPreviousWeek() {
  //   this.semanaComponent.goPreviousWeek();
  // }

  // goToNextWeek() {
  //   this.semanaComponent.goNextWeek();
  // }

  // goToPreviousMonth() {
  //   this.mesComponent.irParaMesAnterior();
  // }

  // goToNextMonth() {
  //   this.mesComponent.irParaProximoMes();
  // }

  // goToCurrentWeek() {
  //   this.semanaComponent.goCurrentWeek();
  // }

  // goToCurrentMonth() {
  //   this.mesComponent.irParaMesAtual();
  // }

  // atualizarMes(evento: { mes: string; ano: number }) {
  //   this.mesAtual = evento.mes.toUpperCase();
  //   this.anoAtual = evento.ano;
  // }

  events: ICalendarEvent[] = [
    {
      id: '1',
      title: 'Reunião de Equipe',
      date: '2025-07-21', // Segunda-feira
      startTime: '09:00',
      endTime: '10:30',
      color: '#3b82f6', // Azul
      description: 'Reunião semanal da equipe de desenvolvimento'
    },
    {
      id: '2',
      title: 'Apresentação Cliente',
      date: '2025-07-21',
      startTime: '14:00',
      endTime: '15:30',
      color: '#10b981', // Verde
      description: 'Apresentação do projeto para o cliente'
    },
    {
      id: '3',
      title: 'Code Review',
      date: '2025-07-22', // Terça-feira
      startTime: '10:00',
      endTime: '11:00',
      color: '#f59e0b', // Amarelo
      description: 'Revisão de código da nova funcionalidade'
    },
    {
      id: '4',
      title: 'Almoço com Sarah',
      date: '2025-07-23', // Quarta-feira
      startTime: '12:00',
      endTime: '13:30',
      color: '#ef4444', // Vermelho
      description: 'Almoço de negócios'
    },
    {
      id: '5',
      title: 'Sprint Planning',
      date: '2025-07-24', // Quinta-feira
      startTime: '09:00',
      endTime: '12:00',
      color: '#8b5cf6', // Roxo
      description: 'Planejamento do próximo sprint'
    }
  ];

  // Configuração de horário (9h às 18h, intervalos de 30 min)
  timeConfig: ITimeRange = {
    startTime: 9,
    endTime: 18,
    interval: 30
  };

  // Ações do menu de contexto
  eventActions: ICalendarAction[] = [
    {
      name: 'Editar',
      method: (event: ICalendarEvent) => this.editEvent(event)
    },
    {
      name: 'Duplicar',
      method: (event: ICalendarEvent) => this.duplicateEvent(event)
    },
    {
      name: 'Excluir',
      method: (event: ICalendarEvent) => this.deleteEvent(event)
    }
  ];

  // Variável para mostrar mensagens
  message: string = '';

  // Handlers dos eventos do calendário
  handleAddEvent(eventData: IAddEventData): void {
    const newEvent: ICalendarEvent = {
      id: Date.now().toString(),
      title: 'Novo Evento',
      date: eventData.date.toISOString().split('T')[0],
      startTime: eventData.startTime,
      endTime: this.addMinutes(eventData.startTime, 60), // 1 hora de duração
      color: '#6366f1',
      description: 'Evento criado rapidamente'
    };

    this.events = [...this.events, newEvent];
  }

  handleViewEvent(event: ICalendarEvent): void {
    this.showMessage(`👁️ Visualizando: ${event.title} (${event.startTime} - ${event.endTime})`);
  }

  handleMonthChange(data: { month: string; year: number }): void {
    this.showMessage(`📅 Navegando para ${data.month} ${data.year}`);
  }

  // Ações do menu de contexto
  editEvent(event: ICalendarEvent): void {
    this.showMessage(`✏️ Editando evento: ${event.title}`);
    // Aqui você abriria um modal ou navegaria para página de edição
  }

  duplicateEvent(event: ICalendarEvent): void {
    const duplicated: ICalendarEvent = {
      ...event,
      id: Date.now().toString(),
      title: `${event.title} (Cópia)`,
      startTime: this.addMinutes(event.startTime, 60),
      endTime: this.addMinutes(event.endTime, 60)
    };

    this.events = [...this.events, duplicated];
    this.showMessage(`📋 Evento duplicado: ${duplicated.title}`);
  }

  deleteEvent(event: ICalendarEvent): void {
    if (confirm(`Deseja excluir "${event.title}"?`)) {
      this.events = this.events.filter(e => e.id !== event.id);
      this.showMessage(`❌ Evento excluído: ${event.title}`);
    }
  }

  // Utilitários
  private addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(n => parseInt(n, 10));
    const totalMinutes = h * 60 + m + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;

    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  private showMessage(msg: string): void {
    this.message = msg;
    // Auto-limpar mensagem após 3 segundos
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
