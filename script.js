/* ===========================
   BMC WEBSITE – MAIN JS
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- NAVBAR SCROLL & MENU ---------- */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-link');
  const backToTop = document.getElementById('backToTop');

  // Xử lý scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      backToTop.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      backToTop.classList.remove('visible');
    }
    updateActiveNavLink();
  });

  // Mobile menu
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  // Đóng menu khi click link
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  // Back to top
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Cập nhật active link khi scroll
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelector('.nav-links a[href*=' + sectionId + ']').classList.add('active');
      } else {
        document.querySelector('.nav-links a[href*=' + sectionId + ']').classList.remove('active');
      }
    });
  }


  /* ---------- REVEAL ANIMATION ON SCROLL ---------- */
  const reveals = document.querySelectorAll('.reveal');

  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    reveals.forEach(reveal => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Chạy ngay lúc load


  /* ---------- NUMBER COUNTER ANIMATION ---------- */
  const counters = document.querySelectorAll('.stat-number');
  let counterStarted = false;

  function startCounters() {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps

      let current = 0;
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.innerText = Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target;
        }
      };
      updateCounter();
    });
  }

  window.addEventListener('scroll', () => {
    if (counterStarted) return;
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;
    
    const position = statsSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight;

    if (position < screenPosition) {
      startCounters();
      counterStarted = true;
    }
  });


  /* ---------- PROJECTS FILTER + PAGINATION ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = Array.from(document.querySelectorAll('.project-card'));
  const pagination = document.getElementById('projectsPagination');
  const pageNumbers = document.getElementById('pageNumbers');
  const pagePrev = document.getElementById('pagePrev');
  const pageNext = document.getElementById('pageNext');

  const PAGE_SIZE = 6;
  let currentFilter = 'all';
  let currentPage = 1;

  function getFilteredCards() {
    return projectCards.filter(card => {
      if (currentFilter === 'all') return true;
      return card.getAttribute('data-cat') === currentFilter;
    });
  }

  function renderPagination(totalPages) {
    if (!pagination || !pageNumbers) return;

    if (totalPages <= 1) {
      pagination.classList.add('hidden');
      return;
    }
    pagination.classList.remove('hidden');
    pageNumbers.innerHTML = '';

    // Cửa sổ trang: hiện các trang lân cận + đầu/cuối (gọn)
    const pages = [];
    const add = (n) => { if (!pages.includes(n)) pages.push(n); };
    add(1);
    if (currentPage > 3) pages.push('...');
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) add(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    if (totalPages > 1) add(totalPages);

    pages.forEach(p => {
      if (p === '...') {
        const dots = document.createElement('span');
        dots.className = 'page-dots';
        dots.textContent = '…';
        pageNumbers.appendChild(dots);
        return;
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-btn page-number' + (p === currentPage ? ' active' : '');
      btn.textContent = p;
      btn.setAttribute('aria-label', 'Trang ' + p);
      btn.addEventListener('click', () => goToPage(p));
      pageNumbers.appendChild(btn);
    });

    if (pagePrev) pagePrev.disabled = currentPage === 1;
    if (pageNext) pageNext.disabled = currentPage === totalPages;
  }

  function applyView() {
    const filteredCards = getFilteredCards();
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    projectCards.forEach(card => card.classList.add('hidden'));

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    filteredCards.slice(start, end).forEach((card, idx) => {
      card.classList.remove('hidden');
      // Replay reveal animation
      card.classList.remove('visible');
      setTimeout(() => card.classList.add('visible'), 50 + idx * 60);
    });

    renderPagination(totalPages);
  }

  function goToPage(p) {
    currentPage = p;
    applyView();
    // Cuộn mượt lên đầu section
    const section = document.getElementById('projects');
    if (section) {
      const offset = section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        currentPage = 1;
        applyView();
      });
    });
    applyView();
  }

  if (pagePrev) pagePrev.addEventListener('click', () => goToPage(Math.max(1, currentPage - 1)));
  if (pageNext) pageNext.addEventListener('click', () => goToPage(currentPage + 1));


  /* ---------- CONTACT FORM SUBMIT (FormSubmit.co) ---------- */
  const contactForm = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  const submitBtn = document.getElementById('submitBtn');
  const formNextUrl = document.getElementById('formNextUrl');

  // Trỏ _next về lại chính trang hiện tại (giữ người dùng ở lại web)
  if (formNextUrl) {
    formNextUrl.value = window.location.origin + window.location.pathname + window.location.search + '#contact';
  }

  if (contactForm) {
    // Hiển thị trạng thái UI
    function showFormMsg(type, html) {
      formMsg.style.display = 'block';
      formMsg.className = 'form-message ' + type;
      formMsg.innerHTML = html;
    }

    function setLoading(loading) {
      if (loading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.dataset.originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Đang gửi</span><span class="btn-arrow">→</span>';
      } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        if (submitBtn.dataset.originalText) {
          submitBtn.innerHTML = submitBtn.dataset.originalText;
        }
      }
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot chống bot
      const honey = contactForm.querySelector('input[name="_honey"]');
      if (honey && honey.value) return; // bot bị chặn

      // Validate nhanh phía client
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      if (!name || !phone) return;

      setLoading(true);
      showFormMsg('pending', `
        <div class="msg-title">⏳ Đang gửi yêu cầu...</div>
        <p class="msg-desc">Vui lòng đợi trong giây lát, chúng tôi đang chuyển yêu cầu đến email công ty.</p>
      `);

      try {
        const formData = new FormData(contactForm);

        // FormSubmit gửi đến 1 email duy nhất (free tier)
        // Email nhận: congtybmcvinhphuc@gmail.com (form chính)
        // Email còn lại: congtybmc.mn@gmail.com → cài BCC forwarding trong Gmail settings

        const response = await fetch('https://formsubmit.co/ajax/congtybmcvinhphuc@gmail.com', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          // Lưu backup local (nếu muốn xem lại)
          try {
            const submissions = JSON.parse(localStorage.getItem('bmc_submissions') || '[]');
            submissions.push({
              name, phone,
              email: document.getElementById('email').value,
              service: document.getElementById('service').value,
              message: document.getElementById('message').value,
              submittedAt: new Date().toISOString()
            });
            localStorage.setItem('bmc_submissions', JSON.stringify(submissions));
          } catch (_) {}

          contactForm.reset();
          showFormMsg('success', `
            <div class="msg-title">🎉 Gửi thành công!</div>
            <p class="msg-desc">Yêu cầu của bạn đã được chuyển đến <strong>congtybmcvinhphuc@gmail.com</strong>. Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
            <div class="msg-summary">
              <strong>${name}</strong> • ${phone}<br/>
              <span>📬 Email đã được gửi tự động</span>
            </div>
            <div class="msg-actions" style="margin-top: 14px;">
              <a href="tel:0972253366" class="msg-btn msg-btn-primary">📞 Gọi ngay 0972 253 366</a>
              <button type="button" id="sendAnotherBtn" class="msg-btn">✉️ Gửi yêu cầu khác</button>
            </div>
          `);

          // Nút gửi yêu cầu khác
          setTimeout(() => {
            const sendAnother = document.getElementById('sendAnotherBtn');
            if (sendAnother) {
              sendAnother.addEventListener('click', () => {
                formMsg.style.display = 'none';
                document.getElementById('name').focus();
              });
            }
          }, 0);
        } else {
          throw new Error('Server trả về lỗi');
        }
      } catch (err) {
        showFormMsg('error', `
          <div class="msg-title">⚠️ Gửi tự động thất bại</div>
          <p class="msg-desc">Đã có lỗi mạng, vui lòng thử 1 trong các cách sau:</p>
          <div class="msg-actions" style="margin-bottom: 12px;">
            <button type="button" id="retryBtn" class="msg-btn msg-btn-primary">🔄 Thử lại</button>
            <a href="tel:0972253366" class="msg-btn">📞 Gọi 0972 253 366</a>
            <a href="mailto:congtybmcvinhphuc@gmail.com?subject=Yeu cau tu van" class="msg-btn">📧 Gửi Email</a>
          </div>
        `);
        setTimeout(() => {
          const retry = document.getElementById('retryBtn');
          if (retry) {
            retry.addEventListener('click', () => contactForm.requestSubmit());
          }
        }, 0);
      } finally {
        setLoading(false);
      }
    });
  }

  /* ---------- PROJECT MODAL ---------- */
  const modal = document.getElementById('projectModal');
  const modalImg = document.getElementById('modalImg');
  const modalCat = document.getElementById('modalCat');
  const modalTitle = document.getElementById('modalTitle');
  const modalValue = document.getElementById('modalValue');
  const modalInvestor = document.getElementById('modalInvestor');
  const modalDesc = document.getElementById('modalDesc');

  if (modal) {
    const closeBtn = document.querySelector('.close-btn');

    // Open modal
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('.project-img img').src;
        const cat = card.querySelector('.project-cat').innerText;
        const title = card.querySelector('h3').innerText;
        const value = card.querySelector('.project-value').innerText;
        const desc = card.querySelector('.project-info p').innerText;
        const investor = card.getAttribute('data-investor') || 'Đang cập nhật';

        modalImg.src = img;
        modalCat.innerText = cat;
        modalTitle.innerText = title;
        modalValue.innerText = value;
        modalInvestor.innerText = investor;
        modalDesc.innerText = desc;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
      });
    });

    // Close modal functions
    function closeModal() {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }


});
