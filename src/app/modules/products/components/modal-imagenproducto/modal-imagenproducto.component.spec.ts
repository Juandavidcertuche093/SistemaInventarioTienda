import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImagenproductoComponent } from './modal-imagenproducto.component';

describe('ModalImagenproductoComponent', () => {
  let component: ModalImagenproductoComponent;
  let fixture: ComponentFixture<ModalImagenproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalImagenproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalImagenproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
