const btn = document.querySelector('.theme-switcher');
console.log(btn)
// alert('he')
btn.style.position ='fixed'; 
btn.style.bottom ='20px'; 
btn.style.rigth ='20px'; 

btn.addEventListener('click', function(e){
  document.body.classList.toggle('light');
})