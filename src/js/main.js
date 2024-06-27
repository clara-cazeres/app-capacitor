import { $ } from './constants.js';
import './components.js';
import './pages.js';

export function iniciarApp() {
  guardarElementos();
}

function guardarElementos() {
  $.ionNav = document.querySelector("ion-nav");
}

export function navegarPageAmpliacion(productoId) {
  $.ionNav.push("page-ampliacion-producto", {
    productoId: productoId,
  });
}

iniciarApp();
