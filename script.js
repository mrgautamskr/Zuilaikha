
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  // Footer year
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  const menu = $("#mobileMenu");
  const menuToggle = $(".menu-toggle");
  const menuClose = $(".menu-close");

  function setMenu(open) {
    if (!menu || !menuToggle) return;

    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

    document.body.classList.toggle("menu-open", open);
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(!menu?.classList.contains("open"));
  });

  menuClose?.addEventListener("click", () => setMenu(false));

  $$(".mobile-menu a").forEach(link => {
    link.addEventListener("click", () => setMenu(false));
  });

  // Close overlays with Escape
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setMenu(false);
      closeSearch();
      closeLightbox();
    }
  });

  // Active navigation
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-link");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navLinks.forEach(link => {
          const active =
            link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", active);

          if (active) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, {
      rootMargin: "-25% 0px -60% 0px"
    });

    sections.forEach(section => sectionObserver.observe(section));
  }

  // Video category filter
  $$(".filter-bar .filter-button").forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;

      $$(".filter-bar .filter-button").forEach(item => {
        const selected = item === button;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      $$(".video-card[data-category]").forEach(card => {
        const visible =
          category === "all" || card.dataset.category === category;

        card.classList.toggle("filtered-out", !visible);
      });
    });
  });

  // Gallery lightbox
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxClose = $(".lightbox-close");
  let previousLightboxFocus = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImage) return;

    previousLightboxFocus = document.activeElement;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Gallery photograph";

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");

    lightboxClose?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;

    const wasOpen = lightbox.classList.contains("open");

    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");

    if (lightboxImage) lightboxImage.src = "";

    if (wasOpen && previousLightboxFocus instanceof HTMLElement) {
      previousLightboxFocus.focus();
    }
  }

  $$(".gallery-item").forEach(button => {
    button.addEventListener("click", () => {
      const image = $("img", button);
      const src = button.dataset.image || image?.src;

      if (src) openLightbox(src, image?.alt);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);

  lightbox?.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  // Search panel
  const searchPanel = $("#searchPanel");
  const searchToggle = $(".search-toggle");
  const searchClose = $(".search-close");
  const searchInput = $("#siteSearch");
  const searchResults = $("#searchResults");
  let previousSearchFocus = null;

  const searchableItems = [
    {
      title: "Home",
      href: "#home",
      terms: "welcome creator introduction"
    },
    {
      title: "About Me",
      href: "#about",
      terms: "about profile lifestyle beauty travel"
    },
    {
      title: "Videos",
      href: "#videos",
      terms: "vlogs youtube video watch"
    },
    {
      title: "Gallery",
      href: "#gallery",
      terms: "photos pictures memories"
    },
    {
      title: "Projects",
      href: "#projects",
      terms: "collaboration brand campaigns"
    },
    {
      title: "Blog & Journal",
      href: "#blog",
      terms: "stories articles journal tips"
    },
    {
      title: "Contact",
      href: "#contact",
      terms: "email message work together"
    }
  ];

  function openSearch() {
    if (!searchPanel) return;

    previousSearchFocus = document.activeElement;
    searchPanel.classList.add("open");
    searchPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");

    setTimeout(() => searchInput?.focus(), 50);
  }

  function closeSearch() {
    if (!searchPanel) return;

    const wasOpen = searchPanel.classList.contains("open");

    searchPanel.classList.remove("open");
    searchPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");

    if (wasOpen && previousSearchFocus instanceof HTMLElement) {
      previousSearchFocus.focus();
    }
  }

  function renderSearchResults(query = "") {
    if (!searchResults) return;

    const normalized = query.trim().toLowerCase();

    const results = searchableItems.filter(item => {
      const content = `${item.title} ${item.terms}`.toLowerCase();
      return !normalized || content.includes(normalized);
    });

    searchResults.replaceChildren();

    if (results.length === 0) {
      const message = document.createElement("p");
      message.textContent =
        "No matching sections found. Try another keyword.";
      searchResults.append(message);
      return;
    }

    results.forEach(item => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = `${item.title} ↗`;
      link.addEventListener("click", closeSearch);
      searchResults.append(link);
    });
  }

  searchToggle?.addEventListener("click", openSearch);
  searchClose?.addEventListener("click", closeSearch);

  searchPanel?.addEventListener("click", event => {
    if (event.target === searchPanel) closeSearch();
  });

  searchInput?.addEventListener("input", () => {
    renderSearchResults(searchInput.value);
  });

  renderSearchResults();

  // Contact form: frontend validation only.
  // A backend or email service is needed for actual delivery.
  const contactForm = $("#contactForm");
  const formStatus = $("#formStatus");

  contactForm?.addEventListener("submit", event => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    if (formStatus) {
      formStatus.textContent =
        "Message delivery is not configured yet. Please email hello@example.com.";
    }
  });

  // Reveal animations
  const revealTargets = $$(
    ".section-heading, .about-grid, .stats-strip, " +
    ".video-card, .gallery-item, .project-card, " +
    ".blog-card, .contact-form"
  );

  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealTargets.forEach(element => element.classList.add("reveal"));

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12
    });

    revealTargets.forEach(element => revealObserver.observe(element));
  } else {
    revealTargets.forEach(element => element.classList.add("visible"));
  }

  // Image loading fallback
  $$("img").forEach(image => {
    image.addEventListener("error", () => {
      image.style.background =
        "linear-gradient(135deg, #53214e, #b34aff55, #ff65b544)";
      image.style.minHeight = "120px";
      image.alt = "Image unavailable. Check the image file path.";
    });
  });
});
