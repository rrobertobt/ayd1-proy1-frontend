import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { BranchesService } from './branches.service';
import { Branch } from './branch.model';

@Component({
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './branch-list.html',
})
export class BranchList implements OnInit {
  loading = false;
  branches: Branch[] = [];

  constructor(private api: BranchesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.list().subscribe(bs => {
      this.branches = bs;
      this.loading = false;
      this.cdr.detectChanges(); 
    });
  }

  toggleActive(b: Branch) {
    const payload = { ...b, active: !b.active };
    this.api.update(payload).subscribe(val => {
      const i = this.branches.findIndex(x => x.branch_id === val.branch_id);
      if (i > -1) this.branches[i] = val;
      this.branches = [...this.branches];
      this.cdr.detectChanges();  
    });
  }

  delete(id?: number) {
    if (!id) return;
    this.api.remove(id).subscribe(() => {
      this.branches = this.branches.filter(b => b.branch_id !== id);
      this.cdr.detectChanges();  
    });
  }
}
