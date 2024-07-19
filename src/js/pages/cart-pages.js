import { obtenerCarrito, eliminarProductoDelCarrito, limpiarCarrito, configurarCartButton } from '../functions/cart-functions.js';
import { configurarUserOptions } from '../functions/functions.js';

customElements.define(
  "page-carrito",
  class extends HTMLElement {
    connectedCallback() {
      console.log("connected page-carrito");

      this.innerHTML = document.getElementById("page-carrito.html").innerHTML;
      
      this.mostrarCarrito();

      this.querySelector("#btn-finalizar-compra").addEventListener("click", () => {
        this.realizarCompra();
      });
      configurarUserOptions(this); 
      configurarCartButton(this); 
    }

    mostrarCarrito() {
      const carritoLista = this.querySelector("#carrito-lista");
      const carrito = obtenerCarrito();

      if (carrito.length === 0) {
        carritoLista.innerHTML = '<p>Tu carrito está vacío, cuando agregues un producto se mostrará aquí.</p>';
      } else {
        carritoLista.innerHTML = carrito.map(producto => `
          <ion-item>
            <ion-thumbnail slot="start">
              <img src="${producto.image}" alt="${producto.name}">
            </ion-thumbnail>
            <ion-label>${producto.name} - ${producto.price}</ion-label>
            <ion-button slot="end" color="danger" size="small" id="eliminar-${producto.id}">Eliminar</ion-button>
          </ion-item>
        `).join('');

        carrito.forEach(producto => {
          this.querySelector(`#eliminar-${producto.id}`).addEventListener("click", () => {
            eliminarProductoDelCarrito(producto.id);
            this.mostrarCarrito();
          });
        });
      }
    }

    realizarCompra() {
      limpiarCarrito();
      this.mostrarCarrito();

      const toast = document.createElement('ion-toast');
      toast.message = 'Compra realizada con éxito';
      toast.duration = 2000;
      document.body.appendChild(toast);
      toast.present();
    }
  }
);
