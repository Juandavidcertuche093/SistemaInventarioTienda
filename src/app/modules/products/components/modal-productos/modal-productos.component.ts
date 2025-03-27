import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

//angular/material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';

//interfaces
import {Categoria} from '../../../../core/interfaces/categoria.interface';
import { Producto } from '../../../../core/interfaces/producto.interface';
import {Proveedor} from '../../../../core/interfaces/proveedor.interface';
import { ImagenProdubcto } from '../../../../core/interfaces/imagenProducto.interface'

//servicios
import { ProductosService } from '../../services/productos.service';
import { CategoriaService } from '../../services/categoria.service';
import { UtilidadService } from '../../../../services/utilidad.service';
import { ProveedorService } from '../../services/proveedor.service';
import { ImagenproductoService } from '../../services/imagenproducto.service'

import moment from 'moment';

import { numeroPositivo } from '../../../../core/utility/numeroPositivo';
import { provideClientHydration } from '@angular/platform-browser';

//Define el formato de fecha que se usará en el componente (DD/MM/YYYY).
// export const MY_DATA_FORMATS={
//   parse:{
//     dateInput: 'DD/MM/YYYY'
//   },
//   display:{
//     dateInput: 'DD/MM/YYYY',
//     monthYearLabel: 'MMMM YYYY'
//   }
// }

@Component({
  selector: 'app-modal-productos',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatGridListModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule
  ],
  templateUrl: './modal-productos.component.html',
  styleUrl: './modal-productos.component.scss'
})
export class ModalProductosComponent implements OnInit{

  //PROPIEDADES
  formularioProduncto: FormGroup;
  tituloAccion: string = 'Agregar';
  botonAccion: string = 'Guardar';
  listaCategoria: Categoria[] = []//nos muestra las lista de las catgorias que se obtinen desde la base de datos
  listaProveedor: Proveedor[] = []//nos muestra las lista de las proveedores que se obtinen desde la base de datos
  listaImagenProducto: ImagenProdubcto[] = []//nos muestra la lista de imagenes y nombre que se obtienen desde la base de datos

  constructor(
    private modalActual: MatDialogRef<ModalProductosComponent>,
    @Inject(MAT_DIALOG_DATA) public datosProducto: Producto,
    private fb: FormBuilder,
    private categoriaServicio: CategoriaService,
    private produnctoServicio: ProductosService,
    private utilidadServicio: UtilidadService,
    private proveedorServicio: ProveedorService,
    private imagenProductoServicio: ImagenproductoService

  ){
    this.formularioProduncto = this.fb.nonNullable.group({
      nombre:       ['', [Validators.required]],
      idCategoria:  ['', [Validators.required]],
      idProveedor:  ['', [Validators.required]],
      idImagen:     ['', [Validators.required]],
      stock:        [{ value: 0, disabled: true }, [Validators.required]], // Bloqueado y con valor predete
      precioCompra: ['', [Validators.required, Validators.min(1), numeroPositivo]],
      precioVenta:  ['', [Validators.required, Validators.min(1), numeroPositivo]],
      esActivo:     ['1', [Validators.required]],
    });
    if (this.datosProducto != null && this.datosProducto != undefined){
      this.tituloAccion = 'Editar'
      this.botonAccion = 'Actualizar'
    }
    //traemos la lista de categorias
    this.categoriaServicio.lista()
    .subscribe({
      next: (data) => {
        if(data.status)
          this.listaCategoria = data.value
      },
      error: (e) => {}
    })

    //traemos la lista de proveedores
    this.proveedorServicio.lista()
    .subscribe({
      next: (data) => {
        if(data.status)
          this.listaProveedor = data.value
      },
      error: (e) => {}
    })

    //traemos la lista de imagenes del producto
    this.imagenProductoServicio.lista()
    .subscribe({
      next: (data) => {
        if(data.status)
          this.listaImagenProducto = data.value
      }
    })
  }

  //si no hay un produncto en datosProducto (modo edicion) se cargan los valores actuales del prosucto
  ngOnInit(): void {
    if(this.datosProducto !== null && this.datosProducto !== undefined)

      this.formularioProduncto.patchValue({
        nombre:       this.datosProducto.nombre,
        idCategoria:  this.datosProducto.idCategoria,
        idProveedor:  this.datosProducto.idProveedor,
        idImagen:     this.datosProducto.idImagen,
        stock:        this.datosProducto.stock,
        precioCompra:       this.datosProducto.precioCompra,
        precioVenta:       this.datosProducto.precioVenta,
        esActivo:     this.datosProducto.esActivo
      })
  }

  GuardarEditar_Producto(){
    //LOGICA PARA CREEAR Y ACTUALIAR EL PRODUCTO
    const _productos: Producto = {
      idProducto: this.datosProducto == null ? 0: this.datosProducto.idProducto,
      nombre: this.formularioProduncto.value.nombre,
      idCategoria: this.formularioProduncto.value.idCategoria,
      descripcionCategoria: "",//lo puedes dejar bacio si no se requiere
      idProveedor: this.formularioProduncto.value.idProveedor,
      nombreProveedor:"",
      idImagen: this.formularioProduncto.value.idImagen,
      nombreImagen:"",
      rutaImagen: "",
      stock: this.datosProducto ? this.datosProducto.stock : 0,
      precioCompra: this.formularioProduncto.value.precioCompra,
      precioVenta: this.formularioProduncto.value.precioVenta,
      esActivo: parseInt(this.formularioProduncto.value.esActivo)
    }
    if (this.datosProducto == null){
      //LOGICA PARA CREEAR EL PRODUCTO
      this.produnctoServicio.guardar(_productos)
      .subscribe({
        next: (data) => {
          if(data.status) {
            this.utilidadServicio.mostrarAlerta('El producto se registro con exito','success')
            this.modalActual.close('true')
          } else
            this.utilidadServicio.mostrarAlerta(data.msg,'error')
        },
        error: (e) => {
          this.utilidadServicio.mostrarAlerta("Ocurrio un error al guardar el producto", "error")
        }
      })
    } else
      //LOGICA PARA ACTUALIZAR EL PRODUCTO
      this.produnctoServicio.editar(_productos)
      .subscribe({
        next: (data) => {
          if(data.status) {
            this.utilidadServicio.mostrarAlerta("EL producto se actualizo", "success")
            this.modalActual.close('true')
          } else
            this.utilidadServicio.mostrarAlerta("No se puede actualizar el producto","error")
        },
        error:(e) => {}
      })

  }

}
