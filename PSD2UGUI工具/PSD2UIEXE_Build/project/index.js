const PSD = require('psd.js');
const FS = require('fs-extra');
const LAYA_TEMPLETE = require('./temlete');
const path = require('path');
const { fstat } = require('fs');

//-----------------config------------------
var PSD_URL //psd路径
var OUTPUT_URL// 输出路径 最后一个斜杠不要
var FILE_NAME //保存的ui文件名
var UI_URL
var autoRename = false //是否重命名导出图片
var id = 1
//-----------------------------------------

var LayaObj; //ui文件Object

var imgDict = {}

async function start() {
    let files = FS.readdirSync('./')
    for (const f of files) {
        if (path.extname(f) == '.psd') {
            PSD_URL = f
            FILE_NAME = path.parse(f).name
            break
        }
    }
    if (!FS.existsSync(PSD_URL)) {
        console.log('没有找到指定的psd文件!');
        return;
    }
    OUTPUT_URL = './' + PSD_URL.replace('.psd', '')
    UI_URL = OUTPUT_URL + '/output.json';
    FS.ensureDirSync(OUTPUT_URL)
    FS.emptyDirSync(OUTPUT_URL)
    FS.ensureFileSync(UI_URL);

    //init
    LayaObj = new LAYA_TEMPLETE.Base();
    return PSD.open(PSD_URL).then(async function (doc) {
        let childs = doc.tree().children().reverse();
        for (let node of childs) {
            if (node.visible())
                await exportNode(node, LayaObj);
        }
        FS.writeFileSync(UI_URL, JSON.stringify(LayaObj, null, 4));
    });
}

function exportNode(node, parent) {
    let exportData = node.export();
    if (node.type == 'group') {
        exportBox(node, parent);
    }
    else if (exportData.text) {
        exportText(node, parent);
    }
    else {
        try {
            return exportPng(node, parent);
        } catch (error) {
            console.log(error)
            console.log("***********************转图出现异常,让美术检查是否该图层需要设置为智能对象，图层名称："+node.name)
            return;
        }
        
    }
}

function exportBox(node, parent) {
    let boxObj = new LAYA_TEMPLETE.Box();
    let xy = getRelativePos(node);
    boxObj.x = xy[0];
    boxObj.y = xy[1];
    boxObj.width = node.width;
    boxObj.height = node.height;
    boxObj.isRoot = node.parent.isRoot()
    boxObj.pname = node.name
    parent.child.push(boxObj);
    let childs = node.children().reverse();
    for (const node of childs) {
        if (node.visible())
            exportNode(node, boxObj);
    }
}

function exportPng(node, parent) {
    let fileName = autoRename ? (FILE_NAME + '_' + id) : node.name
    fileName = fileName.replace(/\//g, '').trim()
    fileName = fileName.trim()
    if(node.layer.image.width() == 0 && node.layer.image.height()==0)
    {
        return;
    }
    let skin = OUTPUT_URL + '/' + fileName + '.png';
    let pngObj = new LAYA_TEMPLETE.Image();
    let xy = getRelativePos(node);
    pngObj.x = xy[0];
    pngObj.y = xy[1];
    pngObj.width = node.width;
    pngObj.height = node.height;
    pngObj.isRoot = node.parent.isRoot()
    pngObj.imgName = fileName + '.png'
    pngObj.opacity = node.layer.opacity / 255
    parent.child.push(pngObj);
    console.log(skin)
    id += 1;
    if(imgDict[skin])
    {
        console.log("======>注意，出现同名图片:"+skin);
        return;
    }
    else{
        imgDict[skin] = true;
        return node.layer.image.saveAsPng(skin);
    }
}

function exportText(node, parent) {
    let txtObj = new LAYA_TEMPLETE.Text();
    let xy = getRelativePos(node);
    let effects = node.get('objectEffects')?.data
    //shadow
    let shaodowObj = FindShadowObj(effects)
    txtObj.shadow = shaodowObj != null
    if (txtObj.shadow) {
        txtObj.shadowColor = getColorFromPSObj(shaodowObj)
        txtObj.shadowDir = shaodowObj.lagl.value
        txtObj.shadowDis = shaodowObj.Dstn.value
    }
    //outline
    txtObj.outline = effects?.FrFX?.enab ? true : false
    if (txtObj.outline) {
        txtObj.outlineColor = getColorFromPSObj(effects.FrFX)
        txtObj.outlineWidth = effects.FrFX["Sz  "].value
    }
    node = node.export();
    txtObj.x = xy[0];
    txtObj.y = xy[1];
    txtObj.width = node.width;
    txtObj.height = node.height;
    txtObj.isRoot = node.parent ? node.parent.isRoot() : false
    txtObj.font = node.text.font.names[0]
    txtObj.fontSize = Math.round(node.text.font.sizes[0] * node.text.transform.yy)
    node.text.font.colors[0].map((c, i) => {
        let s;
        if (i != 3) {
            s = c.toString(16);
            txtObj.color += (s.length == 1 ? '0' + s : s);
        }
    })
    txtObj.text = node.text.value;
    parent.child.push(txtObj);
}

function FindShadowObj(effects) {
    if (!effects)
        return null
    if (effects?.DrSh?.enab)
        return effects?.DrSh
    if (effects.dropShadowMulti) {
        for (const ef of effects.dropShadowMulti) {
            if (ef.class.id == 'DrSh' && ef.enab) {
                return ef
            }
        }
    }
    return null
}

function getColorFromPSObj(obj) {
    let clr = obj["Clr "]
    let arr = [clr["Rd  "], clr["Grn "], clr["Bl  "], obj.Opct.value / 100 * 255]
    let str = ''
    arr.map((c, i) => {
        let s;
        if (i != 4) {
            s = Math.floor(c).toString(16);
            str += (s.length == 1 ? '0' + s : s);
        }
    })
    return str
}

function getRelativePos(node) {
    let xy = [node.left + node.width / 2, node.top + node.height / 2];
    if (!node.parent.isRoot()) {
        let p = node.parent;
        xy[0] -= (p.left + p.width / 2);
        xy[1] -= (p.top + p.height / 2);
    }
    return xy;
}
start().then(() => {
    console.log('输出完成')
})
if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
    process.stdin.on('data', () => process.exit(0));
}