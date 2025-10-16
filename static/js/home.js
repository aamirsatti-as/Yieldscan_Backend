const auctionList = document.querySelector('div#auction-container');
const auctionSection = document.querySelector('section#auction-section');
const casinoList = document.querySelector('div#casino-container');
const casinoSection = document.querySelector('section#casino-section');

const auctionsSwiper = new Swiper('.auctionsSwiper', {
  loop: true,
  slidesPerView: 4,
  spaceBetween: 20,
  navigation: {
    nextEl: '.swiper-button-next-arrow-auctions',
    prevEl: '.swiper-button-prev-arrow-auctions',
  },
  breakpoints: {
    768: {
      slidesPerView: 3,
    },
    1024: {
      slidesPerView: 4,
    },
  },
});

const casinosSwiper = new Swiper('.casinosSwiper', {
  loop: true,
  slidesPerView: 4,
  spaceBetween: 20,
  navigation: {
    nextEl: '.swiper-button-next-arrow-casinos',
    prevEl: '.swiper-button-prev-arrow-casinos',
  },
  breakpoints: {
    768: {
      slidesPerView: 3,
    },
    1024: {
      slidesPerView: 4,
    },
  },
});

async function getAllFavorites() {
  return fetch(`${window.location.origin}/favorite/all`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const favorites = data.data.map((i) => i.id);
        return favorites;
      } else {
        return [];
      }
    })
    .catch((err) => console.log(err));
}

