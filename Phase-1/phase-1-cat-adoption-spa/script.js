document.addEventListener("DOMContentLoaded", () => {
    fetchCats();
});

function fetchCats() {
    fetch("http://localhost:3000/cats")
        .then(response => response.json())
        .then(cats => displayCats(cats))
        .catch(error => console.error("Error fetching cats:", error));
}

function displayCats(cats) {
    const container = document.getElementById("cats-container");
    container.innerHTML = "";

    cats.forEach(cat => {
        const catCard = document.createElement("div");
        catCard.classList.add("cat-card");
        catCard.dataset.id = cat.id;

        catCard.innerHTML = `
            <img src="${cat.image}" alt="${cat.name}">
            <h3>${cat.name}</h3>
            <p>Age: ${cat.age} years</p>
            <button class="adopt-btn" data-id="${cat.id}">Adopt</button>
        `;

        container.appendChild(catCard);
    });

    addEventListeners();
}

function addEventListeners() {
    document.querySelectorAll(".adopt-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const catId = event.target.dataset.id;
            deleteCat(catId);
        });
    });
}

function deleteCat(catId) {
    fetch(`http://localhost:3000/cats/${catId}`, {
        method: "DELETE"
    })
    .then(() => {
        document.querySelector(`[data-id="${catId}"]`).remove();
    })
    .catch(error => console.error("Error deleting cat:", error));
}
