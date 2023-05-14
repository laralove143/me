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
    this.elems = elems;
  }

  scroll(delta) {
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

    document.addEventListener(
      "touchmove",
      (touch) => {
        touch.preventDefault();
        this.scroll((this.lastTouchY - touch.touches[0].pageY) / 10);
        this.lastTouchY = touch.touches[0].pageY;
      },
      { passive: false }
    );

    document.addEventListener("touchend", () => {
      let scrollCount = 10;
      const scrollIntervalId = setInterval(() => {
        if (scrollCount > 100) {
          clearInterval(scrollIntervalId);
          return;
        }
        this.scroll(1 / scrollCount);
        scrollCount++;
      }, 0.5);
    });
  }
}

class ScaleScrollElem extends ScrollElem {
  constructor(id, isText, factor, startScale, targetScale) {
    super(id, (elem, delta) => {
      if (!this.hasStarted) {
        this.elem.style.opacity = "1";
        this.hasStarted = true;
      }

      this.scale -= delta * factor;

      if (this.scale <= targetScale) {
        this.scale = targetScale;
        this.done();
      } else if (this.scale >= this.maxScale) {
        this.scale = this.maxScale;
      }

      if (isText) {
        elem.style.fontSize = `${this.scale}vw`;
      } else {
        elem.style.scale = this.scale;
      }
    });

    this.hasStarted = false;
    this.maxScale = startScale;
    this.scale = this.maxScale;
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

const scrollIndicatorScale = new ScaleScrollElem(
  "scrollIndicator",
  false,
  0.25,
  1,
  0
);

const nameScale = new ScaleScrollElem("name", true, 8, 340, 20);

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

new ScrollHandler([
  scrollIndicatorScale,
  nameScale,
  namePrideColors,
  nameNbColors,
]).addListener();
