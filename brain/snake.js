// TODO: Bug Collection
// 1.当向下或者向右移动时，点击反方向控制键，会出现2秒的断点
// 2.正常逻辑为单向行驶，不能倒车. ===>(1 AND 2 BUGS HAS BEEN FIXED)
// 3.吃食物已解决（待优化）
// 4.当在底边时，会立即判断“撞墙”，从而造成游戏结束 (BUGS HAS BEEN FIXED)

// TODO: Later Version
// To Support Touch Move (2016-11-08)
// In this version, this Snake has been support touch move. (2016-11-09)
// 在这个版本中，蛇已经支持手机滑动移动 (2016-11-09)

// TODO:
// bugs:
// 1.触碰到墙壁时游戏结束，点击确定后一直停留于此，修复为点击确定，重新可以开始 （2016-11-16） BUGS FIXED


//check mobile or pc
var mobileAgent = new Array("iphone", "ipod", "ipad", "android", "mobile", "blackberry", "webos", "incognito", "webmate", "bada", "nokia", "lg", "ucweb", "skyfire");
var browser = navigator.userAgent.toLowerCase();
var isMobile = false;
for (var i = 0; i < mobileAgent.length; i++) {
    if (browser.indexOf(mobileAgent[i]) != -1) {
        isMobile = true;
        //location.href = '手机网址';
        break;
    }
}


//global
var gb = {
    cvs: null, //canvas
    ctx: null, //ctx
    ave: 0, //默认的蛇的尺寸（包括宽、高） or 同样也是场景格子尺寸
    cvsWidth: 320, //默认的画布宽度
    cvsHeight: 320, //默认的画布高度
    snake_length: 3, //默认的蛇的长度 最大设置5
    snake_step: 1, //默认的蛇的步长
    sence_showtable: true, //默认显示网格
    sence_food_num: 1, //默认显示食物个数
    sence_food_cret: 0, //已产生的食物数量
    sence_foodX: 0, //食物X坐标
    sence_foodY: 0, //食物Y坐标
    setting_game: false, //默认游戏状态
    setting_speed: 1, //默认速度1 -> 1=>默认速度 、 0.5=>2x速度 、2=>慢2x速度
    setting_score: 0, //所得分数
    ctrl_top: null, //控制-上
    ctrl_left: null, //控制-左
    ctrl_right: null, //控制-右
    ctrl_botton: null, //控制-下
    move_left: false, //是否->左移动
    move_right: false, //是否->右移动
    move_up: false, //是否->上移动
    move_down: false, //是否->下移动
    point: [], //蛇长度
    start_headX: null, //默认起始X点
    start_headY: null, //默认起始Y点 (HAS BEEN DESTORYED)
    game_auto_mode: false, //自动觅食模式(V3发布);
    game_sorce_save: false, //保存成绩(V3发布);
    game_auto_move: false, //自动移动
    // mobile part
    touch_startX: 0, //滑动起始位置X
    touch_startY: 0, //滑动起始位置Y
    touch_endX: 0, //滑动结束位置X
    touch_endY: 0, //滑动结束位置Y
    touch_disX: 0, //滑动X距离
    touch_disY: 0 //滑动Y距离
};

if (isMobile) {
    gb.cvsWidth = 320;
    gb.cvsHeight = 320;
} else {
    gb.cvsWidth = 500;
    gb.cvsHeight = 500;
}

var headIndex;

function init() {
    gb.cvs = document.getElementById("screen");
    gb.ctx = gb.cvs.getContext("2d");
    gb.cvs.width = gb.cvsWidth;
    gb.cvs.height = gb.cvsHeight;
    gb.ave = Math.floor(gb.cvs.width / 30) | 0;
    if (gb.sence_showtable) {
        creSence();
    }
    creFood();
    creSnake();
}

//create sence
function creSence() {
    for (var i = 0; i <= 30; i++) {
        for (var j = 0; j <= 30; j++) {
            gb.ctx.strokeStyle = "#ccc";
            gb.ctx.strokeRect(gb.ave * i, gb.ave * j, gb.ave, gb.ave);
        }
    }
}

