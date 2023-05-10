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

            const scrollNext = this.elems.find(elem => elem.isDone === false);
            if (scrollNext === undefined) {
                return;
            }
            scrollNext.onScroll(scrollNext.elem, wheel.deltaY / 100);
        });
    }
}

const name = new ScrollElem("name", (elem, delta) => {
    elem.scale = elem.scale ?? window.getComputedStyle(elem).scale;
    elem.scale -= delta / 2;

    if (elem.scale <= 1) {
        elem.scale = 1;
        name.done();
    } else if (elem.scale >= 16) {
        elem.scale = 16;
    }

    elem.style.scale = elem.scale;
});

new ScrollHandler([name]).addListener();
