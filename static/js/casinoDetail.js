const casinoId = document.getElementById('casino-id').innerText;
const entryFee = document.getElementById('entry-fee').innerText;
const maxSlots = document.getElementById('max-slots').innerText;
const usedSlots = document.querySelectorAll('p.used-slots');
const participantList = document.querySelectorAll('tbody.content-all-slots');
const ownParticipantList = document.querySelectorAll('tbody.content-my-slots');
const initialTab = 'my-slots';

const tabs = document.querySelectorAll('a.tab-link');
const contents = document.querySelectorAll('tbody.tab-content');
const tabIndicators = document.querySelectorAll('img.tab-indicator');

function activateTab(selectedTab) {
  contents.forEach((content) => content.classList.add('hidden'));

  tabs.forEach((tab, index) => {
    if (tab.dataset.tab === selectedTab) {
      tab.classList.remove('text-[#A19F9E]');
      tabIndicators[index].classList.remove('hidden');
    } else {
      tab.classList.add('text-[#A19F9E]');
      tabIndicators[index].classList.add('hidden');
    }
  });

  const _contents = document.querySelectorAll(`.content-${selectedTab}`);
  _contents.forEach((content) => {
    content.classList.remove('hidden');
  });
}

activateTab(initialTab);

tabs.forEach((tab) =>
  tab.addEventListener('click', () => activateTab(tab.dataset.tab))
);

const socket = new WebSocket(
  'ws://' + window.location.host + '/ws/casino/' + casinoId + '/'
);

async function getParticipants() {
  return fetch(
    `${window.location.origin}${window.location.pathname}participants`
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

function updateParticipants(data) {
  const participants = data.data.participants;
  const ownParticipants = data.data.own_participants;

  const numOfParticipants = participants.length;

  usedSlots.forEach(slot => {
    slot.innerText = `${numOfParticipants}/${maxSlots} Bought`;
  })

  participantList.forEach((p) => {
    p.innerHTML = '';
    participants.forEach((participant) => {
      const _participant = `
        <tr class="even:bg-gray-50">
          <td
              class="whitespace-nowrap text-center px-3 py-1 text-base capitalize pl-4 pr-3 font-normal text-[#2EBD85] sm:pl-3">
              ${participant.user.user.first_name} ${participant.user.user.last_name}
          </td>
          <td class="whitespace-nowrap text-center px-3 py-1 text-[#252C32] text-base">
              1
          </td>
          <td class="whitespace-nowrap text-center px-3 py-1 text-[#252C32] text-base">
              $${entryFee}
          </td>
          <td class="whitespace-nowrap text-center px-3 py-1 text-[#252C32] text-base truncate">
              ${participant.time_ago}
          </td>
        </tr>
      `;
      p.innerHTML += _participant;
    });
  });

  ownParticipantList.forEach((p) => {
    p.innerHTML = '';
    ownParticipants.forEach((participant) => {
      const _participant = `
        <tr class="even:bg-gray-50">
          <td
              class="capitalize whitespace-nowrap text-center py-1 pl-4 text-base pr-3 font-normal text-[#2EBD85] sm:pl-3">
              ${participant.user.user.first_name} ${participant.user.user.last_name}
          </td>
          <td class="whitespace-nowrap text-center px-3 py-1 text-[#252C32] text-base">
              1
          </td>
          <td class="whitespace-nowrap px-3 text-center py-1 text-[#252C32] text-base">
              $${entryFee}
          </td>
          <td class="whitespace-nowrap px-3 text-center py-1 text-[#252C32] truncate text-base">
              ${participant.time_ago}
          </td>
        </tr>
      `;
      p.innerHTML += _participant;
    });
  });
}

socket.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.type === 'cards_availability_update') {
    const usedSlotsEl = document.querySelectorAll('.used-slots');
  if (usedSlotsEl) {
      usedSlotsEl.innerText = `${data.total_participants} / ${data.max_participants} Bought`;
    }
    if (data.total_participants === data.max_participants) {
      const soldMenu = document.getElementById('sold-out-container-desktop');
      const mainContainer = document.getElementById('main-container');

      const mobileBuyContainer = document.getElementById('mobile-buy-container');
      const mobileTimerContainer = document.getElementById('mobile-timer-container');
      const mobileHeadingContainer = document.getElementById('mobile-heading-container');
      const mobileBoughtContainer = document.getElementById('mobile-bought-container');
      const mobileSoldContainer = document.getElementById('sold-out-container-mobile');

      if (mobileBuyContainer) mobileBuyContainer.style.display = 'none';
      if (mobileTimerContainer) mobileTimerContainer.style.display = 'none';
      if (mobileHeadingContainer) mobileHeadingContainer.style.display = 'none';
      if (mobileBoughtContainer) mobileBoughtContainer.style.display = 'none';
      if (mobileSoldContainer) mobileSoldContainer.style.display = 'block';

      
      if (soldMenu) soldMenu.style.display = 'block';
      if (mainContainer) soldMenu.style.display = 'block';
      if (mainContainer) {
        mainContainer.classList.remove('col-span-3');
        mainContainer.classList.add('col-span-5');
      }
    }
  }
  if (data.type === 'new_participant') {
    getParticipants()
      .then((data) => updateParticipants(data))
      .catch((err) => console.log(err));
  }
};

