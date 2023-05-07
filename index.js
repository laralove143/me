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

    addListener() {
        document.addEventListener("wheel", (wheel) => {
            const scrollNext = this.elems.find(elem => elem.isDone === false);
            if (scrollNext === undefined) {
                return;
            }
            scrollNext.onScroll(scrollNext.elem, wheel.deltaY / 100);
        })
    }
}

const name = new ScrollElem("name", (elem, delta) => {
    elem.scale = elem.scale ?? window.getComputedStyle(elem).scale;
    elem.scale -= delta / 2;

    if (elem.scale <= 1) {
        elem.scale = 1;
        name.done();
    } else if (elem.scale >= 8) {
        elem.scale = 8;
    }

    elem.style.scale = elem.scale;
});

new ScrollHandler([name]).addListener();