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
  styles: [`
    .login-container { max-width: 300px; margin: 80px auto; padding: 2em; border-radius: 8px; background: #fff; box-shadow: 0 2px 8px #0001; }
    input { display: block; width: 100%; margin-bottom: 1em; padding: 0.5em; }
    button { width: 100%; padding: 0.7em; background: #1976d2; color: #fff; border: none; border-radius: 4px; }
    .error { color: #d32f2f; margin-top: 1em; }
  `]
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
