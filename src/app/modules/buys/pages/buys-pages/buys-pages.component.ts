import { Component, computed, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2'

//angular/material
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { CdkTableModule } from '@angular/cdk/table';
import { MatTableModule } from '@angular/material/table';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

//interfaces
import { Producto } from '../../../../core/interfaces/producto.interface';
import { DetalleCompra } from '../../../../core/interfaces/detallecompra.interface';
import { Compra } from '../../../../core/interfaces/compra.interface';
import { Proveedor } from '../../../../core/interfaces/proveedor.interface';

//servicios
import { CompraService } from '../../services/compra.service';
import { ProductoCompraService } from '../../services/producto-compra.service';
import { ProveedorCompraService } from '../../services/proveedor-compra.service'
import { UtilidadService } from '../../../../services/utilidad.service';

//PrimeNG
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-buys-pages',
  imports: [
    CommonModule,
    MatDialogModule,
    MatGridListModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    CdkTableModule,
    MatTableModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    TableModule,
    BadgeModule,
    ButtonModule
  ],
  templateUrl: './buys-pages.component.html',
  styleUrl: './buys-pages.component.scss'
})
export class BuysPagesComponent {
  //PROPIEDADES Y VARIABLES
  listaProductos: Producto[]=[]//Contiene los productos activos con stock mayor a 0.
  listaProductosFiltro: Producto[]=[]//Se usa para almacenar los medicamentos filtrados en el buscador.
  listaProductosParaCompra: DetalleCompra[]=[]//Lista de productos seleccionados para la venta.
  productoSeleccionado!: Producto//Almacena el producto seleccionado.

  listaProveedores: Proveedor[]=[]
  listaProveedorFiltro:Proveedor[]=[]
  proveedorSeleccionado!: Proveedor//Almacena el proveedor seleccionado.

  bloquearBotonRegistro: boolean = false
  tipoPagoDefecto: string = 'Efectivo'
  totalApagar: number = 0

  formularioProductoCompra: FormGroup;
  columnasTabla: string[] = ["producto","cantidad","precio","total","accion"];
  datosDetalleCompra = new MatTableDataSource(this.listaProductosParaCompra);

   //FUNCION QUE NOS SIRVE PARA BUSCAR EL PRODUCTO POR SU NOMBRE
   retornaProductosPorFiltro(search: string | Producto):Producto[]{
    const valorBuscado = typeof search === 'string' ? search.toLocaleLowerCase(): search.nombre.toLocaleLowerCase();
    return this.listaProductos.filter(item => item.nombre.toLocaleLowerCase().includes(valorBuscado))
  }

  retornaProveedoresPorFiltro(search: string | Proveedor): Proveedor[] {
    const valorBuscado = typeof search === 'string' ? search.toLocaleLowerCase() : search.nombre.toLocaleLowerCase();
    return this.listaProveedores.filter(item => item.nombre.toLocaleLowerCase().includes(valorBuscado));
  }

  constructor(
    private fb: FormBuilder,
    private productoCompraService: ProductoCompraService,
    private compraService: CompraService,
    private proveedorCompraServioce: ProveedorCompraService,
    private utilidadService: UtilidadService
  ){
    this.formularioProductoCompra = this.fb.nonNullable.group({
      producto:["",[Validators.required]],
      proveedor:["",[Validators.required]],
      cantidad:["",[Validators.required, Validators.min(1)]]
    })

    //cargamos lista de productos
    this.productoCompraService.lista()
    .subscribe({
      next:(data) => {
        if (data.status) {
          const lista = data.value as Producto[];
          this.listaProductos = lista.filter(p => p.esActivo == 1 && p.stock >= 0)
        }
      },
      error: (e) => {}
    })
    //filtrado automatico de productos
    this.formularioProductoCompra.get('producto')?.valueChanges
    .subscribe(value => {
      this.listaProductosFiltro = this.retornaProductosPorFiltro(value)
    })

    this.proveedorCompraServioce.lista()
    .subscribe({
      next: (data) => {
        if (data.status)
          this.listaProveedores = data.value
          this.listaProveedorFiltro = data.value; // Inicializa listaProveedorFiltro con todos los proveedores
      },
      error: (e) => {
        console.error('Error al cargar proveedores', e);
      }
    })
    this.formularioProductoCompra.get('proveedor')?.valueChanges
    .subscribe(value => {
      this.listaProveedorFiltro = this.retornaProveedoresPorFiltro(value);
    });

  }

