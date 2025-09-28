import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ContractsService } from './contracts.service';
import { Contract, ContractTypeRef } from './contract.model';

@Component({
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './contract-list.html',
})
export class ContractList implements OnInit {
  loading = false;
  errorMsg = '';
  items: Contract[] = [];
  types = new Map<number, string>();

  constructor(private api: ContractsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.listTypes().subscribe(t => this.types = new Map(t.map(x => [x.contract_type_id, x.type_name])));
    this.api.list().subscribe({
      next: rows => { this.items = rows; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load contracts.'; }
    });
  }

  typeName(id: number) { return this.types.get(id) || '-'; }

  delete(id?: number) {
    if (!id) return;
    this.api.remove(id).subscribe(() => { this.items = this.items.filter(x => x.contract_id !== id); this.cdr.detectChanges(); });
  }
}
