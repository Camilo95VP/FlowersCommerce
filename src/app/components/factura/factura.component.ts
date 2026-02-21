import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FacturaService } from '../../services/factura.service';
import { Factura, ProductoFactura } from '../../models/factura.model';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css']
})
export class FacturaComponent implements OnInit {
  @ViewChild('facturaTemplate', { static: false }) facturaTemplate!: ElementRef;
  
  facturaForm: FormGroup;
  mostrarVistaPrevia = false;
  facturaGuardada: Factura | null = null;
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private facturaService: FacturaService,
    private cdr: ChangeDetectorRef
  ) {
    this.facturaForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.agregarProducto(); // Agregar una fila inicial
  }

  generarCodigoAlfanumerico(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 5; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      // Nombre del PDF
      nombrePDF: ['', Validators.required],
      // Tipo de documento
      cuentaCobro: [false],
      remision: [false],
      comprobante: [false],
      pedido: [false],
      numero: [{ value: this.generarCodigoAlfanumerico(), disabled: true }],
      
      // Información del cliente
      cliente: ['', Validators.required],
      cedula: ['', Validators.required],
      direccion: [''],
      telefono: [''],
      contacto: [''],
      credito: [false],
      plazo: [''],
      fechaTransaccion: [this.obtenerFechaActual(), Validators.required],
      
      // Productos
      productos: this.fb.array([]),
      
      // Vendedor
      vendedor: ['RAMIRO CASTAÑEDA RIOS', Validators.required]
    });
  }

  get productos(): FormArray {
    return this.facturaForm.get('productos') as FormArray;
  }

  crearProductoFormGroup(): FormGroup {
    return this.fb.group({
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      descripcion: ['', Validators.required],
      valorUnidad: [0, [Validators.required, Validators.min(0.01)]],
      valorTotal: [{ value: 0, disabled: true }]
    });
  }

  agregarProducto(): void {
    const productoGroup = this.crearProductoFormGroup();
    
    // Escuchar cambios en cantidad y valor unitario para calcular total
    productoGroup.get('cantidad')?.valueChanges.subscribe(() => this.calcularTotalProducto(productoGroup));
    productoGroup.get('valorUnidad')?.valueChanges.subscribe(() => this.calcularTotalProducto(productoGroup));
    
    this.productos.push(productoGroup);
  }

  eliminarProducto(index: number): void {
    this.productos.removeAt(index);
  }

  calcularTotalProducto(productoGroup: FormGroup): void {
    const cantidad = productoGroup.get('cantidad')?.value || 0;
    const valorUnidad = productoGroup.get('valorUnidad')?.value || 0;
    const total = cantidad * valorUnidad;
    
    productoGroup.get('valorTotal')?.setValue(total, { emitEvent: false });
  }

  calcularSubtotal(): number {
    return this.productos.controls.reduce((total, control) => {
      return total + (control.get('valorTotal')?.value || 0);
    }, 0);
  }

  calcularTotal(): number {
    return this.calcularSubtotal(); // Podrías agregar impuestos aquí
  }

  obtenerFechaActual(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  guardarFactura(): void {
    if (this.facturaForm.valid && this.productos.length > 0) {
      const formValue = this.facturaForm.getRawValue();
      const factura: Factura = {
        ...formValue,
        subtotal: this.calcularSubtotal(),
        total: this.calcularTotal()
      };
      
      const id = this.facturaService.guardarFactura(factura);
      this.facturaGuardada = { ...factura, id };
      alert('Factura guardada exitosamente!');
    } else {
      alert('Por favor complete todos los campos requeridos y agregue al menos un producto.');
    }
  }

  async generarPDF(): Promise<void> {
    if (!this.facturaGuardada) {
      alert('Primero debes guardar la factura');
      return;
    }
    
    this.mostrarVistaPrevia = true;
    this.cdr.detectChanges(); // Forzar renderizado del template
    
    // Esperar a que se renderice la vista previa
    setTimeout(async () => {
      try {
        if (!this.facturaTemplate) {
          throw new Error('No se pudo encontrar el template de la factura');
        }
        const nombreArchivo = this.facturaGuardada!.nombrePDF || this.facturaGuardada!.numero;
        await this.facturaService.generarPDF(this.facturaTemplate.nativeElement, nombreArchivo);
        alert('PDF generado exitosamente!');
      } catch (error) {
        alert('Error al generar el PDF');
        console.error(error);
      } finally {
        this.mostrarVistaPrevia = false;
      }
    }, 500);
  }

  nuevaFactura(): void {
    this.facturaForm.reset();
    this.facturaForm.patchValue({
      fechaTransaccion: this.obtenerFechaActual(),
      numero: this.generarCodigoAlfanumerico(),
      vendedor: 'RAMIRO CASTAÑEDA RIOS'
    });
    this.productos.clear();
    this.agregarProducto();
    this.facturaGuardada = null;
    this.mostrarVistaPrevia = false;
  }
}
