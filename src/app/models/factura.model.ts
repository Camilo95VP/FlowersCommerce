export interface ProductoFactura {
  cantidad: number;
  descripcion: string;
  valorUnidad: number;
  valorTotal: number;
}

export interface Factura {
  // Nombre del archivo PDF
  nombrePDF: string;
  // Tipo de documento
  cuentaCobro: boolean;
  remision: boolean;
  comprobante: boolean;
  pedido: boolean;
  numero: string;
  
  // Información del cliente
  cliente: string;
  cedula: string;
  direccion: string;
  telefono: string;
  contado: boolean;
  credito: boolean;
  plazo: string;
  fechaTransaccion: string;
  
  // Productos
  productos: ProductoFactura[];
  
  // Totales
  subtotal: number;
  total: number;
  
  // Información adicional
  vendedor: string;
  
  // Metadata
  id?: string;
  fechaCreacion?: Date;
}