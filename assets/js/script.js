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
              intermediateCode += direction * Math.ceil((this.frame - start) * step * 0.2); // Adjust multiplier for finer control
            } else {
              intermediateCode = toCode; // Go directly to the target after the duration
            }
            char = String.fromCharCode(Math.round(intermediateCode));
            this.queue[i].char = char;
          }
          output += `<span class="MT_txt_anim">${char}</span>`;
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

// jQuery shorthand on document ready
$(function () {
  const $el = $(".MT_skill_anim_container");
  const phrases = $(".MT_skill_anim_texts").text().split(",");
  const randomizeChar =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  new TextScramble($el, phrases, randomizeChar, 2000);
});