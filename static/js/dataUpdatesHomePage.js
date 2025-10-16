async function ordersAndAuctionsData() {
    return fetch(`${window.location.origin}/auction/get-auctions`)
      .then((res) => res.json())
      .catch((err) => console.log(err));
  }
  
document.addEventListener('DOMContentLoaded', function () {
ordersAndAuctionsData()
    .then((response) => {
        if (response.auctions.length > 0) {
            response.auctions.forEach((auction) => {
            const bidElements = document.querySelectorAll(`.highest-bid-auction[data-auction-id='${auction.id}']`);
                bidElements.forEach((bidElement) => {
                bidElement.innerHTML = `$${parseFloat(auction.highest_bid).toFixed(0)}`;
                });;
            });
        }
})
})