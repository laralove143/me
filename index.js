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

  scrollNext() {
    return this.elems.find((elem) => elem.isDone === false);
  }

  scroll(delta) {
    const scrollNext = this.scrollNext();
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
      this.lastTouches = [touch.touches[0].pageY];
    });

    document.addEventListener(
      "touchmove",
      (touch) => {
        touch.preventDefault();

        this.lastTouches.push(touch.touches[0].pageY);
        this.lastTouches = this.lastTouches.slice(-2);

        this.scroll(
          (this.lastTouches[this.lastTouches.length - 2] -
            this.lastTouches[this.lastTouches.length - 1]) /
            10
        );
      },
      { passive: false }
    );

    document.addEventListener("touchend", () => {
      const delta =
        this.lastTouches[this.lastTouches.length - 2] -
        this.lastTouches[this.lastTouches.length - 1];

      let scrollCount = 0;
      const scrollIntervalId = setInterval(() => {
        scrollCount++;

        if (scrollCount > 100) {
          clearInterval(scrollIntervalId);
          return;
        }

        this.scroll(delta / (scrollCount + 10) / 10);
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
  constructor(id, colorCodes, isReversed, endColorCode) {
    super(id, (elem, delta) => {
      if (!this.hasStarted) {
        this.elem.style.color = "transparent";
        this.hasStarted = true;
      }

      if (this.isForward) {
        this.isBackwardDone = false;
      } else {
        this.isDone = false;
      }

      let nextColor;
      if (this.isForward) {
        nextColor = this.colors.find(
          (color) => color.percentage !== color.targetPercentage
        );
      } else {
        for (let i = this.colors.length - 1; i > 0; i--) {
          if (this.colors[i].percentage !== 0) {
            nextColor = this.colors[i];
            break;
          }
        }
      }

      if (nextColor === undefined) {
        if (this.isForward) {
          this.done();
        } else {
          this.isBackwardDone = true;
        }
        return;
      }

      delta *= 4;

      if (this.isForward) {
        nextColor.percentage += delta;
        if (nextColor.percentage > nextColor.targetPercentage) {
          nextColor.percentage = nextColor.targetPercentage;
        } else if (nextColor.percentage < 0) {
          nextColor.percentage = 0;
        }
      } else {
        nextColor.percentage -= delta;
        if (nextColor.percentage < 0) {
          nextColor.percentage = 0;
        } else if (nextColor > 100) {
          nextColor.percentage = 100;
        }
      }

      const colorsCss = this.colors
        .map((color) => color.toCss())
        .reverse()
        .join(", ");
      elem.style.backgroundImage = `linear-gradient(to right, ${colorsCss})`;
    });

    this.isForward = true;
    this.isBackwardDone = false;
    this.hasStarted = false;
    this.colors = [
      new Color(endColorCode, 100, 100),
      ...colorCodes.map((code, idx) => {
        return new Color(
          code,
          0,
          (100 / colorCodes.length) * (colorCodes.length - idx)
        );
      }),
    ];

    if (isReversed) {
      this.colors.push(new Color("#FFFFFF", 0, 100));
    }
  }
}

class NameHover {
  constructor(triggerId, containerId, contentId) {
    this.trigger = new ColorsScrollElem(
      triggerId,
      ["#FF0000"],
      false,
      "#FFFFFF"
    );
    this.content = new ColorsScrollElem(
      contentId,
      ["#FF0000"],
      false,
      "transparent"
    );
  }

  addListener() {
    const factor =
      new URLSearchParams(document.location.search).get("imEylul") !== null
        ? 1000
        : 10;

    this.trigger.elem.addEventListener("mouseenter", () => {
      this.trigger.isForward = true;
      this.content.isForward = true;

      if (this.fillBackwardIntervalId !== undefined) {
        clearInterval(this.fillBackwardIntervalId);
      }

      this.fillForwardIntervalId = setInterval(() => {
        if (!this.trigger.isDone) {
          this.trigger.onScroll(
            this.trigger.elem,
            factor * (this.content.elem.offsetWidth / window.innerWidth)
          );
        } else {
          this.content.elem.style.visibility = "visible";
          this.content.onScroll(
            this.content.elem,
            factor * (this.trigger.elem.offsetWidth / window.innerWidth)
          );
        }
      }, 15);
    });

    this.trigger.elem.addEventListener("mouseleave", () => {
      this.trigger.isForward = false;
      this.content.isForward = false;

      if (this.fillForwardIntervalId !== undefined) {
        clearInterval(this.fillForwardIntervalId);
      }

      this.fillBackwardIntervalId = setInterval(() => {
        if (!this.content.isBackwardDone) {
          this.content.onScroll(
            this.content.elem,
            factor * (this.trigger.elem.offsetWidth / window.innerWidth)
          );
        } else {
          this.content.elem.style.visibility = "hidden";
          this.trigger.onScroll(
            this.trigger.elem,
            factor * (this.content.elem.offsetWidth / window.innerWidth)
          );
        }
      }, 15);
    });
  }
}

const scrollIndicatorScale = new ScaleScrollElem(
  "scrollIndicator",
  false,
  0.25,
  1,
  0
);

const nameHover = new NameHover(
  "nameHoverTrigger",
  "nameHoverContainer",
  "nameHoverContent"
);

const nameScale = new ScaleScrollElem("name", true, 8, 340, 8);

const namePrideColors = new ColorsScrollElem(
  "name",
  ["#732982", "#24408E", "#008026", "#FFED00", "#FF8C00", "#E40303"],
  true,
  "#FFFFFF"
);

const nameNbColors = new ColorsScrollElem(
  "name",
  ["#2C2C2C", "#9C59D1", "#FFFFFF", "#FCF434"],
  true,
  "#FFFFFF"
);

const scrollHandler = new ScrollHandler([
  scrollIndicatorScale,
  nameScale,
  namePrideColors,
  nameNbColors,
]);

scrollHandler.addListener();

const scrollDoneCheckIntervalId = setInterval(() => {
  if (scrollHandler.scrollNext() === undefined) {
    clearInterval(scrollDoneCheckIntervalId);

    nameHover.addListener();
  }
}, 100);
