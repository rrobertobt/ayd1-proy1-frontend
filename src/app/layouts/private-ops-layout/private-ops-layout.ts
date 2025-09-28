import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OpsTopNav } from '../../components/partials/ops/ops-top-nav/ops-top-nav';

@Component({
  selector: 'app-private-ops-layout',
  imports: [RouterOutlet, OpsTopNav],
  templateUrl: './private-ops-layout.html',
  styleUrl: './private-ops-layout.css'
})
export class PrivateOpsLayout {

}
