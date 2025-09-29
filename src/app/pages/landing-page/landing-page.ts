import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DefaultTopNav } from '../../partials/landing/default-top-nav/default-top-nav';

@Component({
  selector: 'app-landing-page',
  imports: [ButtonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {

}
