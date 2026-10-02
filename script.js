// ============================================
// Jeremías Gutiérrez — Portafolio
// Renderiza toda la página a partir de info.json
// (contenido/perfil) y projects.json (proyectos).
// ============================================

document.addEventListener("DOMContentLoaded", loadData);

async function loadData() {
  try {
    const [info, projects] = await Promise.all([
      fetchJSON("info.json"),
      fetchJSON("projects.json"),
    ]);
    renderSite(info, projects);

    initMobileMenu();
    initHeroRoles();
    initScrollReveal();
    initActiveNav();
    initToTop();
  } catch (err) {
    console.error("No se pudo cargar info.json / projects.json:", err);
    const banner = document.getElementById("dataError");
    if (banner) banner.hidden = false;
  }
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

/* ---------- Render ---------- */
function renderSite(info, projects) {
  renderMeta(info);
  renderNav(info);
  renderHero(info);
  renderManifesto(info);
  renderStudio(info);
  renderWorks(projects);
  renderMarquee(info);
  renderLookingFor(info);
  renderArchive(info);
  renderContact(info);
  renderFooter(info, projects);
}

function renderMeta(info) {
  document.title = info.site.title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", info.site.description);
}

function renderNav(info) {
  const logo = document.getElementById("navLogo");
  logo.innerHTML = `${info.site.logo}<span class="nav__logo-dot">.</span>`;

  const navLinks = document.getElementById("navLinks");
  const menuLinks = document.getElementById("menuLinks");
  navLinks.innerHTML = "";
  menuLinks.innerHTML = "";

  info.nav.links.forEach((link) => {
    const sectionId = link.href.replace("#", "");

    if (link.submenu) {
      const item = document.createElement("div");
      item.className = "nav__item nav__item--has-sub";
      item.innerHTML = `
        <a href="${link.href}" class="nav__link" data-section="${sectionId}">${link.label}</a>
        <div class="nav__submenu">
          ${link.submenu.map((sub) => `<a href="${sub.href}">${sub.label}</a>`).join("")}
        </div>`;
      navLinks.appendChild(item);
    } else {
      const a = document.createElement("a");
      a.href = link.href;
      a.className = "nav__link";
      a.dataset.section = sectionId;
      a.textContent = link.label;
      navLinks.appendChild(a);
    }

    const menuLink = document.createElement("a");
    menuLink.href = link.href;
    menuLink.className = "menu__link";
    menuLink.textContent = link.label;
    menuLinks.appendChild(menuLink);

    if (link.submenu) {
      const sub = document.createElement("div");
      sub.className = "menu__sub";
      sub.innerHTML = link.submenu.map((s) => `<a href="${s.href}">${s.label}</a>`).join("");
      menuLinks.appendChild(sub);
    }
  });

  document.getElementById("menuFooter").innerHTML = `<span>${info.contact.email}</span>`;
}

function renderHero(info) {
  document.getElementById("heroEyebrow").textContent = info.hero.eyebrow;
  document.getElementById("heroTitle").textContent = info.hero.name;
  document.getElementById("heroSubtitle").textContent = info.hero.subtitle;

  const roles = document.getElementById("heroRoles");
  roles.innerHTML = info.hero.roles
    .map((role, i) => `<span class="hero__role${i === 0 ? " is-active" : ""}">${role}</span>`)
    .join("");
}

function renderManifesto(info) {
  document.getElementById("manifestoText").innerHTML = inlineMarkdown(info.manifesto);
}

function renderStudio(info) {
  document.getElementById("studioTag").textContent = info.studio.tag;
  document.getElementById("studioTitle").innerHTML = info.studio.title;
  document.getElementById("studioText").textContent = info.studio.text;

  const grid = document.getElementById("studioGrid");
  grid.innerHTML = info.studio.areas
    .map(
      (area) => `
      <div class="studio__card reveal">
        <span class="studio__num">${area.num}</span>
        <h3>${area.title}</h3>
        <p>${area.text}</p>
        <div class="tag-row">${tagsHTML(area.tags)}</div>
      </div>`
    )
    .join("");
}

function renderWorks(projects) {
  const list = document.getElementById("worksList");
  list.innerHTML = projects.map((p, i) => renderWorkCard(p, i)).join("");
  setupModelViewers(list);
}

function renderWorkCard(p, index) {
  if (p.type === "model3d") {
    const viewerId = `mv-${index}`;
    const first = p.variants[0];
    const tabs = p.variants.length > 1
      ? `<div class="work__tabs" data-target="${viewerId}">
          ${p.variants
            .map(
              (v, vi) => `
            <button type="button" class="work__tab${vi === 0 ? " is-active" : ""}"
              data-src="${v.src}" data-autoplay="${v.autoplay}">${v.label}</button>`
            )
            .join("")}
        </div>`
      : "";
    return `
      <article id="${p.id}" class="work work--3d reveal">
        <div class="work__viewer">
          <model-viewer id="${viewerId}" src="${first.src}" alt="${p.name}"
            camera-controls auto-rotate shadow-intensity="1" exposure="1"
            environment-image="neutral" loading="lazy"
            ${first.autoplay ? "autoplay" : ""}></model-viewer>
          ${tabs}
        </div>
        <div class="work__info">
          <h3>${p.name}</h3>
          <p class="work__role">${p.role}</p>
          <div class="tag-row">${tagsHTML(p.tools)}</div>
        </div>
      </article>`;
  }

  return `
    <article id="${p.id}" class="work reveal">
      <div class="work__thumb work__thumb--${p.thumbVariant}">
        <span class="work__thumb-label">${p.category}</span>
      </div>
      <div class="work__info">
        <h3>${p.name}</h3>
        <p class="work__role">${p.role}</p>
        <div class="tag-row">${tagsHTML(p.tools)}</div>
        <a href="${p.link}" class="work__link">${p.linkLabel}</a>
      </div>
    </article>`;
}

// Delegated click handling for the Modelo/Animación tabs next to each <model-viewer>.
function setupModelViewers(container) {
  container.querySelectorAll(".work__tabs").forEach((tabs) => {
    const viewer = document.getElementById(tabs.dataset.target);
    if (!viewer) return;
    tabs.querySelectorAll(".work__tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        tabs.querySelectorAll(".work__tab").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        viewer.setAttribute("src", btn.dataset.src);
        if (btn.dataset.autoplay === "true") {
          viewer.setAttribute("autoplay", "");
        } else {
          viewer.removeAttribute("autoplay");
        }
      });
    });
  });
}

