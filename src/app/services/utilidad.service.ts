import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';//Este es un servicio de Angular Material que se usa para mostrar mensajes breves

@Injectable({
  providedIn: 'root'
})
export class UtilidadService {

  constructor(
    private snackBar: MatSnackBar
  ) { }

  //metodo para devolver un mensaje de alerta
  // mostrarAlerta(mensaje: string, tipo: string) {
  //   this.snackBar.open(mensaje, tipo, {
  //     horizontalPosition: "center", // Centra horizontalmente
  //     verticalPosition: 'top',      // Mantiene la posición superior
  //     duration: 5000,             // Duración de la alerta en milisegundos
  //   });
  // }

  mostrarAlerta(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') {
    this.snackBar.open(mensaje, 'Cerrar', {
      horizontalPosition: "center",
      verticalPosition: 'top',
      duration: 5000,
      panelClass: ['snackbar-' + tipo.toLowerCase()] // Asegúrate que sea minúscula
    });
  }
}
