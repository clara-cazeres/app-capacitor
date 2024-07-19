import { obtenerCarritoPersistente, eliminarProductoDelCarritoPersistente, limpiarCarritoPersistente } from '../functions/cart-functions.js';
import { configurarUserOptions } from '../functions/functions.js';

customElements.define(
  "page-carrito",
  class extends HTMLElement {
    connectedCallback() {
      console.log("connected page-carrito");

      this.innerHTML = document.getElementById("page-carrito.html").innerHTML;
      
      this.mostrarCarrito();

      this.querySelector("#btn-finalizar-compra").addEventListener("click", () => {
        this.verificarCompra();
      });
      configurarUserOptions(this); 
    }

    mostrarCarrito() {
      const carritoLista = this.querySelector("#carrito-lista");
      const carrito = obtenerCarritoPersistente();

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
            eliminarProductoDelCarritoPersistente(producto.id);
            this.mostrarCarrito();
          });
        });
      }
    }

    verificarCompra() {
      const carrito = obtenerCarritoPersistente();
      if (carrito.length === 0) {
        const toast = document.createElement('ion-toast');
        toast.message = 'Tu carrito está vacío. Para finalizar la compra debe tener al menos un producto.';
        toast.duration = 2000;
        document.body.appendChild(toast);
        toast.present();
      } else {
        this.confirmarCompra();
      }
    }

    confirmarCompra() {
      const alert = document.createElement('ion-alert');
      alert.header = 'Finalizar Compra';
      alert.message = '¿Deseas finalizar la compra?';
      alert.buttons = [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí',
          handler: () => {
            this.realizarCompra();
          }
        }
      ];
      document.body.appendChild(alert);
      alert.present();
    }

    async realizarCompra() {
      const carrito = obtenerCarritoPersistente();
      const userToken = localStorage.getItem("user-token");

      console.log("User Token:", userToken);
      console.log("Carrito:", carrito);

      if (carrito.length === 0) {
        const toast = document.createElement('ion-toast');
        toast.message = 'Tu carrito está vacío. Para finalizar la compra debe tener al menos un producto.';
        toast.duration = 2000;
        document.body.appendChild(toast);
        await toast.present();
      } else {
        try {
          const response = await fetch('https://user-api-64ni.onrender.com/api/purchase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ products: carrito })
          });

          if (!response.ok) {
            console.log("Error response:", response);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          limpiarCarritoPersistente();
          this.mostrarCarrito();

          const successToast = document.createElement('ion-toast');
          successToast.message = 'Compra realizada con éxito';
          successToast.duration = 2000;
          document.body.appendChild(successToast);
          successToast.present();
        } catch (error) {
          console.error("Error en la compra:", error);
          const errorAlert = document.createElement('ion-alert');
          errorAlert.header = 'Error';
          errorAlert.message = 'Hubo un error al procesar tu compra, intente de nuevo más tarde.';
          errorAlert.buttons = ['OK'];
          document.body.appendChild(errorAlert);
          errorAlert.present();
        }
      }
    }
  }
);

customElements.define(
  "modal-carrito",
  class extends HTMLElement {
    connectedCallback() {
      console.log("connected modal-carrito");

      this.innerHTML = document.getElementById("modal-carrito.html").innerHTML;

      this.querySelector("#btn-continuar-comprando").addEventListener("click", () => {
        document.querySelector('ion-modal').dismiss();
      });

      this.querySelector("#btn-ver-carrito").addEventListener("click", () => {
        document.querySelector('ion-modal').dismiss();
        document.querySelector("ion-nav").push('page-carrito');
      });

      this.mostrarModalCarrito();
    }

    mostrarModalCarrito() {
      const modalCarritoLista = this.querySelector("#modal-carrito-lista");
      const carrito = obtenerCarritoPersistente();

      if (carrito.length === 0) {
        modalCarritoLista.innerHTML = '<p>Tu carrito está vacío, cuando agregues un producto se mostrará aquí.</p>';
      } else {
        modalCarritoLista.innerHTML = carrito.map(producto => `
          <ion-item>
            <ion-thumbnail slot="start">
              <img src="${producto.image}" alt="${producto.name}">
            </ion-thumbnail>
            <ion-label>${producto.name} - ${producto.price}</ion-label>
          </ion-item>
        `).join('');
      }
    }
  }
);
