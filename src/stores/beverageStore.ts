import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import db from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import type { Unsubscribe } from "firebase/firestore";

let _unsubBeverages: Unsubscribe | null = null;

const defaultBases: BaseBeverageType[] = [
  { id: "b1", name: "Black Tea", color: "#8B4513" },
  { id: "b2", name: "Green Tea", color: "#C8E6C9" },
  { id: "b3", name: "Coffee", color: "#6F4E37" },
];

const defaultSyrups: SyrupType[] = [
  { id: "s1", name: "No Syrup", color: "transparent" },
  { id: "s2", name: "Vanilla", color: "#FFEFD5" },
  { id: "s3", name: "Caramel", color: "#DAA520" },
  { id: "s4", name: "Hazelnut", color: "#6B4423" },
];

const defaultCreamers: CreamerType[] = [
  { id: "c1", name: "No Cream", color: "transparent" },
  { id: "c2", name: "Milk", color: "AliceBlue" },
  { id: "c3", name: "Cream", color: "#F5F5DC" },
  { id: "c4", name: "Half & Half", color: "#FFFACD" },
];

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",
    user: null as User | null,
  }),

  actions: {
    async init() {
      // Load bases
      const basesSnap = await getDocs(collection(db, "bases"));
      if (basesSnap.empty) {
        for (const b of defaultBases) {
          await setDoc(doc(db, "bases", b.id), {
            name: b.name,
            color: b.color,
          });
        }
        this.bases = defaultBases;
      } else {
        this.bases = basesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as BaseBeverageType[];
      }
      if (this.bases.length > 0 && !this.currentBase) {
        this.currentBase = this.bases[0];
      }

      // Load syrups
      const syrupsSnap = await getDocs(collection(db, "syrups"));
      if (syrupsSnap.empty) {
        for (const s of defaultSyrups) {
          await setDoc(doc(db, "syrups", s.id), {
            name: s.name,
            color: s.color,
          });
        }
        this.syrups = defaultSyrups;
      } else {
        this.syrups = syrupsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as SyrupType[];
      }
      if (this.syrups.length > 0 && !this.currentSyrup) {
        this.currentSyrup = this.syrups[0];
      }

      // Load creamers
      const creamersSnap = await getDocs(collection(db, "creamers"));
      if (creamersSnap.empty) {
        for (const c of defaultCreamers) {
          await setDoc(doc(db, "creamers", c.id), {
            name: c.name,
            color: c.color,
          });
        }
        this.creamers = defaultCreamers;
      } else {
        this.creamers = creamersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as CreamerType[];
      }
      if (this.creamers.length > 0 && !this.currentCreamer) {
        this.currentCreamer = this.creamers[0];
      }
    },

    setUser(user: User | null) {
      this.user = user;
      // Clean up previous listener
      if (_unsubBeverages) {
        _unsubBeverages();
        _unsubBeverages = null;
      }
      if (user) {
        this.loadBeverages(user.uid);
      } else {
        this.beverages = [];
      }
    },

    loadBeverages(uid: string) {
      const q = query(
        collection(db, "beverages"),
        where("uid", "==", uid)
      );
      _unsubBeverages = onSnapshot(q, (snapshot) => {
        this.beverages = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as BeverageType[];
      });
    },

    async makeBeverage() {
      if (!this.user) {
        alert("No user logged in, please sign in first.");
        return;
      }
      if (
        !this.currentBase ||
        !this.currentSyrup ||
        !this.currentCreamer ||
        !this.currentName
      ) {
        alert(
          "Please complete all beverage options and the name before making a beverage."
        );
        return;
      }

      const beverageId = `${this.currentBase.id}-${this.currentSyrup.id}-${this.currentCreamer.id}`;

      const newBeverage = {
        name: this.currentName,
        temp: this.currentTemp,
        base: { ...this.currentBase },
        syrup: { ...this.currentSyrup },
        creamer: { ...this.currentCreamer },
        uid: this.user.uid,
      };

      await setDoc(doc(db, "beverages", beverageId), newBeverage);
      const name = this.currentName;
      this.currentName = "";
      return name;
    },

    showBeverage(beverage: BeverageType) {
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentSyrup = beverage.syrup;
      this.currentCreamer = beverage.creamer;
      this.currentBeverage = beverage;
    },
  },
});
