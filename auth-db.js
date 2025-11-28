// auth-db.js - Auth (register/login/logout) + Firestore helpers (compat API)
(function(){
  function $(id){ return document.getElementById(id); }
  function notify(msg){ alert(msg); }

  function ready(){ return (window.firebase && firebase.auth && firebase.firestore); }

  // Register user and create user doc
  async function registerUser(){
    if(!ready()){ notify('Firebase not loaded.'); return; }
    const name = $('regName')?.value?.trim();
    const email = $('regEmail')?.value?.trim();
    const pass = $('regPass')?.value;
    if(!name || !email || !pass){ notify('Please complete all fields'); return; }
    try{
      const uc = await firebase.auth().createUserWithEmailAndPassword(email, pass);
      await uc.user.updateProfile({ displayName: name });
      const db = firebase.firestore();
      await db.collection('users').doc(uc.user.uid).set({ name, email, created: firebase.firestore.FieldValue.serverTimestamp() });
      notify('Account created. Redirecting to dashboard...');
      window.location.href = 'dashboard.html';
    }catch(err){ notify('Register error: ' + err.message); }
  }

  // Login
  async function loginUser(){
    if(!ready()){ notify('Firebase not loaded.'); return; }
    const email = $('loginEmail')?.value?.trim();
    const pass = $('loginPass')?.value;
    if(!email || !pass){ notify('Enter email and password'); return; }
    try{
      await firebase.auth().signInWithEmailAndPassword(email, pass);
      notify('Logged in. Redirecting to dashboard...');
      window.location.href = 'dashboard.html';
    }catch(err){ notify('Login failed: ' + err.message); }
  }

  // Logout
  async function logoutUser(){
    if(!ready()){ notify('Firebase not loaded.'); return; }
    try{ await firebase.auth().signOut(); notify('Logged out.'); window.location.href = 'index.html'; }catch(err){ notify('Logout failed: '+err.message); }
  }

  // Save booking to Firestore
  async function submitBooking(){
    if(!ready()){ notify('Firebase not loaded.'); return; }
    const service = $('serviceSelect')?.value;
    const date = $('serviceDate')?.value;
    const time = $('serviceTime')?.value;
    const phone = $('contactPhone')?.value?.trim();
    const notes = $('serviceNotes')?.value?.trim();
    if(!date || !service){ notify('Please choose service and date'); return; }
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    try{
      const payload = { uid: user ? user.uid : null, email: user ? user.email : null, service, date, time, phone, notes, status:'Requested', amount:null, created: firebase.firestore.FieldValue.serverTimestamp() };
      const ref = await db.collection('bookings').add(payload);
      notify('Booking request sent. ID: ' + ref.id + '. We will contact you with a quotation via WhatsApp.');
      if(user) window.location.href = 'dashboard.html';
    }catch(err){ notify('Booking save failed: '+err.message); }
  }

  // Protect page - redirect if not logged in
  function protectPage(redirectTo='login.html'){
    if(!(window.firebase && firebase.auth)) return;
    firebase.auth().onAuthStateChanged(user=>{
      if(!user) window.location.href = redirectTo;
      else { const el = $('userEmail'); if(el) el.textContent = user.email || user.displayName || ''; }
    });
  }

  // Load bookings for logged in user and render into containerId
  async function loadUserBookings(containerId){
    if(!ready()) return;
    const user = firebase.auth().currentUser;
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = 'Loading...';
    try{
      const snap = await firebase.firestore().collection('bookings').where('uid','==',user.uid).orderBy('created','desc').get();
      if(snap.empty){ container.innerHTML = '<div class="small">No bookings found.</div>'; return; }
      container.innerHTML = '';
      snap.forEach(doc=>{
        const d = doc.data();
        const el = document.createElement('div'); el.className='report-card';
        const created = d.created && d.created.toDate ? d.created.toDate().toLocaleString() : '';
        el.innerHTML = `<strong>${d.service}</strong><div class="small">Date: ${d.date} ${d.time?('@'+d.time:'')}</div><div class="small">Status: ${d.status}</div><div class="small">Amount: ${d.amount?('₹'+d.amount):'Quotation Pending'}</div><div class="small">Created: ${created}</div><div style="margin-top:8px"><button class="btn" onclick="window.open('invoice.html?bid=${doc.id}','_blank')">View Invoice</button></div>`;
        container.appendChild(el);
      });
    }catch(err){ container.innerHTML = '<div class="small">Load error</div>'; console.error(err); }
  }

  // Generate PDF invoice for given booking data (client-side)
  async function generateInvoicePDF(data){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'pt',format:'a4'});
    let y=60;
    doc.setFontSize(16); doc.text('Mahadev Fabric Care - Work Invoice',40,y); y+=28;
    doc.setFontSize(11); doc.text(`Invoice No: ${data.id || '-'}`,40,y); y+=18;
    doc.text(`Customer: ${data.customer || data.email || data.phone || '-'}`,40,y); y+=16;
    doc.text(`Service: ${data.service || '-'}`,40,y); y+=16;
    doc.text(`Date of Service: ${data.date || '-'}`,40,y); y+=16;
    doc.text(`Amount: ${data.amount?('₹'+data.amount):'Quotation Pending'}`,40,y); y+=24;
    if(document.getElementById('qrImg')){
      try{ doc.addImage(document.getElementById('qrImg').src, 'PNG', 400, 100, 120, 120); }catch(e){}
    }
    doc.save('Invoice_'+(data.id||'invoice')+'.pdf');
  }

  // Load booking by id and return data (used by invoice page)
  async function loadBookingById(bid){
    if(!(window.firebase && firebase.firestore)) return null;
    try{
      const doc = await firebase.firestore().collection('bookings').doc(bid).get();
      if(!doc.exists) return null;
      const d = doc.data(); d.id = doc.id; return d;
    }catch(e){ console.error(e); return null; }
  }

  window.MFC = { registerUser, loginUser, logoutUser, protectPage, submitBooking, loadUserBookings, generateInvoicePDF, loadBookingById };
})();