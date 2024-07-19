import { global } from '../constants.js';


export function saveCartToLocalStorage(cart) {
  localStorage.setItem('carrito', JSON.stringify(cart));
}

export function loadCartFromLocalStorage() {
  const cart = localStorage.getItem('carrito');
  return cart ? JSON.parse(cart) : [];
}

export function obtenerCarritoPersistente() {
  return loadCartFromLocalStorage();
}

export function agregarProductoAlCarritoPersistente(producto) {
  const cart = loadCartFromLocalStorage();
  cart.push(producto);
  saveCartToLocalStorage(cart);
}

export function eliminarProductoDelCarritoPersistente(productoId) {
  let cart = loadCartFromLocalStorage();
  cart = cart.filter(producto => producto.id !== productoId);
  saveCartToLocalStorage(cart);
}

export function limpiarCarritoPersistente() {
  saveCartToLocalStorage([]);
}

export function verificarUsuarioLogueado() {
  const userToken = localStorage.getItem("user-token");
  return !!userToken;
}

export function mostrarAlertIniciarSesion() {
  const alert = document.createElement('ion-alert');
  alert.header = 'Iniciar sesión';
  alert.message = 'Para agregar el producto debes iniciar sesión';
  alert.buttons = [
    {
      text: 'Ir al login',
      handler: () => {
        document.querySelector("ion-nav").setRoot("page-login");
      }
    },
    {
      text: 'Registrarse',
      handler: () => {
        document.querySelector("ion-nav").setRoot("page-registro");
      }
    }
  ];
  document.body.appendChild(alert);
  alert.present();
}

export function mostrarCarrito() {
  const carrito = obtenerCarritoPersistente();

  const actionSheet = document.createElement('ion-action-sheet');
  actionSheet.header = 'Carrito de compras';
  actionSheet.buttons = carrito.map(producto => ({
    text: `${producto.name} - ${producto.price}`,
    handler: () => console.log(`Producto seleccionado: ${producto.name}`)
  })).concat({
    text: 'Ver carrito',
    handler: () => {
      document.querySelector("ion-nav").push('page-carrito');
    }
  }, {
    text: 'Cancelar',
    role: 'cancel'
  });

  document.body.appendChild(actionSheet);
  actionSheet.present();
}

export function configurarCartButton(page) {
  setTimeout(() => {  // asegurar que el DOM esté actualizado
    try {
      if (page instanceof HTMLElement) {
        const cartButton = page.querySelector("#cart-button");

        if (cartButton) {
          cartButton.addEventListener("click", () => {
            mostrarCarrito();
          });
        } else {
          console.log('cart-button no encontrado en esta página');
        }
      }
    } catch (error) {
      console.error('Error al configurar cart-button:', error);
    }
  }, 100);  
}

export function mostrarModalCarrito() {
  const modal = document.createElement('ion-modal');
  modal.component = 'modal-carrito';
  document.body.appendChild(modal);
  modal.present();
}
