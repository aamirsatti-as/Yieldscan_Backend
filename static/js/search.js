function updateSortParam(param) {
  const params = new URLSearchParams(window.location.search);
  params.delete('sort');
  params.set('sort', param);
  window.location.search = params.toString();
}

document.getElementById('clear-filters').addEventListener('click', function () {
  window.location.href = window.location.pathname;
});

const params = new URLSearchParams(window.location.search);

const selectedCategory = params.get('category');
const categoryRadios = document.querySelectorAll("input[name='category']");

const selectedPrice = params.get('price');
const priceRadios = document.querySelectorAll("input[name='price']");

const selectedGrade = params.get('grade');
const gradeRadios = document.querySelectorAll("input[name='grade']");

const selectedCondition = params.get('condition');
const conditionRadios = document.querySelectorAll("input[name='condition']");

if (selectedCategory) {
  const radio = document.querySelector(
    `input[name="category"][value="${selectedCategory}"]`
  );
  if (radio) {
    radio.checked = true;
  }
}

if (selectedPrice) {
  const radio = document.querySelector(
    `input[name="price"][value="${selectedPrice}"]`
  );
  if (radio) {
    radio.checked = true;
  }
}

if (selectedGrade) {
  const radio = document.querySelector(
    `input[name="grade"][value="${selectedGrade}"]`
  );
  if (radio) {
    radio.checked = true;
  }
}

if (selectedCondition) {
  const radio = document.querySelector(
    `input[name="condition"][value="${selectedCondition}"]`
  );
  if (radio) {
    radio.checked = true;
  }
}

categoryRadios.forEach((radio) => {
  radio.addEventListener('change', function () {
    const params = new URLSearchParams(window.location.search);
    params.set('category', this.value);
    window.location.search = params.toString();
  });
});

priceRadios.forEach((radio) => {
  radio.addEventListener('change', function () {
    const params = new URLSearchParams(window.location.search);
    params.set('price', this.value);
    window.location.search = params.toString();
  });
});

gradeRadios.forEach((radio) => {
  radio.addEventListener('change', function () {
    const params = new URLSearchParams(window.location.search);
    params.set('grade', this.value);
    window.location.search = params.toString();
  });
});

conditionRadios.forEach((radio) => {
  radio.addEventListener('change', function () {
    const params = new URLSearchParams(window.location.search);
    params.set('condition', this.value);
    window.location.search = params.toString();
  });
});

// Sort modal

const modal = document.querySelector('div#modal');
const openSortModalBtn = document.querySelector('button#open-sort-modal-btn');
const openFilterModalBtn = document.querySelector(
  'button#open-filter-modal-button'
);
const closeModalBtn = document.querySelectorAll('button.close-modal-btn');
const filterContent = document.querySelector('div#filter-content');
const sortContent = document.querySelector('div#sort-content');

openSortModalBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
  sortContent.classList.remove('hidden');
  filterContent.classList.add('hidden');
});

openFilterModalBtn.addEventListener('click', () => {
  
  modal.classList.remove('-translate-x-full');
  // modal.classList.remove('hidden');
  modal.classList.remove('opacity-0', 'invisible');

  filterContent.classList.remove('hidden');
  sortContent.classList.add('hidden');
});

  closeModalBtn.forEach((item) => {
    item.addEventListener('click', () => {
      modal.classList.add('opacity-0', 'invisible', '-translate-x-full');    
    });
  });

const listOfSorts = [
  'Most Popular',
  'New Lowest Asks',
  'New Highest Bids',
  'Average Sale Price',
  'Total Sold',
  'Volatility',
  'Price Premium',
  'Last Sale',
  'Lowest Ask',
  'Highest Bid',
  'Release Date',
];

const sortMap = {
  'Most Popular': 'most_popular',
  'New Lowest Asks': 'new_lowest_asks',
  'New Highest Bids': 'new_highest_bids',
  'Average Sale Price': 'average_sale_price',
  'Total Sold': 'total_sold',
  Volatility: 'volatility',
  'Price Premium': 'price_premium',
  'Last Sale': 'last_sale',
  'Lowest Ask': 'lowest_ask',
  'Highest Bid': 'highest_bid',
  'Release Date': 'release_date',
};

const sortsContainer = document.querySelector('div#sort-list');

