import { navegarPageAmpliacion } from './main.js';

customElements.define(
    "item-producto",
    class extends HTMLElement {
      connectedCallback() {
        console.log("connected item-producto");
  
        this.dataProducto = {
          $id: this.attributes.$id.value,
          nombre: this.attributes.nombre.value,
          foto: this.attributes.foto.value,
          precio: this.attributes.precio.value,
          precioOriginal: this.attributes['precio-original']?.value || '',
          moneda: this.attributes.moneda.value,
          descripcion: this.attributes.descripcion ? this.attributes.descripcion.value : "",
        };
  
        this.interactivo = this.attributes.interactivo?.value || "";
        const buttonAttr = this.interactivo ? "button" : "";
  
        const originalPrice = this.dataProducto.precioOriginal ? `<span class="original-price">${this.dataProducto.precioOriginal} ${this.dataProducto.moneda}</span>` : '';
        const discountedPrice = `<span class="discounted-price">${this.dataProducto.precio} ${this.dataProducto.moneda}</span>`;
  
        this.innerHTML = `
          <ion-card ${buttonAttr}>
            <img alt="Imagen del producto" src="${this.dataProducto.foto}" />
            <ion-card-header>
              <ion-card-title>${this.dataProducto.nombre}</ion-card-title>
              <ion-card-subtitle>
                ${originalPrice} ${discountedPrice}
              </ion-card-subtitle>
            </ion-card-header>
            ${this.dataProducto.descripcion ? `<ion-card-content>${this.dataProducto.descripcion}</ion-card-content>` : ""}
          </ion-card>
        `;
  
        if (this.interactivo) {
          this.querySelector("ion-card").addEventListener("click", () =>
            navegarPageAmpliacion(this.dataProducto.$id)
          );
        }
      }
    }
  );
  

customElements.define(
  "skeleton-producto",
  class extends HTMLElement {
    connectedCallback() {
      const height = this.attributes.height?.value || "200px";
      const width = this.attributes.width?.value || "100%";
      this.innerHTML = `
        <ion-card>
          <ion-skeleton-text animated style="height: ${height}; width: ${width}; margin: 0"></ion-skeleton-text>
          <ion-card-header>
            <ion-card-title>
              <ion-skeleton-text animated style="width: 80px"></ion-skeleton-text>
            </ion-card-title>
            <ion-card-subtitle style="display: flex; gap: 8px">
              <ion-skeleton-text animated style="width: 20px"></ion-skeleton-text>
              <span><ion-skeleton-text animated style="width: 55px"></ion-skeleton-text></span>
              <ion-skeleton-text animated style="width: 40px"></ion-skeleton-text>
            </ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      `;
    }
  }
);
