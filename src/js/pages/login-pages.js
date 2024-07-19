import {
    submitFormLogin,
    submitFormRegistro,
    validarSesion,
    obtenerInfoUsuario,
    logout
  } from "../functions/functions.js";
  
  customElements.define(
    "page-registro",
    class extends HTMLElement {
      connectedCallback() {
        console.log("page-registro");
  
        this.innerHTML = document.getElementById("page-registro.html").innerHTML;
  
        this.querySelector("#btn-navigate-login").addEventListener("click", () => {
          document.querySelector("ion-nav").setRoot("page-login");
        });
  
        this.querySelector("form").addEventListener("submit", submitFormRegistro);
      }
    }
  );
  
  customElements.define(
    "page-login",
    class extends HTMLElement {
      connectedCallback() {
        console.log("page-login");
  
        this.innerHTML = document.getElementById("page-login.html").innerHTML;
  
        this.querySelector("#btn-navigate-registro").addEventListener("click", () => {
          document.querySelector("ion-nav").setRoot("page-registro");
        });
  
        this.querySelector("form").addEventListener("submit", submitFormLogin);
      }
    }
  );
  
  customElements.define(
    "page-user",
    class extends HTMLElement {
      connectedCallback() {
        console.log("page-user");
  
        validarSesion();
  
        this.innerHTML = document.getElementById("page-user.html").innerHTML;
  
        obtenerInfoUsuario();
      }
    }
  );
  