document.addEventListener("DOMContentLoaded", () => {
    const movieDetails = document.getElementById("movie-details");
    const filmList = document.getElementById("films");
    const buyTicketButton = document.getElementById("buy-ticket");
    
    const API_URL = "http://localhost:3000/films";
    const TICKETS_URL = "http://localhost:3000/tickets";

    function fetchMovies() {
        fetch(API_URL)
            .then(response => response.json())
            .then(movies => {
                filmList.innerHTML = ""; // Clear existing list
                movies.forEach(movie => {
                    const li = document.createElement("li");
                    li.classList.add("film", "item");
                    li.textContent = movie.title;
                    li.dataset.id = movie.id;
                    
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.classList.add("delete-btn");
                    deleteButton.addEventListener("click", (e) => {
                        e.stopPropagation();
                        deleteMovie(movie.id, li);
                    });
                    
                    li.appendChild(deleteButton);
                    li.addEventListener("click", () => displayMovieDetails(movie));
                    
                    if (movie.capacity - movie.tickets_sold <= 0) {
                        li.classList.add("sold-out");
                    }
                    
                    filmList.appendChild(li);
                });
                if (movies.length > 0) displayMovieDetails(movies[0]);
            });
    }

    function displayMovieDetails(movie) {
        movieDetails.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}">
            <h2>${movie.title}</h2>
            <p>${movie.description}</p>
            <p><strong>Showtime:</strong> ${movie.showtime}</p>
            <p><strong>Runtime:</strong> ${movie.runtime} min</p>
            <p><strong>Available Tickets:</strong> <span id="available-tickets">${movie.capacity - movie.tickets_sold}</span></p>
        `;
        buyTicketButton.dataset.id = movie.id;
        buyTicketButton.textContent = (movie.capacity - movie.tickets_sold > 0) ? "Buy Ticket" : "Sold Out";
    }

    buyTicketButton.addEventListener("click", () => {
        const movieId = buyTicketButton.dataset.id;
        if (!movieId) return;

        fetch(`${API_URL}/${movieId}`)
            .then(response => response.json())
            .then(movie => {
                let availableTickets = movie.capacity - movie.tickets_sold;
                if (availableTickets > 0) {
                    availableTickets--;
                    updateTicketsSold(movie.id, movie.tickets_sold + 1);
                }
            });
    });

    function updateTicketsSold(movieId, newTicketsSold) {
        fetch(`${API_URL}/${movieId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "tickets_sold": newTicketsSold })
        })
        .then(response => response.json())
        .then(updatedMovie => {
            document.getElementById("available-tickets").textContent = updatedMovie.capacity - updatedMovie.tickets_sold;
            if (updatedMovie.capacity - updatedMovie.tickets_sold <= 0) {
                buyTicketButton.textContent = "Sold Out";
                document.querySelector(`[data-id='${updatedMovie.id}']`).classList.add("sold-out");
            }
            addNewTicket(updatedMovie.id);
        });
    }

    function addNewTicket(filmId) {
        fetch(TICKETS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "film_id": filmId, "number_of_tickets": 1 })
        });
    }

    function deleteMovie(movieId, element) {
        fetch(`${API_URL}/${movieId}`, { method: "DELETE" })
            .then(() => {
                element.remove();
                movieDetails.innerHTML = "";
            });
    }

    fetchMovies();
});