function renderMarquee(info) {
  const track = document.getElementById("marqueeTrack");
  const items = [...info.tools, ...info.tools]
    .map((tool) => `<span>${tool}</span>`)
    .join("");
  track.innerHTML = items;
}

function renderLookingFor(info) {
  const data = info.lookingFor;
  document.getElementById("lookingTag").textContent = data.tag;
  document.getElementById("lookingTitle").textContent = data.title;
  document.getElementById("lookingText").textContent = data.text;
  const cta = document.getElementById("lookingCta");
  cta.textContent = data.cta.label;
  cta.href = data.cta.href;
}

function renderArchive(info) {
  const data = info.archive;
  document.getElementById("archiveTag").textContent = data.tag;
  document.getElementById("archiveTitle").textContent = data.title;
  document.getElementById("archiveNote").textContent = data.note;

  const grid = document.getElementById("archiveGrid");
  grid.innerHTML = data.items
    .map(
      (item) => `
      <div class="archive__cell reveal archive__cell--${item.variant}${item.tall ? " archive__cell--tall" : ""}">
        <button class="archive__image-button" type="button" aria-label="Ver imagen completa: ${item.label}">
          <img src="${item.src}" alt="" loading="lazy" decoding="async">
        </button>
        <span>${item.label}</span>
      </div>`
    )
    .join("");

  const lightbox = document.getElementById("archiveLightbox");
  const lightboxImage = document.getElementById("archiveLightboxImage");
  const lightboxCaption = document.getElementById("archiveLightboxCaption");
  const closeButton = lightbox.querySelector(".archive-lightbox__close");

  grid.addEventListener("click", (event) => {
    const button = event.target.closest(".archive__image-button");
    if (!button) return;

    const image = button.querySelector("img");
    lightboxImage.src = image.src;
    lightboxImage.alt = button.getAttribute("aria-label");
    lightboxCaption.textContent = button.closest(".archive__cell").querySelector("span").textContent;
    lightbox.showModal();
    closeButton.focus({ preventScroll: true });
  });

  closeButton.addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}

