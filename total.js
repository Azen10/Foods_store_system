let cart = [];
let total = 0;

function addToCart(itemName, itemPrice) {
    cart.push({ name: itemName, price: itemPrice });
    total += itemPrice;

    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');

    cartItems.innerHTML = '';

    cart.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} - ₱${item.price}`;
        cartItems.appendChild(listItem);
    });

    totalPrice.textContent = `Total: ₱${total}`;
}