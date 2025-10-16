function showToast(toastMessage = "", isError = false) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    toastContainer.innerHTML = `
    <span class="inline-block w-10 h-10 pl-[10px] pt-[10px] text-white rounded-[6px]">
          <img src="${isError ? '/static/images/danger.svg' : '/static/images/success.svg'}" alt="${isError ? 'Error' : 'Success'}" class="h-5 w-5 text-[20px]" />
    </span>
  </span>
      ${toastMessage}
    `;
   
    toastContainer.className = `
      ${isError ? 'toast-error-color' : 'text-[#000000]'}
  
    fixed top-4 left-[-100px]  text-base max-w-sm z-[10000] rounded border border-black border-opacity-10 shadow
      opacity-0 invisible transition-all h-[64px] duration-500 ease-out px-4 py-2 text-base flex items-center pe-7
    `;
    // toastContainer.innerText = `${isError === true ? '❌ ' : '✅ '}  ${toastMessage}`;
    
    // toastContainer.className = `${isError ? 'toast-error-color' : 'toast-success-color'} 
    //   fixed top-4 left-[-100px] max-w-sm text-white z-[10000] rounded
    //   opacity-0 invisible transition-all duration-500 ease-out px-4 py-2 text-base`;
  
    void toastContainer.offsetWidth;
    toastContainer.classList.remove('opacity-0', 'invisible');
    toastContainer.style.left = '1%'; 
    toastContainer.style.top = '18%';
    // toastContainer.style.backgroundColor = '#F2F0EF'
  
    setTimeout(() => {
      toastContainer.style.left = '-100px';
      toastContainer.classList.add('opacity-0', 'invisible');
    }, 5000);
  }