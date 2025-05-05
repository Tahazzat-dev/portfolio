const btn = document.querySelector('.theme-switcher');
btn.style.position ='fixed'; 
btn.style.bottom ='20px'; 
btn.style.rigth ='20px'; 

btn.addEventListener('click', function(e){
  document.body.classList.toggle('light');
})