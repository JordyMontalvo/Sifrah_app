import axios from "axios";

// Configuración para diferentes entornos
const getBaseURL = () => {
  // Si hay una variable de entorno específica, usarla
  if (process.env.VUE_APP_SERVER) {
    return process.env.VUE_APP_SERVER + "/api";
  }
  
  // Si no, usar la configuración por defecto según el entorno
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment 
    ? "http://localhost:3000/api" 
    : "https://tu-app-backend.herokuapp.com/api"; // URL de ejemplo de Heroku
};

axios.defaults.baseURL = getBaseURL();

class API {
  constructor({
    Profile,
    Password,
    Security,
    Afiliation,
    Activation,
    Promo,
    Activations,
    Collect,
    Transfer,
    Collects,
    Closeds,
    Transfers,
    Offices,
    ActivationBanners,
  }) {
    this.Profile = new Profile();
    this.Password = new Password();
    this.Security = new Security();
    this.Afiliation = new Afiliation();
    this.Activation = new Activation();
    this.Promo = new Promo();
    this.Activations = new Activations();
    this.Collect = new Collect();
    this.Transfer = new Transfer();
    this.Collects = new Collects();
    this.Closeds = new Closeds();
    this.Transfers = new Transfers();
    this.Offices = new Offices();
    this.ActivationBanners = new ActivationBanners();
  }

  register(data) {
    return axios.post("/auth/register", data);
  }
  login(data) {
    return axios.post("/auth/login", data);
  }
  loginWithGoogle(id_token) {
    return axios.post("/auth/login-google", { id_token });
  }
  logout(session) {
    return axios.post("/auxi/logout", { session });
  }
  verify(session) {
    return axios.get(`/auxi/verify?session=${session}`);
  }
  check(check) {
    return axios.post("/auxi/check", { check });
  }
  dashboard(session) {
    return axios.get(`/app/dashboard?session=${session}`);
  }
  status(session) {
    return axios.get(`/app/status?session=${session}`);
  }
  directs(session) {
    return axios.get(`/app/directs?session=${session}`);
  }
  tree(session, id) {
    return axios.get(`/app/tree?session=${session}&&id=${id}`);
  }
  transactions(session) {
    return axios.get(`/app/transactions?session=${session}`);
  }
  bonuses(session) {
    return axios.get(`/app/bonuses?session=${session}`);
  }
  tools(session) {
    return axios.get(`/app/tools?session=${session}`);
  }
  branch(session, data) {
    return axios.post(`/app/branch?session=${session}`, data);
  }
  photo(session, data) {
    return axios.post(`/app/photo?session=${session}`, data);
  }
  coverage(session, data) {
    return axios.post(`/app/coverage?session=${session}`, data);
  }
  tree(session, id, depth) {
    let url = `/app/tree?session=${session}`
    if (id !== undefined && id !== null) url += `&&id=${id}`
    if (depth !== undefined && depth !== null) url += `&&depth=${depth}`
    return axios.get(url)
  }
  treeComplete(session, id) {
    let url = `/app/tree-complete?session=${session}`
    if (id !== undefined && id !== null) url += `&&id=${id}`
    return axios.get(url)
  }


  // Mercado Pago
//   mercadopagoPreference(data) {
//     return axios.post("http://localhost:4000/api/app/mercadopago", data);
//   }

  // Email System
  sendPasswordReset(data) {
    return axios.post("/email/password-reset", data);
  }

  validateEmail(email) {
    return axios.post("/auth/validate-email", { email });
  }
  
  sendContactEmail(data) {
    return axios.post("/email/contact", data);
  }
  
  sendWelcomeEmail(data) {
    return axios.post("/email/welcome", data);
  }
  
  sendActivationEmail(data) {
    return axios.post("/email/activation", data);
  }
  
  sendCommissionEmail(data) {
    return axios.post("/email/commission", data);
  }
  
  testEmailService() {
    return axios.get("/email/test");
  }
}

class Profile {
  GET(session) {
    return axios.get(`/app/profile?session=${session}`);
  }
  UPDATE(session, data) {
    return axios.post(`/app/profile?session=${session}`, data);
  }
}
class Password {
  GET(session) {
    return axios.get(`/app/password?session=${session}`);
  }
  UPDATE(session, data) {
    return axios.post(`/app/password?session=${session}`, data);
  }
}
class Security {
  GET(session) {
    return axios.get(`/app/security?session=${session}`);
  }
  POST(session, data) {
    return axios.post(`/app/security?session=${session}`, data);
  }
}

class Afiliation {
  GET(session) {
    return axios.get(`/app/affiliation?session=${session}`);
  }
  POST(session, data) {
    return axios.post(`/app/affiliation?session=${session}`, data);
  }
}

class Activation {
  GET(session) {
    return axios.get(`/app/activation?session=${session}`);
  }
  POST(session, data) {
    return axios.post(`/app/activation?session=${session}`, data);
  }
}
class Promo {
  POST(session, data) {
    return axios.post(`/app/promo?session=${session}`, data);
  }
}
class Activations {
  GET(session) {
    return axios.get(`/app/activations?session=${session}`);
  }
}

class Collect {
  GET(session) {
    return axios.get(`/app/collect?session=${session}`);
  }
  POST(session, data) {
    return axios.post(`/app/collect?session=${session}`, data);
  }
}
class Collects {
  GET(session) {
    return axios.get(`/app/collects?session=${session}`);
  }
}

class Closeds {
  GET(session) {
    return axios.get(`/app/closeds?session=${session}`);
  }
}

class Transfer {
  GET(session) {
    return axios.get(`/app/transfer?session=${session}`);
  }
  POST(session, data) {
    return axios.post(`/app/transfer?session=${session}`, data);
  }
}
class Transfers {
  GET(session) {
    return axios.get(`/app/transfers?session=${session}`);
  }
}

class Offices {
  GET() {
    return axios.get(`/app/offices`); // Cambiar a endpoint de usuarios
  }
}

class ActivationBanners {
  GET(session) {
    return axios.get(`/app/activation-banners?session=${session}`);
  }
}

export default new API({
  Profile,
  Password,
  Security,
  Afiliation,
  Activation,
  Promo,
  Activations,
  Collect,
  Closeds,
  Transfer,
  Collects,
  Transfers,
  Offices,
  ActivationBanners,
});
