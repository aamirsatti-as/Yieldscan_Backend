MicroModal.init();

const cardId = document.getElementById('card-id').innerText;
const currentMarketTab = 'asks';
const asksList = document.querySelector('div#asks-container');

const socket = new WebSocket(
  'ws://' + window.location.host + '/ws/sale/' + cardId + '/'
);

const salesTabs = document.querySelectorAll('.tab-link-sales');
const salesTabIndicators = document.querySelectorAll('.tab-indicator-sales');
const saleContents = document.querySelectorAll('.tab-content-sales');
const lowestBidMsg = document.getElementById('lowest-bid');
const highestBidMsg = document.getElementById('highest-bid');

const saleMsg = document.getElementById('sale-for-items-msg');
const saleAmountInput = document.getElementById('sale_amount_input');
const saleQuantityInput = document.getElementById('sale_quantity_input');
const saleBtnSpan = document.getElementById('sell-now-btn-span');

const bidMsg = document.getElementById('bid-for-items-msg');
const bidAmountInput = document.getElementById('bid_amount_input');
const bidQuantityInput = document.getElementById('bid_quantity_input');
const buyBtnSpan = document.getElementById('buy-now-btn-span');

function activateSalesTab(selectedTab) {
  saleContents.forEach((content) => content.classList.add('hidden'));
  lowestBidMsg.classList.add('hidden');
  highestBidMsg.classList.add('hidden');

  salesTabs.forEach((tab, index) => {
    if (tab.dataset.tab === selectedTab) {
      tab.classList.remove('text-[#A19F9E]');
      tab.classList.remove('font-medium');
      tab.classList.add('font-bold');
      salesTabIndicators[index].classList.remove('hidden');
    } else {
      tab.classList.add('text-[#A19F9E]');
      tab.classList.remove('font-bold');
      tab.classList.add('font-medium');
      salesTabIndicators[index].classList.add('hidden');
    }
  });

  if (selectedTab === 'buy') {
    lowestBidMsg.classList.remove('hidden');
  } else {
    highestBidMsg.classList.remove('hidden');
  }

  const content = document.getElementById(`tab-content-${selectedTab}`);
  if (content) {
    content.classList.remove('hidden');
  }
}

salesTabs.forEach((tab) => {
  tab.addEventListener('click', () => activateSalesTab(tab.dataset.tab));
});

function updateBidMessage() {
  const amount = Math.max(0, parseFloat(bidAmountInput.value) || 0);
  const quantity = Math.max(0, parseInt(bidQuantityInput.value) || 0);
  const total = amount * quantity;
  const gradeId = document.getElementById('grade-id').innerText;

  socket.send(
    JSON.stringify({
      type: 'quantity_change',
      message: cardId,
      cardId: cardId,
      quantity: quantity,
      gradeId:gradeId
    })
  );
  bidMsg.innerText = `Bid for ${quantity} items: $ ${total.toFixed(2)}`;
}

bidAmountInput.addEventListener('input', updateBidMessage);
bidQuantityInput.addEventListener('input', updateBidMessage);

function updateSaleMessage() {
  const amount = Math.max(0, parseFloat(saleAmountInput.value) || 0);
  const quantity = Math.max(0, parseInt(saleQuantityInput.value) || 0);
  const total = amount * quantity;
  const gradeId = document.getElementById('grade-id').innerText;
  const userId = document.getElementById('user-id').innerText;

  socket.send(
    JSON.stringify({
      type: 'sale_quantity_change',
      message: cardId,
      cardId: cardId,
      gradeId: gradeId,
      quantity: quantity,
      userId: userId
    })
  );

  saleMsg.innerText = `Sell ${quantity} items for: $ ${total.toFixed(2)}`;
}

saleAmountInput.addEventListener('input', updateSaleMessage);
saleQuantityInput.addEventListener('input', updateSaleMessage);

