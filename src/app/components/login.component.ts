import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <h2>Iniciar sesión</h2>
      <form (ngSubmit)="onLogin()">
        <input [(ngModel)]="username" name="username" placeholder="Usuario" required />
        <input [(ngModel)]="password" name="password" type="password" placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>
      <div *ngIf="error" class="error">Usuario o contraseña incorrectos</div>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (this.auth.login(this.username, this.password)) {
      this.router.navigate(['/']);
    } else {
      this.error = true;
    }
  }
}
