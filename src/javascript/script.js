// index.js
import { fetchImages } from './api.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';

// Hide the "Load more" button initially
loadMoreBtn.style.display = 'none';

searchForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const searchQuery = formData.get('searchQuery');

  if (searchQuery.trim() === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }

  // Reset page for a new search
  currentPage = 1;
  currentQuery = searchQuery;

  try {
    const imageData = await fetchImages(searchQuery, currentPage);
    handleImageResponse(imageData);

    // Show the "Load more" button after the first search
    loadMoreBtn.style.display = 'block';
  } catch (error) {
    console.error('Error during search:', error);
    Notiflix.Notify.failure('An error occurred during the search. Please try again.');
  }
});

loadMoreBtn.addEventListener('click', async function () {
  currentPage++;

  try {
    const imageData = await fetchImages(currentQuery, currentPage);
    handleImageResponse(imageData);
  } catch (error) {
    console.error('Error during "Load more":', error);
    Notiflix.Notify.failure('An error occurred while loading more images. Please try again.');
  }
});

function handleImageResponse(data) {
  if (data.hits.length === 0) {
    Notiflix.Notify.warning('Sorry, there are no images matching your search query. Please try again.');
  } else {
    if (currentPage === 1) {
      Notiflix.Notify.success('Hooray! We found ' + data.totalHits + ' images.');
    }

    renderImages(data.hits);
    checkPagination(data.totalHits);
    initializeLightbox();
    smoothScroll();
  }
}

function renderImages(images) {
  if (currentPage === 1) {
    // Clear gallery for new search
    while (gallery.firstChild) {
      gallery.removeChild(gallery.firstChild);
    }
  }

  images.forEach(function (image) {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const link = document.createElement('a');
    link.href = image.largeImageURL;
    link.dataset.lightbox = 'gallery';

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';

    link.appendChild(img);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info');

    const likes = createInfoItem('Likes', image.likes);
    const views = createInfoItem('Views', image.views);
    const comments = createInfoItem('Comments', image.comments);
    const downloads = createInfoItem('Downloads', image.downloads);

    infoDiv.appendChild(likes);
    infoDiv.appendChild(views);
    infoDiv.appendChild(comments);
    infoDiv.appendChild(downloads);

    card.appendChild(link);
    card.appendChild(infoDiv);

    gallery.appendChild(card);
  });
}

function createInfoItem(label, value) {
  const p = document.createElement('p');
  const boldText = document.createElement('b');
  boldText.textContent = label + ':';
  p.appendChild(boldText);
  p.appendChild(document.createTextNode(' ' + value));
  return p;
}

function checkPagination(totalHits) {
  const remainingImages = totalHits - currentPage * 40;
  loadMoreBtn.style.display = remainingImages > 0 ? 'block' : 'none';

  if (remainingImages <= 0) {
    Notiflix.Notify.info('We\'re sorry, but you\'ve reached the end of search results.');
  }
}

function initializeLightbox() {
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}

function smoothScroll() {
  const cardHeight = gallery.firstElementChild.getBoundingClientRect().height;

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
