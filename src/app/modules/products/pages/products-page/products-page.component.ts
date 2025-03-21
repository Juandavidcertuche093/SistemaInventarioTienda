import { AfterViewInit, Component, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

//angular Material
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {DialogModule} from '@angular/cdk/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import { CdkTableModule } from '@angular/cdk/table';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

//compoenente modal
import { ModalProductosComponent } from '../../components/modal-productos/modal-productos.component';
import { ModalCategoriaComponent } from '../../components/modal-categoria/modal-categoria.component';
import { ModalProveedorComponent } from '../../components/modal-proveedor/modal-proveedor.component';
import { ModalImagenproductoComponent } from '../../components/modal-imagenproducto/modal-imagenproducto.component';

//interface
import { Producto } from '../../../../core/interfaces/producto.interface';

//servicios
import { ProductosService } from '../../services/productos.service';
import { UtilidadService } from '../../../../services/utilidad.service';
import Swal from 'sweetalert2';

//PrimeNG
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

//Pipes
import {OrderByPipe} from '../../pipes/order-by.pipe'

@Component({
  selector: 'app-products-page',
  imports: [
    MatTableModule,
    CdkTableModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    DialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatMomentDateModule,
    TableModule,
    BadgeModule,
    ButtonModule,
    OrderByPipe
  ],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss',
})
export class ProductsPageComponent implements OnInit {

  columnaTabla: string[] = ['nombre', 'categoria', 'imgProducto', 'stock', 'precio', 'estado', 'acciones'];
  dataInicio:Producto[]=[];
  dataListaMProductos = new MatTableDataSource(this.dataInicio);

  constructor(
    private dialog: MatDialog,
    private productoServicio: ProductosService,
    private utilidadServicio: UtilidadService
  ){}

  obtenerProductos(){
    this.productoServicio.lista()
    .subscribe({
      next: (data) => {
        if(data.status)
          this.dataListaMProductos.data = data.value
        else
        this.utilidadServicio.mostrarAlerta('No se encontraron datos', 'Ooops')
      },
      error: (e) => {}
    })
  }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  //metodo para filtrar
  aplicarFiltroTabla(event: Event, dt: any) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dt.filterGlobal(filterValue, 'contains');
  }

  //metodo para el valor del stock
  getStockClass(stock: number): string {
    if (stock > 10) return 'stock-alto';
    if (stock > 0) return 'stock-bajo';
    return '';
  }

  //metodo para el modal de crear producto
  nuevoMedicamento(){
    this.dialog.open(ModalProductosComponent,{
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if(resultado === 'true')this.obtenerProductos();
    });
  }

  //metodo para el modal de actualizar producto
  editarProducto(producto:Producto){
    this.dialog.open(ModalProductosComponent,{
      disableClose:true,
      data: producto
    }).afterClosed().subscribe(resultado => {
      if(resultado === 'true')this.obtenerProductos();
    });
  }

  //metodo para el modal de crear categoria
  nuevaCategoria(){
    this.dialog.open(ModalCategoriaComponent,{
      disableClose:true
    }).afterClosed().subscribe(resultado => {
      if(resultado === 'true')this.obtenerProductos();
    })
  }

  //metodo para el modal de crear proveedor
  nuevoProveedor(){
    this.dialog.open(ModalProveedorComponent, {
      disableClose:true
    }).afterClosed().subscribe(resultado => {
      if(resultado === 'true')this.obtenerProductos();
    })
  }

  //metodo para el modal de crear imagenproducto
  nuevoImagenProducto(){
    this.dialog.open(ModalImagenproductoComponent, {
      disableClose:true
    }).afterClosed().subscribe(resultado => {
      if(resultado === 'true')this.obtenerProductos();
    })
  }

  //metodo para elimainar un producto
  eliminarProducto(producto:Producto){
    //libreria de alertas personalizadas
    Swal.fire({
      title:'¿Desea eliminar el Producto',
      // text: producto.nombre,
      html: `<p style="font-size: 1.5rem; font-weight: bold;">${producto.nombre}</p>`,
      icon:'warning',
      confirmButtonColor:'#3085d6',
      confirmButtonText:'Si, eliminar',
      showCancelButton:true,
      cancelButtonColor: '#d33',
      cancelButtonText:'No, volver'
    }).then((resultado) => {

      if(resultado.isConfirmed){
        this.productoServicio.eliminar(producto.idProducto)
        .subscribe({
          next:(data) => {
            if(data.status){
              this.utilidadServicio.mostrarAlerta("El producto fue eliminado","Listo!");
              this.obtenerProductos();
            }else
            this.utilidadServicio.mostrarAlerta("No se pudo eliminar el producto","Error");
          },
          error:(e) => {}
        })
      }
    })
  }

}
