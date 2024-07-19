import { global } from '../constants.js';
import { navegarCarrito } from '../main.js';

export function agregarProductoAlCarrito(producto) {
    global.carrito.push(producto);
    console.log('Producto agregado al carrito:', producto);
    mostrarModalCarrito();
}

export function obtenerCarrito() {
    return global.carrito;
}

export function eliminarProductoDelCarrito(productoId) {
    global.carrito = global.carrito.filter(producto => producto.id !== productoId);
    console.log('Producto eliminado del carrito:', productoId);
}

export function limpiarCarrito() {
    global.carrito = [];
    console.log('Carrito limpiado');
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
    const carrito = obtenerCarrito();

    const actionSheet = document.createElement('ion-action-sheet');
    actionSheet.header = 'Carrito de compras';
    actionSheet.buttons = carrito.map(producto => ({
        text: `${producto.name} - ${producto.price}`,
        handler: () => console.log(`Producto seleccionado: ${producto.name}`)
    })).concat({
        text: 'Ver carrito',
        handler: () => {
            navegarCarrito();
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
    modal.component = 'div'; // Placeholder for the component
    modal.cssClass = 'carrito-modal';

    modal.innerHTML = document.getElementById('modal-carrito.html').innerHTML;

    document.body.appendChild(modal);
    modal.present();

    modal.querySelector('#btn-continuar-comprando').addEventListener('click', () => {
        modal.dismiss();
    });

    modal.querySelector('#btn-ver-carrito').addEventListener('click', () => {
        modal.dismiss();
        navegarCarrito();
    });

    const modalCarritoLista = modal.querySelector('#modal-carrito-lista');
    const carrito = obtenerCarrito();

    modalCarritoLista.innerHTML = carrito.map(producto => `
       <ion-item>
            <ion-thumbnail slot="start">
                <img src="${producto.image}">
            </ion-thumbnail>
            <ion-label>
                <h2>${producto.name}</h2>
                <p>${producto.price}</p>
            </ion-label>
        </ion-item>
    `).join('');
}
