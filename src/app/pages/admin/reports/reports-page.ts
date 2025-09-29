import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ReportsService, ReportKey } from './reports.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './reports-page.html',
})
export class ReportsPage {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  reportKeys: { key: ReportKey; label: string }[] = [
    { key: 'discounts',        label: 'Descuentos por nivel' },
    { key: 'deliveries',       label: 'Estado de entregas' },
    { key: 'commissions',      label: 'Comisiones por repartidor' },
    { key: 'cancellations',    label: 'Cancelaciones por comercio' },
    { key: 'business-ranking', label: 'Ranking de comercios' },
  ];

  rows: any[] = [];
  columns: string[] = [];

  @ViewChild('reportTable', { static: false })
  reportTable?: ElementRef<HTMLTableElement>;

  constructor(
    private fb: FormBuilder,
    private api: ReportsService,
    private cdr: ChangeDetectorRef
  ) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    this.form = this.fb.group({
      report: ['discounts', Validators.required],
      startDate: [`${yyyy}-${mm}-01`, Validators.required],
      endDate: [`${yyyy}-${mm}-${dd}`, Validators.required],
    });
  }

  private buildColumns(data: any[]): string[] {
    const set = new Set<string>();
    for (const r of data) for (const k of Object.keys(r ?? {})) set.add(k);
    return Array.from(set);
  }

  fetch(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { report, startDate, endDate } = this.form.getRawValue();
    this.loading = true;
    this.errorMsg = '';
    this.api.list(report as ReportKey, { startDate, endDate }).subscribe({
      next: (items) => {
        this.rows = items;
        this.columns = this.buildColumns(items);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.message || 'No se pudo cargar el reporte.';
        this.cdr.detectChanges();
      },
    });
  }

  // ---------- Export helpers ----------
  private async loadScript(src: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  private async ensurePdfMake(): Promise<any> {
    const w = window as any;
    if (!w.pdfMake) {
      await this.loadScript('https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js');
    }
    if (!w.pdfMake.vfs) {
      // IMPORTANT: always wait for vfs to be injected
      await this.loadScript('https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.js');
    }
    return w.pdfMake;
  }

  private filename(ext: string): string {
    const { report, startDate, endDate } = this.form.getRawValue();
    return `${report}-${startDate}_to_${endDate}.${ext}`;
  }

  private downloadBlob(blob: Blob, name: string) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  private dataURLtoBlob(dataUrl: string): Blob {
    const [head, body] = dataUrl.split(',');
    const mime = /data:(.*?);base64/.exec(head)?.[1] || 'application/octet-stream';
    const bin = atob(body);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return new Blob([buf], { type: mime });
  }

  // ---------- Export: Image (PNG) ----------
  async exportImage(): Promise<void> {
    if (!this.reportTable) return;

    const w = window as any;
    if (!w.domtoimage) {
      await this.loadScript('https://cdn.jsdelivr.net/npm/dom-to-image-more@3.3.0/dist/dom-to-image-more.min.js');
    }
    const domtoimage = w.domtoimage;

    const el = this.reportTable.nativeElement;
    const dataUrl: string = await domtoimage.toPng(el, {
      bgcolor: '#ffffff',
      cacheBust: true,
      quality: 1,
      style: { transform: 'scale(1)', 'transform-origin': 'top left' },
    });

    this.downloadBlob(this.dataURLtoBlob(dataUrl), this.filename('png'));
  }

  // ---------- Export: PDF (uses pdfMake with built-in Roboto fonts) ----------
  async exportPdf(): Promise<void> {
    const pdfMake = await this.ensurePdfMake();

    const headers = this.columns.slice();
    const body: any[] = [
      headers.map(h => ({ text: String(h), bold: true, fillColor: '#f1f5f9' })),
    ];

    for (const r of this.rows) {
      const row: any[] = [];
      for (const c of headers) {
        const v = (r as any)?.[c];
        if (v === null || v === undefined) row.push('-');
        else if (typeof v === 'object') {
          try { row.push(JSON.stringify(v)); } catch { row.push(String(v)); }
        } else {
          row.push(String(v));
        }
      }
      body.push(row);
    }

    const landscape = headers.length > 6;
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 20],
      pageOrientation: landscape ? 'landscape' : 'portrait',
      content: [
        { text: 'Reporte', style: 'title', margin: [0, 0, 0, 8] },
        {
          table: { headerRows: 1, widths: Array(headers.length).fill('*'), body },
          layout: 'lightHorizontalLines',
          fontSize: headers.length > 10 ? 7 : 9,
        },
      ],
      styles: { title: { fontSize: 12, bold: true } },
    };

    pdfMake.createPdf(docDefinition).download(this.filename('pdf'));
  }

  // ---------- Export: Excel (SheetJS) ----------
  async exportExcel(): Promise<void> {
    const headers = this.columns.slice();
    const matrix: (string | number | null)[][] = [headers];

    for (const r of this.rows) {
      const row: (string | number | null)[] = [];
      for (const c of headers) {
        const v = (r as any)?.[c];
        if (v === null || v === undefined) row.push(null);
        else if (typeof v === 'object') {
          try { row.push(JSON.stringify(v)); } catch { row.push(String(v)); }
        } else if (typeof v === 'number') row.push(v);
        else row.push(String(v));
      }
      matrix.push(row);
    }

    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(matrix);
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, this.filename('xlsx'));
  }

  // render cell
  formatCell(row: any, col: string): string {
    const v = row?.[col];
    if (v === null || v === undefined) return '-';
    if (typeof v === 'object') {
      try { return JSON.stringify(v); } catch { return String(v); }
    }
    return String(v);
  }
}