listOfSorts.forEach((item) => {
  const sortItem = `
    <button class="flex justify-between items-center py-2.5 border-b border-[#1E232933] sort-btn">
        <p class="font-medium text-left">${item}</p>
        <img class="check-icon hidden" src="${window.location.origin}/static/icons/check.svg" />
    </button>
  `;
  sortsContainer.innerHTML += sortItem;
});

const sortButtons = document.querySelectorAll('button.sort-btn');
const sortButtonIndicators = document.querySelectorAll(
  'button.sort-btn > img.check-icon'
);

if (sortButtons.length > 0) {
  sortButtons[0].classList.add('text-[#F6D658]');
  sortButtonIndicators[0].classList.remove('hidden');
}

sortButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    sortButtons.forEach((item) => item.classList.remove('text-[#F6D658]'));
    sortButtonIndicators.forEach((item) => item.classList.add('hidden'));
    btn.classList.add('text-[#F6D658]');
    sortButtonIndicators[index].classList.remove('hidden');

    // Uncomment once you have the filters set up
    // if (sortMap[btn.innerText]) {
    //   updateSortParam(sortMap[btn.innerText]);
    // }
  });
});

const selectedFilters = document.querySelectorAll('p.selected-filter');

const categoryNameItems = document.querySelectorAll(
  'div.categories-list > p.category-name'
);
const categoryIdItems = document.querySelectorAll(
  'div.categories-list > p.category-id'
);

const categoryItems = [];

categoryNameItems.forEach((item, index) => {
  categoryItems.push({
    label: item.innerText,
    value: categoryIdItems[index].innerText,
  });
});

const filters = {
  category: categoryItems,
  price: [
    { label: "All Price", value: "all" },
    { label: "Under $20", value: "0_20" },
    { label: "$25 to $100", value: "25_100" },
    { label: "$100 to $300", value: "100_300" },
    { label: "$500 to $1,000", value: "500_1000" },
    { label: "$5,000 to $10,000", value: "5000_10000" },
  ],
  grade: [
    { label: "No", value: "no" },
    { label: "Yes", value: "yes" },
    { label: "Not Specified", value: "not_specified" },
  ],
  condition: [
    { label: "New", value: "new" },
    { label: "Used", value: "used" },
    { label: "Not Specified", value: "not_specified" },
  ],
};

const filtersList = document.querySelector('div#filter-list');

for (const filter in filters) {
  const filterItem = `
    <div class="border-b border-[#1E232933]">
        <div class="flex justify-between items-center px-6 py-4 filter-expand-btn">
            <p class="font-medium text-left capitalize">${filter}</p>
            <button type="button" class="rotate-icon">
                <img class="arrow-icon" src="${
                  window.location.origin
                }/static/images/arrow.svg" />
            </button>
        </div>
        <div class="pb-2 hidden filter-list-expanded">
          <div class="grid">
              ${filters[filter]
                .map(
                  (f) =>
                    `<button type="button" class="add-filter-btn capitalize text-sm py-2 px-6 font-normal flex justify-between items-center">${f.label}<img class="hidden filter-check-icon" src="${window.location.origin}/static/icons/check-orange.svg" /></button>
                    <input name="${filter}" type="radio" value="${f.value}" class="filter-input hidden" />
                    `
                )
                .join('')}
          </div>
        </div>
    </div>
  `;
  filtersList.innerHTML += filterItem;
}
const selectedItemsContainer = document.querySelector('.selected-items');

const filterExpandButtons = document.querySelectorAll(
  'div.filter-expand-btn'
);
const filterListExpanded = document.querySelectorAll(
  'div.filter-list-expanded'
);

const addFilterBtns = document.querySelectorAll('button.add-filter-btn');
filterExpandButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    filterListExpanded[index].classList.toggle('hidden');
    btn.querySelector('.rotate-icon').classList.toggle('rotate-180');
  });
});

// Function to get query parameters from the URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const queryObj = {};
  params.forEach((value, key) => {
    queryObj[key] = value;
  });
  return queryObj;
}

// Apply selected filters on page load
document.addEventListener("DOMContentLoaded", () => {
  const queryParams = getQueryParams();

  Object.keys(queryParams).forEach((key) => {
    const selectedValue = queryParams[key];

    // Find the matching input
    const radioInput = document.querySelector(`input[name="${key}"][value="${selectedValue}"]`);
    if (radioInput) {
      radioInput.checked = true; // Select the radio input

      const btn = radioInput.previousElementSibling; // Get the corresponding button
      if (btn && btn.classList.contains("add-filter-btn")) {
        btn.classList.add("text-[#FA8232]", "bg-[#FFF3EB]"); // Apply styles
        btn.querySelector('.filter-check-icon').classList.remove('hidden'); // Show check icon
      }
    }
  });
});

