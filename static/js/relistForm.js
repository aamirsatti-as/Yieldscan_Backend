async function handleRelist() {
    try{
    const auctionId = document.getElementById('relist-auction-id').innerText;
    const startingPrice = parseInt(document.getElementById('relist-starting-price').value)
    const endTime = document.getElementById('relist-end-time').value
    if(startingPrice <= 0 ){
      showToast('Starting price should be greater than 0', true)
      return
    }
    if (!startingPrice || !endTime) {
      showToast('Please enter starting price and endtime', true)
      return
    }
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    const localDate = new Date(endTime);
    const utcDate = new Date(localDate.toUTCString());  // Converts to UTC

    const utcDateTimeStr = utcDate.toISOString();  // Format: "2025-05-06T14:46:00.000Z"

    // Now send this UTC time (utcDateTimeStr) to the backend
    console.log(utcDateTimeStr);  
    const body = {
        startingPrice,
        endTime: utcDateTimeStr,
        auctionId
    }
    const response = await fetch(`${window.location.origin}/auction/api/relist-auction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '' 
      },
      body: JSON.stringify(body)
    });
  
    const data = await response.json();
    if (response.ok) {
      showToast("Auction relisted successfully")
      //This toast is for the toast to be shown beofr
      setTimeout(() => {
        window.location.href = `/auction/${data.auction_id}`;
      }, 800);
    } else {
      console.error('Failed to relisted auction:', data);
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

//   For Disabling the past dates
  window.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;
    document.getElementById('relist-end-time').setAttribute('min', minDate);
});