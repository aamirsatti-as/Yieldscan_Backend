const cardsList = document.getElementById("cards-list");
const searchForm = document.getElementById("search-form");

async function getAllCards(query) {
    return fetch(`${window.location.origin}/api/search/?query=${query}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

function createCard(card) {
    return `<div class="relative">
                <div class="flex gap-x-[10px] w-full">                           
                    <div class="flex justify-center">
                        <div class="grid place-items-center">
                            <img class="object-contain w-[100px]" src="${ card.images.small }" alt="" />
                        </div>
                    </div>
                    <div class="flex flex-col justify-start items-start w-full gap-[5px]">
                        <h3 class="text-xs text-[#252C32] font-semibold w-1/2">${card.name}</h3>
                        <p class="text-[#525156] text-[10px] max-w-[120px] truncate overflow-hidden whitespace-nowrap">${card.set.name} - ${card.number}</p>
                        <div class="flex justify-between items-center border border-1 border-[#DDE2E4] rounded-[3px] px-[6px] py-1 w-full max-w-[80px]">
                            <p class="text-xs">
                                ${card.grade ? card.grade : "None"}
                            </p>
                            <img src="${window.location.origin}/static/icons/line.svg" />
                        </div>
                        <div class="flex gap-x-5 mt-2.5">
                            <button class="w-20 py-0.5 rounded-sm bg-primary text-center add-card-btn" data-card-id="${card.id}">
                                <span class="text-xs font-medium capitalize">Add</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`
}

if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        cardsList.classList.remove('hidden');
        const formData = new FormData(searchForm);
        const query = formData.get("query");
        getAllCards(query).then(data => {
            cardsList.innerHTML = "";
            data.data.forEach(card => {
                cardsList.innerHTML += createCard(card);
            });

            const addCardButtons = document.querySelectorAll('button.add-card-btn');

            addCardButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const cardId = this.dataset.cardId;
                    const card = data.data.find(i => i.id == cardId);
                    const hiddenInput = document.querySelector('input[name="card"]');
                    if (hiddenInput) {
                        hiddenInput.value = cardId;
                        const selectedCard = document.getElementById('selected-card');
                        selectedCard.innerHTML = `
                            <div class="relative">
                                <div class="flex gap-x-[10px] w-full">                           
                                    <div class="flex justify-center">
                                        <div class="grid place-items-center">
                                            <img class="object-contain w-[100px]" src="${ card.images.small }" alt="" />
                                        </div>
                                    </div>
                                    <div class="flex flex-col justify-start items-start w-full gap-[5px]">
                                        <h3 class="text-xs text-[#252C32] font-semibold w-1/2">${card.name}</h3>
                                        <p class="text-[#525156] text-[10px] max-w-[120px] truncate overflow-hidden whitespace-nowrap">${card.set.name} - ${card.number}</p>
                                        <div class="flex justify-between items-center border border-1 border-[#DDE2E4] rounded-[3px] px-[6px] py-1 w-full max-w-[80px]">
                                            <p class="text-xs">
                                                ${card.grade ? card.grade : "None"}
                                            </p>
                                            <img src="${window.location.origin}/static/icons/line.svg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `
                        cardsList.classList.add('hidden');
                    } 
                });
            });
        });
    })
}

