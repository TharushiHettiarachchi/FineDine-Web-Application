import { db } from "./firebase.js";
import { collection, addDoc, query, where, getDocs } 
    from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Alert modal functions
function showAlert(message) {
    document.getElementById("alert-message").textContent = message;
    document.getElementById("alert-modal").style.display = "flex";
}
document.getElementById("close-alert").addEventListener("click", () => {
    document.getElementById("alert-modal").style.display = "none";
});

document.getElementById("sign-up-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName  = document.getElementById("last-name").value.trim();
    const mobile    = document.getElementById("mobile-number").value.trim();
    const btn       = document.getElementById("sign-up-button");

    if (!firstName || !lastName || !mobile) {
        showAlert("Please fill all fields.");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Creating...";

    try {
        // Check if mobile already exists
        const q = query(collection(db, "user"), where("mobile", "==", mobile));
        const snap = await getDocs(q);

        if (!snap.empty) {
            showAlert("Mobile number already registered!");
            btn.disabled = false;
            btn.textContent = "Create Account";
            return;
        }

        // Create new user
        const docRef = await addDoc(collection(db, "user"), {
            firstName: firstName,
            lastName: lastName,
            mobile: mobile,
        });

        // Store logged-in user immediately
        const userData = {
            uid: docRef.id,
            firstName,
            lastName,
            mobile
        };
        localStorage.setItem("user", JSON.stringify(userData));

        showAlert("Account created successfully!");

        setTimeout(() => {
            window.location.replace("drawer/home.html");
        }, 800);

    } catch (error) {
        console.error(error);
        showAlert("Signup error. Check console.");
    }

    btn.disabled = false;
    btn.textContent = "Create Account";
});
