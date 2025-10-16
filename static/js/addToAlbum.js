const albumContainer = document.querySelector('div#album-container');
const albumsModal = document.querySelector('div#albums-modal');
const openModalButton = document.querySelector('button#open-modal-btn');
const closeModalButton = document.querySelector('button#close-albums-modal-btn')
const openModalIcon = openModalButton.querySelector('img');

openModalButton.addEventListener('click', () => {
    albumsModal.classList.remove('hidden');
})

closeModalButton.addEventListener('click', () => {
    albumsModal.classList.add('hidden');
})

window.addEventListener('click', (event) => {
  if (!albumsModal.contains(event.target) && !openModalButton.contains(event.target) ) {
    albumsModal.classList.add('hidden');
  }
});

function updateAlbums(albums) {
  if (!albums || albums.length === 0) {
    albumContainer.innerHTML = `
      <div class="text-center text-gray-500 py-4">No records found</div>
    `;
    return;
  }
  albums.forEach((item) => {
    const albumItem = `
            <a href="${window.location.origin}/auth/collections/detail/${item.id}/add/${cardId}/?next=/card-detail/${cardId}/" class="add-to-album-button w-[111px] h-[87px] shadow-md place-items-center place-content-center">
                <div class="w-fit h-1/2 overflow-clip px-2">
                    <img src="${window.location.origin}${item.image}" class="w-full object-cover" />
                </div>
            </a>
        `;
    albumContainer.innerHTML += albumItem;
  });
}

async function getAllCollections() {
  fetch(`${window.location.origin}/auth/collections/all/`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        updateAlbums(data.data);
      }
    })
    .catch((err) => console.log(err));
}

document.addEventListener('DOMContentLoaded', function () {
  // Select all elements with ID starting with "bid-" or "ask-"
  const priceCells = document.querySelectorAll('[id^="bid-"], [id^="ask-"]');

  priceCells.forEach(cell => {
      const price = parseFloat(cell.textContent.replace('$', '').trim());
      if (!isNaN(price)) {
          cell.textContent = '$' + price.toLocaleString(undefined, { minimumFractionDigits: 20, maximumFractionDigits: 2 });
      }
  });
});

getAllCollections();