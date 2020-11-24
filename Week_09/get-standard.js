// w3c css页面 爬取CSS标准， https://www.w3.org/TR/?tag=css

const standards = Array.prototype.slice.call(
    document.querySelector('#container').children
).filter(
    element => element.getAttribute("data-tag").match(/css/)
).map(
    element => ({
        name : element.children[1].innerText,
        url : element.children[1].children[0].href
    })
);

