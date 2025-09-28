import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ContractsService } from '../contracts/contracts.service';
import { UsersService } from '../users/users.service';
import { Contract } from '../contracts/contract.model';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './contract-history.html',
})
export class ContractHistory implements OnInit {
  userId!: number;
  userName = '';
  items: Contract[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private api: ContractsService,
    private users: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = +(this.route.snapshot.paramMap.get('id') || 0);
    this.refresh();
    this.users.get(this.userId).subscribe(u => {
      if (u) this.userName = `${u.first_name} ${u.last_name}`;
      this.cdr.detectChanges();
    });
  }

  refresh() {
    this.loading = true;
    this.api.listByUser(this.userId).subscribe(rows => {
      this.items = rows.sort((a, b) => (a.start_date > b.start_date ? -1 : 1));
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  renew(c: Contract) {
    const today = new Date().toISOString().slice(0, 10);
    this.api.renew(c, today).subscribe(() => this.refresh());
  }

  terminate(c: Contract) {
    const today = new Date().toISOString().slice(0, 10);
    this.api.terminate(c.contract_id!, today).subscribe(() => this.refresh());
  }
}
