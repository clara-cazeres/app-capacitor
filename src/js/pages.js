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

customElements.define(
  "page-listado-productos",
  class extends HTMLElement {
    connectedCallback() {
      console.log("connected page-listado-productos");

      this.innerHTML = document.getElementById("page-listado-productos.html").innerHTML;

      // input busqueda
      this.searchBar = this.querySelector("#search-bar");
      this.searchBar.addEventListener("ionInput", this.onSearch.bind(this));

      // botones de filtros y orden
      this.filterButton = this.querySelector("#filter-button");
      this.sortButton = this.querySelector("#sort-button");

      // action sheets
      this.filterActionSheet = this.querySelector("#filter-action-sheet");
      this.sortActionSheet = this.querySelector("#sort-action-sheet");

      this.filterButton.addEventListener("click", this.abrirFiltroActionSheet.bind(this));
      this.sortButton.addEventListener("click", this.cerrarSortActionSheet.bind(this));

      this.filters = [];
      this.query = "";
      this.categoria = CATEGORY_ID;
      this.orden = "";
      this.selectedFilter = "";
      this.offset = 0;
      this.hasMoreProducts = true;

      this.infiniteScroll = this.querySelector("#infinite-scroll");
      this.infiniteScroll.addEventListener("ionInfinite", async () => {
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
      this.cargarListadoProductos();
    }

    abrirFiltroActionSheet() {
      this.filterActionSheet.header = "Filtrar Productos";
      this.filterActionSheet.buttons = this.filters.concat({
        text: "Cancelar",
        role: "cancel",
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
      this.cargarListadoProductos();
    }

    aplicarFiltro(filterId, valueId) {
      this.selectedFilter = `${filterId}=${valueId}`;
      this.offset = 0;
      this.hasMoreProducts = true;
      this.cargarListadoProductos();
    }

    async cargarListadoProductos() {
      let searchUrl = `${API_URL}/sites/MLU/search?official_store_id=${OFFICIAL_STORE_ID}`;

      if (this.query) {
        searchUrl += `&q=${encodeURIComponent(this.query)}`;
      }
      if (this.categoria) {
        searchUrl += `&category=${this.categoria}`;
      }
      if (this.selectedFilter) {
        searchUrl += `&${this.selectedFilter}`;
      }
      if (this.orden) {
        searchUrl += `&sort=${this.orden}`;
      }
      searchUrl += `&offset=${this.offset}&limit=50`;

      try {
        const rawRes = await fetch(searchUrl);
        const jsonRes = await rawRes.json();
        this.escribirListadoProductos(jsonRes);
      } catch (error) {
        console.log("Error cargarListadoProductos", error);
        this.querySelector("#listado-productos").innerHTML = "<p>Error cargando productos.</p>";
      }
    }

    async cargarMasProductos() {
      this.offset += 50;
      await this.cargarListadoProductos();
    }

    escribirListadoProductos(listado) {
      console.log("listado productos", listado);

      const productosHtml = listado.results.map(producto => crearElementoProducto(producto)).join("");
      if (this.offset === 0) {
        this.querySelector("#listado-productos").innerHTML = `<ion-row>${productosHtml}</ion-row>`;
      } else {
        this.querySelector("#listado-productos ion-row").innerHTML += productosHtml;
      }

      if (listado.results.length < 50) {
        this.hasMoreProducts = false;
        this.infiniteScroll.disabled = true;
      }
    }

    cargarFiltros() {
      const url = `${API_URL}/sites/MLU/search?official_store_id=${OFFICIAL_STORE_ID}&category=${CATEGORY_ID}`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
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
          console.error('Error loading filters:', error);
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
        console.log("Error cargarInformacionProducto", error);
        this.querySelector("#ampliacion-producto").innerHTML = "<p>Error cargando producto.</p>";
      }
    }

    escribirAmpliacionProducto(producto) {
      console.log("data producto", producto);

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
