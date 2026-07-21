const preview = document.querySelector('.background-preview');
const previewImg = document.querySelector('.background-preview__img');
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('image-modal__img');
const closeButton = document.querySelector('.image-modal__close');
const prevButton = document.querySelector('.image-modal__nav--prev');
const nextButton = document.querySelector('.image-modal__nav--next');

const transitionOverlay = document.createElement('div');
transitionOverlay.className = 'page-transition-overlay';
document.body.appendChild(transitionOverlay);

const showTransitionOverlay = () => {
  transitionOverlay.classList.add('is-active');
  window.setTimeout(() => {
    transitionOverlay.classList.remove('is-active');
    sessionStorage.removeItem('page-transition');
  }, 400);
};

const navigateWithViewTransition = (event) => {
  const target = event.target instanceof Element ? event.target.closest('a') : null;
  if (!target) return;

  const href = target.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
    return;
  }

  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin || target.target === '_blank' || target.hasAttribute('download')) {
    return;
  }

  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return;
  }

  event.preventDefault();
  sessionStorage.setItem('page-transition', 'active');

  if (document.startViewTransition) {
    document.startViewTransition(() => {
      window.location.assign(url.href);
    });
  } else {
    window.location.assign(url.href);
  }
};

document.addEventListener('click', (event) => {
  navigateWithViewTransition(event);
});

if (sessionStorage.getItem('page-transition') === 'active') {
  window.setTimeout(showTransitionOverlay, 50);
}

if (preview && previewImg) {
  document.querySelectorAll('.project').forEach((project) => {
    const previewSrc = project.dataset.preview;
    if (!previewSrc) return;

    project.addEventListener('mouseenter', () => {
      previewImg.src = previewSrc;
      preview.classList.add('visible');
    });

    project.addEventListener('mouseleave', () => {
      preview.classList.remove('visible');
    });
  });
}

const slideshowContainers = document.querySelectorAll('.project-slideshow');

slideshowContainers.forEach((slideshow) => {
  const slides = Array.from(slideshow.querySelectorAll('.project-slideshow__image'));
  const prevButtonControl = slideshow.querySelector('.project-slideshow__button--prev');
  const nextButtonControl = slideshow.querySelector('.project-slideshow__button--next');
  let currentSlideIndex = 0;

  const showSlide = (index) => {
    if (!slides.length) return;

    currentSlideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === currentSlideIndex);
    });
  };

  prevButtonControl?.addEventListener('click', () => showSlide(currentSlideIndex - 1));
  nextButtonControl?.addEventListener('click', () => showSlide(currentSlideIndex + 1));

  showSlide(0);
});

if (modal && modalImage) {
  const galleryImages = Array.from(document.querySelectorAll('.gallery-image'));
  let activeImageIndex = 0;

  const openImage = (index) => {
    if (!galleryImages.length) return;

    activeImageIndex = (index + galleryImages.length) % galleryImages.length;
    const activeImage = galleryImages[activeImageIndex];
    modalImage.src = activeImage.src;
    modalImage.alt = activeImage.alt || 'Expanded project image';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  };

  galleryImages.forEach((image, index) => {
    image.addEventListener('click', () => {
      openImage(index);
    });
  });

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalImage.src = '';
  };

  const showNextImage = () => {
    openImage(activeImageIndex + 1);
  };

  const showPreviousImage = () => {
    openImage(activeImageIndex - 1);
  };

  closeButton?.addEventListener('click', closeModal);
  prevButton?.addEventListener('click', showPreviousImage);
  nextButton?.addEventListener('click', showNextImage);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) {
      return;
    }

    if (event.key === 'Escape') {
      closeModal();
    } else if (event.key === 'ArrowRight') {
      showNextImage();
    } else if (event.key === 'ArrowLeft') {
      showPreviousImage();
    }
  });
}

const initializeImageFadeIn = () => {
  const images = Array.from(document.querySelectorAll('img'));
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const fadeImages = images.filter((img) => !img.closest('.page-transition-overlay'));
  const fadeCards = cards;
  const fadeTargets = [...fadeImages, ...fadeCards];

  fadeImages.forEach((img) => {
    img.classList.add('fade-image');
    img.style.setProperty('--fade-delay', '0s');
  });

  fadeCards.forEach((card, index) => {
    card.classList.add('fade-card');
    card.style.setProperty('--fade-delay', `${index * 0.1 + 0.1}s`);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observerInstance.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px',
    });

    fadeTargets.forEach((target) => observer.observe(target));
  } else {
    fadeTargets.forEach((target) => target.classList.add('is-visible'));
  }
};

document.addEventListener('DOMContentLoaded', initializeImageFadeIn);
