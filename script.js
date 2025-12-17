
import { db } from "./firebase.js"; 
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";


function showAlertModal(message) {
    const modal = document.getElementById('alert-modal');
    const msgElement = document.getElementById('alert-message');
    msgElement.textContent = message;
    if (modal) modal.style.display = 'flex';
}

function hideAlertModal() {
    const modal = document.getElementById('alert-modal');
    if (modal) modal.style.display = 'none';
}

if (document.getElementById('close-alert')) {
    document.getElementById('close-alert').addEventListener('click', hideAlertModal);
}



const checkUserInStorage = () => {
    const user = localStorage.getItem('user'); 
    if (user) {
      
        window.location.replace('drawer/home.html'); 
        return true;
    }
    return false;
};

if (checkUserInStorage()) {
   
}



if (document.getElementById('sign-in-form')) {
    document.getElementById('sign-in-form').addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const mobileInput = document.getElementById('mobile-number');
        const signInButton = document.getElementById('sign-in-button');
        
        if (!mobileInput || !signInButton) return;

        const getMobile = mobileInput.value.trim();

        if (!getMobile) {
            showAlertModal("Please enter a mobile number.");
            return;
        }

        const originalText = signInButton.textContent;
        signInButton.textContent = 'Signing In...';
        signInButton.disabled = true;

        try {
            const q = query(
                collection(db, 'user'),
                where('mobile', '==', getMobile)
            );
            
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                showAlertModal("Mobile number not found!");
            } else {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                
                
                const userWithId = { 
                    ...userData, 
                    uid: userDoc.id 
                }; 

                localStorage.setItem('user', JSON.stringify(userWithId));
                
              
                setTimeout(() => {
                    window.location.replace('drawer/home.html'); 
                }, 100); 
                
                return;
            }

        } catch (error) {
            console.error("Sign-in error:", error);
            showAlertModal("An unexpected sign-in error occurred. Check network and console."); 
        } finally {
            signInButton.textContent = originalText;
            signInButton.disabled = false;
        }
    });
}