import { API_URL, OFFICIAL_STORE_ID, CATEGORY_ID } from './constants.js';
import { navegarPageAmpliacion } from './main.js';

function crearElementoProducto(producto) {
  return `
    <ion-col size="6">
      <item-producto
        interactivo="true"
        $id="${producto.id}"
        producto-id="${producto.id}"
        nombre="${producto.title}"
        foto="${producto.thumbnail}"
        precio="${producto.price}"
        moneda="${producto.currency_id}"
      ></item-producto>
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
  console.log(`URL construida: ${url}`); // Agregado para depuración
  return url;
}

async function fetchProductos(searchUrl) {
  console.log(`Fetch Productos URL: ${searchUrl}`); // Agregado para depuración
  const rawRes = await fetch(searchUrl);
  return await rawRes.json();
}

customElements.define(
  "page-listado-productos",
  class extends HTMLElement {
    connectedCallback() {
      console.log("connected page-listado-productos");

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
      this.orden = "";
      this.appliedFilters = [];
      this.offset = 0;
      this.hasMoreProducts = true;

      this.infiniteScroll = this.querySelector("#infinite-scroll");
      this.infiniteScroll.addEventListener("ionInfinite", async () => {
        console.log('Infinite Scroll solicitado'); // Agregado para depuración
        await this.cargarMasProductos();
        this.infiniteScroll.complete();
      });

      this.cargarFiltros();
      this.cargarListadoProductos();
    }

    onSearch(event) {
      this.query = event.target.value.trim();
      this.offset = 0;
      this.hasMoreProducts = true;
      console.log(`Buscar: ${this.query}`); // Agregado para depuración
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
      console.log(`Ordenar: ${sortOrder}`); // Agregado para depuración
      this.cargarListadoProductos();
    }

    aplicarFiltro(filterId, valueId) {
      const newFilter = `${filterId}=${valueId}`;
      if (!this.appliedFilters.includes(newFilter)) {
        this.appliedFilters.push(newFilter);
      }
      this.offset = 0;
      this.hasMoreProducts = true;
      console.log(`Filtros aplicados: ${this.appliedFilters}`); // Agregado para depuración
      this.cargarListadoProductos();
    }

    borrarFiltros() {
      this.appliedFilters = [];
      this.offset = 0;
      this.hasMoreProducts = true;
      console.log('Filtros borrados'); // Agregado para depuración
      this.cargarListadoProductos();
    }

    async cargarListadoProductos() {
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
        console.log(`Cargar más productos: offset = ${this.offset}`); // Agregado para depuración
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
        console.log("No hay más productos para cargar"); // Agregado para depuración
      } else {
        this.infiniteScroll.disabled = false;
      }
    }

    cargarFiltros() {
      const url = `${API_URL}/sites/MLU/search?official_store_id=${OFFICIAL_STORE_ID}&category=${CATEGORY_ID}`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log("Filtros recibidos", data); // Agregado para depuración
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

      this.innerHTML = document.getElementById("page-ampliacion-producto.html").innerHTML;

      this.cargarInformacionProducto();
    }

    async cargarInformacionProducto() {
      try {
        const rawRes = await fetch(`${API_URL}/items/${this.productoId}`);
        const jsonRes = await rawRes.json();
        this.escribirAmpliacionProducto(jsonRes);
      } catch (error) {
        mostrarError("Error cargando producto");
      }
    }

    escribirAmpliacionProducto(producto) {
      console.log("Datos del producto recibidos:", producto);

      this.querySelector("#ampliacion-producto").innerHTML = `
        <item-producto
          $id="${producto.id}"
          producto-id="${producto.id}"
          nombre="${producto.title}"
          foto="${producto.thumbnail}"
          precio="${producto.price}"
          moneda="${producto.currency_id}"
          descripcion="${producto.plain_text}"
        ></item-producto>
      `;
    }
  }
);
