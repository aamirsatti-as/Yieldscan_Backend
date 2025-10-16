
async function ordersAndAuctionsData() {
    return fetch(`${window.location.origin}/api/cards/orders-and-auctions`)
      .then((res) => res.json())
      .catch((err) => console.log(err));
  }
  
async function updateData() {
    const auctionTable = document.getElementById(`auction-table-data-update`);
    const ordersTable = document.getElementById(`orders-table-data-update`);
    ordersAndAuctionsData()
    .then((response) => {
      console.log('data ',response)
      ordersTable.innerHTML = '';
      auctionTable.innerHTML = '';
      if (response.data.orders.length < 1) {
        ordersTable.innerHTML = `
          <tr>
              <td colspan="12" class="text-center py-6 text-[#999]">No active orders available.</td>
          </tr>`;
      } else {
        response.data.orders.forEach((order) => {
          orderItem = `<tr class="border-b border-[#EAECEF]">
                            <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
                                  <div class="flex gap-10 items-center">
                                      <div>
                                          <img src=${order.image.small} alt="card-image" class="w-[40px] h-[50px]"/>
                                      </div>
                                      <div >
                                          ${order.card || ''} 
                                      </div>
                                  </div>
                              </td>
                              <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
                                 ${order.client_bid || ''}
                              </td>
                              <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
                                  ${order.highest_bid || ''}
                              </td>
                              <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
                                  ${order.type || ''}
                              </td>
                              <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
                                  ${order.quantity || ''}
                              </td>
                              <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
                                  ${order.lowest_ask || ''}
                              </td>
                              <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
                                  ${order.grade || ''}
                              </td>
                              <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
                                  ${order.date || ''} 
                              </td>
                              <td class="font-medium text-base text-[#4B5563] pt-6 pb-5 flex">
                                  <span class="ml-2 bg-[#D5F2E7] p-2 flex justify-center items-center rounded-[18px]">
                                      <img src="/static/icons/edit.svg" alt="'edit"/>
                                  </span>
                                  <span class="ml-2 bg-[#FDDADF] p-2 flex justify-center items-center rounded-[18px]">
                                      <img src="/static/icons/delete.svg" alt="delete"/>
                                  </span>
                              </td>
                            </tr>`;
          ordersTable.innerHTML += orderItem;
        });
      }
      if (response.data.auctions.length < 1) {
        auctionTable.innerHTML = `
          <tr>
              <td colspan="12" class="text-center py-6 text-[#999]">No active auctions available.</td>
          </tr>`;
      } else {
        response.data.auctions.forEach((auction) => {
        
        auctionItem = `<tr class="border-b border-[#EAECEF]">
        <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
            <div class="flex gap-10 items-center">
                <div>
                    <img src=${auction.image.small} alt="card-image" class="w-[40px] h-[50px]"/>
                </div>
                <div >
                    ${ auction.card_entity||'' }
                </div>
            </div>
          </td>
          <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
              ${auction.client_bid || ''}
          </td>
          <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
              ${auction.highest_bid || ''}
          </td>
          <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
              ${auction.starting_price || ''}
          </td>
          <td class="font-medium text-base text-[#4B5563] pt-6 pb-5">
              ${auction.time_left || ''}
          </td>
          <td class="font-medium text-base text-[#4B5563] pt-6 pb-5 flex">
              <span class="ml-2 bg-[#D5F2E7] p-2 flex justify-center items-center rounded-[18px]">
                  <img src="/static/icons/edit.svg" alt="'edit"/>
              </span>
              <span class="ml-2 bg-[#FDDADF] p-2 flex justify-center items-center rounded-[18px]">
                  <img src="/static/icons/delete.svg" alt="delete"/>
              </span>
          </td>
        </tr>`;
       });
      auctionTable.innerHTML += auctionItem;
      }
  
  
    })
    .catch((err) => console.log(err));
  }
  