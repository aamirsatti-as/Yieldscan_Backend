function startCountdown() {
  const auctionElement = document.getElementById('auction-time-remaining');
  const auctionTimerElements = document.querySelectorAll('.auction-bids-end-timer');
  const auctionWinner = document.querySelectorAll('.auction-winner');
  const auctionEndTimeElement = document.getElementById('auction-end-time');
  const staticEndTimeText = auctionEndTimeElement?.innerText || '';
  const auctionBidsButton = document.getElementById('auction-bids-buttons'); 
  const showIfAuctionEnded = document.getElementById('show-if-auction-ended'); 
  const buyAndConfirmText = document.getElementById('buy-and-confirm-text-container');
  const auctionEndShowContainer = document.getElementById('auction-ended-show-container');
  const relistAuction = document.getElementById('relist-auction');
  let flag = true
  function updateCountdown() {
    if (!auctionElement) return;

    const timeRemainingStr = auctionElement.innerText.trim();
    if (!timeRemainingStr) return;
    // const timeParts = timeRemainingStr.match(/(\d+)([dhms])/g);
    const timeParts = timeRemainingStr.match(/(\d+)\s*(d|h|m|s|days?|hours?|minutes?|seconds?)/gi);
    let totalSeconds = 0;
    timeParts?.forEach(part => {
      const value = parseInt(part, 10);
      if (part.includes('d')) totalSeconds += value * 86400;
      if (part.includes('h')) totalSeconds += value * 3600;
      if (part.includes('m')) totalSeconds += value * 60;
      if (part.includes('s')) totalSeconds += value;
    });
    const intervalId = setInterval(async () => {

      if (totalSeconds <= 0) {
        auctionTimerElements.forEach(el => {
          el.innerText = 'Ends in 0d 0h 0m 0s';
        });
        clearInterval(intervalId);
        return;
      }

      totalSeconds--;
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      console.log('day ',days,hours,minutes,seconds, flag)
      auctionTimerElements.forEach(el => {
        el.innerHTML = `Ends in ${days} days ${hours}h ${minutes}m ${seconds}s <span>${staticEndTimeText}</span>`;
      });
      if(seconds == 0 && minutes == 0 && hours == 0 && days == 0 && flag == true){
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
        const response = await fetch(`${window.location.origin}/auction/api/auction-winner/150`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken || '' 
          },
        });
        const data = await response.json();
        if(data.bids > 0){
          auctionWinner.forEach(el => {
            el.classList.remove('hidden')
            el.innerText=`Winner: @${data.highest_bidder}`
          });  
        } else{
          showIfAuctionEnded.classList.remove('hidden')
          if(data.is_owner){
            relistAuction.classList.remove('hidden')
          }
        }
        if(auctionBidsButton){
          auctionBidsButton.classList.add('hidden')
        }
        if(buyAndConfirmText){
          buyAndConfirmText.classList.add('hidden')
        }
        if(auctionEndShowContainer){
          auctionEndShowContainer.classList.remove('hidden')
        }

        flag = false
          auctionTimerElements.forEach(el => {
            el.classList.add('hidden')
          });
        }
    }, 1000);
  }

  updateCountdown();
}
document.addEventListener('DOMContentLoaded', startCountdown);