function renderContact(info) {
  const data = info.contact;
  document.getElementById("contactTag").textContent = data.tag;
  document.getElementById("contactTitle").textContent = data.title;

  const email = document.getElementById("contactEmail");
  email.textContent = data.email;
  email.href = `mailto:${data.email}`;

  document.getElementById("contactSocials").innerHTML = data.socials
    .map((s) => `<a href="${s.href}">${s.label}</a>`)
    .join("");
}

function renderFooter(info, projects) {
  document.getElementById("footerWordmark").textContent = info.footer.wordmark;

  const footerEmail = document.getElementById("footerEmail");
  footerEmail.textContent = info.contact.email;
  footerEmail.href = `mailto:${info.contact.email}`;

  const sitemap = document.getElementById("footerSitemap");
  sitemap.innerHTML =
    `<span class="footer__label">Sitemap</span>` +
    info.nav.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("");

  const social = document.getElementById("footerSocial");
  social.innerHTML =
    `<span class="footer__label">Social</span>` +
    info.contact.socials.map((s) => `<a href="${s.href}">${s.label}</a>`).join("");

  document.getElementById("footerCopyright").textContent = `© ${info.site.year} ${info.hero.name}`;
  document.getElementById("footerUniversity").textContent = info.footer.university;
}

/* ---------- Helpers ---------- */
function tagsHTML(tags) {
  return tags.map((t) => `<span class="tag">${t}</span>`).join("");
}

// Convierte *texto* en <em>texto</em> dentro de campos de info.json
function inlineMarkdown(str) {
  return str.replace(/\*(.+?)\*/g, "<em>$1</em>");
}

/* ---------- Mobile menu (hamburguesa + panel lateral arrastrable) ---------- */
function initMobileMenu() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const panel = document.getElementById("menuPanel");
  if (!toggle || !menu || !panel) return;

  const open = () => {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    panel.style.transform = "";
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.contains("is-open");
    isOpen ? close() : open();
  });

  menu.addEventListener("click", (e) => {
    if (e.target === menu) close();
  });

  menu.querySelectorAll(".menu__link, .menu__sub a").forEach((link) => {
    link.addEventListener("click", close);
  });

  // Swipe-to-close (arrastre horizontal del panel)
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  panel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
    panel.style.transition = "none";
  }, { passive: true });

  panel.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    currentX = e.touches[0].clientX - startX;
    if (currentX > 0) {
      panel.style.transform = `translateX(${currentX}px)`;
    }
  }, { passive: true });

  panel.addEventListener("touchend", () => {
    dragging = false;
    panel.style.transition = "";
    const panelWidth = panel.offsetWidth;
    if (currentX > panelWidth * 0.3) {
      close();
    } else {
      panel.style.transform = "";
    }
    currentX = 0;
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ---------- Hero: roles rotativos (slider de texto) ---------- */
function initHeroRoles() {
  const roles = document.querySelectorAll(".hero__role");
  if (!roles.length) return;
  let index = 0;
  setInterval(() => {
    roles[index].classList.remove("is-active");
    index = (index + 1) % roles.length;
    roles[index].classList.add("is-active");
  }, 2600);
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !targets.length) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- Nav activo según sección visible ---------- */
function initActiveNav() {
  const sections = ["index", "works", "studio", "archive", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const links = document.querySelectorAll(".nav__link[data-section]");
  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.section === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- Botón volver arriba ---------- */
function initToTop() {
  const btn = document.getElementById("toTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("is-visible", window.scrollY > 700);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
