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

/* Giriş */

loginBtn.addEventListener("click", async () => {

  const card = document.querySelector(".login-card");
  const btnText = loginBtn.querySelector(".btn-text");

  loginBtn.classList.add("loading");
  card?.classList.add("loading");
  btnText.innerHTML = "Giriş yapılıyor...";
  authMessage.innerHTML = "";

  try {

    await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    authMessage.innerHTML =
      "Giriş başarılı, yönlendiriliyorsunuz...";

document.getElementById("loginTransition")?.classList.add("active");

setTimeout(() => {
  window.location.href = "index.html";
}, 1000);

  } catch (err) {

    loginBtn.classList.remove("loading");
    card?.classList.remove("loading");
    btnText.innerHTML = "Giriş Yap";

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