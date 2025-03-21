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
import { ProveedorService } from '../../services/proveedor.service';
import { UtilidadService } from '../../../../services/utilidad.service';

//interfaces
import { Proveedor } from '../../../../core/interfaces/proveedor.interface';

@Component({
  selector: 'app-modal-proveedor',
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
  templateUrl: './modal-proveedor.component.html',
  styleUrl: './modal-proveedor.component.scss'
})
export class ModalProveedorComponent {

  formularioProveedor: FormGroup
  tituloAccion: string = 'Agregar'
  botonAccion: string = 'Guardar'

  constructor(
    private modalActual: MatDialogRef<ModalProveedorComponent>,
    private fb: FormBuilder,
    private proveedorServicio: ProveedorService,
    private utilidadesServicio: UtilidadService
  ){
    this.formularioProveedor = this.fb.nonNullable.group({
      nombre:['', [Validators.required]],
    })
  }

  guardar_Proveedor(){
    const _proveedor: Proveedor = {
      idProveedor: 0,
      nombre: this.formularioProveedor.value.nombre,
    };
    this.proveedorServicio.guardar(_proveedor)
    .subscribe({
      next:(data) => {
        if (data.status) {
          this.utilidadesServicio.mostrarAlerta('El proveedor se registro', 'Exito')
          this.modalActual.close(true)
        } else {
          this.utilidadesServicio.mostrarAlerta('No se puedo registrar el proveedor','Error')
        }
      },
    })
  }

}
