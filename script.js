
const catsContainer = document.getElementById("cats-container");

const catsInfo = [
    { name: "Luna", description: "A sweet little cat who loves peaceful naps.", price: 120 },
    { name: "Oliver", description: "A playful friend who loves exploring.", price: 150 },
    { name: "Milo", description: "A curious cat with a big personality.", price: 100 },
    { name: "Bella", description: "A gentle companion who loves attention.", price: 180 },
    { name: "Leo", description: "An adventurous cat full of energy.", price: 200 },
    { name: "Cleo", description: "An elegant kitty with a charming look.", price: 170 },
    { name: "Simba", description: "A fluffy friend with a brave heart.", price: 140 },
    { name: "Lily", description: "A lovely cat who enjoys cozy afternoons.", price: 130 },
    { name: "Coco", description: "A playful kitty who loves making friends.", price: 160 },
    { name: "Shadow", description: "A mysterious cat with a gentle personality.", price: 190 },
    { name: "Misty", description: "A calm companion with a curious mind.", price: 145 },
    { name: "Oreo", description: "A cheerful kitty who loves to play.", price: 155 }
];

const isDetailsPage = window.location.pathname.endsWith("details.html");

if (catsContainer) {
    const catsApiLimit = 6;
    const requests = isDetailsPage ? 1 : 2;

    Promise.all(
        Array.from({ length: requests }, () =>
            fetch(
                `https://api.thecatapi.com/v1/images/search?limit=${catsApiLimit}`,
                { cache: "no-store" }
            ).then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load cats");
                }

                return response.json();
            })
        )
    )
        .then((results) => {
            const cats = results.flat();

            const validCats = cats
                .filter((cat) => cat.url)
                .slice(0, catsInfo.length)
                .map((cat, index) => ({
                    ...cat,
                    info: catsInfo[index]
                }));

            console.log("Cats received:", cats.length);
            console.log("Valid cats:", validCats.length);

            let currentPage = 1;
            const catsPerPage = 6;

            let pagination = document.getElementById("cats-pagination");

            if (!isDetailsPage && !pagination) {
                pagination = document.createElement("nav");
                pagination.id = "cats-pagination";
                pagination.setAttribute("aria-label", "Cat pages");
                catsContainer.insertAdjacentElement("afterend", pagination);
            }

            function renderCats(page) {
                currentPage = page;

                const startIndex = (page - 1) * catsPerPage;

                const visibleCats = validCats.slice(
                    startIndex,
                    startIndex + catsPerPage
                );

                catsContainer.innerHTML = visibleCats.map((cat, index) => {
                    const info = cat.info;
                    const catId = cat.id || `cat-${startIndex + index}`;

                  
const cardButtons = `
    <div class="quantity-controls">
        <button type="button" class="quantity-btn"
            onclick="changeQuantity(this, -1)">−</button>

        <span class="quantity">1</span>

        <button type="button" class="quantity-btn"
            onclick="changeQuantity(this, 1)">+</button>
    </div>

    <button type="button"
        class="btn btn-dark add-cart-btn"
        onclick="addToCart('${catId}', this)">
        Add to Cart
    </button>

    ${
        !isDetailsPage
            ? `<a href="details.html?image=${encodeURIComponent(cat.url)}&name=${encodeURIComponent(info.name)}&description=${encodeURIComponent(info.description)}"
                class="btn btn-outline-dark mt-2">
                Discover More
            </a>`
            : ""
    }
`;
                    return `
                        <div class="col-md-4 col-sm-6 mb-4">
                            <div class="card cat-card h-100"
                                data-cat-id="${catId}"
                                data-price="${info.price}">

                                <img src="${cat.url}"
                                    class="cat-image"
                                    alt="${info.name}"
                                    loading="lazy">

                                <div class="card-body text-center">
                                    <h5 class="card-title">${info.name}</h5>
                                    <h5 class="cat-price">$${info.price}</h5>
                                    <p class="card-text">${info.description}</p>
                                    ${cardButtons}
                                </div>
                            </div>
                        </div>
                    `;
                }).join("");

                if (!isDetailsPage && pagination) {
                    const totalPages = Math.ceil(
                        validCats.length / catsPerPage
                    );

                    pagination.innerHTML = `
                        <ul class="pagination justify-content-center mt-4 mb-5">
                            ${Array.from({ length: totalPages }, (_, i) => {
                                const pageNumber = i + 1;

                                return `
                                    <li class="page-item ${pageNumber === currentPage ? "active" : ""}">
                                        <button type="button"
                                            class="page-link"
                                            onclick="showCatsPage(${pageNumber})"
                                            ${pageNumber === currentPage ? 'aria-current="page"' : ""}>
                                            ${pageNumber}
                                        </button>
                                    </li>
                                `;
                            }).join("")}
                        </ul>
                    `;
                }
            }

            window.showCatsPage = renderCats;
            renderCats(1);
        })
        .catch((error) => {
            console.error("Error loading cats:", error);

            catsContainer.innerHTML =
                '<p class="text-center">Sorry, we could not load the cats. Please try again.</p>';
        });
}

