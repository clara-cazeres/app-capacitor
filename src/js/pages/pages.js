import { API_URL, OFFICIAL_STORE_ID, CATEGORY_ID } from '../constants.js';
import { navegarPageAmpliacion, navegarListadoProductos } from '../main.js';
import { configurarUserOptions } from '../functions/functions.js';
import { configurarShareButton } from '../functions/share-function.js';
import { configurarCartButton, verificarUsuarioLogueado, mostrarAlertIniciarSesion, agregarProductoAlCarrito } from '../functions/cart-functions.js'; 
import "./login-pages.js";
import "./cart-pages.js";

function crearElementoProducto(producto) {
  const originalPrice = producto.original_price ? `<span class="original-price">${producto.original_price} ${producto.currency_id}</span>` : '';
  const discountedPrice = `<span class="discounted-price">${producto.price} ${producto.currency_id}</span>`;
  return `
    <ion-col size="6">
      <item-producto
        interactivo="true"
        $id="${producto.id}"
        producto-id="${producto.id}"
        nombre="${producto.title}"
        foto="${producto.thumbnail}"
        precio-original="${producto.original_price || ''}"
        precio="${producto.price}"
        moneda="${producto.currency_id}"
      >
        ${originalPrice} ${discountedPrice}
      </item-producto>
    </ion-col>
  `;
}

function mostrarError(mensaje) {
  console.error(mensaje);
  document.querySelector("#listado-productos").innerHTML = `<p>${mensaje}</p>`;
}

function construirUrlBusqueda(query, categoria, appliedFilters, orden, offset) {
  let url = `${API_URL}/sites/MLU/search?official_store_id=${OFFICIAL_STORE_ID}`;
  if (query) url += `&q=${encodeURIComponent(query)}`;
  if (categoria) url += `&category=${categoria}`;
  if (appliedFilters.length > 0) {
    url += appliedFilters.map(filter => `&${filter}`).join('');
  }
  if (orden) url += `&sort=${orden}`;
  url += `&offset=${offset}&limit=50`;
  console.log(`URL construida: ${url}`);
  return url;
}

async function fetchProductos(searchUrl) {
  console.log(`Fetch Productos URL: ${searchUrl}`);
  const rawRes = await fetch(searchUrl);
  return await rawRes.json();
}

customElements.define(
  "page-inicio",
  class extends HTMLElement {
    connectedCallback() {
      console.log("connected page-inicio");

      if (this instanceof HTMLElement) {
        this.innerHTML = document.getElementById("page-inicio.html").innerHTML;

        this.productosRecientes = [];

        this.cargarProductosRecientes();

        // navegación
        this.addEventListener('navegarPageAmpliacion', (event) => {
          navegarPageAmpliacion(event.detail.productoId);
        });

        // evento botón "ver productos"
        this.querySelector("#ver-productos-button").addEventListener('click', () => {
          navegarListadoProductos();
        });

        configurarUserOptions(this); // pasar this
        configurarCartButton(this); // pasar this
      } else {
        console.error('this no es un elemento HTML válido');
      }
    }

    async cargarProductosRecientes() {
      const searchUrl = construirUrlBusqueda('', CATEGORY_ID, [], 'date_desc', 0);
      try {
        const jsonRes = await fetchProductos(searchUrl);
        this.productosRecientes = jsonRes.results.slice(0, 4); // Limitar a 4 productos
        this.mostrarProductosRecientes();
      } catch (error) {
        mostrarError("Error cargando productos recientes");
      }
    }

    mostrarProductosRecientes() {
      const slides = this.querySelector('#slides-recientes');
      slides.innerHTML = this.productosRecientes.map(producto => {
        const originalPrice = producto.original_price ? `<span class="original-price">${producto.original_price} ${producto.currency_id}</span>` : '';
        const discountedPrice = `<span class="discounted-price">${producto.price} ${producto.currency_id}</span>`;
        return `
          <ion-col size="6">
            <ion-card onclick="this.dispatchEvent(new CustomEvent('navegarPageAmpliacion', { detail: { productoId: '${producto.id}' }, bubbles: true }))">
            <ion-card-content>
            Nuevo
          </ion-card-content>
              <img src="${producto.thumbnail}" />
              <ion-card-header>
                <ion-card-subtitle>
                  ${originalPrice} ${discountedPrice}
                </ion-card-subtitle>
              </ion-card-header>
                
            </ion-card>
          </ion-col>
        `;
      }).join('');
    }
  }
);

