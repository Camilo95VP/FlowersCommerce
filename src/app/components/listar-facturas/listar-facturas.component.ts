import { Component, OnInit } from '@angular/core';
import { FacturaService } from '../../services/factura.service';
import { Factura } from '../../models/factura.model';

@Component({
  selector: 'app-listar-facturas',
  templateUrl: './listar-facturas.component.html',
  styleUrls: ['./listar-facturas.component.css']
})
export class ListarFacturasComponent implements OnInit {
  facturas: Factura[] = [];
  facturaSeleccionada: Factura | null = null;

  constructor(private facturaService: FacturaService) { }

  ngOnInit(): void {
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    this.facturas = this.facturaService.obtenerFacturas();
  }

  verFactura(factura: Factura): void {
    this.facturaSeleccionada = factura;
  }

  eliminarFactura(id: string): void {
    if (confirm('¿Está seguro de eliminar esta factura?')) {
      this.facturaService.eliminarFactura(id);
      this.cargarFacturas();
      if (this.facturaSeleccionada?.id === id) {
        this.facturaSeleccionada = null;
      }
    }
  }

  cerrarDetalle(): void {
    this.facturaSeleccionada = null;
  }

  calcularTotal(productos: any[]): number {
    return productos.reduce((total, producto) => total + producto.valorTotal, 0);
  }

  getTipoDocumento(factura: Factura): string {
    const tipos = [];
    if (factura.cuentaCobro) tipos.push('Cuenta de Cobro');
    if (factura.remision) tipos.push('Remisión');
    if (factura.comprobante) tipos.push('Comprobante');
    if (factura.pedido) tipos.push('Pedido');
    return tipos.join(', ') || 'Sin especificar';
  }
}
