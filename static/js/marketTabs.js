// import { formatNumber } from "./cardDetail";
const marketTabs = document.querySelectorAll('.tab-link-market');
const marketTabIndicators = document.querySelectorAll('.tab-indicator-market');
const marketContents = document.querySelectorAll('.tab-content-market');

const asksTable = document.getElementById(`asks-table`);
const bidsTable = document.getElementById(`bids-table`);
const salesTable = document.getElementById(`sales-table`);
const gradeId = document.getElementById('grade-id').innerText;
const auctionTable = document.getElementById(`auction-table-data-update`);
const ordersTable = document.getElementById(`orders-table-data-update`);


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

async function getMarketData() {
  return fetch(`${window.location.origin}/market/market_data/${cardId}/${gradeId}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

async function updateMarketData() {
  getMarketData()
    .then((data) => {
      if (data.success) {
        bidsTable.innerHTML = '';
        asksTable.innerHTML = '';
        salesTable.innerHTML = '';
        const asks = data.data.asks;
        const bids = data.data.bids;
        const sales = data.data.sales
        if (asks.length < 1) {
          asksTable.innerHTML = `
            <tr>
              <td colspan="3" class="text-center py-2 text-sm text-gray-500">
                No asks found
              </td>
            </tr>`;
        } else {
          asks.forEach((item) => {
            askItem = `<tr class="even:bg-gray-50">
                                  <td
                                      class="whitespace-nowrap text-center py-1 pl-4 pr-3 text-xs font-medium text-[#E2464A] sm:pl-3">
                                      ${formatNumber(item.price)}
                                  </td>
                                  <td class="whitespace-nowrap text-center px-3 py-1 text-xs text-[#252C32]">
                                      ${formatNumber(item.quantity)}
                                  </td>
                                  <td class="whitespace-nowrap px-3 text-center py-1 text-xs text-[#252C32]">
                                      ${formatNumber(item.total)}
                                  </td>
                              </tr>`;
            asksTable.innerHTML += askItem;
          });
        }
        if (bids.length < 1) {
          bidsTable.innerHTML = `
            <tr>
              <td colspan="3" class="text-center py-4 text-gray-500 text-sm">
                No bids found
              </td>
            </tr>`;
        } else {
          data.data.bids.forEach((item) => {
            bidItem = `<tr class="even:bg-gray-50">
                                  <td
                                      class="whitespace-nowrap text-center py-1 pl-4 pr-3 text-xs font-medium text-[#E2464A] sm:pl-3">
                                      ${formatNumber(item.price)}
                                  </td>
                                  <td class="whitespace-nowrap text-center px-3 py-1 text-xs text-[#252C32]">
                                      ${formatNumber(item.quantity)}
                                  </td>
                                  <td class="whitespace-nowrap px-3 text-center py-1 text-xs text-[#252C32]">
                                      ${formatNumber(item.total)}
                                  </td>
                              </tr>`;
            bidsTable.innerHTML += bidItem;
          });
        }
        if (sales.length < 1) {
          salesTable.innerHTML = `
            <tr>
              <td colspan="3" class="text-center py-4 text-gray-500 text-sm">
                No sales found
              </td>
            </tr>`;
        } else {
          
        sales.forEach((item) => {
          salesItem = `<tr class="even:bg-gray-50">
                                <td
                                    class="whitespace-nowrap text-center py-1 pl-4 pr-3 text-xs font-medium text-[#E2464A] sm:pl-3">
                                    ${formatNumber(item.price)}
                                </td>
                                <td class="whitespace-nowrap text-center px-3 py-1 text-xs text-[#252C32]">
                                    ${formatNumber(item.quantity)}
                                </td>
                                <td class="whitespace-nowrap px-3 text-center py-1 text-xs text-[#252C32]">
                                    ${item.created_at_formatted}
                                </td>
                            </tr>`;
          salesTable.innerHTML += salesItem;
        });
        }
        
      }
    })
    .catch((err) => console.log(err));
}

activateTab('asks');

marketTabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

function formatNumber(amount) {
  if (isNaN(amount)) return amount;
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}