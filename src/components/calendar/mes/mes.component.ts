import { formatDate } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ICalendarioEvento } from '../interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule ],
  selector: 'app-visualizacao-mensal',
  templateUrl: './mes.component.html',
  styleUrls: ['./mes.component.scss'],
})
export class VisualizacaoMensalComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
  @Input() eventos: Array<ICalendarioEvento> = [];
  @Input() desabilitarAdicionarEvento = false;
  @Input() desabilitarIrParaProximoMes = false;
  @Input() desabilitarIrParaMesAnterior = false;
  @Input() dataInicial?: string;
  @Input() periodoMarcadoParaEventos?: { dataInicial: string; dataFim: string };
  @Output() cliqueAdicionarEvento = new EventEmitter<{ data: Date }>();
  @Output() cliqueVisualizarEvento = new EventEmitter<ICalendarioEvento>();
  @Output() mesMudou = new EventEmitter<{ mes: string; ano: number }>();
  @Input() acoesEvento: { nome: string; metodo: (evento: any) => void }[] = [];
  menuVisivel = false;
  posicaoMenu = { top: '0px', left: '0px' };
  eventoSelecionado: any;
  @HostBinding('calendario.modo-compacto') modoCompacto = false;
  private observadorDeRedimensionamento!: ResizeObserver;
  private indiceMesAtual = 0;
  private diasMarcados: string[] = [];
  mesAtual!: string;
  anoAtual!: number;
  diasNoMes: string[] = [];
  popoverAberto = false;
  diaSelecionado: string | null = null;
  diaAtual!: string;
  diasDaSemana: string[] = [
    'Dom.',
    'Seg.',
    'Ter.',
    'Qua.',
    'Qui.',
    'Sex.',
    'Sáb.',
  ];

  constructor(private elementoRef: ElementRef, private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.observadorDeRedimensionamento = new ResizeObserver((entradas) => {
      for (const entrada of entradas) {
        const largura = entrada.contentRect.width;
        this.modoCompacto = largura < 600;
        this.cd.detectChanges();
      }
    });

    this.observadorDeRedimensionamento.observe(
      this.elementoRef.nativeElement.querySelector('.calendario')
    );
  }

  ngOnDestroy(): void {
    this.observadorDeRedimensionamento.disconnect();
  }

  ngOnInit() {
    const { dataInicial, dataFim } = this.periodoMarcadoParaEventos || {};

    const referencia = dataInicial
      ? new Date(dataInicial + 'T00:00:00')
      : new Date();

    this.anoAtual = referencia.getFullYear();
    this.indiceMesAtual = referencia.getMonth();
    this.diaAtual = this.normalizarData(new Date().toISOString());
    this.dataInicial = this.normalizarData(referencia.toISOString());

    if (dataInicial && dataFim) {
      this.marcarDiasEntre({ dataInicial, dataFim });
    }

    this.atualizarMesEDias();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['periodoMarcadoParaEventos']) {
      const { dataInicial, dataFim } =
        changes['periodoMarcadoParaEventos'].currentValue || {};
      if (dataInicial && dataFim) {
        this.marcarDiasEntre({ dataInicial, dataFim });
      }
    }
  }

  private marcarDiasEntre({
    dataInicial,
    dataFim,
  }: {
    dataInicial: string;
    dataFim: string;
  }): void {
    this.diasMarcados = [];

    const inicio = new Date(dataInicial);
    const fim = new Date(dataFim);

    const current = new Date(inicio);
    while (current <= fim) {
      this.diasMarcados.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  }

  private gerarDiasDoMes(ano: number, indiceMes: number): string[] {
    const diasNoMes = new Date(ano, indiceMes + 1, 0).getDate();
    const primeiroDiaDaSemana = new Date(ano, indiceMes, 1).getDay();

    const diasDoMesAtual = Array.from({ length: diasNoMes }, (_, i) =>
      new Date(ano, indiceMes, i + 1).toISOString()
    );

    const diasDoMesAnterior = Array.from(
      { length: primeiroDiaDaSemana },
      (_, i) => {
        const data = new Date(ano, indiceMes, -(primeiroDiaDaSemana - 1 - i));
        return data.toISOString();
      }
    );

    const totalDeDias = diasDoMesAnterior.length + diasDoMesAtual.length;

    const diasDoProximoMes = Array.from(
      { length: 42 - totalDeDias },
      (_, i) => {
        const data = new Date(ano, indiceMes + 1, i + 1);
        return data.toISOString();
      }
    );

    return [...diasDoMesAnterior, ...diasDoMesAtual, ...diasDoProximoMes];
  }

  private normalizarData(data: string): string {
    return formatDate(data, 'dd/MM/yyyy', 'pt-BR');
  }

  private alterarMes(passo: number) {
    this.indiceMesAtual += passo;
    if (this.indiceMesAtual < 0) {
      this.indiceMesAtual = 11;
      this.anoAtual--;
    } else if (this.indiceMesAtual > 11) {
      this.indiceMesAtual = 0;
      this.anoAtual++;
    }
    this.atualizarMesEDias();
  }

  private emitirMudancaDeMes() {
    this.mesMudou.emit({ mes: this.mesAtual, ano: this.anoAtual });
  }

  private atualizarMesEDias() {
    const mes = formatDate(
      new Date(this.anoAtual, this.indiceMesAtual),
      'MMMM',
      'pt-BR'
    );
    this.mesAtual = mes.charAt(0).toUpperCase() + mes.slice(1);
    this.diasNoMes = this.gerarDiasDoMes(this.anoAtual, this.indiceMesAtual);
  }

  adicionarEvento(dataInicio: string | Date) {
    const data = new Date(dataInicio);
    this.cliqueAdicionarEvento.emit({ data });
  }

  obterEventosDoDia(dia: string): ICalendarioEvento[] {
    return this.eventos.filter(
      (evento) => this.normalizarData(evento.data) === this.normalizarData(dia)
    );
  }

  obterEstiloDoEvento(cor: string): Record<string, string> {
    return { backgroundColor: cor };
  }

  alternarPopover(dia: string, evento: Event) {
    evento.stopPropagation();
    this.popoverAberto =
      this.diaSelecionado === dia ? !this.popoverAberto : true;
    this.diaSelecionado = dia;
  }

  fecharPopover(evento: Event) {
    evento.stopPropagation();
    this.popoverAberto = false;
    this.diaSelecionado = null;
  }

  irParaMesAnterior() {
    this.alterarMes(-1);
    this.emitirMudancaDeMes();
  }

  irParaProximoMes() {
    this.alterarMes(1);
    this.emitirMudancaDeMes();
  }

  irParaMesAtual() {
    const agora = new Date();
    this.anoAtual = agora.getFullYear();
    this.indiceMesAtual = agora.getMonth();
    this.atualizarMesEDias();
    this.emitirMudancaDeMes();
  }

  verificarMesmoDia(dia: string, diaAtual: string): boolean {
    const diaNormalizado = this.normalizarData(dia);
    return diaNormalizado === diaAtual;
  }

  verificarDiaMarcado(data: string): boolean {
    return this.diasMarcados.includes(data);
  }

  abrirMenu(event: MouseEvent, evento: any) {
    event.preventDefault();
    this.menuVisivel = true;
    this.eventoSelecionado = evento;
    this.posicaoMenu = {
      top: event.clientY + 'px',
      left: event.clientX + 'px',
    };
  }

  executarAcao(callback: (evento: any) => void) {
    callback(this.eventoSelecionado);
    this.menuVisivel = false;
  }

  fecharMenu() {
    this.menuVisivel = false;
  }

  get podeNavegar(): { anterior: boolean; proximo: boolean } {
    const agora = new Date();
    const estaNoMesAtual =
      this.anoAtual === agora.getFullYear() &&
      this.indiceMesAtual === agora.getMonth();
    return {
      anterior: this.desabilitarIrParaMesAnterior && estaNoMesAtual,
      proximo: this.desabilitarIrParaProximoMes && estaNoMesAtual,
    };
  }
}
