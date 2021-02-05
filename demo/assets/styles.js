document.onscroll = () =>
    document.getElementById("top").classList.toggle("hide", document.body.scrollTop < document.querySelector("section").clientHeight - 400);

function clickToggleClass(elementClass, toggleClass, disabledClass = undefined)
{
const query = [...document.querySelectorAll("." + elementClass)];

query.forEach(element =>
{
    if (disabledClass && element.classList.contains(disabledClass))
        return;

    element.addEventListener("click", event =>
    {
        element.classList.toggle(toggleClass);
    })
})
}

function clickToggleSelected(elementClass)
{
clickToggleClass(elementClass, elementClass + "--selected", elementClass + "--disabled")
}

setTimeout(() =>
{
    clickToggleSelected("dd-checkbox");
    clickToggleSelected("dd-radio");
    clickToggleSelected("dd-switch");
}, 1000);