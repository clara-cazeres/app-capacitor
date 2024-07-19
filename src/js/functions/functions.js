import { global } from '../constants.js';

export function configurarUserOptions(page) {
  setTimeout(() => {  // asegurar que el DOM esté actualizado
    try {
      if (page instanceof HTMLElement) {
        const userOptionsButton = page.querySelector("#user-options-button");

        if (userOptionsButton) {
          userOptionsButton.addEventListener("click", async () => {
            const actionSheet = document.createElement('ion-action-sheet');
            const userName = localStorage.getItem("user-name");
            const userToken = localStorage.getItem("user-token");

            if (userToken && userName) {
              actionSheet.header = userName;
              actionSheet.buttons = [
                {
                  text: 'Log Out',
                  handler: () => {
                    logout();
                    actionSheet.dismiss(); // Cerrar el action sheet
                  }
                },
                {
                  text: 'Cancelar',
                  role: 'cancel'
                }
              ];
            } else {
              actionSheet.header = 'Opciones de Usuario';
              actionSheet.buttons = [
                {
                  text: 'Registrarse',
                  handler: () => {
                    document.querySelector("ion-nav").setRoot("page-registro");
                    actionSheet.dismiss(); // Cerrar el action sheet
                  }
                },
                {
                  text: 'Log In',
                  handler: () => {
                    document.querySelector("ion-nav").setRoot("page-login");
                    actionSheet.dismiss(); // Cerrar el action sheet
                  }
                },
              ];
            }

            document.body.appendChild(actionSheet);
            await actionSheet.present();
          });
        } else {
          console.log('user-options-button no encontrado en esta página');
        }
      }
    } catch (error) {
      console.error('Error al configurar user-options-button:', error);
    }
  }, 100);  // Ajustar el tiempo de espera si es necesario
}

export function submitFormLogin(ev) {
  ev.preventDefault();

  const datos = {
    mail: document.querySelector("#inp-login-mail").value,
    pass: document.querySelector("#inp-login-pass").value,
  };

  console.log("Datos a enviar:", datos);

  fetch("https://user-api-64ni.onrender.com/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: datos.mail,
      password: datos.pass,
    }),
    mode: 'cors'
  })
    .then((response) => {
      console.log('Response Status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((jsonRes) => {
      console.log("Respuesta JSON:", jsonRes);
      global.user = jsonRes.info;
      console.log("Usuario global:", global);

      localStorage.setItem("user-token", jsonRes.token);
      localStorage.setItem("user-name", global.user.name);

      const toast = document.createElement('ion-toast');
      toast.message = 'Inicio de sesión exitoso';
      toast.duration = 2000;
      document.body.appendChild(toast);
      toast.present();

      document.querySelector("ion-nav").setRoot("page-inicio");
    })
    .catch((error) => {
      console.error("Error en la solicitud:", error);
      const toast = document.createElement('ion-toast');
      toast.message = 'Error en el inicio de sesión';
      toast.color = 'danger';
      toast.duration = 2000;
      document.body.appendChild(toast);
      toast.present();
    });
}

export function submitFormRegistro(ev) {
    ev.preventDefault();
  
    const datos = {
      name: document.querySelector("#inp-registro-nombre").value,
      email: document.querySelector("#inp-registro-mail").value,
      password: document.querySelector("#inp-registro-pass").value,
    };
  
    console.log("Datos a enviar:", datos);
  
    fetch("https://user-api-64ni.onrender.com/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
      mode: 'cors'
    })
      .then((response) => {
        console.log('Response Status:', response.status);
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(`Error ${response.status}: ${err.message}`);
          });
        }
        return response.json();
      })
      .then((jsonRes) => {
        console.log("Respuesta JSON:", jsonRes);
  
        const toast = document.createElement('ion-toast');
        toast.message = 'Registro exitoso';
        toast.duration = 2000;
        document.body.appendChild(toast);
        toast.present();
  
        document.querySelector("ion-nav").setRoot("page-login");
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
        const toast = document.createElement('ion-toast');
        toast.message = error.message || 'Error en el registro';
        toast.color = 'danger';
        toast.duration = 2000;
        document.body.appendChild(toast);
        toast.present();
      });
  }
  
export function validarSesion() {
  const token = localStorage.getItem("user-token");

  if (!token) {
    document.querySelector("ion-menu").setAttribute("disabled", true);
    document.querySelector("ion-nav").setRoot("page-login");
  }
}

export function obtenerInfoUsuario() {
  fetch("https://user-api-64ni.onrender.com/api/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("user-token"),
    },
  })
    .then((rawRes) => rawRes.json())
    .then((jsonRes) => {
      global.user = jsonRes.info;
      document.querySelector("#user-info").innerHTML += /*html*/ `
          <ion-item-divider>
              <ion-label>User info</ion-item-divider>
          <ion-item>
              <ion-label>Nombre</ion-item>
              <ion-badge slot="end">${global.user.name}</ion-badge>
          </ion-item>
          <ion-item>
              <ion-label>Email</ion-item>
              <ion-badge slot="end">${global.user.email}</ion-badge>
          </ion-item>
          <ion-item>
              <ion-label>Username</ion-item>
              <ion-badge slot="end">${global.user.username}</ion-badge>
          </ion-item>
      `;
    })
    .catch((error) => {
      console.log("CATCH", error);
    });
}

export function logout() {
  localStorage.removeItem("user-token");
  localStorage.removeItem("user-name");
  document.querySelector("ion-nav").setRoot("page-inicio");

  const toast = document.createElement('ion-toast');
  toast.message = 'Sesión cerrada';
  toast.duration = 2000;
  document.body.appendChild(toast);
  toast.present();
}
