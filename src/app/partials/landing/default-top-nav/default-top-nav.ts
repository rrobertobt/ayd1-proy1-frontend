import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-default-top-nav',
  imports: [ButtonModule, RouterLink],
  templateUrl: './default-top-nav.html',
  styleUrl: './default-top-nav.css'
})
export class DefaultTopNav {

}