socket.onmessage = (e) => {
  const data = JSON.parse(e.data);
  const sellBtn = document.querySelector('.sell-now-btn');
  const setAskBtn =  document.querySelector('.set-ask-btn')
  const sellBtnSpan = document.getElementById('sell-now-btn-span');
  console.log('data ',data)
  if (data.type === 'sell_button_status') {
    if (data.cards_entities == 0) {
      sellBtnSpan.innerText = "Sell Now"; 
      sellBtn.disabled = true;
      sellBtn.classList.remove('opacity-100');
      sellBtn.classList.add('opacity-60', 'cursor-not-allowed');
      sellBtn.disabled = true;

      setAskBtn.disabled = true;
      setAskBtn.classList.remove('opacity-100');
      setAskBtn.classList.add('opacity-60', 'cursor-not-allowed');
    } else {
      sellBtn.disabled = false;
      sellBtn.classList.remove('opacity-60', 'cursor-not-allowed');
      sellBtn.classList.add('opacity-100', 'cursor-pointer');

      setAskBtn.disabled = false;
      setAskBtn.classList.remove('opacity-60', 'cursor-not-allowed');
      setAskBtn.classList.add('opacity-100', 'cursor-pointer');
    }
  }  
  if (data.type === 'card_entities_owned') {
    const cardOwnedEntries = document.querySelector('.card-entries-owned-all');
    const cardAvailableForSale = document.querySelector('.card_entities_for_sale');
    const lowestBid = document.getElementById('lowest-bid');
    const highestBid = document.getElementById('highest-bid');
    if (cardOwnedEntries) { 
      // cardOwnedEntries.innerText = `Available: ${data.card_entities || 0}`;
      buyBtnSpan.innerText = `Buy Now`;
    } 
    if (cardAvailableForSale) { 
      saleBtnSpan.innerText = `Sell Now`;
      cardAvailableForSale.innerText = `Available: ${data.card_entity || 0}`;
    } 
    if (lowestBid) { 
      lowestBid.innerText = `Lowest Ask Price : $${formatNumber(data.lowest_ask)}`;
    } 
    if (highestBid) { 
      highestBid.innerText = `Highest Bid Price: ${formatNumber(data.highest_bid)}`;
    } 
    if(data.card_entities>0){
      sellBtn.classList.remove('pointer-events-none');
      setAskBtn.classList.remove('pointer-events-none');
    } 
  }
  if (data.type === 'sale_quantity_change') {
    saleBtnSpan.innerText = `Sell ${data.data.quantity} Now: $ ${parseFloat(
      data.data.total_price
    ).toFixed(2)}`;
    if (data.data.total_price ==0) {
      sellBtn.disabled = true;
      sellBtn.classList.add('opacity-60');
    } else {
      sellBtn.disabled = false;
      sellBtn.classList.remove('opacity-60');
    }
    if(data.data.card_entities === 0){
      sellBtn.disabled = true;
      sellBtn.classList.add('opacity-60');
      setAskBtn.classList.add('opacity-60', 'cursor-not-allowed');
      const cardEntitiesOwnedCount = document.querySelector('.card-entries-owned-all')
      cardEntitiesOwnedCount.innerText = `Available: ${data.card_entities_owned || 0}`;

    }
  }
  if (data.type === 'quantity_change') {
    buyBtnSpan.innerText = `Buy ${data.data.quantity} Now: $ ${parseFloat(
      data.data.total_price
    ).toFixed(2)}`;
  }
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
    const { display, send } = calculateEndDate(days);``
    const sendUTC = new Date(send.replace(' ', 'T')).toISOString();
    // Set input values
    startDateInput.value = formattedNow;
    endDateInput.value = sendUTC;

    // Update and show the formatted end date
    endDateElement.textContent = `End Date: ${display}`;
    endDateElement.classList.remove('hidden');
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

activateSalesTab('buy');
const placeBidBtn = document.querySelector('.place-bid-btn');
const setAskBtn = document.querySelector('.set-ask-btn');
const buyNowBtn = document.querySelector('.buy-now-btn');
const sellNowBtn = document.querySelector('.sell-now-btn');
// Function to handle the bid submission
async function handlePlaceBid(event) {
  event.preventDefault();
  event.stopPropagation();
  const cardId = window.location.pathname.split('/').filter(Boolean)
  const amount = parseFloat(document.getElementById('bid_amount_input').value)
  const quantity = parseInt(document.getElementById('bid_quantity_input').value)
  const gradeId = document.getElementById('grade-id').innerText;

  if (!amount || !quantity) {
    showToast('Please Enter Quantity and Amount', true)
    return
  }
  toggleButtonState(placeBidBtn, true);
  const bidData = {
    card_id: cardId[1],
    amount,
    quantity,
    grade_id:gradeId
  };
  try {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    const response = await fetch(`${window.location.origin}/api/cards/place-bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '' 
      },
      body: JSON.stringify(bidData)
    });



    const data = await response.json();

    if (response.ok) {
      let messageParts = [];

      if (data.bids_placed > 0) {
        const bidText = data.bids_placed === 1 ? 'bid' : 'bids';
        messageParts.push(`${data.bids_placed} ${bidText} placed`);
      }
    
      if (data.bids_fulfilled > 0) {
        const buyText = data.bids_fulfilled === 1 && data.card;
        messageParts.push(`${data.bids_fulfilled} ${buyText} bought`);
      }
    
      if (messageParts.length > 0) {
        let message = `${messageParts.join(" and ")} successfully.`;
        showToast(message);
        resetButtonAndInputStates()
        updateSellButtonsAndQuantity()
      }
      updateData()
    } else {
      console.error('Failed to place bid:', data);
      if (data?.message) {
        showToast(data?.message, true)
      } else {
        showToast("Something went wrong,Try Again", true)
      }
    }
    toggleButtonState(placeBidBtn, false);
  } catch (error) {
    toggleButtonState(placeBidBtn, false);
    console.error('Network error:', error);
    if (error?.message) {
      showToast(error?.message, true)
    } else {
      showToast("Something went wrong,Try Again", true)
    }
  }
}

async function setAskBid(event) {

  event.preventDefault();
  event.stopPropagation();
  const cardId = window.location.pathname.split('/').filter(Boolean)
  const sale_amount = parseFloat(document.getElementById('sale_amount_input').value)
  const quantity = parseInt(document.getElementById('sale_quantity_input').value)
  const gradeId = document.getElementById('grade-id').innerText;
  if (!sale_amount || !quantity) {
    showToast("Please Enter Quantity and Amount", true)
    return
  }
  toggleButtonState(setAskBtn, true);
  // Dummy data - replace with actual form values when ready
  const askData = {
    card_id: cardId[1],
    sale_amount,
    quantity,
    grade_id:gradeId
  };
  try {
    // Get CSRF token (required for Django)
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    console.log('csrfToken ', csrfToken)
    const response = await fetch(`${window.location.origin}/api/cards/set-ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '' 
      },
      body: JSON.stringify(askData)
    });

    const data = await response.json();

    if (response.ok) {
      let messageParts = [];

      if (data.card_sold > 0) {
        const cardText = data.card_sold === 1 && data.card;
        messageParts.push(`${data.card_sold} ${cardText} sold`);
      }
      
      if (data.asks_placed > 0) {
        const askText = data.asks_placed === 1 ? 'ask' : 'asks';
        messageParts.push(`${data.asks_placed} ${askText} placed`);
      }      

      if (messageParts.length > 0) {
        let message = `${messageParts.join(" and ")} successfully.`;
        showToast(message);
        resetButtonAndInputStates()
        updateSellButtonsAndQuantity()
      }
      updateData()
      // data.card_sold, data.asks_placed
      // let message = `${card}data`
      // showToast("Ask set successfully")
    } else {
      console.error('Failed to place bid:', data);
      if (data?.message) {
        showToast(data?.message, true)
      } else {
        showToast('Something went wrong,Try Again', true)
      }
    }
    toggleButtonState(setAskBtn, false);
  } catch (error) {
    toggleButtonState(setAskBtn, false);
    console.error('Network error:', error);
    if (error?.message) {
      showToast(error?.message, true)
    } else {
      showToast('Something went wrong,Try Again', true)
    }
  }
}

