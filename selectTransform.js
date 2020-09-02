export function transform(selectElt, settings) {
    if (selectElt.nodeName == null || selectElt.nodeName.toLowerCase() !== "select") {
        throw new Error("Attempted to transform invalid element: argument must be a <select> element");
    }

    const selectContainer = document.createElement("DIV");
    selectContainer.classList.add("select-container");
    selectContainer.style.width = selectElt.style.width;
    
    const optionList = document.createElement("UL");
    optionList.className = "select-options";
    optionList.style.display = "none";
    optionList.style.width = selectElt.style.width;
    const options = [];
    let selected = createOption(selectElt.childNodes[0], true, settings.displayImg);
    let val = selectElt.childNodes[0].value ? selectElt.childNodes[0].value : selectElt.childNodes[0].innerHTML;
    for (const child of selectElt.childNodes) {
        if (child.nodeName != null && child.nodeName.toLowerCase() === "option") {
            const option = createOption(child, false, true);
            if (child.selected) {
                selected = createOption(child, true, settings.displayImg);
                val = child.value ? child.value : child.innerHTML;
                option.classList.toggle("selected");
            }
            options.push(option);
        }
    }

    for (const option of options) {
        const optionContainer = document.createElement("LI");
        optionContainer.append(option);
        optionList.append(optionContainer);
    }

    const selectedBox = createSelectDisplay(selectElt, selected, val);
    selectContainer.append(selectedBox.selectedOption, optionList);
    selectContainer.value = val;
    addClickHandler(selectContainer, selectedBox.downCaret, selectedBox.upCaret, optionList, settings.displayImg);

    if (settings.replace) {
        selectElt.parentNode.replaceChild(selectContainer, selectElt);
    }
    
    return selectContainer;
}

function createOption(elt, selected, displayImg) {
    const a = document.createElement("A");
    a.className = "option";
    const input = document.createElement("INPUT");
    input.type = "hidden";
    input.value = elt.hasAttribute("value") ? elt.value : elt.innerHTML;
    const img = document.createElement("IMG");
    img.className = "option-img";
    if (elt.hasAttribute("option-img")) {
        img.src = elt.getAttribute("option-img");
        if (elt.hasAttribute("option-width") && elt.hasAttribute("option-height")) {
            img.width = elt.getAttribute("option-width");
            img.height = elt.getAttribute("option-height");
        }
    }
    const label = document.createElement("LABEL");
    label.className = "option-name";
    label.innerHTML = elt.innerHTML;

    if (!selected) {
        a.append(input);
    }
    if (displayImg) {
        a.append(img);
    }
    a.append(label);

    return a;
}


function createSelectDisplay(selectElt, selected, val) {
    const selectedOption = document.createElement("DIV");
    selectedOption.className = "select-display";
    selectedOption.style.width = selectElt.style.width;
    
    // const input = document.createElement("INPUT");
    // input.type = "hidden";
    // input.value = val;
    selected.className = "selected-option";
    selectedOption.append(selected);
    
    const span1 = document.createElement("SPAN");
    span1.className = "select-caret-icon";
    span1.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-down" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1.5">\n' + 
                      '<path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>\n'
                      '</svg>';
    const span2 = document.createElement("SPAN");
    span2.className = "select-caret-icon";
    span2.style.display = "none";
    span2.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-up" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1.5">\n' + 
                      '<path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>\n'
                      '</svg>';
    selectedOption.append(span1, span2);

    return { selectedOption: selectedOption, downCaret: span1, upCaret: span2 };
}

function addClickHandler(container, expand, hide, list, displayImg) {
    container.addEventListener("click", (event) => {
        expand.style.display = expand.style.display === "none" ? "block" : "none";
        hide.style.display = hide.style.display === "none" ? "block" : "none";
        list.style.display = list.style.display === "none" ? "block" : "none";

        const target = event.target.closest(".option");
        if (target != null) {
            const selected = container.querySelector(".select-display");
            const val = target.querySelector("input").value;
            if (container.value != val) {
                container.value = val;
                container.dispatchEvent(new InputEvent("input"));
            }
            selected.querySelector("label").innerHTML = target.querySelector("label").innerHTML;
            if (displayImg) {
                selected.querySelector("img").src = target.querySelector("img").src;
            }
            container.querySelector("li > .selected").classList.toggle("selected");
            target.classList.toggle("selected");
        }
    });

    document.body.addEventListener("click", (event) => {
        if (event.target.closest(".select-container") != container) {
            expand.style.display = "block";
            hide.style.display = "none";
            list.style.display = "none";
        }
    });
}