//create food
function creFood() {
    for (var i = 0; i < gb.sence_food_num; i++) {
        gb.sence_food_cret++;
        gb.sence_foodX = Math.round(Math.random() * 30);
        gb.sence_foodY = Math.round(Math.random() * 30);
        gb.ctx.restore();
        gb.ctx.save();
        gb.ctx.fillStyle = "#f00";

        //为了避免撞墙而造成游戏结束 处理，待bug调试结束，可删除
        //添加开始
        if (gb.sence_foodX === 0) {
            gb.sence_foodX = gb.sence_foodX + 1;
        } else if (gb.sence_foodX === 30) {
            gb.sence_foodX = gb.sence_foodX - 1;
        }
        if (gb.sence_foodY === 0) {
            gb.sence_foodY = gb.sence_foodY + 1;
        } else if (gb.sence_foodY === 30) {
            gb.sence_foodY = gb.sence_foodY - 1;
        }
        //添加结束

        gb.ctx.fillRect(gb.sence_foodX * gb.ave + 1, gb.sence_foodY * gb.ave + 1, gb.ave - 2, gb.ave - 2);
    }
}

//create Snake
function creSnake() {
    gb.ctx.restore();
    gb.ctx.save();
    //create start point
    gb.start_headX = 2 * gb.ave + 1;
    for (var i = 0; i < gb.snake_length; i++) {
        gb.ctx.fillRect(gb.start_headX, gb.ave * i + 1, gb.ave - 2, gb.ave - 2);
        var point = {
            x: 2,
            y: i
        };
        gb.point.push(point);
    }
    //auto move
    if (gb.game_auto_move) {
        gb.ctrl_botton = setInterval(moveDown, gb.setting_speed * 1000);
    }
}

// Snake Move
function moveDown() {
    gb.ctx.restore();
    gb.ctx.save();
    score();
    if (!gb.setting_game) {
        headIndex = gb.point.length - 1;
        creHead({ x: gb.point[headIndex].x, y: gb.point[headIndex].y + 1 }, "down");
        creaLine();
        cleEnd({ x: gb.point[0].x, y: gb.point[0].y });
    }

}

function moveUp() {
    gb.ctx.restore();
    gb.ctx.save();
    score();
    if (!gb.setting_game) {
        headIndex = gb.point.length - 1;
        creHead({ x: gb.point[headIndex].x, y: gb.point[headIndex].y - 1 }, "up");
        creaLine();
        cleEnd({ x: gb.point[0].x, y: gb.point[0].y });
    }

}

function moveRight() {
    gb.ctx.restore();
    gb.ctx.save();
    score();
    if (!gb.setting_game) {
        headIndex = gb.point.length - 1;
        creHead({ x: gb.point[headIndex].x + 1, y: gb.point[headIndex].y }, "right");
        creaLine();
        cleEnd({ x: gb.point[0].x, y: gb.point[0].y });
    }

}

function moveLeft() {
    gb.ctx.restore();
    gb.ctx.save();
    score();
    if (!gb.setting_game) {
        headIndex = gb.point.length - 1;
        creHead({ x: gb.point[headIndex].x - 1, y: gb.point[headIndex].y }, "left");
        creaLine();
        cleEnd({ x: gb.point[0].x, y: gb.point[0].y });
    }

}

//snake line
function creaLine() {
    gb.ctx.restore();
    gb.ctx.save();
    for (var i = 0; i < gb.point.length; i++) {
        gb.ctx.fillRect(gb.point[i].x * gb.ave + 1, gb.point[i].y * gb.ave + 1, gb.ave - 2, gb.ave - 2);
    }
}

function creHead(points, pm) {
    gb.ctx.restore();
    gb.ctx.save();
    gb.ctx.fillRect(points.x * gb.ave + 1, points.y * gb.ave + 1, gb.ave - 2, gb.ave - 2);
    gb.point.push(points);
    eatFood(points, pm);
}

function cleEnd(points) {
    gb.ctx.restore();
    gb.ctx.save();
    gb.ctx.clearRect(points.x * gb.ave + 1, points.y * gb.ave + 1, gb.ave - 2, gb.ave - 2);
    gb.point = gb.point.slice(1);
}

//eat food
function eatFood(points, pm) {
    gb.ctx.restore();
    gb.ctx.save();
    if (points.x === gb.sence_foodX && points.y === gb.sence_foodY) {
        gb.snake_length = gb.snake_length + 1;
        switch (pm) {
            case "left":
                gb.point.push({ x: points.x - 1, y: points.y });
                break;
            case "up":
                gb.point.push({ x: points.x, y: points.y - 1 });
                break;
            case "right":
                gb.point.push({ x: points.x + 1, y: points.y });
                break;
            case "down":
                gb.point.push({ x: points.x, y: points.y + 1 });
                break;
        }
        if (gb.sence_food_cret > 0) {
            gb.setting_score = gb.setting_score + 10;
            document.getElementById("socre_c").value = gb.setting_score;
        }
        creFood();
    }
}