/* Quantity Buttons */
function changeQuantity(button, amount) {
    const quantityElement =
        button.parentElement.querySelector(".quantity");

    let quantity = Number(quantityElement.textContent);

    quantity += amount;

    if (quantity < 1) {
        quantity = 1;
    }

    quantityElement.textContent = quantity;
}

/* Get Cart From Local Storage */
function getCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem("catCart"));
        return Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
        return [];
    }
}

/* Update Navbar Cart Count */
function updateCartCount() {
    const cartCount = document.getElementById("cart-count");

    if (!cartCount) return;

    const cart = getCart();

    const totalItems = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    cartCount.textContent = totalItems;
}

/* Add Cat To Cart */
function addToCart(id, button) {
    const card = button.closest(".cat-card");

    if (!card) return;

    const name = card.querySelector(".card-title").textContent;
    const image = card.querySelector(".cat-image").src;
    const price = Number(card.dataset.price) || 0;

    const quantityElement = card.querySelector(".quantity");
    const quantity = Number(quantityElement?.textContent) || 1;

    const cart = getCart();

    const existingItem = cart.find(
        (item) => String(item.id) === String(id)
    );

    if (existingItem) {
        existingItem.quantity =
            Number(existingItem.quantity || 0) + quantity;
    } else {
        cart.push({
            id: String(id),
            name: name,
            image: image,
            price: price,
            quantity: quantity
        });
    }
    localStorage.setItem("catCart", JSON.stringify(cart));

    updateCartCount();
    showToast("Added to Cart");
}

function showToast(message) {
    let toast = document.getElementById("cart-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "cart-toast";
        document.body.appendChild(toast);
    }

    toast.className = "cart-toast";
    toast.replaceChildren();

    const check = document.createElement("span");
    check.textContent = "✓";

    const text = document.createElement("span");
    text.textContent = message;

    toast.append(check, text);
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}
/* Make Functions Available To HTML Buttons */
window.changeQuantity = changeQuantity;
window.addToCart = addToCart;

/* Update Count When Page Opens */
updateCartCount();

/* =========================
   CAT BREEDS PAGE
========================= */

const breedsContainer = document.getElementById("breeds-container");

