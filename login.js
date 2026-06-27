import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const resetBtn = document.getElementById("resetBtn");

const authMessage = document.getElementById("authMessage");

/* Giriş yapılmışsa direkt panele gönder */

onAuthStateChanged(auth, (user) => {

  if (user) {
    window.location.href = "index.html";
  }

});

/* Giriş */

loginBtn.addEventListener("click", async () => {

  try {

    await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    authMessage.innerHTML =
      "Giriş başarılı, yönlendiriliyorsunuz...";

  } catch (err) {

    authMessage.innerHTML =
      "E-Posta veya şifre hatalı.";

  }

});

/* Kayıt Ol */

registerBtn.addEventListener("click", async () => {

  try {

    await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    authMessage.innerHTML =
      "Hesap oluşturuldu.";

  } catch (err) {

    authMessage.innerHTML =
      err.message;

  }

});

/* Şifre Sıfırla */

resetBtn.addEventListener("click", async () => {

  if (!email.value) {

    authMessage.innerHTML =
      "Önce e-posta adresinizi girin.";

    return;
  }

  try {

    await sendPasswordResetEmail(
      auth,
      email.value
    );

    authMessage.innerHTML =
      "Şifre sıfırlama maili gönderildi.";

  } catch (err) {

    authMessage.innerHTML =
      err.message;

  }

});