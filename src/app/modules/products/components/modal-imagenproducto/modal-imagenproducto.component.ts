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

//servicios
import { ImagenproductoService } from '../../services/imagenproducto.service';
import { UtilidadService } from '../../../../services/utilidad.service';

//interfaces
import { ImagenProdubcto } from '../../../../core/interfaces/imagenProducto.interface';

@Component({
  selector: 'app-modal-imagenproducto',
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
    MatDatepickerModule
  ],
  templateUrl: './modal-imagenproducto.component.html',
  styleUrl: './modal-imagenproducto.component.scss'
})
export class ModalImagenproductoComponent {

  //PROPIEDADES
  formularioImagenProducto: FormGroup
  tituloAccion: string = 'Agregar'
  botonAccion: string = 'Guardar'

  constructor(
    private modalActual: MatDialogRef<ModalImagenproductoComponent>,
    private fb: FormBuilder,
    private imagenProductoServicio: ImagenproductoService,
    private utilidadesServicio: UtilidadService
  ){
    this.formularioImagenProducto = this.fb.nonNullable.group({
      nombreArchivo:['', [Validators.required]],
      ruta:['', [Validators.required]]
    })
  }

  guardar_iamgenProducto(){
    const _iamgenProducto: ImagenProdubcto = {
      idImagen: 0,
      nombreArchivo: this.formularioImagenProducto.value.nombreArchivo,
      ruta: this.formularioImagenProducto.value.ruta
    };
    this.imagenProductoServicio.guardar(_iamgenProducto)
    .subscribe({
      next:(data) =>  {
        if (data.status) {
          this.utilidadesServicio.mostrarAlerta('La imagen del producto se registro','success')
          this.modalActual.close(true)
        } else {
          this.utilidadesServicio.mostrarAlerta('No se puedo registrar la imagen','error')
        }
      },
    })
  }

}
