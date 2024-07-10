import { $ } from './constants.js';
import './components.js';
import './pages.js';

export function iniciarApp() {
  guardarElementos();
  $.ionNav.setRoot('page-inicio');
}

function guardarElementos() {
  $.ionNav = document.getElementById("main-nav");
}

export function navegarPageAmpliacion(productoId) {
  console.log(`Navegando a ampliación de producto con ID: ${productoId}`);
  $.ionNav.push('page-ampliacion-producto', { productoId });
}

export function navegarListadoProductos() {
  console.log(`Navegando al listado de productos`);
  $.ionNav.push('page-listado-productos');
}

iniciarApp();
