class AddImage extends HTMLElement {
  static get observedAttributes() { return ['src', 'alt', 'width', 'height']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const src = this.getAttribute('src');
    const alt = this.getAttribute('alt');
    const width = this.getAttribute('width') || '400';
    const height = this.getAttribute('height') || '400';
    this.shadowRoot.innerHTML = `
      <style>
        .placeholder-img {
          display: block;
          margin: 2rem auto;
          border-radius: 12px;
          border: 2px dashed #6366f1;
          background: #222;
          color: #ccc;
          width: ${width}px;
          height: ${height}px;
          text-align: center;
          font-size: 1.2rem;
        }
        .missing-alt {
          color: #ff9800;
          font-weight: bold;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }
      </style>
      <div class="placeholder-img" id="ph-img-container"></div>
    `;
    const container = this.shadowRoot.getElementById('ph-img-container');
  const fallbackSrc = 'images/placeholder-400x400.svg';
  let imgSrc = src ? src : fallbackSrc;
    let imgAlt = alt || "Error: 'alt' attribute is required for accessibility. Please add a meaningful alt text.";
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = imgAlt;
    img.width = width;
    img.height = height;
    let triedFallback = false;
    img.onerror = () => {
      if (!triedFallback && img.src !== fallbackSrc) {
        triedFallback = true;
        img.src = fallbackSrc;
        img.alt = `Image not found. Showing default placeholder.`;
        // Show button when fallback is displayed
        setTimeout(() => {
          showInsertButton();
        }, 0);
      } else {
        container.textContent = '';
        container.innerHTML = `
          <span style='color:#e53935;font-size:1.5em;vertical-align:middle;'>&#10060;</span>
          <span>Image not found.<br>Showing default placeholder.<br>Check the image URL or upload a new image of the correct size.</span><br>
          <button id='add-img-btn' style='margin-top:1em;padding:0.5em 1em;font-size:1em;'>Insert image from images folder</button>
        `;
        addInsertButtonListener();
      }
    };
    container.textContent = '';
    container.appendChild(img);
    // If fallback is used initially, show button
    if (imgSrc === fallbackSrc) {
      setTimeout(() => {
        showInsertButton();
      }, 0);
    }

    function showInsertButton() {
      if (!container.querySelector('#add-img-btn')) {
        const btn = document.createElement('button');
        btn.id = 'add-img-btn';
        btn.textContent = 'No Image Found. Insert from images folder.';
        btn.style.marginTop = '1em';
        btn.style.padding = '0.75em 1.5em';
        btn.style.fontSize = '1.1em';
        btn.style.background = '#222';
        btn.style.color = '#fff';
        btn.style.border = '2px solid #6366f1';
        btn.style.borderRadius = '8px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        btn.onmouseover = () => { btn.style.background = '#333'; };
        btn.onmouseout = () => { btn.style.background = '#222'; };
        container.appendChild(btn);
        addInsertButtonListener();
      }
    }
    function addInsertButtonListener() {
      const btn = container.querySelector('#add-img-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          // Only allow user to select a file and update src attribute
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.style.display = 'none';
          input.onchange = (e) => {
            const file = input.files[0];
            if (file) {
              const url = URL.createObjectURL(file);
              let addImageEl = btn.closest('add-image');
              let container;
              if (addImageEl) {
                addImageEl.setAttribute('src', url);
                addImageEl.setAttribute('alt', file.name);
                container = addImageEl.shadowRoot.getElementById('ph-img-container');
              } else {
                container = btn.parentElement;
              }
              if (container) {
                while (container.firstChild) {
                  container.removeChild(container.firstChild);
                }
                const img = document.createElement('img');
                img.src = url;
                img.alt = file.name;
                img.width = addImageEl ? (addImageEl.getAttribute('width') || '400') : '400';
                img.height = addImageEl ? (addImageEl.getAttribute('height') || '400') : '400';
                container.appendChild(img);
                // Add Try Again and Save buttons
                const tryBtn = document.createElement('button');
                tryBtn.textContent = 'Try Again';
                tryBtn.style.margin = '1em 0.5em 0 0';
                tryBtn.style.padding = '0.5em 1em';
                tryBtn.style.fontSize = '1em';
                tryBtn.style.background = '#222';
                tryBtn.style.color = '#fff';
                tryBtn.style.border = '2px solid #6366f1';
                tryBtn.style.borderRadius = '8px';
                tryBtn.style.cursor = 'pointer';
                tryBtn.onclick = () => {
                  container.removeChild(img);
                  container.removeChild(tryBtn);
                  container.removeChild(saveBtn);
                  // Immediately open file picker for new image selection
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.style.display = 'none';
                  input.onchange = (e) => {
                    const file = input.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      let addImageEl = container.closest('add-image');
                      if (addImageEl) {
                        addImageEl.setAttribute('src', url);
                        addImageEl.setAttribute('alt', file.name);
                        while (container.firstChild) {
                          container.removeChild(container.firstChild);
                        }
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = file.name;
                        img.width = addImageEl.getAttribute('width') || '400';
                        img.height = addImageEl.getAttribute('height') || '400';
                        container.appendChild(img);
                        // Add Try Again and Save buttons again
                        const tryBtnNew = document.createElement('button');
                        tryBtnNew.textContent = 'Try Again';
                        tryBtnNew.style.margin = '1em 0.5em 0 0';
                        tryBtnNew.style.padding = '0.5em 1em';
                        tryBtnNew.style.fontSize = '1em';
                        tryBtnNew.style.background = '#222';
                        tryBtnNew.style.color = '#fff';
                        tryBtnNew.style.border = '2px solid #6366f1';
                        tryBtnNew.style.borderRadius = '8px';
                        tryBtnNew.style.cursor = 'pointer';
                        tryBtnNew.onclick = function() {
                          container.removeChild(img);
                          container.removeChild(tryBtnNew);
                          container.removeChild(saveBtnNew);
                          // Immediately open file picker for new image selection
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.style.display = 'none';
                          input.onchange = (e) => {
                            const file = input.files[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              let addImageEl = container.closest('add-image');
                              if (addImageEl) {
                                addImageEl.setAttribute('src', url);
                                addImageEl.setAttribute('alt', file.name);
                                while (container.firstChild) {
                                  container.removeChild(container.firstChild);
                                }
                                const img = document.createElement('img');
                                img.src = url;
                                img.alt = file.name;
                                img.width = addImageEl.getAttribute('width') || '400';
                                img.height = addImageEl.getAttribute('height') || '400';
                                container.appendChild(img);
                                // Add Try Again and Save buttons again
                                const tryBtnAgain = document.createElement('button');
                                tryBtnAgain.textContent = 'Try Again';
                                tryBtnAgain.style.margin = '1em 0.5em 0 0';
                                tryBtnAgain.style.padding = '0.5em 1em';
                                tryBtnAgain.style.fontSize = '1em';
                                tryBtnAgain.style.background = '#222';
                                tryBtnAgain.style.color = '#fff';
                                tryBtnAgain.style.border = '2px solid #6366f1';
                                tryBtnAgain.style.borderRadius = '8px';
                                tryBtnAgain.style.cursor = 'pointer';
                                tryBtnAgain.onclick = function() {
                                  container.removeChild(img);
                                  container.removeChild(tryBtnAgain);
                                  container.removeChild(saveBtnAgain);
                                  // Immediately open file picker for new image selection
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.style.display = 'none';
                                  input.onchange = (e) => {
                                    const file = input.files[0];
                                    if (file) {
                                      const url = URL.createObjectURL(file);
                                      let addImageEl = container.closest('add-image');
                                      if (addImageEl) {
                                        addImageEl.setAttribute('src', url);
                                        addImageEl.setAttribute('alt', file.name);
                                        while (container.firstChild) {
                                          container.removeChild(container.firstChild);
                                        }
                                        const img = document.createElement('img');
                                        img.src = url;
                                        img.alt = file.name;
                                        img.width = addImageEl.getAttribute('width') || '400';
                                        img.height = addImageEl.getAttribute('height') || '400';
                                        container.appendChild(img);
                                        // Add Try Again and Save buttons again
                                        const tryBtnFinal = document.createElement('button');
                                        tryBtnFinal.textContent = 'Try Again';
                                        tryBtnFinal.style.margin = '1em 0.5em 0 0';
                                        tryBtnFinal.style.padding = '0.5em 1em';
                                        tryBtnFinal.style.fontSize = '1em';
                                        tryBtnFinal.style.background = '#222';
                                        tryBtnFinal.style.color = '#fff';
                                        tryBtnFinal.style.border = '2px solid #6366f1';
                                        tryBtnFinal.style.borderRadius = '8px';
                                        tryBtnFinal.style.cursor = 'pointer';
                                        tryBtnFinal.onclick = tryBtnAgain.onclick;
                                        const saveBtnFinal = document.createElement('button');
                                        saveBtnFinal.textContent = 'Save';
                                        saveBtnFinal.style.margin = '1em 0 0 0.5em';
                                        saveBtnFinal.style.padding = '0.5em 1em';
                                        saveBtnFinal.style.fontSize = '1em';
                                        saveBtnFinal.style.background = '#222';
                                        saveBtnFinal.style.color = '#fff';
                                        saveBtnFinal.style.border = '2px solid #6366f1';
                                        saveBtnFinal.style.borderRadius = '8px';
                                        saveBtnFinal.style.cursor = 'pointer';
                                        saveBtnFinal.onclick = () => {
                                          if (addImageEl) {
                                            addImageEl.setAttribute('src', img.src);
                                          }
                                          container.removeChild(tryBtnFinal);
                                          container.removeChild(saveBtnFinal);
                                        };
                                        container.appendChild(tryBtnFinal);
                                        container.appendChild(saveBtnFinal);
                                      }
                                    }
                                  };
                                  container.appendChild(input);
                                  input.click();
                                };
                                const saveBtnAgain = document.createElement('button');
                                saveBtnAgain.textContent = 'Save';
                                saveBtnAgain.style.margin = '1em 0 0 0.5em';
                                saveBtnAgain.style.padding = '0.5em 1em';
                                saveBtnAgain.style.fontSize = '1em';
                                saveBtnAgain.style.background = '#222';
                                saveBtnAgain.style.color = '#fff';
                                saveBtnAgain.style.border = '2px solid #6366f1';
                                saveBtnAgain.style.borderRadius = '8px';
                                saveBtnAgain.style.cursor = 'pointer';
                                saveBtnAgain.onclick = () => {
                                  if (addImageEl) {
                                    addImageEl.setAttribute('src', img.src);
                                  }
                                  container.removeChild(tryBtnAgain);
                                  container.removeChild(saveBtnAgain);
                                };
                                container.appendChild(tryBtnAgain);
                                container.appendChild(saveBtnAgain);
                              }
                            }
                          };
                          container.appendChild(input);
                          input.click();
                        };
                        const saveBtnNew = document.createElement('button');
                        saveBtnNew.textContent = 'Save';
                        saveBtnNew.style.margin = '1em 0 0 0.5em';
                        saveBtnNew.style.padding = '0.5em 1em';
                        saveBtnNew.style.fontSize = '1em';
                        saveBtnNew.style.background = '#222';
                        saveBtnNew.style.color = '#fff';
                        saveBtnNew.style.border = '2px solid #6366f1';
                        saveBtnNew.style.borderRadius = '8px';
                        saveBtnNew.style.cursor = 'pointer';
                        saveBtnNew.onclick = () => {
                          if (addImageEl) {
                            addImageEl.setAttribute('src', img.src);
                          }
                          container.removeChild(tryBtnNew);
                          container.removeChild(saveBtnNew);
                        };
                        container.appendChild(tryBtnNew);
                        container.appendChild(saveBtnNew);
                      }
                    }
                  };
                  container.appendChild(input);
                  input.click();
                };
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Save';
                saveBtn.style.margin = '1em 0 0 0.5em';
                saveBtn.style.padding = '0.5em 1em';
                saveBtn.style.fontSize = '1em';
                saveBtn.style.background = '#222';
                saveBtn.style.color = '#fff';
                saveBtn.style.border = '2px solid #6366f1';
                saveBtn.style.borderRadius = '8px';
                saveBtn.style.cursor = 'pointer';
                saveBtn.onclick = () => {
                  // Persist the selected image URL to the src attribute
                  if (addImageEl) {
                    addImageEl.setAttribute('src', img.src);
                  }
                  container.removeChild(tryBtn);
                  container.removeChild(saveBtn);
                };
                container.appendChild(tryBtn);
                container.appendChild(saveBtn);
              }
            }
          };
          container.appendChild(input);
          input.click();
        });
      }
    }
  }
}
customElements.define('add-image', AddImage);
