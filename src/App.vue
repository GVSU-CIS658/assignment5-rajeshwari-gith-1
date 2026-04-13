<template>
  <div>
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />
    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :id="`r${temp}`"
              :value="temp"
              v-model="beverageStore.currentTemp"
            />
            {{ temp }}
          </label>
        </template>
      </li>
      <li>
        <template v-for="b in beverageStore.bases" :key="b.id">
          <label>
            <input
              type="radio"
              name="bases"
              :id="`r${b.id}`"
              :value="b"
              v-model="beverageStore.currentBase"
            />
            {{ b.name }}
          </label>
        </template>
      </li>
      <li>
        <template v-for="s in beverageStore.syrups" :key="s.id">
          <label>
            <input
              type="radio"
              name="syrups"
              :id="`r${s.id}`"
              :value="s"
              v-model="beverageStore.currentSyrup"
            />
            {{ s.name }}
          </label>
        </template>
      </li>
      <li>
        <template v-for="c in beverageStore.creamers" :key="c.id">
          <label>
            <input
              type="radio"
              name="creamers"
              :id="`r${c.id}`"
              :value="c"
              v-model="beverageStore.currentCreamer"
            />
            {{ c.name }}
          </label>
        </template>
      </li>
    </ul>
    <div v-if="beverageStore.user">
      Signed in as {{ beverageStore.user.displayName }}
      <button @click="signOutUser">Sign out</button>
    </div>
    <div v-else>
      <button @click="signInWithGoogle">Sign in with Google</button>
    </div>
    <input type="text" placeholder="Beverage Name" v-model="beverageStore.currentName" />
    <button @click="makeBev" :disabled="!beverageStore.user">🍺 Make Beverage</button>
    <p v-if="!beverageStore.user">Please sign in to save your beverage.</p>
    <p v-if="statusMessage">{{ statusMessage }}</p>
  </div>
  <div id="beverage-container" style="margin-top: 20px">
    <template v-for="beverage in beverageStore.beverages" :key="beverage.id">
      <input
        type="radio"
        name="savedBeverage"
        :value="beverage.id"
        @change="beverageStore.showBeverage(beverage)"
      />
      {{ beverage.name }}
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "./firebase";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";

const beverageStore = useBeverageStore();
const statusMessage = ref("");

onMounted(() => {
  beverageStore.init();
  onAuthStateChanged(auth, (user) => {
    beverageStore.setUser(user);
    if (user) {
      statusMessage.value = "Signed in with Google.";
    }
  });
});

async function signInWithGoogle() {
  await signInWithPopup(auth, provider);
}

async function makeBev() {
  const name = await beverageStore.makeBeverage();
  if (name) {
    statusMessage.value = `Beverage ${name} made successfully!`;
    setTimeout(() => {
      statusMessage.value = "";
    }, 3000);
  }
}

async function signOutUser() {
  await signOut(auth);
  beverageStore.setUser(null);
  statusMessage.value = "Signed out.";
}
</script>

<style lang="scss">
body,
html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}
ul {
  list-style: none;
  padding: 0;
  li {
    margin-bottom: 15px;
  }
}
#beverage-container {
  margin-top: 20px;
  label {
    display: block;
    margin-bottom: 5px;
  }
}
</style>
