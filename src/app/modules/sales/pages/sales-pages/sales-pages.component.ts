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
import { DetalleVenta } from '../../../../core/interfaces/detalleventa.interface';
import { Venta } from '../../../../core/interfaces/venta.interface';

//servicios
import { VentaService } from '../../services/venta.service';
import { ProductoVentaService } from '../../services/producto-venta.service';
import { UtilidadService } from '../../../../services/utilidad.service';
import { AuthUsuarioService } from '../../../authentication/services/auth-usuario.service';

//PrimeNG
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sales-pages',
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
  templateUrl: './sales-pages.component.html',
  styleUrl: './sales-pages.component.scss'
})
export class SalesPagesComponent {

  //PROPIEDADES Y VARIABLES
  listaProducto: Producto[]=[]//almacena la lista de todos los productos activos y con stock mayor a 0
  listaProductosFiltro: Producto[]=[]//almacena lista de productos filtrados segun la busqueda realizada
  listaProductosParaVenta: DetalleVenta[]=[]//contiene la lista de productos que se han selecionado para la venta
  bloquearBotonRegistro: boolean = false//se utiliza para deshabilitar el boton de registro de la veta
  productoSeleccionado!: Producto//almacena el producto que el usuario a seleccionado para agragar a la venta
  tipoPagoDefecto: string = 'Efectivo'
  totalApagar: number = 0


  formularioProductosVenta: FormGroup;
  columnasTabla: string[] = ["producto","cantidad","precioVenta","total","accion"];
  datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);

  //FUNCION QUE NOS SIRVE PARA BUSCAR EL PRODUCTO POR SU NOMBRE
  retornaProductosPorFiltro(search: string | Producto):Producto[]{
    const valorBuscado = typeof search === 'string' ? search.toLocaleLowerCase(): search.nombre.toLocaleLowerCase();
    return this.listaProducto.filter(item => item.nombre.toLocaleLowerCase().includes(valorBuscado))
  }

  constructor(
    private fb: FormBuilder,
    private productosVentaService: ProductoVentaService,
    private authusuarioService:  AuthUsuarioService,
    private ventaService: VentaService,
    private utilidadService: UtilidadService
  ){
    this.formularioProductosVenta = this.fb.nonNullable.group({
      producto:["",[Validators.required]],
      cantidad:["",[Validators.required, Validators.min(1)]]
    })

    //LISTA DE MEDICAMENTOS ACTIVOS Y CON STOCK MAYOR 0
    this.productosVentaService.lista()
    .subscribe({
      next: (data) => {
        if (data.status) {
          const lista = data.value as Producto[];
          this.listaProducto = lista.filter(p => p.esActivo == 1 && p.stock > 0)
        }
      },
      error: (e) => {}
    })
    //FILTRAR PRODUCTOS POR NOMBRE EN EL FORMUALRIO
    this.formularioProductosVenta.get('producto')?.valueChanges
    .subscribe(value => {
      this.listaProductosFiltro = this.retornaProductosPorFiltro(value)
    })

  }

  ngOnInit(): void {
  }

  //METODO PARA MOSTRAR EL NOMBRE DEL PRODUCTO SELECCIONADO
  mostrarProducto(medicamento: Producto): string {
    return medicamento.nombre
  }

  //ASIGNAR EL PRODUCTO SELECCIONADO AL OBJETO MEDICAMENTOSELECCIONADO
  productoParaVenta(event: MatAutocompleteSelectedEvent) {
    this.productoSeleccionado = event.option.value as Producto; // Asegura que sea del tipo Medicamento
  }

  //METODO PÁRA AGREGAR EL PRODUCTO
  agregarProductoParaVenta() {
    const _cantidad: number = this.formularioProductosVenta.value.cantidad;
    const _precio: number = parseFloat(this.productoSeleccionado.precioVenta);
    const _total: number = _cantidad * _precio;


    if (_cantidad <= 0 || isNaN(_cantidad)) {
      this.utilidadService.mostrarAlerta('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    // Validar si el stock es suficiente
    if (this.productoSeleccionado.stock < _cantidad) {
      this.utilidadService.mostrarAlerta('No hay suficiente stock para este medicamento', 'warning');
      return;
    }

    // Si el stock es suficiente, proceder a agregar el producto a la venta
    this.totalApagar = this.totalApagar + _total;

    this.listaProductosParaVenta.push({
      idProducto: this.productoSeleccionado.idProducto,
      descripcionProducto: this.productoSeleccionado.nombre,
      cantidad: _cantidad,
      precioTexto: String(_precio),
      totalTexto: String(_total)
    });

    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);

    // Restablecer el formulario
    this.formularioProductosVenta.patchValue({
      producto: "",
      cantidad: ""
    });
  }

  //ELIMINAR UN MEDICAMENTO DE LISTA DE DE VENTA
  eliminarProducto(detalle: DetalleVenta){
    this.totalApagar = this.totalApagar - parseFloat(detalle.totalTexto)
    this.listaProductosParaVenta = this.listaProductosParaVenta.filter(p => p.idProducto !== detalle.idProducto)

    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta)
  }


  //REGISTRAR LA VENTA
  registrarVenta(){
    if (this.listaProductosParaVenta .length > 0) {
      this.bloquearBotonRegistro = true

      // Obtener información del usuario desde la sesión
      const usuarioSesion = this.authusuarioService.currentUser();
      const idUsuario = usuarioSesion ? usuarioSesion.idUsuario : '';
      const UsuarioDescripcion = usuarioSesion ? usuarioSesion.rolDescripcion : '';

      const request: Venta = {
        tipoPago: this.tipoPagoDefecto,
        totalTexto: String(this.totalApagar.toFixed()),//toFixed() a un número, puedes especificar cuántos dígitos decimales deseas que aparezcan
        IdUsuario: idUsuario, // Incluimos el ID del usuario logueado
        usuarioDescripcion: UsuarioDescripcion, // Incluimos la descripción del usuario (rol)
        detalleventa: this.listaProductosParaVenta
      }

      this.ventaService.registrar(request)
      .subscribe({
        next: (response) => {
          if (response) {
            this.totalApagar = 0.00;
            this.listaProductosParaVenta =[],
            this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta );

            Swal.fire({
              icon:'success',
              title: "Venta Registrada",
              text: `Numero de venta ${response.value.numVenta}`
            })
          } else
            this.utilidadService.mostrarAlerta('No se pudo registrar la venta','warning');
        },
        complete:() => {
          this.bloquearBotonRegistro = false;
        },
        error:(e) => {}
      })
    }
  }

}
