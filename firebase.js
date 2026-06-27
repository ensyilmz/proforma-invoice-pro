import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_rgeKc82tZHClRolGKqiC6vu_7ngUYcQ",
  authDomain: "proforma-invoice-pro.firebaseapp.com",
  projectId: "proforma-invoice-pro",
  storageBucket: "proforma-invoice-pro.firebasestorage.app",
  messagingSenderId: "519588626728",
  appId: "1:519588626728:web:9f759293c55fb9a732501d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);