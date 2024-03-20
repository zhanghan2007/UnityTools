function Base() {
    return {
        "child": [],
    };
}

function Text() {
    return {
        "type": "Label",
        "x": 0,
        "y": 0,
        "font": "",
        "fontSize": 0,
        "color": "",
        "text": ""
    };
}

function Image() {
    return {
        "type": "Image",
        "imgName": "",
        "x": 0,
        "y": 0,
    };
}

function Box() {
    return {
        "type": "Box",
        "x": 0,
        "y": 0,
        "width": 0,
        "height": 0,
        "child": []
    }
}

module.exports.Base = Base;
module.exports.Text = Text;
module.exports.Image = Image;
module.exports.Box = Box;
