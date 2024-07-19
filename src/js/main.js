import { $ } from './constants.js';
import './components.js';
import './pages/pages.js';
import { configurarUserOptions, logout } from './functions/functions.js';

document.addEventListener('DOMContentLoaded', (event) => {
    iniciarApp();
});

export function iniciarApp() {
  guardarElementos();
  $.ionNav.setRoot('page-inicio');
  configurarMenuNavegacion();
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

export function navegarCarrito() {
  console.log("Navegando al carrito de compras");
  $.ionNav.push('page-carrito');
}

export function navegarInicio() {
  console.log("Navegando a inicio");
  $.ionNav.setRoot('page-inicio');
}

export function navegarLogin() {
  console.log("Navegando a login");
  $.ionNav.setRoot('page-login');
}

export function navegarRegistro() {
    console.log("Navegando a registro");
    $.ionNav.setRoot('page-registro');
  }

function configurarMenuNavegacion() {
  document.getElementById('menu-inicio').addEventListener('click', () => {
    navegarInicio();
    document.querySelector('ion-menu').close();
  });
  document.getElementById('menu-productos').addEventListener('click', () => {
    navegarListadoProductos();
    document.querySelector('ion-menu').close();
  });
  document.getElementById('menu-carrito').addEventListener('click', () => {
    navegarCarrito();
    document.querySelector('ion-menu').close();
  });
  document.getElementById('menu-login').addEventListener('click', () => {
    navegarLogin();
    document.querySelector('ion-menu').close();
  });
  document.getElementById('menu-registro').addEventListener('click', () => {
    navegarRegistro();
    document.querySelector('ion-menu').close();
  });

}