//getScore
function score() {
    gb.ctx.restore();
    gb.ctx.save();
    // TODO: bug has been fixed
    if (gb.point[gb.snake_length - 1].y === 30 || gb.point[gb.snake_length - 1].y === 0 || gb.point[gb.snake_length - 1].x === 30 || gb.point[gb.snake_length - 1].x === 0) {
        alert("得分:" + gb.setting_score + "分");
        clearAll();
        gb.setting_game = true;
        window.location.reload(this);
    }
}

//switch in PC and Mobile
if (isMobile) {
    document.addEventListener("touchstart", touch, false);
    document.addEventListener("touchmove", touch, false);
    document.addEventListener("touchend", touch, false);
} else {
    document.onkeydown = function(e) {
        switch (e.keyCode) { //suport W A S D and Direction key control
            case 37:
            case 65: //left
                ToleftMove();
                break;
            case 38:
            case 87: //up
                ToUpMove();
                break;
            case 39:
            case 68: //right
                ToRightMove();
                break;
            case 40:
            case 83: //down
                ToDownMove();
                break;
        }
    };
}

function clearAll() {
    clearInterval(gb.ctrl_top);
    clearInterval(gb.ctrl_left);
    clearInterval(gb.ctrl_right);
    clearInterval(gb.ctrl_botton);
}

//-----------------------------------------------------------device - mobile------------------------------------------------------------//
function touch(e) {
    e.preventDefault();
    switch (e.type) {
        case "touchstart":
            T_start(e.touches[0]);
            break;
        case "touchmove":
            T_move(event.touches[0]);
            break;
        case "touchend":
            T_end();
            break;
    }
}

function T_start(ex) {
    gb.touch_startX = ex.pageX;
    gb.touch_startY = ex.pageY;
}

function T_move(ex) {
    gb.touch_endX = ex.pageX;
    gb.touch_endY = ex.pageY;
}

function T_end(ex) {
    gb.touch_disX = gb.touch_startX - gb.touch_endX;
    gb.touch_disY = gb.touch_startY - gb.touch_endY;
    console.log(gb.touch_disX, gb.touch_disY);
    // TODO:
    //此处暂且定义 当X轴大于或小于正负100时为左右滑动
    //此处暂且定义 当Y轴大于或小于正负100时为左右滑动
    if (gb.touch_disX < -100 && (-100 < gb.touch_disY < 100)) { // right
        ToRightMove();
    } else if (gb.touch_disX > 100 && (-100 < gb.touch_disY < 100)) { //left
        ToleftMove();
    }
    if (gb.touch_disY > 100 && (-100 < gb.touch_disX < 100)) { //up
        ToUpMove();
    } else if (gb.touch_disY < -100 && (-100 < gb.touch_disX < 100)) { //down
        ToDownMove();
    }
}

//---------------------------public method--------------------------------------------------------------------------------------------------------------------------//
function ToleftMove() {
    if (!gb.move_right) {
        gb.move_left = true;
        gb.move_up = gb.move_down = false;
        moveLeft();
        clearAll();
        gb.ctrl_left = setInterval(moveLeft, gb.setting_speed * 1000);
    }
}

function ToRightMove() {
    if (!gb.move_left) {
        gb.move_right = true;
        gb.move_up = gb.move_down = false;
        moveRight();
        clearAll();
        gb.ctrl_right = setInterval(moveRight, gb.setting_speed * 1000);
    }
}

function ToUpMove() {
    if (!gb.move_down) {
        gb.move_up = true;
        gb.move_left = gb.move_right = false;
        moveUp();
        clearAll();
        gb.ctrl_top = setInterval(moveUp, gb.setting_speed * 1000);
    }
}

function ToDownMove() {
    if (!gb.move_up) {
        gb.move_down = true;
        gb.move_left = gb.move_right = false;
        moveDown();
        clearAll();
        gb.ctrl_botton = setInterval(moveDown, gb.setting_speed * 1000);
    }
}