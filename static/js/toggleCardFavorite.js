async function toggleFavorite(cardId) {
  fetch(`${window.location.origin}/favorite/${cardId}`)
    .then((res) => {
      if (res.redirected && res.url.includes('/auth/login/')) {
        window.location.href = '/auth/login/';
        return;
      }
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        const value = data.is_favorite;
        const icons = document.querySelectorAll(`button.card-${cardId} > span`);
        const iconsButton = document.querySelectorAll(`button.fav-button > span`);
        icons.forEach((icon) => {
          icon.dataset.icon = value === true ? "heart-filled" : "heart";
        });
        iconsButton.forEach((icon) => {
          icon.dataset.icon = value === true ? "heart-filled" : "heart";
        });
      }
    })
    .catch((err) => console.log(err));
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const optionsBox = dropdown.querySelector('.dropdown-options');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');
    const selectedValue = dropdown.querySelector('.selected-value');

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      optionsBox.classList.toggle('hidden');
    });

    optionsBox.querySelectorAll('.dropdown-option').forEach(option => {
      option.addEventListener('click', () => {
        const value = option.dataset.value;
        const text = option.textContent.trim();
        selectedValue.textContent = text;
        hiddenInput.value = value;
        optionsBox.classList.add('hidden');
      });
    });

    document.addEventListener('click', () => {
      optionsBox.classList.add('hidden');
    });
  });
});