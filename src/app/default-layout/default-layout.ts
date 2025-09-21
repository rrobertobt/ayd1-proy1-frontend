import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DefaultTopNav } from '../partials/landing/default-top-nav/default-top-nav';
import { DefaultFooter } from '../partials/landing/default-footer/default-footer';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, DefaultTopNav, DefaultFooter],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.css'
})
export class DefaultLayout {

}
