<template>
  <App :session="session" title="Libros">
    <div class="libros-view" :class="{ 'no-padding': readerActive }">
      <!-- Header -->
      <header class="libros-header">
        <div class="header-top">
          <button class="back-btn" @click="$router.push('/dashboard')">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h1 class="header-title">Libros</h1>
          <div class="header-actions">
            <i class="far fa-bell"></i>
            <i class="fas fa-share-alt"></i>
          </div>
        </div>
        <p class="header-subtitle">{{ sectionSubtitle }}</p>
      </header>

      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Buscar libro..." v-model="searchQuery" />
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab" 
          :class="['tab-item', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Category Chips -->
      <div class="category-chips">
        <button 
          v-for="cat in categories" 
          :key="cat" 
          :class="['chip-item', { active: activeCategory === cat }]"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Book List (Grid) -->
      <div class="book-list">
        <div v-for="book in filteredBooks" :key="book._id" class="book-card" @click="openReader(book)">
          <div class="book-cover">
            <img :src="book.image || defaultImage" alt="Cover" />
            <button class="bookmark-btn" @click.stop="toggleFavorite(book._id)">
              <i :class="[isFavorite(book._id) ? 'fas fa-bookmark active' : 'far fa-bookmark']"></i>
            </button>
          </div>
          <div class="book-info">
            <div class="book-meta">
              <div class="book-rating">
                <i class="fas fa-star" v-for="n in book.rating" :key="'s'+n"></i>
                <i class="far fa-star" v-for="n in 5 - book.rating" :key="'e'+n"></i>
              </div>
              <span class="book-pages">{{ book.pages }} pags</span>
            </div>
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
          </div>
        </div>
      </div>

      <!-- Reader Overlay -->
      <BookReader 
        :active="readerActive" 
        :book="selectedBook" 
        @close="readerActive = false"
      />

    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import BookReader from "./BookReader.vue";

export default {
  components: {
    App,
    BookReader
  },
  data() {
    return {
      searchQuery: "",
      activeTab: "Todos",
      activeCategory: "Todos",
      loading: true,
      sectionSubtitle: "Lee y aprende sin límites",
      tabs: ["Todos", "Nuevos", "Favoritos"],
      favorites: JSON.parse(localStorage.getItem('book_favorites') || '[]'),
      books: [],
      defaultImage: "https://via.placeholder.com/300x450?text=Libro",
      readerActive: false,
      selectedBook: null
    };
  },
  computed: {
    categories() {
      const dynamicCats = [...new Set(this.books.map(b => b.category).filter(Boolean))];
      return ["Todos", ...dynamicCats];
    },
    session() {
      return this.$store.state.session;
    },
    filteredBooks() {
      return this.books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        let matchesTab = true;
        if (this.activeTab === "Favoritos") matchesTab = this.isFavorite(book._id);
        if (this.activeTab === "Nuevos") {
           matchesTab = this.isRecent(book.created_at);
        }

        const matchesCategory = this.activeCategory === "Todos" || book.category === this.activeCategory;
        
        return matchesSearch && matchesCategory && matchesTab;
      });
    }
  },
  methods: {
    async fetchSubtitle() {
      try {
        const res = await api.Books.GET_CONFIG();
        if (res.data && res.data.subtitle) {
          this.sectionSubtitle = res.data.subtitle;
        }
      } catch (err) {
        console.error("Error fetching subtitle:", err);
      }
    },
    isRecent(date) {
      if (!date) return false;
      const created = new Date(date);
      const now = new Date();
      return (now - created) < (5 * 24 * 60 * 60 * 1000); // 5 days
    },
    async fetchBooks() {
      try {
        this.loading = true;
        const res = await api.Books.GET();
        if (res.data && res.data.books) {
          this.books = res.data.books.map(b => ({
            ...b,
            rating: b.rating ? parseInt(b.rating) || 5 : 5,
            pages: b.pages || "100"
          }));
        }
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        this.loading = false;
      }
    },
    openBook(url) {
      if(url) {
        window.open(url, '_blank');
      }
    },
    openReader(book) {
      this.selectedBook = book;
      this.readerActive = true;
    },
    toggleFavorite(bookId) {
      const index = this.favorites.indexOf(bookId);
      if (index > -1) {
        this.favorites.splice(index, 1);
      } else {
        this.favorites.push(bookId);
      }
      localStorage.setItem('book_favorites', JSON.stringify(this.favorites));
    },
    isFavorite(bookId) {
      return this.favorites.includes(bookId);
    }
  },
  async mounted() {
    this.fetchSubtitle();
    this.fetchBooks();
  },
};
</script>

<style scoped src="../../assets/style/views/app/Libros.css"></style>
