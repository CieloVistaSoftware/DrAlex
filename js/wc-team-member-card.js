class TeamMemberCard extends HTMLElement {
  static get observedAttributes() {
    return ["name", "role", "description", "image-src", "image-alt", "image-size"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
  const name = this.getAttribute("name") || "";
  let role = this.getAttribute("role") || "";
  if (role.trim().toLowerCase() === "group") role = "";
  const description = this.getAttribute("description") || "";
  const imageSrc = this.getAttribute("image-src") || "";
  const imageAlt = this.getAttribute("image-alt") || name;
  const imageSize = this.getAttribute("image-size") || "400x400";
  const [width, height] = imageSize.split("x");

    this.shadowRoot.innerHTML = `
      <style>
        .content-card {
          background: var(--bg-secondary, #222c36);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(34,44,54,0.08);
          padding: 1.5em;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #e0e6ed;
          border-left: 3px solid var(--primary, #6366f1);
          margin-bottom: 2rem;
        }
        .profile-image, .about-profile-placeholder {
          width: ${width}px;
          height: ${height}px;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #222c36;
          border: 2px dashed #4a6a8a;
          color: #e0e6ed;
          margin-bottom: 1em;
        }
        .profile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .about-profile-placeholder span {
          width: ${width}px;
          display: block;
          text-align: center;
        }
        .about-profile-placeholder .optimal {
          font-size: 0.9em;
          color: #8ca0b3;
          word-break: break-word;
          white-space: normal;
          max-width: 100%;
          text-align: center;
        }
        .card-title {
          font-size: 1.3em;
          font-weight: 600;
          margin: 0.5em 0 0.2em 0;
          text-align: center;
        }
        .card-description {
          font-size: 1em;
          text-align: center;
        }
      </style>
      <div class="content-card">
        ${imageSrc ? `
          <div class="profile-image">
            <img src="${imageSrc}" alt="${imageAlt}" />
          </div>
        ` : `
          <div class="about-profile-placeholder">
            <span>Image Needed</span>
            <span class="optimal">Optimal size: ${width}x${height}px (JPG or PNG)</span>
          </div>
        `}
        <h3 class="card-title">${name}</h3>
        <p class="card-description">
          ${role ? `<strong>${role}</strong><br>` : ""}
          ${description}
        </p>
      </div>
    `;
  }
}

customElements.define("team-member-card", TeamMemberCard);
