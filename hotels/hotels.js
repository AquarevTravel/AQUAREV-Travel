
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const HOTEL_DATA_URL = "./data/hotels.json";
  const DETAILS_PAGE = "./hotel-details.html";

  let hotels = [];
  let filteredHotels = [];

  const pageLoader = document.getElementById("pageLoader");
  const hotelHeader = document.getElementById("hotelHeader");

  const hotelSearchForm = document.getElementById("hotelSearchForm");
  const destinationInput = document.getElementById("destination");
  const checkInInput = document.getElementById("checkIn");
  const checkOutInput = document.getElementById("checkOut");

  const guestsSelector = document.getElementById("guestsSelector");
  const guestsPanel = document.getElementById("guestsPanel");
  const guestsDone = document.getElementById("guestsDone");
  const guestsSummary = document.getElementById("guestsSummary");

  const adultsCount = document.getElementById("adultsCount");
  const childrenCount = document.getElementById("childrenCount");
  const roomsCount = document.getElementById("roomsCount");

  const destinationSuggestions = document.getElementById(
    "destinationSuggestions"
  );

  const hotelResultsSection = document.getElementById("hotelResults");
  const hotelResultsGrid = document.getElementById("hotelResultsGrid");
  const hotelCount = document.getElementById("hotelCount");
  const resultsDescription = document.getElementById("resultsDescription");

  const hotelFilters = document.getElementById("hotelFilters");
  const closeFilters = document.getElementById("closeFilters");
  const mobileFilterButton = document.getElementById("mobileFilterButton");

  const resetFiltersButton = document.getElementById("resetFilters");

  const minPrice = document.getElementById("minPrice");
  const maxPrice = document.getElementById("maxPrice");
  const minPriceValue = document.getElementById("minPriceValue");
  const maxPriceValue = document.getElementById("maxPriceValue");

  const sortButton = document.getElementById("sortButton");

  const emptySearchButton = document.getElementById(
    "emptySearchButton"
  );

  const languageButton = document.getElementById("languageButton");
  const languageMenu = document.getElementById("languageMenu");

  const mobileMenuButton = document.getElementById(
    "mobileMenuButton"
  );
  const hotelNav = document.getElementById("hotelNav");

  const cookieNotice = document.getElementById("cookieNotice");
  const closeCookieNotice = document.getElementById(
    "closeCookieNotice"
  );

  let adults = 2;
  let children = 0;
  let rooms = 1;

  let currentSort = "recommended";

  function getNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatPrice(value, currency = "DZD") {
    const amount = getNumber(value, 0);

    return (
      new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0
      }).format(amount) +
      " " +
      currency
    );
  }

  function getHotelPrice(hotel) {
    if (hotel.price !== undefined) {
      return getNumber(hotel.price);
    }

    if (hotel.pricePerNight !== undefined) {
      return getNumber(hotel.pricePerNight);
    }

    if (hotel.pricing?.pricePerNight !== undefined) {
      return getNumber(hotel.pricing.pricePerNight);
    }

    if (hotel.pricing?.amount !== undefined) {
      return getNumber(hotel.pricing.amount);
    }

    return 0;
  }

  function getHotelCurrency(hotel) {
    return (
      hotel.currency ||
      hotel.pricing?.currency ||
      "DZD"
    );
  }

  function getHotelRating(hotel) {
    return getNumber(
      hotel.rating ??
        hotel.reviewScore ??
        hotel.reviews?.rating ??
        0
    );
  }

  function getHotelStars(hotel) {
    return getNumber(
      hotel.stars ??
        hotel.starRating ??
        hotel.category ??
        0
    );
  }

  function getHotelType(hotel) {
    return (
      hotel.type ||
      hotel.hotelType ||
      hotel.categoryName ||
      ""
    );
  }

  function getHotelServices(hotel) {
    if (Array.isArray(hotel.services)) {
      return hotel.services;
    }

    if (Array.isArray(hotel.amenities)) {
      return hotel.amenities;
    }

    return [];
  }

  function getHotelImage(hotel) {
    return (
      hotel.image ||
      hotel.mainImage ||
      hotel.images?.[0] ||
      "./assets/images/hotels/default-hotel.jpg"
    );
  }

  function getHotelName(hotel) {
    return (
      hotel.name ||
      hotel.hotelName ||
      "Hôtel AQUAREV"
    );
  }

  function getHotelDestination(hotel) {
    return (
      hotel.destination ||
      hotel.city ||
      hotel.location?.city ||
      hotel.location?.country ||
      "Destination"
    );
  }

  function starsHTML(stars) {
    const total = Math.max(
      0,
      Math.min(5, Math.round(stars))
    );

    let html = "";

    for (let i = 0; i < 5; i++) {
      html +=
        i < total
          ? '<i class="fa-solid fa-star"></i>'
          : '<i class="fa-regular fa-star"></i>';
    }

    return html;
  }

  function servicesHTML(services) {
    if (!Array.isArray(services) || !services.length) {
      return '<span class="hotel-card-service">Services inclus</span>';
    }

    return services
      .slice(0, 4)
      .map(
        service => `
          <span class="hotel-card-service">
            <i class="fa-solid fa-check"></i>
            ${escapeHTML(service)}
          </span>
        `
      )
      .join("");
  }

  function getHotelId(hotel) {
    return String(
      hotel.id ||
        hotel.hotelId ||
        ""
    );
  }

  function createHotelCard(hotel) {
    let id = getHotelId(hotel);

    if (!id) {
      id =
        "hotel-" +
        Math.random()
          .toString(36)
          .substring(2, 10);
    }

    const name = getHotelName(hotel);
    const destination = getHotelDestination(hotel);
    const price = getHotelPrice(hotel);
    const currency = getHotelCurrency(hotel);
    const rating = getHotelRating(hotel);
    const stars = getHotelStars(hotel);
    const type = getHotelType(hotel);
    const image = getHotelImage(hotel);
    const services = getHotelServices(hotel);

    const card = document.createElement("article");

    card.className = "hotel-card";
    card.dataset.hotelId = id;

    card.innerHTML = `
      <div class="hotel-card-image">
        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(name)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='./assets/images/hotels/default-hotel.jpg';"
        />

        <button
          type="button"
          class="hotel-card-favorite"
          aria-label="Ajouter aux favoris"
          data-hotel-id="${escapeHTML(id)}"
        >
          <i class="fa-regular fa-heart"></i>
        </button>

        ${
          hotel.featured
            ? `
              <span class="hotel-card-badge">
                <i class="fa-solid fa-crown"></i>
                Sélection AQUAREV
              </span>
            `
            : ""
        }
      </div>

      <div class="hotel-card-body">
        <div class="hotel-card-location">
          <i class="fa-solid fa-location-dot"></i>
          ${escapeHTML(destination)}
        </div>

        <h3 class="hotel-card-title">
          ${escapeHTML(name)}
        </h3>

        <div class="hotel-card-stars">
          ${starsHTML(stars)}
          ${
            type
              ? `<span class="hotel-card-type">${escapeHTML(type)}</span>`
              : ""
          }
        </div>

        ${
          rating
            ? `
              <div class="hotel-card-rating">
                <strong>${rating.toFixed(1)}</strong>
                <span>Excellent</span>
              </div>
            `
            : ""
        }

        <div class="hotel-card-amenities">
          ${servicesHTML(services)}
        </div>

        <div class="hotel-card-footer">
          <div class="hotel-card-price">
            <small>À partir de</small>
            <strong>${formatPrice(price, currency)}</strong>
            <em>par nuit</em>
          </div>

          <button
            type="button"
            class="hotel-card-button"
            data-hotel-id="${escapeHTML(id)}"
          >
            Voir les chambres
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;

    return card;
  }

  function hidePageLoader() {
    if (!pageLoader) {
      return;
    }

    pageLoader.classList.add("hidden");

    setTimeout(() => {
      pageLoader.style.display = "none";
    }, 500);
  }

  function showPageLoader() {
    if (!pageLoader) {
      return;
    }

    pageLoader.style.display = "";
    pageLoader.classList.remove("hidden");
  }

  function renderHotels(list) {
    if (!hotelResultsGrid) {
      return;
    }

    hotelResultsGrid.innerHTML = "";

    if (!Array.isArray(list) || !list.length) {
      hotelResultsGrid.innerHTML = `
        <div class="empty-results">
          <div class="empty-results-icon">
            <i class="fa-solid fa-hotel"></i>
          </div>

          <h3>Aucun hôtel trouvé</h3>

          <p>
            Nous n'avons trouvé aucun établissement correspondant
            à vos critères. Essayez de modifier votre recherche
            ou vos filtres.
          </p>

          <button
            type="button"
            class="empty-search-button"
            id="emptySearchButton"
          >
            <i class="fa-solid fa-rotate-left"></i>
            Réinitialiser la recherche
          </button>
        </div>
      `;

      if (hotelCount) {
        hotelCount.textContent = "0 hôtel";
      }

      if (resultsDescription) {
        resultsDescription.textContent =
          "Aucun établissement ne correspond à vos critères.";
      }

      const resetButton = document.getElementById(
        "emptySearchButton"
      );

      if (resetButton) {
        resetButton.addEventListener(
          "click",
          resetAllSearch
        );
      }

      return;
    }

    const fragment =
      document.createDocumentFragment();

    list.forEach(hotel => {
      fragment.appendChild(
        createHotelCard(hotel)
      );
    });

    hotelResultsGrid.appendChild(fragment);

    if (hotelCount) {
      hotelCount.textContent =
        list.length === 1
          ? "1 hôtel"
          : `${list.length} hôtels`;
    }

    if (resultsDescription) {
      const destination =
        destinationInput?.value.trim();

      if (destination) {
        resultsDescription.textContent =
          `${list.length} établissement${
            list.length > 1 ? "s" : ""
          } disponible${
            list.length > 1 ? "s" : ""
          } pour votre recherche à ${destination}.`;
      } else {
        resultsDescription.textContent =
          "Découvrez nos possibilités d'hébergement partout dans le monde.";
      }
    }

    restoreFavorites();
  }

  function getCheckedValues(selector) {
    return Array.from(
      document.querySelectorAll(selector)
    )
      .filter(input => input.checked)
      .map(input => input.value);
  }

  function hotelMatchesDestination(
    hotel,
    destination
  ) {
    if (!destination) {
      return true;
    }

    const query = normalize(destination);

    const searchableText = normalize(
      [
        hotel.name,
        hotel.hotelName,
        hotel.destination,
        hotel.city,
        hotel.country,
        hotel.location?.city,
        hotel.location?.country
      ]
        .filter(Boolean)
        .join(" ")
    );

    return searchableText.includes(query);
  }

  function hotelMatchesStars(
    hotel,
    selectedStars
  ) {
    if (!selectedStars.length) {
      return true;
    }

    const stars = getHotelStars(hotel);

    return selectedStars.some(
      value =>
        stars === getNumber(value)
    );
  }

  function hotelMatchesType(
    hotel,
    selectedTypes
  ) {
    if (!selectedTypes.length) {
      return true;
    }

    const hotelType =
      normalize(getHotelType(hotel));

    return selectedTypes.some(
      type =>
        hotelType === normalize(type)
    );
  }

  function hotelMatchesServices(
    hotel,
    selectedServices
  ) {
    if (!selectedServices.length) {
      return true;
    }

    const services =
      getHotelServices(hotel).map(
        normalize
      );

    return selectedServices.every(
      requiredService =>
        services.some(service =>
          service.includes(
            normalize(requiredService)
          )
        )
    );
  }

  function hotelMatchesRating(
    hotel,
    selectedRatings
  ) {
    if (!selectedRatings.length) {
      return true;
    }

    const rating =
      getHotelRating(hotel);

    return selectedRatings.some(
      minimum =>
        rating >= getNumber(minimum)
    );
  }

  function hotelMatchesPrice(hotel) {
    const price =
      getHotelPrice(hotel);

    const minimum =
      getNumber(
        minPrice?.value,
        0
      );

    const maximum =
      getNumber(
        maxPrice?.value,
        Infinity
      );

    return (
      price >= minimum &&
      price <= maximum
    );
  }

  function applyFilters() {
    const destination =
      destinationInput?.value.trim() || "";

    const selectedStars =
      getCheckedValues(
        'input[data-filter="stars"]'
      );

    const selectedTypes =
      getCheckedValues(
        'input[data-filter="type"]'
      );

    const selectedServices =
      getCheckedValues(
        'input[data-filter="amenity"]'
      );

    const selectedRatings =
      getCheckedValues(
        'input[data-filter="rating"]'
      );

    filteredHotels =
      hotels.filter(hotel => {
        return (
          hotelMatchesDestination(
            hotel,
            destination
          ) &&
          hotelMatchesPrice(hotel) &&
          hotelMatchesStars(
            hotel,
            selectedStars
          ) &&
          hotelMatchesType(
            hotel,
            selectedTypes
          ) &&
          hotelMatchesServices(
            hotel,
            selectedServices
          ) &&
          hotelMatchesRating(
            hotel,
            selectedRatings
          )
        );
      });

    sortHotels();
    renderHotels(filteredHotels);
  }

  function sortHotels() {
    const sort = currentSort;

    filteredHotels.sort((a, b) => {
      const priceA =
        getHotelPrice(a);

      const priceB =
        getHotelPrice(b);

      const ratingA =
        getHotelRating(a);

      const ratingB =
        getHotelRating(b);

      const starsA =
        getHotelStars(a);

      const starsB =
        getHotelStars(b);

      if (sort === "price-low") {
        return priceA - priceB;
      }

      if (sort === "price-high") {
        return priceB - priceA;
      }

      if (sort === "rating") {
        return ratingB - ratingA;
      }

      if (sort === "stars") {
        return starsB - starsA;
      }

      if (sort === "name") {
        return getHotelName(a).localeCompare(
          getHotelName(b),
          "fr"
        );
      }

      const scoreA =
        ratingA * 2 +
        starsA +
        (a.featured ? 2 : 0);

      const scoreB =
        ratingB * 2 +
        starsB +
        (b.featured ? 2 : 0);

      return scoreB - scoreA;
    });
  }

  function updatePriceLabels() {
    if (minPriceValue && minPrice) {
      minPriceValue.textContent =
        `${formatPrice(
          getNumber(minPrice.value)
        )}`;
    }

    if (maxPriceValue && maxPrice) {
      const maximum =
        getNumber(maxPrice.max);

      const current =
        getNumber(maxPrice.value);

      maxPriceValue.textContent =
        current >= maximum
          ? `${formatPrice(maximum)}`
          : `${formatPrice(current)}`;
    }
  }

  function updateGuestsSummary() {
    if (!guestsSummary) {
      return;
    }

    let text =
      `${adults} Adulte${
        adults > 1 ? "s" : ""
      }`;

    if (children > 0) {
      text +=
        ` · ${children} Enfant${
          children > 1 ? "s" : ""
        }`;
    }

    text +=
      ` · ${rooms} Chambre${
        rooms > 1 ? "s" : ""
      }`;

    guestsSummary.textContent = text;

    if (adultsCount) {
      adultsCount.textContent =
        adults;
    }

    if (childrenCount) {
      childrenCount.textContent =
        children;
    }

    if (roomsCount) {
      roomsCount.textContent =
        rooms;
    }
  }

  function updateGuestCounter(
    target,
    action
  ) {
    if (target === "adults") {
      if (action === "increase") {
        adults++;
      } else if (
        action === "decrease" &&
        adults > 1
      ) {
        adults--;
      }
    }

    if (target === "children") {
      if (action === "increase") {
        children++;
      } else if (
        action === "decrease" &&
        children > 0
      ) {
        children--;
      }
    }

    if (target === "rooms") {
      if (action === "increase") {
        rooms++;
      } else if (
        action === "decrease" &&
        rooms > 1
      ) {
        rooms--;
      }
    }

    updateGuestsSummary();
  }

  function setupGuests() {
    if (!guestsSelector || !guestsPanel) {
      return;
    }

    guestsSelector.addEventListener(
      "click",
      event => {
        event.preventDefault();
        event.stopPropagation();

        guestsPanel.classList.toggle(
          "open"
        );
      }
    );

    guestsPanel
      .querySelectorAll(".counter-btn")
      .forEach(button => {
        button.addEventListener(
          "click",
          event => {
            event.preventDefault();

            const target =
              button.dataset.target;

            const action =
              button.dataset.action;

            updateGuestCounter(
              target,
              action
            );
          }
        );
      });

    if (guestsDone) {
      guestsDone.addEventListener(
        "click",
        event => {
          event.preventDefault();

          guestsPanel.classList.remove(
            "open"
          );
        }
      );
    }

    document.addEventListener(
      "click",
      event => {
        if (
          !guestsPanel.contains(
            event.target
          ) &&
          !guestsSelector.contains(
            event.target
          )
        ) {
          guestsPanel.classList.remove(
            "open"
          );
        }
      }
    );

    updateGuestsSummary();
  }

  function setupDateRestrictions() {
    if (!checkInInput || !checkOutInput) {
      return;
    }

    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    const todayString =
      `${year}-${month}-${day}`;

    checkInInput.min =
      todayString;

    checkOutInput.min =
      todayString;

    checkInInput.addEventListener(
      "change",
      () => {
        if (checkInInput.value) {
          checkOutInput.min =
            checkInInput.value;
        }

        validateDates();
      }
    );

    checkOutInput.addEventListener(
      "change",
      validateDates
    );
  }

  function validateDates() {
    if (
      !checkInInput ||
      !checkOutInput
    ) {
      return true;
    }

    const checkIn =
      checkInInput.value;

    const checkOut =
      checkOutInput.value;

    if (!checkIn || !checkOut) {
      return true;
    }

    if (checkOut <= checkIn) {
      alert(
        "La date de départ doit être postérieure à la date d'arrivée."
      );

      checkOutInput.value = "";

      return false;
    }

    return true;
  }

  function saveSearchData() {
    const searchData = {
      destination:
        destinationInput?.value.trim() || "",
      checkIn:
        checkInInput?.value || "",
      checkOut:
        checkOutInput?.value || "",
      adults,
      children,
      rooms
    };

    sessionStorage.setItem(
      "AQUAREV_HOTEL_SEARCH",
      JSON.stringify(searchData)
    );
  }

  function goToHotelDetails(
    hotelId
  ) {
    const hotel =
      hotels.find(
        item =>
          getHotelId(item) ===
          String(hotelId)
      );

    if (!hotel) {
      console.error(
        "HOTEL NOT FOUND:",
        hotelId
      );
      return;
    }

    saveSearchData();

    sessionStorage.setItem(
      "AQUAREV_SELECTED_HOTEL",
      JSON.stringify(hotel)
    );

    window.location.href =
      `${DETAILS_PAGE}?id=${encodeURIComponent(
        hotelId
      )}`;
  }

  function saveFavoriteHotel(
    hotelId,
    active
  ) {
    let favorites = [];

    try {
      favorites =
        JSON.parse(
          localStorage.getItem(
            "AQUAREV_HOTEL_FAVORITES"
          ) || "[]"
        );
    } catch {
      favorites = [];
    }

    const id =
      String(hotelId);

    if (
      active &&
      !favorites.includes(id)
    ) {
      favorites.push(id);
    }

    if (!active) {
      favorites =
        favorites.filter(
          item => item !== id
        );
    }

    localStorage.setItem(
      "AQUAREV_HOTEL_FAVORITES",
      JSON.stringify(
        favorites
      )
    );
  }

  function restoreFavorites() {
    if (!hotelResultsGrid) {
      return;
    }

    let favorites = [];

    try {
      favorites =
        JSON.parse(
          localStorage.getItem(
            "AQUAREV_HOTEL_FAVORITES"
          ) || "[]"
        );
    } catch {
      favorites = [];
    }

    hotelResultsGrid
      .querySelectorAll(
        ".hotel-card-favorite"
      )
      .forEach(button => {
        const id =
          String(
            button.dataset.hotelId
          );

        if (
          favorites.includes(id)
        ) {
          button.classList.add(
            "active"
          );

          const icon =
            button.querySelector(
              "i"
            );

          if (icon) {
            icon.classList.remove(
              "fa-regular"
            );

            icon.classList.add(
              "fa-solid"
            );
          }
        }
      });
  }

  function setupHotelCardActions() {
    if (!hotelResultsGrid) {
      return;
    }

    hotelResultsGrid.addEventListener(
      "click",
      event => {
        const detailsButton =
          event.target.closest(
            ".hotel-card-button"
          );

        if (detailsButton) {
          goToHotelDetails(
            detailsButton.dataset.hotelId
          );
          return;
        }

        const favoriteButton =
          event.target.closest(
            ".hotel-card-favorite"
          );

        if (favoriteButton) {
          event.preventDefault();
          event.stopPropagation();

          const icon =
            favoriteButton.querySelector(
              "i"
            );

          const active =
            favoriteButton.classList.toggle(
              "active"
            );

          if (icon) {
            icon.classList.toggle(
              "fa-regular",
              !active
            );

            icon.classList.toggle(
              "fa-solid",
              active
            );
          }

          saveFavoriteHotel(
            favoriteButton.dataset.hotelId,
            active
          );
        }
      }
    );
  }

  function setupSearch() {
    if (!hotelSearchForm) {
      return;
    }

    hotelSearchForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        if (!validateDates()) {
          return;
        }

        saveSearchData();

        applyFilters();

        if (hotelResultsSection) {
          hotelResultsSection.scrollIntoView(
            {
              behavior: "smooth",
              block: "start"
            }
          );
        }
      }
    );
  }

  function setupFilters() {
    if (minPrice) {
      minPrice.addEventListener(
        "input",
        () => {
          if (
            getNumber(
              minPrice.value
            ) >
            getNumber(
              maxPrice?.value,
              Infinity
            )
          ) {
            minPrice.value =
              maxPrice.value;
          }

          updatePriceLabels();
          applyFilters();
        }
      );
    }

    if (maxPrice) {
      maxPrice.addEventListener(
        "input",
        () => {
          if (
            getNumber(
              maxPrice.value
            ) <
            getNumber(
              minPrice?.value,
              0
            )
          ) {
            maxPrice.value =
              minPrice.value;
          }

          updatePriceLabels();
          applyFilters();
        }
      );
    }

    document
      .querySelectorAll(
        'input[data-filter="stars"],input[data-filter="type"],input[data-filter="amenity"],input[data-filter="rating"]'
      )
      .forEach(input => {
        input.addEventListener(
          "change",
          applyFilters
        );
      });

    if (sortButton) {
      sortButton.addEventListener(
        "click",
        event => {
          event.preventDefault();

          const options = [
            "recommended",
            "price-low",
            "price-high",
            "rating",
            "stars",
            "name"
          ];

          const currentIndex =
            options.indexOf(
              currentSort
            );

          currentSort =
            options[
              (currentIndex + 1) %
                options.length
            ];

          sortButton.setAttribute(
            "data-sort",
            currentSort
          );

          const labels = {
            recommended:
              "Recommandé",
            "price-low":
              "Prix croissant",
            "price-high":
              "Prix décroissant",
            rating:
              "Meilleure évaluation",
            stars:
              "Nombre d'étoiles",
            name:
              "Nom"
          };

          const text =
            sortButton.querySelector(
              "span"
            );

          if (text) {
            text.textContent =
              labels[currentSort];
          }

          sortHotels();
          renderHotels(
            filteredHotels
          );
        }
      );

      sortButton.dataset.sort =
        currentSort;
    }

    if (resetFiltersButton) {
      resetFiltersButton.addEventListener(
        "click",
        resetAllSearch
      );
    }
  }

  function resetAllSearch() {
    if (destinationInput) {
      destinationInput.value = "";
    }

    if (checkInInput) {
      checkInInput.value = "";
    }

    if (checkOutInput) {
      checkOutInput.value = "";
    }

    document
      .querySelectorAll(
        'input[data-filter]'
      )
      .forEach(input => {
        input.checked = false;
      });

    if (minPrice) {
      minPrice.value =
        minPrice.min || 0;
    }

    if (maxPrice) {
      maxPrice.value =
        maxPrice.max || 5000;
    }

    adults = 2;
    children = 0;
    rooms = 1;

    currentSort =
      "recommended";

    if (sortButton) {
      sortButton.dataset.sort =
        currentSort;

      const text =
        sortButton.querySelector(
          "span"
        );

      if (text) {
        text.textContent =
          "Trier";
      }
    }

    updateGuestsSummary();
    updatePriceLabels();

    filteredHotels =
      [...hotels];

    sortHotels();
    renderHotels(
      filteredHotels
    );

    if (guestsPanel) {
      guestsPanel.classList.remove(
        "open"
      );
    }

    if (hotelFilters) {
      hotelFilters.classList.remove(
        "open"
      );
    }

    sessionStorage.removeItem(
      "AQUAREV_HOTEL_SEARCH"
    );
  }

  function setupMobileFilters() {
    if (
      mobileFilterButton &&
      hotelFilters
    ) {
      mobileFilterButton.addEventListener(
        "click",
        event => {
          event.preventDefault();

          hotelFilters.classList.add(
            "open"
          );
        }
      );
    }

    if (closeFilters) {
      closeFilters.addEventListener(
        "click",
        event => {
          event.preventDefault();

          hotelFilters?.classList.remove(
            "open"
          );
        }
      );
    }
  }

  function setupDestinationSuggestions() {
    if (!destinationInput) {
      return;
    }

    destinationInput.addEventListener(
      "input",
      () => {
        if (
          !destinationSuggestions
        ) {
          return;
        }

        const value =
          normalize(
            destinationInput.value
          );

        destinationSuggestions.innerHTML =
          "";

        if (!value) {
          destinationSuggestions.classList.remove(
            "open"
          );
          return;
        }

        const destinations =
          hotels
            .map(
              hotel =>
                getHotelDestination(
                  hotel
                )
            )
            .filter(Boolean);

        const unique =
          [
            ...new Set(
              destinations
            )
          ];

        const matches =
          unique
            .filter(destination =>
              normalize(
                destination
              ).includes(value)
            )
            .slice(0, 6);

        if (!matches.length) {
          destinationSuggestions.classList.remove(
            "open"
          );
          return;
        }

        matches.forEach(
          destination => {
            const button =
              document.createElement(
                "button"
              );

            button.type = "button";

            button.innerHTML = `
              <i class="fa-solid fa-location-dot"></i>
              <span>${escapeHTML(
                destination
              )}</span>
            `;

            button.addEventListener(
              "click",
              () => {
                destinationInput.value =
                  destination;

                destinationSuggestions.classList.remove(
                  "open"
                );

                applyFilters();
              }
            );

            destinationSuggestions.appendChild(
              button
            );
          }
        );

        destinationSuggestions.classList.add(
          "open"
        );
      }
    );

    document.addEventListener(
      "click",
      event => {
        if (
          !destinationSuggestions ||
          !destinationInput
        ) {
          return;
        }

        if (
          !destinationInput.contains(
            event.target
          ) &&
          !destinationSuggestions.contains(
            event.target
          )
        ) {
          destinationSuggestions.classList.remove(
            "open"
          );
        }
      }
    );
  }

  function setupQuickDestinations() {
    document
      .querySelectorAll(
        ".destination-card"
      )
      .forEach(card => {
        card.addEventListener(
          "click",
          () => {
            const destination =
              card.dataset.destination;

            if (
              destinationInput &&
              destination
            ) {
              destinationInput.value =
                destination;

              applyFilters();

              if (
                hotelResultsSection
              ) {
                hotelResultsSection.scrollIntoView(
                  {
                    behavior:
                      "smooth",
                    block: "start"
                  }
                );
              }
            }
          }
        );
      });
  }

  function setupEmptySearchButton() {
    if (!emptySearchButton) {
      return;
    }

    emptySearchButton.addEventListener(
      "click",
      () => {
        if (hotelSearchForm) {
          hotelSearchForm.scrollIntoView(
            {
              behavior: "smooth",
              block: "center"
            }
          );
        }

        setTimeout(() => {
          destinationInput?.focus();
        }, 500);
      }
    );
  }

  function setupLanguageMenu() {
    if (
      !languageButton ||
      !languageMenu
    ) {
      return;
    }

    languageButton.addEventListener(
      "click",
      event => {
        event.preventDefault();
        event.stopPropagation();

        languageMenu.classList.toggle(
          "open"
        );
      }
    );

    languageMenu
      .querySelectorAll(
        "[data-language]"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            const language =
              button.dataset.language;

            localStorage.setItem(
              "AQUAREV_LANGUAGE",
              language
            );

            languageMenu.classList.remove(
              "open"
            );

            if (
              language === "fr"
            ) {
              document.documentElement.lang =
                "fr";
              document.documentElement.dir =
                "ltr";
            }

            if (
              language === "en"
            ) {
              document.documentElement.lang =
                "en";
              document.documentElement.dir =
                "ltr";
            }

            if (
              language === "ar"
            ) {
              document.documentElement.lang =
                "ar";
              document.documentElement.dir =
                "rtl";
            }

            console.log(
              "LANGUAGE SELECTED:",
              language
            );
          }
        );
      });

    document.addEventListener(
      "click",
      event => {
        if (
          !languageMenu.contains(
            event.target
          ) &&
          !languageButton.contains(
            event.target
          )
        ) {
          languageMenu.classList.remove(
            "open"
          );
        }
      }
    );
  }

  function setupMobileMenu() {
    if (
      !mobileMenuButton ||
      !hotelNav
    ) {
      return;
    }

    mobileMenuButton.addEventListener(
      "click",
      event => {
        event.preventDefault();

        hotelNav.classList.toggle(
          "open"
        );

        mobileMenuButton.classList.toggle(
          "active"
        );
      }
    );

    hotelNav
      .querySelectorAll("a")
      .forEach(link => {
        link.addEventListener(
          "click",
          () => {
            hotelNav.classList.remove(
              "open"
            );

            mobileMenuButton.classList.remove(
              "active"
            );
          }
        );
      });
  }

  function setupHeaderScroll() {
    if (!hotelHeader) {
      return;
    }

    const updateHeader =
      () => {
        if (
          window.scrollY > 40
        ) {
          hotelHeader.classList.add(
            "scrolled"
          );
        } else {
          hotelHeader.classList.remove(
            "scrolled"
          );
        }
      };

    window.addEventListener(
      "scroll",
      updateHeader,
      {
        passive: true
      }
    );

    updateHeader();
  }

  function setupCookieNotice() {
    if (
      !cookieNotice
    ) {
      return;
    }

    const accepted =
      localStorage.getItem(
        "AQUAREV_HOTEL_COOKIE_NOTICE"
      );

    if (accepted === "1") {
      cookieNotice.classList.add(
        "hidden"
      );
    }

    if (closeCookieNotice) {
      closeCookieNotice.addEventListener(
        "click",
        () => {
          cookieNotice.classList.add(
            "hidden"
          );

          localStorage.setItem(
            "AQUAREV_HOTEL_COOKIE_NOTICE",
            "1"
          );
        }
      );
    }
  }

  function restoreSearchData() {
    let saved = null;

    try {
      saved =
        JSON.parse(
          sessionStorage.getItem(
            "AQUAREV_HOTEL_SEARCH"
          ) || "null"
        );
    } catch {
      saved = null;
    }

    if (!saved) {
      return;
    }

    if (
      destinationInput &&
      saved.destination
    ) {
      destinationInput.value =
        saved.destination;
    }

    if (
      checkInInput &&
      saved.checkIn
    ) {
      checkInInput.value =
        saved.checkIn;
    }

    if (
      checkOutInput &&
      saved.checkOut
    ) {
      checkOutInput.value =
        saved.checkOut;
    }

    adults =
      getNumber(
        saved.adults,
        2
      );

    children =
      getNumber(
        saved.children,
        0
      );

    rooms =
      getNumber(
        saved.rooms,
        1
      );

    updateGuestsSummary();
  }

  async function loadHotels() {
    try {
      showPageLoader();

      const response =
        await fetch(
          HOTEL_DATA_URL,
          {
            cache: "no-store"
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        hotels = data;
      } else if (
        Array.isArray(
          data.hotels
        )
      ) {
        hotels =
          data.hotels;
      } else {
        hotels = [];
      }

      filteredHotels =
        [...hotels];

      restoreSearchData();

      sortHotels();

      renderHotels(
        filteredHotels
      );

      hidePageLoader();

      console.log(
        "AQUAREV HOTELS LOADED:",
        hotels.length
      );
    } catch (error) {
      console.error(
        "AQUAREV HOTELS DATA ERROR:",
        error
      );

      if (hotelResultsGrid) {
        hotelResultsGrid.innerHTML = `
          <div class="hotels-error">
            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
              Impossible de charger les hôtels
            </h3>

            <p>
              Une erreur est survenue lors du chargement
              des données hôtelières.
            </p>

            <button
              type="button"
              id="retryHotels"
              class="hotel-retry-btn"
            >
              Réessayer
            </button>
          </div>
        `;

        const retryButton =
          document.getElementById(
            "retryHotels"
          );

        if (retryButton) {
          retryButton.addEventListener(
            "click",
            loadHotels
          );
        }
      }

      hidePageLoader();
    }
  }

  function initialize() {
    setupDateRestrictions();
    setupGuests();
    setupFilters();
    setupSearch();
    setupHotelCardActions();
    setupMobileFilters();
    setupDestinationSuggestions();
    setupQuickDestinations();
    setupEmptySearchButton();
    setupLanguageMenu();
    setupMobileMenu();
    setupHeaderScroll();
    setupCookieNotice();

    updatePriceLabels();
    updateGuestsSummary();

    loadHotels();
  }

  window.addEventListener(
    "load",
    () => {
      setTimeout(
        hidePageLoader,
        300
      );
    }
  );

  initialize();
});
