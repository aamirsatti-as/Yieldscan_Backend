const defaultTab = 'buys';

const tabName = document.getElementById('tab-name').innerText;

const tabs = document.querySelectorAll('.tab-link');
const tabIndicators = document.querySelectorAll('.tab-indicator');
const contents = document.querySelectorAll('.tab-content');

function activateTab(selectedTab) {
  contents.forEach((content) => content.classList.add('hidden'));

  tabs.forEach((tab, index) => {
    if (tab.dataset.tab === selectedTab) {
      tab.classList.remove('text-[#A19F9E]');
      tabIndicators[index].classList.remove('hidden');
    } else {
      tab.classList.add('text-[#A19F9E]');
      tabIndicators[index].classList.add('hidden');
    }
  });

  const content = document.getElementById(`tab-content-${selectedTab}`);
  if (content) {
    content.classList.remove('hidden');
  }
}

if (tabName) {
  activateTab(tabName);
} else {
  activateTab(defaultTab);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});
