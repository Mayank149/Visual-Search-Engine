// === DOM Elements ===
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const previewCard = document.getElementById('previewCard');
const previewImage = document.getElementById('previewImage');
const removeBtn = document.getElementById('removeBtn');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const resultsSection = document.getElementById('results-section');
const resultsCount = document.getElementById('resultsCount');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

let selectedFile = null;

// === Toast Notification ===
function showToast(message, type = 'error') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${type === 'error'
                ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
                : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
            }
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    // Auto dismiss
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}

// === Upload Box Click ===
uploadBox.addEventListener('click', () => fileInput.click());

// === File Input Change ===
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

// === Drag & Drop ===
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
});

uploadBox.addEventListener('dragleave', (e) => {
    // Only remove if leaving the upload box entirely
    if (!uploadBox.contains(e.relatedTarget)) {
        uploadBox.classList.remove('drag-over');
    }
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

// Prevent default drag behavior on window
['dragover', 'drop'].forEach(evt => {
    window.addEventListener(evt, (e) => e.preventDefault());
});

// === Handle File ===
function handleFile(file) {
    selectedFile = file;

    // Revoke previous object URL if any
    if (previewImage.src && previewImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage.src);
    }

    previewImage.src = URL.createObjectURL(file);
    previewCard.hidden = false;
    searchBtn.disabled = false;

    // Clear previous results
    resultsSection.hidden = true;
    results.innerHTML = '';

    // Smooth scroll to preview
    previewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// === Remove Preview ===
removeBtn.addEventListener('click', () => {
    selectedFile = null;
    if (previewImage.src && previewImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage.src);
    }
    previewImage.src = '';
    previewCard.hidden = true;
    searchBtn.disabled = true;
    fileInput.value = '';
});

// === Search ===
searchBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        showToast('Please upload an image first', 'info');
        return;
    }

    // Reset UI
    results.innerHTML = '';
    resultsSection.hidden = true;
    loading.classList.remove('hidden');
    searchBtn.disabled = true;

    // Smooth scroll to loading
    loading.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('http://127.0.0.1:8000/search', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();

        results.innerHTML = "";

        data.results.forEach((path, index) => {
            const card = document.createElement("div");
            card.className = "result-card";
            card.style.animationDelay = `${index * 0.08}s`;

            const img = document.createElement("img");
            img.src = path;
            img.alt = `Similar image ${index + 1}`;
            img.loading = "lazy";

            const overlay = document.createElement("div");
            overlay.className = "result-overlay";

            const indexBadge = document.createElement("span");
            indexBadge.className = "result-index";
            indexBadge.textContent = `#${index + 1}`;
            overlay.appendChild(indexBadge);

            card.appendChild(img);
            card.appendChild(overlay);
            card.addEventListener("click", () => openLightbox(path));
            results.appendChild(card);
        });

        resultsSection.hidden = false;
        resultsCount.textContent = `${data.results.length} result${data.results.length !== 1 ? 's' : ''}`;
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        console.error('Search failed:', err);
        showToast('Search failed — please check your connection', 'error');
        results.innerHTML = `
            <div class="results-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p class="empty-title">Something went wrong</p>
                <p class="empty-sub">Please check your connection and try again</p>
            </div>
        `;
        resultsSection.hidden = false;
    } finally {
        loading.classList.add('hidden');
        searchBtn.disabled = false;
    }
});

// === Render Results ===
// Supports both:
//   - Array of strings: ["/images/1.jpg", "/images/2.jpg"]
//   - Array of objects: [{ path: "/images/1.jpg", score: 0.95 }, ...]
function renderResults(data) {
    results.innerHTML = '';

    // Normalize data to always be an array of items
    let items = [];
    if (Array.isArray(data)) {
        items = data;
    } else if (data && data.results) {
        items = data.results;
    }

    if (!items || items.length === 0) {
        results.innerHTML = `
            <div class="results-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p class="empty-title">No similar images found</p>
                <p class="empty-sub">Try uploading a different image</p>
            </div>
        `;
        resultsSection.hidden = false;
        return;
    }

    // Update count badge
    resultsCount.textContent = `${items.length} result${items.length !== 1 ? 's' : ''}`;

    items.forEach((item, index) => {
        // Support both string paths and object format
        const imgPath = typeof item === 'string' ? item : (item.path || item.image || item.url);
        const score = typeof item === 'object' ? (item.score ?? item.similarity ?? null) : null;

        const card = document.createElement('div');
        card.className = 'result-card';

        const img = document.createElement('img');
        img.src = imgPath;
        img.alt = `Similar image ${index + 1}`;
        img.loading = 'lazy';

        // Handle broken images gracefully
        img.onerror = () => {
            img.src = '';
            img.alt = 'Image unavailable';
            card.classList.add('result-card-error');
        };

        const overlay = document.createElement('div');
        overlay.className = 'result-overlay';

        const indexBadge = document.createElement('span');
        indexBadge.className = 'result-index';
        indexBadge.textContent = `#${index + 1}`;

        // Similarity score badge (if available)
        if (score !== null && score !== undefined) {
            const scoreBadge = document.createElement('span');
            scoreBadge.className = 'result-score';
            const pct = (score * 100).toFixed(1);
            scoreBadge.textContent = `${pct}%`;

            // Color-code by match quality
            if (score >= 0.9) scoreBadge.classList.add('score-high');
            else if (score >= 0.7) scoreBadge.classList.add('score-mid');
            else scoreBadge.classList.add('score-low');

            overlay.appendChild(scoreBadge);
        }

        const expandBtn = document.createElement('button');
        expandBtn.className = 'result-expand';
        expandBtn.setAttribute('aria-label', `View image ${index + 1} full size`);
        expandBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
        `;

        overlay.appendChild(indexBadge);
        overlay.appendChild(expandBtn);
        card.appendChild(img);
        card.appendChild(overlay);

        // Open lightbox on card click
        card.addEventListener('click', () => openLightbox(imgPath));

        results.appendChild(card);
    });

    resultsSection.hidden = false;

    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// === Lightbox ===
function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// === Keyboard Shortcuts ===
document.addEventListener('keydown', (e) => {
    // Escape closes lightbox
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
        closeLightbox();
    }
});