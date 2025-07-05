# OpenRoute

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Development server with HTTPS

To run the Angular development server with HTTPS (using your own certificates):

1. Generate certificates (if you haven't already):
   ```sh
   openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem
   ```
2. Start the dev server with HTTPS:
   ```sh
   ng serve --ssl true --ssl-key key.pem --ssl-cert cert.pem
   ```

- The app will be available at `https://localhost:4200/`.
- You can combine with `--host 0.0.0.0` to access from your local network.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Execute Production PWA (HTTPS, SPA, Installable)

To serve the application as an installable PWA with HTTPS:

1. **Generate certificates (only the first time):**
   ```sh
   openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem
   ```
2. **Build for production:**
   ```sh
   ng build --configuration production
   ```
3. **Serve the app with HTTPS and SPA routing:**
   - **Recommended (high port, no sudo):**
     ```sh
     npx http-server ./dist/open-route/browser -S -C cert.pem -K key.pem -P https://localhost:4443 -p 4443
     ```
   - **Port 443 (requires sudo):**
     ```sh
     sudo npx http-server ./dist/open-route/browser -S -C cert.pem -K key.pem -P https://localhost:443 -p 443
     ```

4. **Open** `https://localhost:4443` (or the port you chose) in Chrome/Edge/Firefox.

5. **Install the app:**
   - You will see the install icon in the address bar or browser menu.
   - If not, make sure you are using HTTPS and both the manifest and service worker are loaded (check DevTools > Application).

> The `-P` flag is required for SPA routing and PWA installability.