async function handleBuyNow(event) {

  event.preventDefault();
  event.stopPropagation();
  const cardId = window.location.pathname.split('/').filter(Boolean)
  const quantity = parseInt(document.getElementById('bid_quantity_input').value)
  const gradeId = document.getElementById('grade-id').innerText;
  if (!quantity) {
    showToast('Please Enter Quantity ', true)
    return
  }
  toggleButtonState(buyNowBtn, true);
  // Dummy data - replace with actual form values when ready
  const sellData = {
    card_id: cardId[1],
    quantity,
    grade_id:gradeId
  };
  try {
    // Get CSRF token (required for Django)
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    const response = await fetch(`${window.location.origin}/api/cards/buy-now`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || ''
      },
      body: JSON.stringify(sellData)
    });

    const data = await response.json();
    if (response.ok) {
      if(data.bought_cards == 0){
        showToast('Something Went wrong, Try again',True)
      }else{
        showToast(`${data.bought_cards} ${data.card} bought successfully`)
        resetButtonAndInputStates()  
        updateSellButtonsAndQuantity()
      }
      updateData()
    } else {
      console.error('Failed to place bid:', data);
      if (data?.message) {
        showToast(data?.message, true)
      } else {
        showToast("Something went wrong,Try Again", true)
      }
    }
    toggleButtonState(buyNowBtn, false);
  } catch (error) {
    toggleButtonState(buyNowBtn, false);
    if (error?.message) {
      showToast(error?.message, true)
    } else {
      showToast("Something went wrong,Try Again", true)
    }
    console.error('Network error:', error);
  }
}