const handleBuyCard = async (quantity, quantity_input) => {
  if (!quantity) {
    showToast('Please enter the quantity', true)
    return
  }
  try {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    const response = await fetch(`${window.location.origin}/casino/api/buy-slot/${casinoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || ''
      },
      body: JSON.stringify({ quantity })
    });



    const data = await response.json();

    if (response.ok) {
      showToast(`${quantity} slots purchased successfully`)
      quantity_input.value = ''
    } else {
      console.error('Failed to place bid:', data);
      if (data?.message) {
        showToast(data?.message, true)
      } else {
        showToast("Something went wrong,Try Again", true)
      }
    }
  } catch (error) {
    console.error('Network error:', error);
    if (error?.message) {
      showToast(error?.message, true)
    } else {
      showToast("Something went wrong,Try Again", true)
    }
  }
}

const handleMobileBuyClick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  const quantity_input = document.getElementById('mobile_entry_quantity_input')
  const quantity = parseFloat(quantity_input.value);
  handleBuyCard(quantity, quantity_input);
};

// Desktop-specific click handler
const handleDesktopBuyClick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  const quantity_input = document.getElementById('desktop_entry_quantity_input')
  const quantity = parseFloat(quantity_input.value);
  handleBuyCard(quantity, quantity_input);
};

// Add event listeners after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const mobileBtn = document.getElementById('casino_card_mobile_buy_btn');
  const desktopBtn = document.getElementById('casino_card_desktop_buy_btn');

  if (mobileBtn) mobileBtn.addEventListener('click', handleMobileBuyClick);
  if (desktopBtn) desktopBtn.addEventListener('click', handleDesktopBuyClick);
});

function startCountdown() {
  const countdownEl = document.getElementById('countdown');
  const countdownElStartDate = document.getElementById('countdown-start-date');
  const hasCasinoSaleStarted = document.getElementById('has-casino-sale-to-start').innerText;
  const endTimeStr = countdownEl.getAttribute('data-end-time');
  const startTimeStr = countdownElStartDate.getAttribute('data-start-time');
  const endTime = new Date(endTimeStr);
  const startTime = new Date(startTimeStr);
  const saleStarted = hasCasinoSaleStarted == 'True'
  function updateCountdown() {
    const now = new Date();
    const rightMenu = document.getElementById('right-menu-casino-page-desktop');
    const desktopHeaderSection = document.getElementById('desktop-header-section');
    const mainContainer = document.getElementById('main-container');
    const showCasinoSaleEndContainer = document.getElementById('show-casino-sale-ended-container');
    const hideCasinoSaleEndContainer = document.getElementById('hide-casino-sale-ended-container');
    const showCasinoSaleEndContaineMobile = document.getElementById('show-casino-end-container-mobile');
    const hideCasinoSaleEndContainerMobile = document.getElementById('hide-casino-end-container-mobile');
    
    const diff = saleStarted ? startTime - now : endTime - now;
    if (diff <= 0) {
      document.querySelectorAll('.days').forEach(el => el.innerText = '0');
      document.querySelectorAll('.hours').forEach(el => el.innerText = '0');
      document.querySelectorAll('.minutes').forEach(el => el.innerText = '0');
      document.querySelectorAll('.seconds').forEach(el => el.innerText = '0');
      clearInterval(intervalId);
      return;
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    document.querySelectorAll('.days').forEach(el => el.innerText = days);
    document.querySelectorAll('.hours').forEach(el => el.innerText = hours);
    document.querySelectorAll('.minutes').forEach(el => el.innerText = minutes);
    document.querySelectorAll('.seconds').forEach(el => el.innerText = seconds);
    if (saleStarted) {
      document.querySelectorAll('.sale-start-hours').forEach(el => el.innerText = hours);
      document.querySelectorAll('.sale-start-minutes').forEach(el => el.innerText = minutes);
      document.querySelectorAll('.sale-start-seconds').forEach(el => el.innerText = seconds);
    }
    if(seconds == 0 && minutes == 0 && hours == 0 && days == 0){
      rightMenu.classList.add('hidden') 
      desktopHeaderSection.classList.add('hidden') 
      mainContainer.classList.remove('col-span-3')
      mainContainer.classList.add('col-span-5')
      showCasinoSaleEndContainer.classList.remove('hidden')
      showCasinoSaleEndContainer.classList.add('flex', 'w-full', 'gap-10')
      hideCasinoSaleEndContainer.classList.add('hidden')
      hideCasinoSaleEndContainer.classList.remove('flex')
      // showCasinoSaleEndContainer.classList.add('gap-')
      showCasinoSaleEndContaineMobile.classList.remove('hidden')
    }
  }
  updateCountdown();
  const intervalId = setInterval(updateCountdown, 1000);
}

document.addEventListener('DOMContentLoaded', startCountdown);
