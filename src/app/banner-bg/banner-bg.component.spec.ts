import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerBgComponent } from './banner-bg.component';

describe('BannerBgComponent', () => {
  let component: BannerBgComponent;
  let fixture: ComponentFixture<BannerBgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BannerBgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerBgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
