class ScrollIndicator {
  constructor(id) {
    this.shown = true;
    this.elem = document.getElementById(id);
  }

  showLater() {
    setTimeout(() => {
      this.shown = true;
      this.elem.style.bottom = "2vh";
      this.elem.style.opacity = "1";
    }, 5_000);
  }

  hide() {
    this.shown = false;
    this.elem.style.bottom = "-6vh";
    this.elem.style.opacity = "0";
    this.showLater();
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

class ScrollHandler {
  constructor(elems) {
    this.indicator = new ScrollIndicator("scrollIndicator");
    this.elems = elems;
  }

  scroll(delta) {
    if (this.indicator.shown) {
      this.indicator.hide();
    }

    const scrollNext = this.elems.find((elem) => elem.isDone === false);
    if (scrollNext === undefined) {
      return;
    }
    scrollNext.onScroll(scrollNext.elem, delta);
  }

  addListener() {
    document.addEventListener("wheel", (wheel) => {
      this.scroll(wheel.deltaY / 100);
    });

    document.addEventListener("touchstart", (touch) => {
      this.lastTouchY = touch.touches[0].pageY;
    });

    document.addEventListener("touchmove", (touch) => {
      this.scroll((this.lastTouchY - touch.touches[0].pageY) / 10);
      this.lastTouchY = touch.touches[0].pageY;
    });
  }
}

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

class ColorsScrollElem extends ScrollElem {
  constructor(id, colorCodes) {
    super(id, (elem, delta) => {
      if (!this.hasStarted) {
        this.elem.style.color = "transparent";
        this.hasStarted = true;
      }

      const nextColor = this.colors.find(
        (color) => color.percentage !== color.targetPercentage
      );
      if (nextColor === undefined) {
        this.done();
        return;
      }

      nextColor.percentage += delta * 4;
      if (nextColor.percentage > nextColor.targetPercentage) {
        nextColor.percentage = nextColor.targetPercentage;
      } else if (nextColor.percentage < 0) {
        nextColor.percentage = 0;
      }

      const colorsCss = this.colors
        .map((color) => color.toCss())
        .reverse()
        .join(", ");
      elem.style.backgroundImage = `linear-gradient(to right, ${colorsCss})`;
    });

    this.hasStarted = false;
    this.elem = document.getElementById(id);
    this.colors = [
      new Color("#FFFFFF", 100, 100),
      ...colorCodes.map((code, idx) => {
        return new Color(
          code,
          0,
          (100 / colorCodes.length) * (colorCodes.length - idx)
        );
      }),
      new Color("#FFFFFF", 0, 100),
    ];
  }
}

const nameScale = new ScrollElem("name", (elem, delta) => {
  if (elem.scale === undefined) {
    elem.scale = getComputedStyle(elem).fontSize.slice(0, -3);
    elem.style.opacity = "1";
  }
  elem.scale -= delta * 4;

  if (elem.scale <= 20) {
    elem.scale = 20;
    nameScale.done();
  } else if (elem.scale >= 200) {
    elem.scale = 200;
  }

  elem.style.fontSize = `${elem.scale}vw`;
});

const namePrideColors = new ColorsScrollElem("name", [
  "#732982",
  "#24408E",
  "#008026",
  "#FFED00",
  "#FF8C00",
  "#E40303",
]);

const nameNbColors = new ColorsScrollElem("name", [
  "#2C2C2C",
  "#9C59D1",
  "#FFFFFF",
  "#FCF434",
]);

new ScrollHandler([nameScale, namePrideColors, nameNbColors]).addListener();
