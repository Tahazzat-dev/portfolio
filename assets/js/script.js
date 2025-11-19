(function($) {
class TextScramble {
  constructor($el, phrases = [], initialRandomizeChar, interval = 800) {
    this.$el = $el;
    this.phrases = phrases;
    this.interval = interval;
    this.chars = initialRandomizeChar;
    this.frame = 0;
    this.queue = [];
    this.counter = 0;
    this.update = this.update.bind(this);
    this.start(); // auto start on construction
  }

  start() {
    if (!this.phrases.length) return;
    this.next();
  }

  next() {
    this.setText(this.phrases[this.counter]).then(() => {
      setTimeout(() => this.next(), this.interval);
    });
    this.counter = (this.counter + 1) % this.phrases.length;
  }

  setText(newText) {
    const oldText = this.$el.text();
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update(oldText); // Pass the old text to the update function
    return promise;
  }

  update(oldText) {
    let output = "";
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (from === to) {
          output += to; // If characters are the same, no animation needed
          complete++;
        } else {
          const fromCode = from.charCodeAt(0);
          const toCode = to.charCodeAt(0);

          if (!char) {
            const diff = Math.abs(toCode - fromCode);
            const step = Math.ceil(diff / 30); // Slower animation (adjust divisor for speed)
            const direction = toCode > fromCode ? 1 : -1;
            let intermediateCode = fromCode;
            const animationDurationFrames = 60; // Adjust for the duration of the stepping
            if (this.frame - start < animationDurationFrames) {
              intermediateCode +=
                direction * Math.ceil((this.frame - start) * step * 0.2); // Adjust multiplier for finer control
            } else {
              intermediateCode = toCode; // Go directly to the target after the duration
            }
            char = String.fromCharCode(Math.round(intermediateCode));
            this.queue[i].char = char;
          }
          output += `<span class="T_txt_anim">${char}</span>`;
        }
      } else {
        output += from;
      }
    }

    this.$el.html(output);

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(() => this.update(oldText)); // Keep passing oldText
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}
class ProgressAnimation {
  constructor(selector = ".T_progress-animation") {
    this.$elements = $(selector);
    this.observer = new IntersectionObserver(this.handleIntersection, { threshold: 0.5 }); // Adjust threshold as needed
    this.init();
  }

  init() {
    this.$elements.each((_, el) => {
      this.observer.observe(el);
      $(el).data('animated', false); // Mark as not yet animated
    });
  }

  handleIntersection = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !$(entry.target).data('animated')) {
        this.animateProgress($(entry.target));
        $(entry.target).data('animated', true); 
        observer.unobserve(entry.target);
      }
    });
  };

  animateProgress($el) {
    const value = parseInt($el.data("value"), 10);
    const name = $el.data("name");
    const $fill = $el.find(".T_progress-fill");
    const $label = $el.find(".T_progress-name");
    const $counter = $el.find(".T_progress-value");

    $label.text(name);
    $fill.css("width", `${value}%`);
    $counter.text(`0%`); // Reset counter if re-animated

    let current = 0;
    const duration = 1500;
    const intervalTime = duration / value;

    const interval = setInterval(() => {
      current++;
      $counter.text(`${current}%`);
      if (current >= value) clearInterval(interval);
    }, intervalTime);
  }
}

// jQuery shorthand on document ready
$(function () {
  const $el = $(".T_skill_anim_container");
  const phrases = $(".T_skill_anim_texts").text().split(",");
  const randomizeChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  new TextScramble($el, phrases, randomizeChar, 4000);

  new ProgressAnimation();
});



// 1. Initialize Lenis
    const lenis = new Lenis({
        duration: 1.2, // Time taken for the scroll to complete (in seconds)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Default easing
        direction: 'vertical', // vertical or horizontal
        gestureDirection: 'vertical', // vertical, horizontal, both
        smoothWheel: true,
        smoothTouch: false, // Set to true if you want smooth scroll on touch devices
        lerp: 0.1, // If duration is not set, this controls the smoothing (0.1 is standard)
    });

    // 2. Add an event listener to log scroll events (optional)
    // lenis.on('scroll', (e) => {
    //   console.log(e)
    // });

    // 3. Define the Animation Frame (RAF) loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            // Stop the browser's default instant jump behavior
            e.preventDefault(); 
            
            // Get the target section ID (e.g., #about or #projects)
            const targetId = link.getAttribute('href'); 
            const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // 1. Get the current and target scroll positions
            const currentScrollPosition = lenis.scroll; // Lenis stores the current scroll Y position
            
            // Calculate the target element's top position relative to the document
            const targetTop = targetElement.getBoundingClientRect().top + currentScrollPosition; 
            
            // 2. Calculate the distance to scroll
            const distance = Math.abs(targetTop - currentScrollPosition);
            
            // 3. Define the scroll factor and minimum/maximum time
            const SCROLL_FACTOR = 0.0005; // Adjust this value to change speed
            const MIN_DURATION = 0.5;    // Minimum time (in seconds)
            const MAX_DURATION = 1.5;    // Maximum time (in seconds)

            // 4. Calculate the duration
            let calculatedDuration = MIN_DURATION + (distance * SCROLL_FACTOR);
            
            // Ensure the duration does not exceed the maximum time
            calculatedDuration = Math.min(calculatedDuration, MAX_DURATION);
            
            // 5. Scroll using the calculated duration
            lenis.scrollTo(targetId, {
                duration: calculatedDuration,
                offset: 0 
            });
        }
        });
      })

    // 4. Start the loop
    requestAnimationFrame(raf);

    $(".T_testimonial-container")?.slick();

    })(jQuery);