function updateAuctionList(auctions, favorites) {
  if (!auctionList) {
    return;
  }
  auctionList.innerHTML = '';
  auctions.forEach((auction) => {
    const card = auction.card_entity.card;
    const auctionItem = `
                  <div class="swiper-slide">
                    <div class="border border-[#EAECEF] p-4 relative rounded-lg">
                        <a class="absolute w-full h-full z-10 top-0 left-0" href="/auction/${auction.id}/"></a>
                        <div class="grid grid-cols-2 relative gap-x-[10px] w-full">                           
                            <div class="flex justify-center">
                                <div class="absolute -right-2 -top-2 rounded-full grid place-content-center z-50">
                                    <button onclick="toggleFavorite('${card.id}')" class="h-3 w-3 card-{{ card.id }}">
                                            <span data-icon="${
                                              favorites.includes(card.id)
                                                ? 'heart-filled'
                                                : 'heart'
                                            }" class="card-${card.id}"></span>
                                    </button>
                                </div>
                                <div class="grid place-items-center">
                                    <img class="object-contain h-[140px] w-[100px]" src="${card.images.small}" alt="" />
                                </div>
                            </div>
                            <div class="flex flex-col justify-start items-start w-full">
                                <h3 class="text-[#252C32] font-semibold w-1/2">${card.name}</h3>
                                <p class="text-[#525156] max-w-[100px] truncate overflow-hidden whitespace-nowrap">${card.set.name} - ${card.number}</p>
                                <span class="text-[18px] font-bold text-[#252C32] block truncate w-full"><span class="text-[#2EBD85] text-[10px] capitalize font-normal truncate">Highest Bid</span><br/>$${Math.round(auction.highest_bid)}</span>
                                <div class="flex justify-between items-center border border-1 border-[#DDE2E4] rounded-[3px] px-[6px] py-1 w-full mt-1.5">
                                    <p class="text-xs">
                                        ${card.grade ? card.grade : "None"}
                                    </p>
                                    <img src="${window.location.origin}/static/icons/line.svg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    auctionList.innerHTML += auctionItem;
  });

  auctionsSwiper.update();
}

function  updateCasinoList(casinos) {
  if (!casinoList) {
    return;
  }
  casinoList.innerHTML = '';
  casinos.forEach((casino) => {
    const casinoItem = `
      <div class="swiper-slide">
        <div class="border border-[#EAECEF] rounded-lg relative hidden md:block">
            <a class="absolute top-0 left-0 w-full h-full z-50" href="/casino/${casino.id}"></a>
            <div class="flex flex-col p-5">
                <div class="flex items-center gap-x-4 px-2">
                    <div class="h-4 w-4 absolute right-2 top-2 bg-white rounded-full grid place-content-center">
                        <button onclick="toggleFavorite('{{ card.id }}')" class="h-3 w-3 card-{{ card.id }}">
                            <span data-icon="heart"></span>
                        </button>
                    </div>
                    <div class="w-[100px] h-[100px] grid place-items-center">
                        <img src="${casino.booster_box.image}" alt="" />
                    </div>
                    <div class="flex flex-col justify-start items-start w-full gap-[5px]">
                        <h3 class="text-base text-[#252C32] font-medium">${casino.booster_box.box_name}</h3>
                        <p class="text-[#2EBD85] text-[10px] capitalize">Entry fee</p>
                        <span class="text-lg font-bold text-[#252C32]">$${Math.round(casino.entry_fee)}</span>
                        <div
                            class="flex justify-between items-center border border-1 border-[#DDE2E4] rounded-[3px] px-[6px] py-1 w-full">
                            <p class="text-xs">
                                ${casino.booster_box.grade.value}
                            </p>
                            <img src="${window.location.origin}/static/icons/line.svg" />
                        </div>
                    </div>
                </div>
                <div class="bg-[#EAECEF] mt-3 p-1 rounded-sm flex items-center justify-center gap-x-1">
                    <img class="w-3 h-3 relative -top-0.5" src="${window.location.origin}/static/icons/clock.svg" />
                    <p class="text-xs truncate">${casino.total_participants} entries - ${casino.time_remaining_formatted}
                        left (${casino.end_time_formatted})</p>
                </div>
            </div>
        </div>
        <div class="md:hidden border border-[#EAECEF] p-3 relative">
            <a class="absolute w-full h-full z-50 top-0 left-0" href="/casino/${casino.id}"></a>
            <div class="grid relative gap-x-[10px] w-full">
                <div class="flex justify-center">
                    <div class="absolute -right-2 -top-2 rounded-full grid place-content-center">
                        <button onclick="toggleFavorite('{{ card.id }}')" class="h-3 w-3 card-{{ card.id }}">
                            <span data-icon="heart"></span>
                        </button>
                    </div>
                    <div class="grid place-items-center">
                        <img class="object-contain h-[80px] w-[80px]" src="${casino.booster_box.image}" alt="" />
                    </div>
                </div>
                <div class="flex flex-col justify-start items-start w-full gap-[5px]">
                    <h3 class="text-xs text-[#252C32] font-semibold w-2/3">${casino.booster_box.box_name}</h3>
                    <p class="text-[#2EBD85] text-[10px]">Slots: ${casino.total_participants}/${casino.max_participants}</p>
                    <span class="text-sm font-bold text-[#252C32]">$${Math.round(casino.entry_fee)}</span>
                </div>
                <div class="col-span-2 mt-[10px] flex justify-between text-[#E2464A] w-full text-center">
                    <div>
                        <p class="font-bold">${casino.time_till_start_without_days.hours}</p>
                        <p class="uppercase text-xs font-semibold">Hours</p>
                    </div>
                    <div>
                        <p class="font-bold">${casino.time_till_start_without_days.minutes}</p>
                        <p class="uppercase text-xs font-semibold">Minutes</p>
                    </div>
                    <div>
                        <p class="font-bold">${casino.time_till_start_without_days.seconds}</p>
                        <p class="uppercase text-xs font-semibold">Seconds</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
    `;
    casinoList.innerHTML += casinoItem;
  });

  casinosSwiper.update();
}

async function getAllAuctions() {
  fetch(`${window.location.origin}/auction/all`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        getAllFavorites().then((favorites) => {
          updateAuctionList(data.data, favorites);
          auctionSection.hidden = false;
        });
      }
    })
    .catch((err) => console.log(err));
}

async function getAllCasinos() {
  fetch(`${window.location.origin}/casino/all`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        updateCasinoList(data.data);
        casinoSection.hidden = false;
      }
    })
    .catch((err) => console.log(err));
}

const socket = new WebSocket(
  'ws://' + window.location.host + '/ws/general/' + 'all' + '/'
);

socket.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.type === 'auction_created') {
    getAllAuctions();
  }
  if (data.type === 'casino_created') {
    getAllCasinos();
  }
};

document.addEventListener('DOMContentLoaded', function () {
  new Swiper('.mySwiper', {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });
});