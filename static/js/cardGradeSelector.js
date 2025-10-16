const gradeSelectors = document.querySelectorAll('select.grade-select');

function selectGrade(grade, card) {
  const gradeItems = document.querySelectorAll(
    `span.grade-item[data-card=${card}]`
  );
  gradeItems.forEach((item) => {
    if (item.dataset.grade === grade) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

gradeSelectors.forEach((select) => {
  select.addEventListener('change', (event) => {
    const grade = event.target.value;
    const card = event.target.dataset.card;
    selectGrade(grade, card);
  });
});

function handleCardClick(element) {
    const gradeSelects = document.querySelectorAll('.card-box-desktop .grade-select');
    
    // Check if click target is a select or its children
    const clickedOnSelect = Array.from(gradeSelects).some(select => {
      return select.contains(event.target) || select === event.target;
    });

    // If clicked on select or its options, don't navigate
    if (clickedOnSelect) {
      return;
    }
    const rawGradeId = document.getElementById('raw_grade')?.innerText;
    // Get all data attributes
    const cardId = element.dataset.cardId;
    // Get all select elements with class 'grade-select'
    const gradeSelect = document.querySelector(`.grade-select[data-card="${cardId}"]`);
    let selectedValue = "", selectedText=""
    if (gradeSelect) {
      selectedValue = gradeSelect.value;
      selectedText = gradeSelect.options[gradeSelect.selectedIndex].text.trim();
    } else{
      selectedText = rawGradeId
    }
    window.location.href = `${window.origin}/card-detail/${cardId}/${selectedText}`;
}
function handleAuctionClick(auctionId) {
  window.location.href = `${window.origin}/auction/${auctionId}`;
}

