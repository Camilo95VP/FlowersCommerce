import { Injectable } from '@angular/core';
import { Factura } from '../models/factura.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private readonly STORAGE_KEY = 'facturas';

  constructor() { }

  // Obtener todas las facturas del localStorage
  obtenerFacturas(): Factura[] {
    const facturas = localStorage.getItem(this.STORAGE_KEY);
    return facturas ? JSON.parse(facturas) : [];
  }

  // Guardar factura en localStorage
  guardarFactura(factura: Factura): string {
    factura.id = this.generarId();
    factura.fechaCreacion = new Date();
    
    const facturas = this.obtenerFacturas();
    facturas.push(factura);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(facturas));
    return factura.id;
  }

  // Obtener factura por ID
  obtenerFacturaPorId(id: string): Factura | null {
    const facturas = this.obtenerFacturas();
    return facturas.find(f => f.id === id) || null;
  }

  // Eliminar factura
  eliminarFactura(id: string): void {
    const facturas = this.obtenerFacturas();
    const facturasFiltradas = facturas.filter(f => f.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(facturasFiltradas));
  }

  // Generar PDF de la factura
  async generarPDF(elementoHTML: HTMLElement, numeroFactura: string): Promise<void> {
    const canvas = await html2canvas(elementoHTML, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 190;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 15;
    
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 15;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`factura-${numeroFactura}.pdf`);
  }

  // Generar ID único para la factura
  private generarId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Calcular totales de la factura
  calcularTotales(productos: any[]): { subtotal: number, total: number } {
    const subtotal = productos.reduce((sum, producto) => {
      return sum + (producto.valorTotal || 0);
    }, 0);
    
    // Podrías agregar impuestos aquí si es necesario
    const total = subtotal;
    
    return { subtotal, total };
  }
}