async function handleSellNow(event) {

  event.preventDefault();
  event.stopPropagation();
  const cardId = window.location.pathname.split('/').filter(Boolean)
  const quantity = parseInt(document.getElementById('sale_quantity_input').value)
  const gradeId = document.getElementById('grade-id').innerText;
  if (!quantity) {
    showToast('Please Enter Quantity', true)
    return
  }
  toggleButtonState(sellNowBtn, true);
  // Dummy data - replace with actual form values when ready
  const sellData = {
    card_id: cardId[1],
    quantity,
    grade_id:gradeId
  };
  try {
    // Get CSRF token (required for Django)
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    const response = await fetch(`${window.location.origin}/api/cards/sell-now`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '' 
      },
      body: JSON.stringify(sellData)
    });

    const data = await response.json();

    if (response.ok) {
      if(data.sold_cards == 0){
        showToast('0 card sold. Try again',false)
      }else{
        showToast(`${data.sold_cards} ${data.card} sold successfully`)
        resetButtonAndInputStates()  
        updateSellButtonsAndQuantity()
      }
          updateData()
} else {
      console.error('Failed to place bid:', data);
      if (data?.message) {
        showToast(data?.message, true)
      } else {
        showToast("Something went wrong,Try Again", true)
      }
    }
    toggleButtonState(sellNowBtn, false);
  } catch (error) {
    toggleButtonState(sellNowBtn, false);
    console.error('Network error:', error);
    if (error?.message) {
      showToast(error?.message, true)
    } else {
      showToast('Something went wrong,Try Again', true)
    }
  }
}


document.addEventListener("DOMContentLoaded", function () {
  const wrapper = document.getElementById("info-wrapper");
  const tooltip = document.getElementById("info-tooltip");
  wrapper.addEventListener("mouseenter", function () {
    tooltip.classList.remove("hidden");
  });

  wrapper.addEventListener("mouseleave", function () {
      tooltip.classList.add("hidden");
  });
});

function toggleButtonState(button, isLoading = true) {
  if (!button) return;

  if (isLoading) {
    button.classList.add('btn-disabled');
    button.disabled = true;
  } else {
    button.classList.remove('btn-disabled');
    button.disabled = false;
  }
}


document.querySelector('.place-bid-btn').addEventListener('click', handlePlaceBid);
document.querySelector('.set-ask-btn').addEventListener('click', setAskBid);
document.querySelector('.buy-now-btn').addEventListener('click', handleBuyNow);
document.querySelector('.sell-now-btn').addEventListener('click', handleSellNow);

//function to format the number
function formatNumber(amount) {
  if (isNaN(amount)) return amount;
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function toggleCardDropdown() {
  const list = document.getElementById('dropdown-list');
  list.classList.toggle('hidden');
}

function selectGrade(id, gradeValue, cardValue) {
  document.getElementById('selected-grade').textContent = gradeValue;
  document.getElementById('grade-id-input').value = id;
  document.getElementById('dropdown-list').classList.add('hidden');
  window.location.href = `/card-detail/${cardValue}/${gradeValue}`;
}

// Optional: Close dropdown when clicking outside
document.addEventListener('click', function (e) {
  const dropdown = document.getElementById('card-grade-dropdown');
  if (!dropdown.contains(e.target)) {
    document.getElementById('dropdown-list').classList.add('hidden');
  }
});

function resetButtonAndInputStates(){
  document.getElementById('bid_amount_input').value = ""
  document.getElementById('bid_quantity_input').value = ""
  document.getElementById('max_bid_input').value = ""
  document.getElementById('sell-now-btn-span').value = "Buy Now"
  document.getElementById('sale_amount_input').value = ""
  document.getElementById('sale_quantity_input').value = ""
  document.getElementById('sell-now-btn-span').value = "Sell Now"

}


async function updateSellButtonsAndQuantity() {
  try {
    const response = await fetch(`${window.location.origin}/api/cards/card-data/${cardId}/${gradeId}`);
    const data = await response.json();
      const sellBtn = document.querySelector('.sell-now-btn');
      const setAskBtn =  document.querySelector('.set-ask-btn')
      const sellBtnSpan = document.getElementById('sell-now-btn-span');
      const cardEntitiesOwnedCount = document.querySelector('.card-entries-owned-all')
      if (data.card_entities_owned == 0) {
        sellBtnSpan.innerText = "Sell Now"; 
        sellBtn.disabled = true;
        sellBtn.classList.remove('opacity-100');
        sellBtn.classList.add('opacity-60', 'cursor-not-allowed');
        sellBtn.disabled = true;
  
        setAskBtn.disabled = true;
        setAskBtn.classList.remove('opacity-100');
        setAskBtn.classList.add('opacity-60', 'cursor-not-allowed');
      } else {
        sellBtn.disabled = false;
        sellBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        sellBtn.classList.add('opacity-100', 'cursor-pointer');
  
        setAskBtn.disabled = false;
        setAskBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        setAskBtn.classList.add('opacity-100', 'cursor-pointer');
      }
      cardEntitiesOwnedCount.innerText = `Available: ${data.card_entities_owned || 0}`;
  } catch (error) {
    console.error('Error fetching updated cards data:', error);
  }
}