if (breedsContainer) {
    breedsContainer.innerHTML =
        '<p class="text-center">Loading cat breeds...</p>';

    fetch("https://api.thecatapi.com/v1/breeds", {
        headers: {
            "x-api-key": "live_wQYIFAXY97nEOyMSidu2rUOVAbHaGXJ7l7RHqu1eVpUyx7aVJZCZ30xqGljA38GY"
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load cat breeds. Check your API key.");
            }

            return response.json();
        })
        .then((breeds) => {
            const breedsWithImages = breeds.filter(
                (breed) => breed.image && breed.image.url
            );

            if (breedsWithImages.length === 0) {
                breedsContainer.innerHTML =
                    '<p class="text-center">No breeds with images were found.</p>';
                return;
            }

            breedsContainer.innerHTML = breedsWithImages
                .map((breed, index) => {
                    const breedId = `breed-${breed.id}`;
                    const price = 100 + index * 10;

                    const description =
                        breed.description ||
                        "Discover this beautiful cat breed.";

                    return `
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="card cat-card h-100"
                                data-cat-id="${breedId}"
                                data-price="${price}">

                                <img
                                    src="${breed.image.url}"
                                    class="cat-image"
                                    alt="${breed.name}"
                                    loading="lazy">

                                <div class="card-body text-center">
                                    <h5 class="card-title">
                                        ${breed.name}
                                    </h5>

                                    <p class="card-text">
                                        ${description}
                                    </p>

                                    <p class="cat-price">
                                        $${price}
                                    </p>

                                    <div class="quantity-controls">
                                        <button type="button"
                                            class="quantity-btn"
                                            onclick="changeQuantity(this, -1)">
                                            −
                                        </button>

                                        <span class="quantity">1</span>

                                        <button type="button"
                                            class="quantity-btn"
                                            onclick="changeQuantity(this, 1)">
                                            +
                                        </button>
                                    </div>

                                    <button type="button"
                                        class="btn btn-dark add-cart-btn mt-3"
                                        onclick="addToCart('${breedId}', this)">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                })
                .join("");
        })
        .catch((error) => {
            console.error("Error loading breeds:", error);

            breedsContainer.innerHTML =
                '<p class="text-center">Could not load cat breeds. Please check your API key and try again.</p>';
        });
}

/* =========================
   CART PAGE
========================= */

function renderCartPage() {
    const cartItems = document.getElementById("cart-items");
    const cartSummary = document.getElementById("cart-summary");

    if (!cartItems || !cartSummary) return;

    let cart = [];

    try {
        const savedCart = JSON.parse(localStorage.getItem("catCart"));
        cart = Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
        cart = [];
    }

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-5">
                <h4>Your cart is empty 🐱</h4>
                <a href="index.html" class="btn btn-dark mt-3">
                    Explore Cats
                </a>
            </div>
        `;

        cartSummary.innerHTML = `
            <h3>Order Summary</h3>
            <p>Subtotal: $0.00</p>
            <p>Shipping: $0.00</p>
            <hr>
            <h5>Total: $0.00</h5>
        `;

        return;
    }

    const subtotal = cart.reduce(
        (total, item) =>
            total + Number(item.price || 0) * Number(item.quantity || 1),
        0
    );

    const shipping = 50;
    const total = subtotal + shipping;

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="card mb-3 shadow-sm">
            <div class="row g-0 align-items-center">
                <div class="col-4">
                    <img
                        src="${item.image || ""}"
                        alt="${item.name || "Cat"}"
                        class="img-fluid rounded-start"
                        style="height: 150px; width: 100%; object-fit: cover;">
                </div>

                <div class="col-8">
                    <div class="card-body">
                        <h5 class="card-title">
                            ${item.name || "Cat"}
                        </h5>

                        <p>Price: $${Number(item.price || 0).toFixed(2)}</p>

                       
<div class="d-flex align-items-center gap-2 mb-3">
    <span>Quantity:</span>

    <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        onclick="changeCartQuantity(${index}, -1)">
        −
    </button>

    <span class="fw-bold">
        ${Number(item.quantity || 1)}
    </span>

    <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        onclick="changeCartQuantity(${index}, 1)">
        +
    </button>
</div>


                        <p>
                            Item total: $${(
                                Number(item.price || 0) *
                                Number(item.quantity || 1)
                            ).toFixed(2)}
                        </p>

                        <button
                            type="button"
                            class="btn btn-outline-danger btn-sm"
                            onclick="removeCartItem(${index})">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join("");

    cartSummary.innerHTML = `
        <h3>Order Summary</h3>
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Shipping: $${shipping.toFixed(2)}</p>
        <hr>
        <h5>Total: $${total.toFixed(2)}</h5>

        <button
            type="button"
            class="btn btn-dark w-100 mt-3"
            onclick="goToCheckout()">
            Proceed to Checkout
        </button>
    `;
}

function removeCartItem(index) {
    let cart = [];

    try {
        const savedCart = JSON.parse(localStorage.getItem("catCart"));
        cart = Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
        cart = [];
    }

    cart.splice(index, 1);

    localStorage.setItem("catCart", JSON.stringify(cart));

    if (typeof updateCartCount === "function") {
        updateCartCount();
    }

    renderCartPage();
}

window.renderCartPage = renderCartPage;
window.removeCartItem = removeCartItem;

if (document.getElementById("cart-items")) {
    renderCartPage();
}

function changeCartQuantity(index, amount) {
    let cart = [];

    try {
        const savedCart = JSON.parse(localStorage.getItem("catCart"));
        cart = Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
        cart = [];
    }

    if (!cart[index]) return;

    cart[index].quantity =
        Number(cart[index].quantity || 1) + amount;

    // لو الكمية وصلت لصفر، نحذف المنتج من السلة
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem("catCart", JSON.stringify(cart));

    if (typeof updateCartCount === "function") {
        updateCartCount();
    }

    renderCartPage();
}

window.changeCartQuantity = changeCartQuantity;

function goToCheckout() {
    const cart = JSON.parse(localStorage.getItem("catCart")) || [];

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    window.location.href = "checkout.html";
}

window.goToCheckout = goToCheckout;




/* =========================
   PRICING PAGE
========================= */

const pricingContainer = document.getElementById("pricing-cats");

if (pricingContainer) {
    async function loadPricingCats() {
        pricingContainer.innerHTML = `
            <div class="col-12 text-center">
                <p>Loading cat prices...</p>
            </div>
        `;

        try {
            // Get 12 cat images using two requests
            const requests = await Promise.all([
                fetch("https://api.thecatapi.com/v1/images/search?limit=6"),
                fetch("https://api.thecatapi.com/v1/images/search?limit=6")
            ]);

            // Check if requests succeeded
            if (requests.some(response => !response.ok)) {
                throw new Error("Failed to load cat images");
            }

            // Convert responses to JSON
            const results = await Promise.all(
                requests.map(response => response.json())
            );

            // Combine the two image arrays
            const images = results.flat();

            // Display all 12 cats
            pricingContainer.innerHTML = catsInfo.map((cat, index) => {
                const imageUrl = images[index]?.url || "";

                return `
                    <div class="col-lg-4 col-md-6 col-sm-6">
                        <article class="pricing-cat-card">

                            ${
                                imageUrl
                                    ? `
                                        <img
                                            src="${imageUrl}"
                                            class="pricing-cat-image"
                                            alt="${cat.name}"
                                            loading="lazy"
                                            onerror="this.outerHTML='<div class=&quot;pricing-no-image&quot;>🐱 Image unavailable</div>'"
                                        >
                                    `
                                    : `
                                        <div class="pricing-no-image">
                                            🐱 Image unavailable
                                        </div>
                                    `
                            }

                            <div class="pricing-cat-body">
                                <h3>${cat.name}</h3>

                                <p>${cat.description}</p>

                                <div class="pricing-cat-price">
                                    $${cat.price}
                                </div>

                                <a
                                    href="index.html"
                                    class="pricing-view-btn"
                                >
                                    Explore Cats
                                </a>
                            </div>

                        </article>
                    </div>
                `;
            }).join("");

        } catch (error) {
            console.error("Pricing page error:", error);

            pricingContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p>Sorry, we could not load cat images.</p>
                    <button
                        type="button"
                        class="btn btn-dark"
                        id="retry-pricing"
                    >
                        Try Again
                    </button>
                </div>
            `;

            document
                .getElementById("retry-pricing")
                ?.addEventListener("click", loadPricingCats);
        }
    }

    loadPricingCats();
}
