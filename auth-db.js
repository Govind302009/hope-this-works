// INIT AOS
AOS.init({duration:800, once:true, offset:100});

// STATS COUNTER
document.addEventListener('DOMContentLoaded', function(){
  const counters = document.querySelectorAll('.stat-value');
  const speed = 1600;
  counters.forEach(counter => {
    const animate = () => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      const inc = Math.ceil(target / (speed / 16));
      if(count < target){
        counter.innerText = Math.min(count + inc, target);
        requestAnimationFrame(animate);
      } else {
        counter.innerText = target;
      }
    };
    // start when visible
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          animate();
          io.disconnect();
        }
      });
    }, {threshold:0.6});
    io.observe(counter);
  });
});

// GALLERY LIGHTBOX
document.querySelectorAll('.gallery-item').forEach(el=>{
  el.addEventListener('click', ()=>{
    const src = el.getAttribute('src');
    const lb = document.getElementById('lightbox');
    lb.querySelector('.lightbox-img').src = src;
    lb.style.display = 'flex';
  });
});
document.querySelectorAll('.lightbox-close').forEach(x=>x.addEventListener('click', ()=>document.getElementById('lightbox').style.display='none'));
document.getElementById('lightbox').addEventListener('click', (e)=>{ if(e.target.id === 'lightbox') e.currentTarget.style.display='none'; });

// CONTACT FORM (front-end only)
const contactForm = document.getElementById('contactForm');
if(contactForm) contactForm.addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('cfName').value.trim();
  const phone = document.getElementById('cfPhone').value.trim();
  const msg = document.getElementById('cfMsg').value.trim();
  if(!name || !phone || !msg){ alert('Please fill required fields.'); return; }
  // TODO: hook to backend
  alert('Request sent (demo). Connect contact form to your backend endpoint to process submissions.');
  contactForm.reset();
});

// LOGIN / SIGNUP demo handlers
const loginForm = document.getElementById('loginForm');
if(loginForm) loginForm.addEventListener('submit', function(e){
  e.preventDefault();
  alert('Login demo — implement auth endpoint and replace this behavior.');
  const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
  modal && modal.hide();
});
const signupForm = document.getElementById('signupForm');
if(signupForm) signupForm.addEventListener('submit', function(e){
  e.preventDefault();
  alert('Signup demo — implement register endpoint and replace this behavior.');
  const modal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
  modal && modal.hide();
});