// Handle button clicks to select radio inputs
addFilterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const categoryDiv = btn.closest('.filter-list-expanded');

    // Reset styles for all buttons in the same category
    categoryDiv.querySelectorAll('.add-filter-btn').forEach((i) => {
      i.classList.remove('text-[#FA8232]', 'bg-[#FFF3EB]');
    });
    categoryDiv.querySelectorAll('.filter-check-icon').forEach((icon) => {
      icon.classList.add('hidden');
    });

    // Apply styles to the clicked button
    btn.classList.add('text-[#FA8232]', 'bg-[#FFF3EB]');
    btn.querySelector('.filter-check-icon').classList.remove('hidden');

    // Select the corresponding radio input
    const radioInput = btn.nextElementSibling;
    if (radioInput && radioInput.type === 'radio') {
      radioInput.checked = true;
    }

    const categoryTitle = btn.closest('.border-b').querySelector('p').innerText;
    const selectedLabel = btn.innerText.trim();
      // Remove existing selected item for this category
      const existing = selectedItemsContainer.querySelector(`[data-category="${categoryTitle}"]`);
      if (existing) {
        existing.remove();
      }
  
      // Create new selected item element
      const selectedItem = document.createElement('div');
      selectedItem.className = 'selected-item flex items-center text-sm px-3 py-1 border border-black text-black text-opacity-40 rounded';
      selectedItem.setAttribute('data-category', categoryTitle);
      selectedItem.innerHTML = `
        <span class="mr-2 font-medium">${categoryTitle}:${selectedLabel}</span> 
        <button class="ml-2 text-2xl pb-[6px] font-bold focus:outline-none remove-selected">&times;</button>
      `;
  
      selectedItemsContainer.appendChild(selectedItem);
  
      // Add click listener to the X button
      selectedItem.querySelector('.remove-selected').addEventListener('click', () => {
        selectedItem.remove();
  
        // Unselect radio input and reset button style
        categoryDiv.querySelectorAll('.filter-input').forEach((input) => {
          input.checked = false;
        });
        categoryDiv.querySelectorAll('.add-filter-btn').forEach((i) => {
          i.classList.remove('text-[#FA8232]', 'bg-[#FFF3EB]');
          i.querySelector('.filter-check-icon').classList.add('hidden');
        });
      });

  });
});


const categoriesToggle = document.getElementById('categories-toggle');
const categoriesContainer = document.querySelector('.categories-container');

const priceToggle = document.getElementById('price-toggle');
const priceContainer = document.querySelector('.price-container');

const gradeArrow = document.getElementById('grade-toggle');
const gradeContainer = document.querySelector('.grade-container');

const conditionArrow = document.getElementById('condition-toggle');
const conditionContainer = document.querySelector('.condition-container');

categoriesToggle.addEventListener('click', () => {
  // Toggle the 'hidden' class on the categories container
  categoriesContainer.classList.toggle('hidden');
  document.getElementById('category-arrow').classList.toggle('rotate-90');
});

priceToggle.addEventListener('click', () => {
  priceContainer.classList.toggle('hidden');
  document.getElementById('price-arrow').classList.toggle('rotate-90');
});

gradeArrow.addEventListener('click', () => {
  gradeContainer.classList.toggle('hidden');
  document.getElementById('grade-arrow').classList.toggle('rotate-90');
});

conditionArrow.addEventListener('click', () => {
  conditionContainer.classList.toggle('hidden');
  document.getElementById('condition-arrow').classList.toggle('rotate-90');
});

document.addEventListener('DOMContentLoaded', function () {
  const images = document.querySelectorAll('img[data-id]');
  
  images.forEach(img => {
    const id = img.getAttribute('data-id');
    const loader = document.querySelector(`.loader[data-id="${id}"]`);
    if (img.complete) {
      loader.style.display = 'none';
      img.style.opacity = '1'; 
    } else {
      img.addEventListener('load', () => {
        loader.style.display = 'none';
        img.style.opacity = '1'; // Set opacity after image loads
      });
    }
  });
});


