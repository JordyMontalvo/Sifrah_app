import axios from 'axios'

axios.defaults.baseURL = process.env.VUE_APP_SERVER + '/api'


class API {

  constructor({ Profile, Password, Security, Afiliation, Activation, Promo, Activations, Collect, Transfer, Collects, Closeds, Transfers }) {
    this.Profile     = new Profile
    this.Password    = new Password
    this.Security    = new Security
    this.Afiliation  = new Afiliation
    this.Activation  = new Activation
    this.Promo       = new Promo
    this.Activations = new Activations
    this.Collect     = new Collect
    this.Transfer    = new Transfer
    this.Collects    = new Collects
    this.Closeds     = new Closeds
    this.Transfers   = new Transfers
  }

  register(data) {
    return axios.post('/auth/register', data)
  }
  login(data) {
    return axios.post('/auth/login', data)
  }
  logout(session) {
    return axios.post('/aux/logout', { session })
  }
  verify(session) {
    return axios.get (`/aux/verify?session=${session}`)
  }
  check(check) {
    return axios.post('/aux/check', { check })
  }
  dashboard(session) {
    return axios.get (`/app/dashboard?session=${session}`)
  }
  status(session) {
    return axios.get (`/app/status?session=${session}`)
  }
  directs(session) {
    return axios.get (`/app/directs?session=${session}`)
  }
  tree(session, id) {
    return axios.get (`/app/tree?session=${session}&&id=${id}`)
  }
  transactions(session) {
    return axios.get (`/app/transactions?session=${session}`)
  }
  bonuses(session) {
    return axios.get (`/app/bonuses?session=${session}`)
  }
  tools(session) {
    return axios.get (`/app/tools?session=${session}`)
  }
  branch(session, data) {
    return axios.post(`/app/branch?session=${session}`, data)
  }
  photo(session, data) {
    return axios.post(`/app/photo?session=${session}`, data)
  }
  coverage(session, data) {
    return axios.post(`/app/coverage?session=${session}`, data)
  }
}

class Profile {
  GET(session) {
    return axios.get (`/app/profile?session=${session}`)
  }
  UPDATE(session, data) {
    return axios.post(`/app/profile?session=${session}`, data)
  }
}
class Password {
  GET(session) {
    return axios.get (`/app/password?session=${session}`)
  }
  UPDATE(session, data) {
    return axios.post(`/app/password?session=${session}`, data)
  }
}
class Security {
  GET(session) {
    return axios.get (`/app/security?session=${session}`)
  }
  POST(session, data) {
    return axios.post(`/app/security?session=${session}`, data)
  }
}

class Afiliation {
  GET(session) {
    return axios.get (`/app/affiliation?session=${session}`)
  }
  POST(session, data) {
    return axios.post(`/app/affiliation?session=${session}`, data)
  }
}

class Activation {
  GET(session) {
    return axios.get (`/app/activation?session=${session}`)
  }
  POST(session, data) {
    return axios.post(`/app/activation?session=${session}`, data)
  }
}
class Promo {
  POST(session, data) {
    return axios.post(`/app/promo?session=${session}`, data)
  }
}
class Activations {
  GET(session) {
    return axios.get (`/app/activations?session=${session}`)
  }
}

class Collect {
  GET(session) {
    return axios.get (`/app/collect?session=${session}`)
  }
  POST(session, data) {
    return axios.post(`/app/collect?session=${session}`, data)
  }
}
class Collects {
  GET(session) {
    return axios.get (`/app/collects?session=${session}`)
  }
}

class Closeds {
  GET(session) {
    return axios.get (`/app/closeds?session=${session}`)
  }
}

class Transfer {
  GET(session) {
    return axios.get (`/app/transfer?session=${session}`)
  }
  POST(session, data) {
    return axios.post(`/app/transfer?session=${session}`, data)
  }
}
class Transfers {
  GET(session) {
    return axios.get (`/app/transfers?session=${session}`)
  }
}

export default new API({ Profile, Password, Security, Afiliation, Activation, Promo, Activations, Collect, Closeds, Transfer, Collects, Transfers })
