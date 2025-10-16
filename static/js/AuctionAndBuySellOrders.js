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