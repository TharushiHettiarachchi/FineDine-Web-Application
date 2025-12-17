// product.js

import { db } from "./firebase.js"; 
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const productDetailsMain = document.getElementById('product-details-main');
const productTitle = document.getElementById('product-title');
const cartActionBar = document.getElementById('cart-action-bar');

let currentItemData = null;
let currentQuantities = {
    full: 0,
    half: 0
};
let itemPrices = {};


const getProductIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
};

const getCurrentUserId = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
           
            const user = JSON.parse(userString);
            return user.uid; 
        } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
            return null;
        }
    }
    return null;
};



const updateQuantity = (portionType, change) => {
    let newQty = currentQuantities[portionType] + change;
    if (newQty < 0) newQty = 0;

    currentQuantities[portionType] = newQty;
    
    const inputElement = document.getElementById(`qty-${portionType}`);
    if (inputElement) {
        inputElement.value = newQty;
    }
    
    updateTotal();
};

const calculateTotal = () => {
    const fullPrice = itemPrices.full || 0;
    const halfPrice = itemPrices.half || 0;
    
    const total = (currentQuantities.full * fullPrice) + (currentQuantities.half * halfPrice);
    return total;
};

const updateTotal = () => {
    const total = calculateTotal();
    const isZero = total === 0;
    
    document.getElementById('total-amount').textContent = `Total: Rs.${total.toFixed(2)}`;
    
    const cartButton = document.getElementById('add-to-cart-btn');
    if (cartButton) {
     
        cartButton.disabled = isZero;
    }
};


const attachQuantityListeners = () => {
    document.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            const change = parseInt(e.target.dataset.change);
            updateQuantity(type, change);
        });
    });
};




const renderQuantityControl = (type, price) => {
    if (!price || price === 0) return '';
    
    return `
        <div class="price-option-row">
            <div class="portion-label">${type === 'full' ? 'Full Portion' : 'Half Portion'} (Rs.${price})</div>
            <div class="qty-control-group">
                <button class="qty-btn" data-type="${type}" data-change="-1">−</button>
                <input type="text" id="qty-${type}" class="qty-input" value="${currentQuantities[type]}" readonly>
                <button class="qty-btn" data-type="${type}" data-change="+1">+</button>
            </div>
        </div>
    `;
};

const renderProduct = (item) => {
    productTitle.textContent = `${item.name} | FineDine`;
    
    const imageUrl = item.imageUrl || 'https://via.placeholder.com/600x350?text=Product+Image';
    const vegLabel = item.isVegetarian 
        ? '<span class="veg-label">(Veg.)</span>' 
        : '';

    const qtyControlsHtml = 
        renderQuantityControl('full', itemPrices.full) +
        renderQuantityControl('half', itemPrices.half);

    productDetailsMain.innerHTML = `
        <div class="product-card">
            <img src="${imageUrl}" alt="${item.name}" class="product-image">
            <div class="product-info">
                <h1>${item.name} ${vegLabel}</h1>
                <p><strong>Category:</strong> ${item.category || 'N/A'}</p>
                <p>${item.description || 'No detailed description available.'}</p>
                
                <div class="price-section">
                    <h3>Select Quantity</h3>
                    ${qtyControlsHtml}
                </div>
            </div>
        </div>
    `;
    

    attachQuantityListeners();
};


const renderCartActionBar = () => {
    cartActionBar.innerHTML = `
        <div id="total-amount" class="total-display">Total: Rs.0.00</div>
        <button id="add-to-cart-btn" class="add-to-cart-btn">Add to Cart</button>
    `;
    
    document.getElementById('add-to-cart-btn').addEventListener('click', handleAddToCart);
    updateTotal(); 
};




const loadProductDetails = async () => {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        productDetailsMain.innerHTML = '<h2>Error: Product ID not found in URL.</h2>';
        return;
    }

    try {
        const foodRef = doc(db, 'foods', productId);
        const foodSnap = await getDoc(foodRef);

        if (!foodSnap.exists()) {
            productDetailsMain.innerHTML = '<h2>Error: Product not found in the database.</h2>';
            return;
        }

        currentItemData = foodSnap.data();
        currentItemData.id = foodSnap.id; 
        
        itemPrices.full = currentItemData.fullPortionPrice || 0;
        itemPrices.half = currentItemData.halfPortionPrice || 0;
        
        renderProduct(currentItemData);
        renderCartActionBar(); 

    } catch (error) {
        console.error("Error fetching product details:", error);
        productDetailsMain.innerHTML = '<h2>An error occurred while loading this product.</h2>';
    }
};




const handleAddToCart = async () => {
    const userId = getCurrentUserId();
    const totalQty = currentQuantities.full + currentQuantities.half;
    
    if (!userId) {
      
        alert("You must be logged in to add items to the cart.");
        window.location.replace('index.html'); 
        return;
    }

    if (totalQty === 0) {
        alert("Please select at least one item quantity.");
        return;
    }
    
    const cartCollection = collection(db, 'cart');
    
    try {
      
        const q = query(
            cartCollection, 
            where("userId", "==", userId),
            where("productId", "==", currentItemData.id)
        );
        const snapshot = await getDocs(q);

        const newFullQty = currentQuantities.full;
        const newHalfQty = currentQuantities.half;

        if (!snapshot.empty) {
          
            const existingCartDoc = snapshot.docs[0];
            const existingData = existingCartDoc.data();
            
            const updatedFullQty = (existingData.fullPortionQty || 0) + newFullQty;
            const updatedHalfQty = (existingData.halfPortionQty || 0) + newHalfQty;

            await updateDoc(doc(db, 'cart', existingCartDoc.id), {
                fullPortionQty: updatedFullQty,
                halfPortionQty: updatedHalfQty,
                updatedAt: new Date()
            });
            
            alert(`Updated ${currentItemData.name} in cart! Total Qty: ${updatedFullQty + updatedHalfQty}`);

        } else {
          
            const newCartItem = {
                userId: userId,
                productId: currentItemData.id,
                fullPortionQty: newFullQty,
                halfPortionQty: newHalfQty,
                addedAt: new Date(), 
                updatedAt: new Date()
            };

            await setDoc(doc(cartCollection), newCartItem); 
            
            alert(`Added ${totalQty} items of ${currentItemData.name} to the cart!`);
        }

       
        currentQuantities.full = 0;
        currentQuantities.half = 0;
        loadProductDetails(); 

    } catch (error) {
        console.error("Error saving cart item to Firestore:", error);
        alert("Failed to add item to cart. Please check your network or Firestore rules.");
    }
};



loadProductDetails();