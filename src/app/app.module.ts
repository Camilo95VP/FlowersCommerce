import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { FacturaComponent } from './components/factura/factura.component';
import { ListarFacturasComponent } from './components/listar-facturas/listar-facturas.component';

const routes: Routes = [
  { path: '', redirectTo: '/listar-facturas', pathMatch: 'full' },
  { path: 'factura', component: FacturaComponent },
  { path: 'listar-facturas', component: ListarFacturasComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    FacturaComponent,
    ListarFacturasComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
