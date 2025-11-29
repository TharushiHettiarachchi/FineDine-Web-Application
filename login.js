import { db, collection, query, where, getDocs } from "./firebase.js";

const mobileField = document.getElementById("mobileField");
const alertBox = document.getElementById("alertBox");

async function login() {
  const mobile = mobileField.value.trim();

  if (mobile === "") {
    alertBox.innerText = "Please enter mobile number";
    alertBox.classList.remove("hidden");
    return;
  }

  try {
    const q = query(collection(db, "user"), where("mobile", "==", mobile));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alertBox.innerText = "Mobile number not found!";
      alertBox.classList.remove("hidden");
    } else {
      const doc = snapshot.docs[0];
      const user = { id: doc.id, ...doc.data() };

      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "home.html";
    }

  } catch (error) {
    console.error("Login error:", error);
  }
}

window.login = login;
