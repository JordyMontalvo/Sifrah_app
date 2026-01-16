// Mock temporal del endpoint de tienda compartida
// Este archivo simula la respuesta del backend para desarrollo

export const mockSharedStoreData = {
  error: false,
  products: [
    {
      id: "1",
      name: "Producto Demo 1",
      price: 100,
      price_socio: 80,
      points: 10,
      img: "https://via.placeholder.com/300x300?text=Producto+1",
      description: "Descripción del producto demo 1",
      subdescription: "Subdescripción breve",
      type: "Categoría 1"
    },
    {
      id: "2",
      name: "Producto Demo 2",
      price: 150,
      price_socio: 120,
      points: 15,
      img: "https://via.placeholder.com/300x300?text=Producto+2",
      description: "Descripción del producto demo 2",
      subdescription: "Subdescripción breve",
      type: "Categoría 1"
    },
    {
      id: "3",
      name: "Producto Demo 3",
      price: 200,
      price_socio: 160,
      points: 20,
      img: "https://via.placeholder.com/300x300?text=Producto+3",
      description: "Descripción del producto demo 3",
      subdescripción: "Subdescripción breve",
      type: "Categoría 2"
    }
  ],
  ownerName: "Usuario Demo",
  activationBanners: {
    left: "",
    centerTop: "",
    centerBottom: "",
    right: ""
  }
};
