<template>
  <div>
    <bread-crumb />
    <settings v-show="status.showSettings" :book-id="bookId" />
    <div class="functions">
      <ul>
        <li>
          <router-link to="/" class="btn btn-sm btn-info" @click="toggleToC">首页</router-link>
        </li>
        <li>
          <button class="btn btn-sm btn-info" @click="status.showSettings = !status.showSettings">设置</button>
        </li>
        <li>
          <button class="btn btn-sm btn-info" @click="toggleToC">目录</button>
        </li>
        <li>
          <button class="btn btn-sm btn-info" @click="prevChapter">上一节</button>
        </li>
        <li>
          <button class="btn btn-sm btn-primary" @click="nextChapter">下一节</button>
        </li>
      </ul>
    </div>
    <div
      class="table-of-contencts overscroll"
      :style="`max-height: ${styles.winHeight - 100}px`"
      v-show="shared.category.showToC"
    >
      <ul class="book-category">
        <table-contents
          v-for="category in data.categoryRootTree.children"
          :category="category"
          :key="category.id"
        />
      </ul>
    </div>
    <div class="chapter-content" @click="toggleToC(false)">
      <chapter-content
        v-if="shared.category.selected"
        :book-id="bookId"
        :key="shared.category.selected.id"
      />
    </div>
  </div>
</template>
<script>
import {
  getBookCategoryTree,
  iterableTree,
  getBooksProgress,
  updateBooksProgress,
  getBookInfo
} from "../services/api";
import TableContents from "../components/TableContents";
import ChapterContent from "../components/ChapterContent";
import BreadCrumb from "../components/BreadCrumb";
import Settings from "../components/Settings";
import { SharedInfo } from "../services/store";

export default {
  data() {
    return {
      bookId: this.$route.params.id,
      data: {
        categoryRootTree: {
          children: []
        },
        flattedCategory: []
      },
      styles: {
        winHeight: window.innerHeight
      },
      status: {
        showSettings: false
      },
      shared: SharedInfo
    };
  },
  mounted() {
    this.loadCategoryTree();
    this.loadBookInfo();
  },
  methods: {
    loadBookInfo() {
      getBookInfo(this.bookId).then(response => {
        if (response.data) {
          this.shared.book = response.data;
        }
      });
    },
    loadCategoryTree() {
      getBookCategoryTree(this.bookId).then(response => {
        this.data.flattedCategory = [];
        iterableTree({ children: response.data }, item => {
          item.selected = false;
          this.data.flattedCategory.push(item);
        });
        this.data.categoryRootTree.children = response.data;
        this.initReadProgress();
      });
    },
    setHeight() {
      window.addEventListener("resize", () => {
        this.styles.winHeight = window.innerHeight - 10;
      });
    },
    toggleToC(val) {
      if (typeof val === "boolean") {
        this.shared.category.showToC = val;
      } else {
        this.shared.category.showToC = !this.shared.category.showToC;
      }
    },
    prevChapter() {
      let current = this.shared.category.selected;
      const index = this.data.flattedCategory.indexOf(current);
      if (index <= 1) {
        return;
      }
      this.shared.category.selected = this.data.flattedCategory[index - 1];
      this.shared.category.showToC = false;
      this.saveReadProgress(this.shared.category.selected);
    },
    nextChapter() {
      let current = this.shared.category.selected;
      const index = this.data.flattedCategory.indexOf(current);
      if (index === this.data.flattedCategory.length) {
        return;
      }
      this.shared.category.selected = this.data.flattedCategory[index + 1];
      this.shared.category.showToC = false;
      this.saveReadProgress(this.shared.category.selected);
    },
    initReadProgress() {
      const localData = getBooksProgress().filter(
        item => item.bookId === this.bookId
      )[0];

      if (!localData || !localData.chapterId) {
        this.shared.category.selected = this.data.categoryRootTree.children[0];
        return;
      }
      iterableTree(this.data.categoryRootTree, item => {
        if (item.id === localData.chapterId) {
          this.shared.category.selected = item;
        }
      });
    },
    saveReadProgress(chapter) {
      const currentProgress = {
        bookId: this.bookId,
        chapterId: chapter.id,
        chapterName: chapter.name,
        date: Date.now()
      };
      const progress = getBooksProgress();
      let hasFound = false;
      for (let index = 0; index < progress.length; index++) {
        const item = progress[index];
        if (item.bookId === currentProgress.bookId) {
          progress[index] = currentProgress;
          hasFound = true;
          break;
        }
      }
      if (!hasFound) {
        progress.push(currentProgress);
      }
      updateBooksProgress(progress);
    }
  },
  components: {
    "table-contents": TableContents,
    "chapter-content": ChapterContent,
    "bread-crumb": BreadCrumb,
    settings: Settings
  }
};
</script>