class Color {
  constructor(code, percentage, targetPercentage) {
    this.code = code;
    this.percentage = percentage;
    this.targetPercentage = targetPercentage;
  }

  toCss() {
    return `${this.code} 0, ${this.code} ${this.percentage}%`;
  }
}

class Colors {
  constructor(codes) {
    this.colors = [new Color("#FFFFFF", 100, 100)].concat(
      codes.map((code, idx) => {
        return new Color(code, 0, (100 / codes.length) * (codes.length - idx));
      })
    );
  }

  next() {
    return this.colors.find(
      (color) => color.percentage !== color.targetPercentage
    );
  }

  toCss() {
    const colorsCss = this.colors
      .map((color) => color.toCss())
      .reverse()
      .join(", ");
    return `linear-gradient(to right, ${colorsCss})`;
  }
}

class ScrollElem {
  constructor(id, onScroll) {
    this.elem = document.getElementById(id);
    this.onScroll = onScroll;
    this.isDone = false;
  }

  done() {
    this.isDone = true;
  }
}

class ScrollIndicator {
  constructor(id) {
    this.shown = true;
    this.elem = document.getElementById(id);
  }

  showLater() {
    setTimeout(() => {
      this.shown = true;
      this.elem.style.bottom = "1em";
    }, 5_000);
  }

  hide() {
    this.shown = false;
    this.elem.style.bottom = "-3em";
    this.showLater();
  }
}

class ScrollHandler {
  constructor(elems) {
    this.indicator = new ScrollIndicator("scrollIndicator");
    this.elems = elems;
  }

  addListener() {
    document.addEventListener("wheel", (wheel) => {
      if (this.indicator.shown) {
        this.indicator.hide();
      }

      const scrollNext = this.elems.find((elem) => elem.isDone === false);
      if (scrollNext === undefined) {
        return;
      }
      scrollNext.onScroll(scrollNext.elem, wheel.deltaY / 100);
    });
  }
}

const nameScale = new ScrollElem("name", (elem, delta) => {
  if (elem.scale === undefined) {
    elem.scale = window.getComputedStyle(elem).scale;
    elem.style.opacity = 1;
  }
  elem.scale -= delta / 2;

  if (elem.scale <= 1) {
    elem.scale = 1;
    nameScale.done();
  } else if (elem.scale >= 16) {
    elem.scale = 16;
  }

  elem.style.scale = elem.scale;
});

const namePrideColors = new ScrollElem("name", (elem, delta) => {
  if (elem.colors === undefined) {
    elem.style.color = "transparent";
    elem.colors = new Colors([
      "#732982",
      "#24408E",
      "#008026",
      "#FFED00",
      "#FF8C00",
      "#E40303",
    ]);
  }

  const nextColor = elem.colors.next();
  if (nextColor === undefined) {
    namePrideColors.done();
    return;
  }

  nextColor.percentage += delta * 4;
  if (nextColor.percentage > nextColor.targetPercentage) {
    nextColor.percentage = nextColor.targetPercentage;
  } else if (nextColor.percentage < 0) {
    nextColor.percentage = 0;
  }

  elem.style.backgroundImage = elem.colors.toCss();
});

new ScrollHandler([nameScale, namePrideColors]).addListener();
