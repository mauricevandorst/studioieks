document.addEventListener('DOMContentLoaded', () => {
  // Scroll progress bar update
  const progressBar = document.getElementById('progress-bar');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  };
  window.addEventListener('scroll', updateProgress);
  updateProgress();

  // Parallax effect on hero layers
  const parallaxLayers = document.querySelectorAll('.parallax-layer');
  const parallaxHandler = () => {
    const scrollTop = window.scrollY;
    parallaxLayers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed || 0);
      layer.style.transform = `translateY(${scrollTop * speed}px)`;
    });
    // Manifest float effect
    const manifest = document.getElementById('manifest');
    if (manifest) {
      const offset = Math.min(window.scrollY * 0.02, 8);
      manifest.style.transform = `translateY(${offset}px)`;
    }
    requestAnimationFrame(parallaxHandler);
  };
  requestAnimationFrame(parallaxHandler);

  // Reveal on scroll using IntersectionObserver
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObserver.observe(el));

  // Gear item highlight on scroll
  const gearItems = document.querySelectorAll('.gear-item');
  const gearObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('text-accent', entry.isIntersecting);
    });
  }, { threshold: 0.6 });
  gearItems.forEach(item => gearObserver.observe(item));

  // JS marquee for smooth, continuous horizontal movement
  const marqueeInner = document.getElementById('marquee-inner');
  if (marqueeInner && getComputedStyle(marqueeInner).display !== 'none') {
    const baseHTML = marqueeInner.innerHTML;
    let cycleWidth = 0; // width of one logical cycle
    let offset = 0;
    let lastTime = performance.now();
    const speed = 70; // px/sec
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const buildMarqueeTrack = () => {
      marqueeInner.innerHTML = baseHTML;
      cycleWidth = marqueeInner.scrollWidth;
      if (cycleWidth === 0) return;

      const containerWidth = marqueeInner.parentElement ? marqueeInner.parentElement.clientWidth : window.innerWidth;
      // Ensure enough content is present so there is always the next cycle available.
      const targetWidth = containerWidth + (cycleWidth * 2);
      let safety = 0;
      while (marqueeInner.scrollWidth < targetWidth && safety < 12) {
        marqueeInner.insertAdjacentHTML('beforeend', baseHTML);
        safety += 1;
      }

      if (cycleWidth > 0) offset %= cycleWidth;
    };

    buildMarqueeTrack();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(buildMarqueeTrack);
    }
    marqueeInner.querySelectorAll('img').forEach(img => {
      if (img.complete) return;
      img.addEventListener('load', buildMarqueeTrack, { once: true });
      img.addEventListener('error', buildMarqueeTrack, { once: true });
    });

    if (!reduceMotion && cycleWidth > 0) {
      const animateMarquee = time => {
        const dt = (time - lastTime) / 1000;
        lastTime = time;
        if (!document.hidden) {
          offset += speed * dt;
          if (offset >= cycleWidth) offset -= cycleWidth;
          marqueeInner.style.transform = `translate3d(${-offset}px,0,0)`;
        }
        requestAnimationFrame(animateMarquee);
      };
      window.addEventListener('resize', buildMarqueeTrack, { passive: true });
      requestAnimationFrame(animateMarquee);
    }
  }

  // Accordion toggling
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const expanded = header.classList.contains('expanded');
      if (expanded) {
        content.style.maxHeight = null;
        header.classList.remove('expanded');
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        header.classList.add('expanded');
      }
    });
  });

 
  // Press kit download with loading animation.
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    const loader = downloadBtn.querySelector('.loader');
    const buttonText = downloadBtn.querySelector('.button-text');
    if (!loader || !buttonText) return;
    const PRESSKIT_PATH = './assets/files/Presskit.docx';
    const transitionDuration = getComputedStyle(loader).transitionDuration.split(',')[0].trim();
    const LOADER_DURATION_MS = transitionDuration.endsWith('ms')
      ? parseFloat(transitionDuration) + 50
      : (parseFloat(transitionDuration) * 1000) + 50;
    const RESET_DELAY_MS = 1000;
    let isDownloading = false;

    const setLoadingState = isLoading => {
      downloadBtn.disabled = isLoading;
      downloadBtn.classList.toggle('is-loading', isLoading);
      buttonText.textContent = isLoading ? 'Bezig...' : 'Download kit';
      if (!isLoading) loader.style.width = '0%';
    };

    const triggerDownload = () => {
      const link = document.createElement('a');
      link.href = PRESSKIT_PATH;
      link.download = 'Presskit.docx';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    downloadBtn.addEventListener('click', () => {
      if (isDownloading) return;
      isDownloading = true;
      setLoadingState(true);
      loader.style.width = '0%';

      requestAnimationFrame(() => {
        loader.style.width = '100%';
      });

      setTimeout(() => {
        triggerDownload();
        setTimeout(() => {
          setLoadingState(false);
          isDownloading = false;
        }, RESET_DELAY_MS);
      }, LOADER_DURATION_MS);
    });
  }
});
