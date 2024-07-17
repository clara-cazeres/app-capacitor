import { $ } from './constants.js';
import './components.js';
import './pages.js';
import { configurarUserOptions, logout } from './functions.js';


document.addEventListener('DOMContentLoaded', (event) => {
  iniciarApp();
});

export function iniciarApp() {
  guardarElementos();
  $.ionNav.setRoot('page-inicio');
}

function guardarElementos() {
  $.ionNav = document.getElementById("main-nav");

  // Configurar opciones de usuario cuando se cambia de página
  $.ionNav.addEventListener('ionNavDidChange', configurarUserOptions);
}

export function navegarPageAmpliacion(productoId) {
  console.log(`Navegando a ampliación de producto con ID: ${productoId}`);
  $.ionNav.push('page-ampliacion-producto', { productoId });
}

export function navegarListadoProductos() {
  console.log("Navegando al listado de productos");
  $.ionNav.push('page-listado-productos');
}