customElements.define(
    "page-listado-productos",
    class extends HTMLElement {
      connectedCallback() {
        console.log("connected page-listado-productos");
  
        if (this instanceof HTMLElement) {
          this.innerHTML = document.getElementById("page-listado-productos.html").innerHTML;
  
          this.searchBar = this.querySelector("#search-bar");
          this.searchBar.addEventListener("ionInput", this.onSearch.bind(this));
  
          this.filterButton = this.querySelector("#filter-button");
          this.sortButton = this.querySelector("#sort-button");
  
          this.filterActionSheet = this.querySelector("#filter-action-sheet");
          this.sortActionSheet = this.querySelector("#sort-action-sheet");
  
          this.filterButton.addEventListener("click", this.abrirFiltroActionSheet.bind(this));
          this.sortButton.addEventListener("click", this.cerrarSortActionSheet.bind(this));
  
          this.filters = [];
          this.query = "";
          this.categoria = CATEGORY_ID;
          console.log(`Categoría inicial: ${this.categoria}`);
          this.orden = "";
          this.appliedFilters = [];
          this.offset = 0;
          this.hasMoreProducts = true;
  
          this.infiniteScroll = this.querySelector("#infinite-scroll");
          this.infiniteScroll.addEventListener("ionInfinite", async () => {
            console.log('Infinite Scroll solicitado');
            await this.cargarMasProductos();
            this.infiniteScroll.complete();
          });
  
          this.cargarFiltros();
          this.cargarListadoProductos();
  
          configurarUserOptions(this); // pasar this
          configurarCartButton(this); // pasar this
        } else {
          console.error('this no es un elemento HTML válido');
        }
      }
  
      onSearch(event) {
        this.query = event.target.value.trim();
        this.offset = 0;
        this.hasMoreProducts = true;
        console.log(`Buscar: ${this.query}`);
        this.cargarListadoProductos();
      }
  
      abrirFiltroActionSheet() {
        this.filterActionSheet.header = "Filtrar Productos";
        this.filterActionSheet.buttons = this.filters.concat({
          text: "Borrar Filtros",
          role: "destructive",
          handler: () => this.borrarFiltros()
        }, {
          text: "Cancelar",
          role: "cancel"
        });
        this.filterActionSheet.present();
      }
  
      cerrarSortActionSheet() {
        this.sortActionSheet.header = "Ordenar Productos";
        this.sortActionSheet.buttons = [
          {
            text: "Precio: Menor a Mayor",
            handler: () => this.aplicarSort("price_asc")
          },
          {
            text: "Precio: Mayor a Menor",
            handler: () => this.aplicarSort("price_desc")
          },
          {
            text: "Relevancia",
            handler: () => this.aplicarSort("relevance")
          },
          {
            text: "Cancelar",
            role: "cancel"
          }
        ];
        this.sortActionSheet.present();
      }
  
      aplicarSort(sortOrder) {
        this.orden = sortOrder;
        this.offset = 0;
        this.hasMoreProducts = true;
        console.log(`Ordenar: ${sortOrder}`);
        this.cargarListadoProductos();
      }
  
      aplicarFiltro(filterId, valueId) {
        const newFilter = `${filterId}=${valueId}`;
        if (!this.appliedFilters.includes(newFilter)) {
          this.appliedFilters.push(newFilter);
          this.mostrarChipFiltro(filterId, valueId);
        }
        this.offset = 0;
        this.hasMoreProducts = true;
        console.log(`Filtros aplicados: ${this.appliedFilters}`);
        this.cargarListadoProductos();
      }
  
      mostrarChipFiltro(filterId, valueId) {
        const chipContainer = this.querySelector("#chip-container");
        const chip = document.createElement('ion-chip');
        chip.innerHTML = `
          ${filterId}: ${valueId}
          <ion-icon name="close-circle"></ion-icon>
        `;
        chip.addEventListener("click", () => {
          this.eliminarFiltro(filterId, valueId);
          chip.remove(); // Elimina el chip del DOM
        });
        chipContainer.appendChild(chip);
      }
  
      eliminarFiltro(filterId, valueId) {
        const filter = `${filterId}=${valueId}`;
        this.appliedFilters = this.appliedFilters.filter(f => f !== filter);
        this.offset = 0;
        this.hasMoreProducts = true;
        console.log(`Filtro eliminado: ${filter}`);
        this.cargarListadoProductos();
        this.mostrarChipsFiltros(); // Actualiza los chips visibles
      }
  
      mostrarChipsFiltros() {
        const chipContainer = this.querySelector("#chip-container");
        chipContainer.innerHTML = '';
        this.appliedFilters.forEach(filter => {
          const [filterId, valueId] = filter.split('=');
          this.mostrarChipFiltro(filterId, valueId);
        });
      }
  
      borrarFiltros() {
        this.appliedFilters = [];
        this.offset = 0;
        this.hasMoreProducts = true;
        console.log('Filtros borrados');
        this.cargarListadoProductos();
        this.mostrarChipsFiltros();
      }
  
      async cargarListadoProductos() {
        console.log(`Cargando listado de productos para la categoría: ${this.categoria}`);
        const searchUrl = construirUrlBusqueda(this.query, this.categoria, this.appliedFilters, this.orden, this.offset);
        try {
          const jsonRes = await fetchProductos(searchUrl);
          this.escribirListadoProductos(jsonRes);
        } catch (error) {
          mostrarError("Error cargando productos");
        }
      }
  
      async cargarMasProductos() {
        if (this.hasMoreProducts) {
          this.offset += 50;
          console.log(`Cargar más productos: offset = ${this.offset}`);
          await this.cargarListadoProductos();
        }
      }
  
      escribirListadoProductos(listado) {
        console.log("Listado de productos recibidos:", listado);
  
        const productosHtml = listado.results.map(producto => crearElementoProducto(producto)).join("");
        if (this.offset === 0) {
          this.querySelector("#listado-productos").innerHTML = `<ion-row>${productosHtml}</ion-row>`;
        } else {
          this.querySelector("#listado-productos ion-row").innerHTML += productosHtml;
        }
  
        if (listado.results.length < 50) {
          this.hasMoreProducts = false;
          this.infiniteScroll.disabled = true;
          console.log("No hay más productos para cargar");
        } else {
          this.infiniteScroll.disabled = false;
        }
      }
  
      cargarFiltros() {
        const url = `${API_URL}/sites/MLU/search?official_store_id=${OFFICIAL_STORE_ID}&category=${CATEGORY_ID}`;
  
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            console.log("Filtros recibidos", data);
            this.filters = data.available_filters.map(filter => {
              return {
                text: filter.name,
                handler: () => {
                  this.abrirFiltroValuesActionSheet(filter);
                }
              };
            });
          })
          .catch((error) => {
            mostrarError('Error cargando filtros');
          });
      }
  
      abrirFiltroValuesActionSheet(filter) {
        const actionSheet = document.createElement('ion-action-sheet');
        actionSheet.header = filter.name;
        actionSheet.buttons = filter.values.map(value => {
          return {
            text: value.name,
            handler: () => {
              this.aplicarFiltro(filter.id, value.id);
            }
          };
        }).concat({
          text: "Cancelar",
          role: "cancel"
        });
        document.body.appendChild(actionSheet);
        actionSheet.present();
      }
    }
  );

  
  customElements.define(
    "page-ampliacion-producto",
    class extends HTMLElement {
      connectedCallback() {
        console.log("connected page-ampliacion-producto", this.productoId);
  
        if (this instanceof HTMLElement) {
          this.innerHTML = document.getElementById("page-ampliacion-producto.html").innerHTML;
  
          this.imageIndex = 0;
          this.imagenes = [];
  
          this.cargarInformacionProducto();
  
          // Escuchar eventos personalizados para la navegación
          this.addEventListener('navegarPageAmpliacion', (event) => {
            navegarPageAmpliacion(event.detail.productoId);
          });
  
          const productImage = this.querySelector("#product-image");
          productImage.addEventListener("click", this.mostrarSiguienteImagen.bind(this));
  
          // Configurar el botón de compartir
          configurarShareButton(this, this.productoId); 
  
          // Configurar opciones de usuario en la página de ampliación del producto
          configurarUserOptions(this); 
  
          // Configurar botón de agregar al carrito
          this.configurarBotonAgregarCarrito();
        } else {
          console.error('this no es un elemento HTML válido');
        }
      }
  
      async cargarInformacionProducto() {
        try {
          const rawRes = await fetch(`${API_URL}/items/${this.productoId}`);
          const jsonRes = await rawRes.json();
          this.imagenes = jsonRes.pictures.map(picture => picture.url);
          this.mostrarImagenActual();
          this.escribirAmpliacionProducto(jsonRes);
          this.cargarDescripcionProducto();
          this.cargarProductosSimilares(jsonRes);
        } catch (error) {
          mostrarError("Error cargando producto");
        }
      }
  
      async cargarDescripcionProducto() {
        try {
          const res = await fetch(`${API_URL}/items/${this.productoId}/description`);
          const json = await res.json();
          this.querySelector("#product-description-content").innerText = json.plain_text;
        } catch (error) {
          mostrarError("Error cargando la descripción del producto");
        }
      }
  
      mostrarImagenActual() {
        const productImage = this.querySelector("#product-image");
        productImage.src = this.imagenes[this.imageIndex];
      }
  
      mostrarSiguienteImagen() {
        this.imageIndex = (this.imageIndex + 1) % this.imagenes.length;
        this.mostrarImagenActual();
      }
  
      escribirAmpliacionProducto(producto) {
        console.log("Datos del producto recibidos:", producto);
  
        this.querySelector("#product-name").innerText = producto.title;
        this.querySelector("#product-price").innerText = `${producto.price} ${producto.currency_id}`;
        this.querySelector("#product-brand").innerText = `Marca: ${producto.attributes.find(attr => attr.id === 'BRAND').value_name}`;
        this.querySelector("#product-warranty").innerText = producto.warranty;
      }
  
      async cargarProductosSimilares(producto) {
        const searchUrl = construirUrlBusqueda('', '', [`brand=${producto.attributes.find(attr => attr.id === 'BRAND').value_id}`], '', 0);
        try {
          const jsonRes = await fetchProductos(searchUrl);
          this.mostrarProductosSimilares(jsonRes.results.slice(0, 2));
        } catch (error) {
          mostrarError("Error cargando productos similares");
        }
      }
  
      mostrarProductosSimilares(productos) {
        const grid = this.querySelector('#productos-similares');
        grid.innerHTML = productos.map(producto => `
          <ion-col size="6">
            <ion-card onclick="this.dispatchEvent(new CustomEvent('navegarPageAmpliacion', { detail: { productoId: '${producto.id}' }, bubbles: true }))">
              <img src="${producto.thumbnail}" />
              <ion-card-header>
                <ion-card-title>${producto.title}</ion-card-title>
                <ion-card-subtitle>${producto.price}</ion-card-subtitle>
              </ion-card-header>
            </ion-card>
          </ion-col>
        `).join('');
      }
  
      configurarBotonAgregarCarrito() {
        const botonAgregarCarrito = this.querySelector("#agregar-carrito");
        botonAgregarCarrito.addEventListener("click", () => {
          if (verificarUsuarioLogueado()) {
            const producto = {
              id: this.productoId,
              name: this.querySelector("#product-name").innerText,
              price: this.querySelector("#product-price").innerText,
              description: this.querySelector("#product-description-content").innerText,
              image: this.querySelector("#product-image").src,
            };
            agregarProductoAlCarrito(producto);
          } else {
            mostrarAlertIniciarSesion();
          }
        });
      }
    }
  );