  //METODO PARA MOSTRAR EL NOMBRE DEL PRODUCTO SELECCIONADO
  mostrarProducto(producto: Producto): string {
    return producto.nombre
  }

  //ASIGNAR EL PRODUCTO SELECCIONADO AL OBJETO MEDICAMENTOSELECCIONADO
  productoParaCompra(event: MatAutocompleteSelectedEvent) {
    this.productoSeleccionado = event.option.value as Producto; // Asegura que sea del tipo Producto
  }

  mostraProveedor(proveedor: Proveedor): string {
    return proveedor.nombre
  }

  proveedorParaCompra(event: MatAutocompleteSelectedEvent){
     this.proveedorSeleccionado = event.option.value as Proveedor
  }

  agregarProductoParaVenta() {
    const _cantidad: number = this.formularioProductoCompra.value.cantidad;
    const _precio: number = parseFloat(this.productoSeleccionado.precio);
    const _total: number = _cantidad * _precio;


    if (_cantidad <= 0 || isNaN(_cantidad)) {
      this.utilidadService.mostrarAlerta('La cantidad debe ser mayor a 0', 'Error');
      return;
    }

    // Validar si el stock es suficiente
    // if (this.medicamentoSeleccionado.stock < _cantidad) {
    //   this.utilidadService.mostrarAlerta('No hay suficiente stock para este medicamento', 'Oops');
    //   return;
    // }

    // Si el stock es suficiente, proceder a agregar el medicamento a la Comopra
    this.totalApagar = this.totalApagar + _total;

    this.listaProductosParaCompra.push({
      idProducto: this.productoSeleccionado.idProducto,
      descripcionProducto: this.productoSeleccionado.nombre,
      cantidad: _cantidad,
      precioTexto: String(_precio),
      totalTexto: String(_total)
    });

    this.datosDetalleCompra = new MatTableDataSource(this.listaProductosParaCompra);

    // Restablecer el formulario
    this.formularioProductoCompra.patchValue({
      producto: "",
      cantidad: "",
      proveedor:""
    });
  }

  //ELIMINAR UN MEDICAMENTO DE LISTA DE DE VENTA
  eliminarProducto(detalle: DetalleCompra){
    this.totalApagar = this.totalApagar - parseFloat(detalle.totalTexto)
    this.listaProductosParaCompra = this.listaProductosParaCompra.filter(p => p.idProducto !== detalle.idProducto)

    this.datosDetalleCompra = new MatTableDataSource(this.listaProductosParaCompra)
  }

   //REGISTRAR LA VENTA
   registrarCompra(){
    if (this.listaProductosParaCompra .length > 0) {
      this.bloquearBotonRegistro = true

      // Obtener la fecha actual en el formato que espera el backend
      const fechaActual = new Date().toLocaleDateString('es-ES'); // Formato: dd/mm/yyyy

      const request: Compra = {
        tipoPago: this.tipoPagoDefecto,
        totalTexto: String(this.totalApagar.toFixed()),
        idProveedor: this.proveedorSeleccionado.idProveedor, // Corregido
        nombreProveedor: this.proveedorSeleccionado.nombre, // Corregido
        fechaCompra: fechaActual, // Agregar la fecha de registro
        detalleCompras: this.listaProductosParaCompra
      }

      // console.log('Request enviado:', request); // Depuración: Verificar el objeto request

      this.compraService.registrar(request)
      .subscribe({
        next: (response) => {
          if (response) {
            this.totalApagar = 0.00;
            this.listaProductosParaCompra =[],
            this.datosDetalleCompra = new MatTableDataSource(this.listaProductosParaCompra );

            Swal.fire({
              icon:'success',
              title: "Compra Registrada",
              text: `Numero de Compra ${response.value.numCompra}`
            })
          } else
            this.utilidadService.mostrarAlerta('No se pudo registrar la Compra','Oops');
        },
        complete:() => {
          this.bloquearBotonRegistro = false;
        },
        error:(e) => {}
      })
    }
  }

}
