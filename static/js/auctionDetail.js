MicroModal.init();

const cardId = document.getElementById('card-id').innerText;
const auctionId = document.getElementById('auction-id').innerText;

const totalBids = document.getElementById('total-bids');
const highestBid = document.getElementById('highest-bid');
const highestBidder = document.getElementById('highest-bidder');
const outbid = document.getElementById('outbid');
const auctionBidsTable = document.getElementById(`tab-content-bids`);


const marketTabs = document.querySelectorAll('.tab-link-market');

const marketTabIndicators = document.querySelectorAll('.tab-indicator-market');

const marketContents = document.querySelectorAll('.tab-content-market');

const socket = new WebSocket(
  'ws://' + window.location.host + '/ws/auction/' + auctionId + '/'
);

const cardSocket = new WebSocket(
  'ws://' + window.location.host + '/ws/sale/' + cardId + '/'
);

socket.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log('here',data)
  if (data.type === 'bid_placed') {
    const count = data.data.count;
    const currentBids = document.querySelectorAll('.current-bid');
    currentBids.forEach(p => {
      p.innerText = `$${data.data.highest_bid} Current Bid`;
    });
    totalBids.innerHTML = `${count} ${count == 1 ? 'bid' : 'bids'}`;
    
    highestBid.innerHTML = `Highest Bid: $${data.data.highest_bid}`;
    highestBidder.classList.add('hidden');
    outbid.classList.remove('hidden');
    const noBidsContainer = document.getElementById('no-bids-container')
    noBidsContainer.classList.add('hidden')
    getBids()
  }
};

cardSocket.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (
    data.type === 'ask_placed' ||
    data.type === 'card_bought' ||
    data.type == 'bid_placed'
  ) {
    updateMarketData();
  }
};

// Auction Modal buttons

const initialAuctionTab = '1day';
const auctionTabButtons = document.querySelectorAll('button.duration-tab');
const endDateElement = document.getElementById('end-date');
const startDateInput = document.getElementById('id_start_time');
const endDateInput = document.getElementById('id_end_time');

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of year
  return `${day}/${month}/${year}`;
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function calculateEndDate(days) {
  const today = new Date();
  today.setDate(today.getDate() + days);
  return {
    display: formatDisplayDate(today),
    send: formatDateTime(today),
  };
}

function activeAuctionDurationTab(selectedId) {
  auctionTabButtons.forEach((button) => {
    if (button.id === selectedId) {
      button.classList.add('bg-primary');
    } else {
      button.classList.remove('bg-primary');
    }
  });

  let days;
  switch (selectedId) {
    case '1day':
      days = 1;
      break;
    case '3days':
      days = 3;
      break;
    case '1week':
      days = 7;
      break;
    case '2weeks':
      days = 14;
      break;
  }

  if (days) {
    const now = new Date();
    const formattedNow = formatDateTime(now);
    const { display, send } = calculateEndDate(days);

    // Set input values
    startDateInput.value = formattedNow;
    const sendUTC = new Date(send.replace(' ', 'T')).toISOString();

    endDateInput.value = sendUTC;
    // Update and show the formatted end date
    endDateElement.textContent = `End Date: ${display}`;
    endDateElement.classList.remove('hidden');
  }
}

async function placeBidAuctionHandler() {
  try{
  const auctionId = document.getElementById('auction-id').innerText;
  const quantity = parseInt(document.getElementById('bid_amount_input').value)

  if (!quantity) {
    showToast('Please Enter Quantity', true)
    return
  }
  if (quantity<0) {
    showToast('Quantity amount should be greater than 0', true)
    return
  }
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
  const response = await fetch(`${window.location.origin}/auction/${auctionId}/place-bid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken || '' 
    },
    body: JSON.stringify({quantity})
  });

  const data = await response.json();

  if (response.ok) {
    showToast("Bid Place Successfully")
    document.getElementById('min-bid-text').innerText = `Enter $${quantity + 1} or more.`;
    document.getElementById('bid_amount_input').value = ''
    document.getElementById('highest-sell-value').innerText = quantity
    document.getElementById('bid-option-1').innerText = `Bid $${parseFloat(quantity)+1}`
    document.getElementById('bid-option-2').innerText = `Bid $${parseFloat(quantity)+2}`
    document.getElementById('bid-option-3').innerText = `Bid $${parseFloat(quantity)+3}`
    clsoeModal()
    updateData()
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

// Initialize with the default tab
activeAuctionDurationTab(initialAuctionTab);

// Add event listeners
auctionTabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeAuctionDurationTab(button.id);
  });
});

const handleBidOptionClick = async (selectedBidValue) => {
  const highestBid = document.getElementById('highest-sell-value').innerText;
  const valueForInput = parseFloat(highestBid) + selectedBidValue
  if (!isNaN(valueForInput)) {
    // document.getElementById('bid_amount_input').value = valueForInput;
    document.querySelectorAll('.shared_bid_input').forEach(input => {
      input.value = valueForInput;
    });
  }
}

const clsoeModal = () => {
  
  const modal = document.getElementById('modalBackdrop');
  const modalBackground = document.getElementById('modal-background');
  const mainBodyContainer = document.getElementById('modal-background');
  const bidSectionMobile = document.getElementById('bid-section-mobile');
  const auctionDetailsPage = document.getElementById('auction-details-page');
  if (modal) {
    modal.classList.remove('md:block');
    modalBackground.classList.remove('md:block');    
    mainBodyContainer.classList.add('hidden');    
    bidSectionMobile.classList.add('hidden')
    auctionDetailsPage.classList.remove('hidden');    
    const mainPageHeader = document.getElementById('main-page-header');
    const mainPageTopbar = document.getElementById('main-page-topbar');
    const mainPageFooterExplore = document.getElementById('main-page-footer-explore');
    const mainPageFooter= document.getElementById('main-page-footer');
    mainPageHeader.classList.remove('hidden');    
    mainPageTopbar.classList.remove('hidden');    
    mainPageFooterExplore.classList.remove('hidden');    
    mainPageFooter.classList.remove('hidden');     
    document.getElementById('model-toggle').innerText = 'No'
  }
}
function toggleBlocksForMdBreakpoint() {
  const mainPageHeader = document.getElementById('main-page-header');
  const mainPageTopbar = document.getElementById('main-page-topbar');
  const mainPageFooterExplore = document.getElementById('main-page-footer-explore');
  const mainPageFooter= document.getElementById('main-page-footer');
  const auctionDetailsPage = document.getElementById('auction-details-page');
  const mdBreakpoint = window.matchMedia('(min-width: 768px)'); 

  const isModalOpen = document.getElementById('model-toggle').innerText 
  if(isModalOpen == 'Yes'){
    if(!mdBreakpoint.matches ){
      mainPageHeader.classList.add('hidden');    
      mainPageTopbar.classList.add('hidden');    
      mainPageFooterExplore.classList.add('hidden');    
      mainPageFooter.classList.add('hidden');        
      auctionDetailsPage.classList.add('hidden');
    } else {
      mainPageHeader.classList.remove('hidden');    
      mainPageTopbar.classList.remove('hidden');    
      mainPageFooterExplore.classList.remove('hidden');    
      mainPageFooter.classList.remove('hidden');     
      auctionDetailsPage.classList.remove('hidden');
    }
  } else{
    
    mainPageHeader.classList.remove('hidden');    
    mainPageTopbar.classList.remove('hidden');    
    mainPageFooterExplore.classList.remove('hidden');    
    mainPageFooter.classList.remove('hidden');     
    auctionDetailsPage.classList.remove('hidden');
  }
}

// Run on page load and when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', toggleBlocksForMdBreakpoint);
window.addEventListener('resize', toggleBlocksForMdBreakpoint); 

function handlePlaceBid() {
  const modal = document.getElementById('modalBackdrop');
  const modalBackground = document.getElementById('modal-background');
  const mainBodyContainer = document.getElementById('modal-background');
  const bidSectionMobile = document.getElementById('bid-section-mobile');
  modal.classList.add('md:block');
  modalBackground.classList.add('md:block');
  mainBodyContainer.classList.add('md:block');
  bidSectionMobile.classList.remove('hidden')
  document.getElementById('model-toggle').innerText = 'Yes'
  toggleBlocksForMdBreakpoint() 
}



function getBids() {
  const auctionId = document.getElementById('auction-id').innerText;

  fetch(`${window.location.origin}/auction/${auctionId}/get-bids`)
    .then(response => response.json())
    .then(data => {
      overwriteBids(data.bids);  
    })
    .catch(err => {
      console.log('err', err);
    });
}

function overwriteBids(bids){
  console.log('bids ',bids)
  auctionBidsTable.innerHTML = ""
  if (bids.length > 0) {
    const headerRow = `
      <tr>
        <th scope="col" class="py-1 pl-4 pr-3 text-center text-xs font-semibold text-[#252C32] sm:pl-3">
          Price
        </th>
        <th scope="col" class="px-3 py-1 text-center text-xs font-semibold text-[#252C32]">
          Date
        </th>
      </tr>`;
    auctionBidsTable.innerHTML += headerRow;
  }

  bids.forEach((item) => {
    console.log('ite ',item)
      bidItem = `<tr class="even:bg-gray-50">
            <td
                class="whitespace-nowrap text-center py-1 pl-4 pr-3 text-xs font-medium text-[#E2464A] sm:pl-3">
                $${item.amount}
            </td>
            <td class="whitespace-nowrap px-3 text-center py-1 text-xs text-[#252C32]">
                $${item.created_at_formatted}
            </td>
        </tr>`
      auctionBidsTable.innerHTML += bidItem;
  });
}

function handleSelectOption(value = 'Grade') {
  const gradeSelect = document.getElementById("graph-select");
  const orderSelect = document.getElementById("order-select");
  const mapContainer = document.getElementById("map-container");
  const orderContainer = document.getElementById("orders-container");
  const borderForGraph = document.getElementById("border-for-graph");
  const borderForOrders = document.getElementById("border-for-orders");
  //  const value = container.textContent.trim();text-[#A19F9E]
   if(value == 'Order'){
      borderForGraph.classList.remove('border-b-4')
      borderForOrders.classList.add('border-b-4')
      gradeSelect.classList.remove('text-[#1E2329]', 'font-semibold');
      gradeSelect.classList.add('text-[#A19F9E]', 'font-medium');

      orderSelect.classList.add('font-semibold', 'text-[#1E2329]');
      orderSelect.classList.remove('text-[#A19F9E]', 'font-medium');

      orderContainer.classList.remove('hidden');
      mapContainer.classList.add('hidden');
      mapContainer.classList.remove('flex');
  } else {
      borderForGraph.classList.add('border-b-4')
      borderForOrders.classList.remove('border-b-4')
      
      gradeSelect.classList.add('text-[#1E2329]', 'font-semibold');
      gradeSelect.classList.remove('text-[#A19F9E]', 'font-medium');

      orderSelect.classList.remove('border-b-4', 'text-[#1E2329]', 'font-semibold');
      orderSelect.classList.add('text-[#A19F9E]', 'font-medium');

      orderContainer.classList.add('hidden');

      mapContainer.classList.remove('hidden');
      mapContainer.classList.add('flex');
    }
}

function handleAuctionAndOrderSelect(value = 'Auction') {
  const auctionSelect = document.getElementById("auction-select");
  const auctionOrderSelect = document.getElementById("order-select-option");
  const auctionTableContainer = document.getElementById("auction-table-data");
  const OrderTableContainer = document.getElementById("order-table-data");
  const borderForGraph = document.getElementById("border-for-auction");
  const borderForOrders = document.getElementById("border-for-second-orders");
  //  const value = container.textContent.trim();text-[#A19F9E]
   if(value == 'Order'){
    borderForGraph.classList.remove('border-b-4')
    borderForOrders.classList.add('border-b-4')
    auctionSelect.classList.remove('text-[#1E2329]');
    auctionSelect.classList.add('text-[#A19F9E]');

    auctionOrderSelect.classList.remove('text-[#A19F9E]');
    auctionOrderSelect.classList.add('text-[#1E2329]');

    auctionTableContainer.classList.add('hidden');
    OrderTableContainer.classList.remove('hidden');

  } else {
    
    borderForGraph.classList.add('border-b-4')
    borderForOrders.classList.remove('border-b-4')

    auctionSelect.classList.add('text-[#1E2329]');
    auctionSelect.classList.remove('text-[#A19F9E]');

    auctionOrderSelect.classList.add('text-[#A19F9E]');
    auctionOrderSelect.classList.remove('text-[#1E2329]');

    auctionTableContainer.classList.remove('hidden');
    OrderTableContainer.classList.add('hidden');
    }
}

function activateTab(selectedTab) {
  marketContents.forEach((content) => content.classList.add('hidden'));
  marketTabs.forEach((tab, index) => {
    if (tab.dataset.tab === selectedTab) {
      tab.classList.remove('text-[#A19F9E]');
      tab.classList.remove('font-medium');
      tab.classList.add('font-bold');
      marketTabIndicators[index].classList.remove('hidden');
    } else {
      tab.classList.add('text-[#A19F9E]');
      tab.classList.remove('font-bold');
      tab.classList.add('font-medium');
      marketTabIndicators[index].classList.add('hidden');
    }
  });

  const content = document.getElementById(`tab-content-${selectedTab}`);
  if (content) {
    content.classList.remove('hidden');
  }
}

activateTab('bids');

marketTabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

function syncSharedBidInputs() {
  const inputs = document.querySelectorAll('.shared_bid_input');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      inputs.forEach(otherInput => {
        if (otherInput !== e.target) {
          otherInput.value = value;
        }
      });
    });
  });
}

// Call this function once the DOM is loaded
document.addEventListener('DOMContentLoaded', syncSharedBidInputs);

