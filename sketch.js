

// --------------------------------------------------
// Hash
// --------------------------------------------------

function genTokenData(projectNum) {
  let data = {};
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  data.hash = hash;
  data.tokenId = (
    projectNum * 1000000 +
    Math.floor(Math.random() * 1000)
  ).toString();
  return data;
}  // generate token hash
let tokenData = genTokenData(1);
let hash = tokenData.hash;
// console.log(hash);
let tokenId = tokenData.tokenId;
// let mintNumber = parseInt(tokenData.tokenId) % 1000000;
// let projectNumber = Math.floor(parseInt(tokenData.tokenId) / 1000000);


// --------------------------------------------------
// Classes
// --------------------------------------------------

class Random {
  constructor() {
    this.useA = false;
    let sfc32 = function (uint128Hex) {
      let a = parseInt(uint128Hex.substring(0, 8), 16);
      let b = parseInt(uint128Hex.substring(8, 16), 16);
      let c = parseInt(uint128Hex.substring(16, 24), 16);
      let d = parseInt(uint128Hex.substring(24, 32), 16);
      return function () {
        a |= 0;
        b |= 0;
        c |= 0;
        d |= 0;
        let t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
      };
    };
    // seed prngA with first half of tokenData.hash
    this.prngA = new sfc32(tokenData.hash.substring(2, 34));
    // seed prngB with second half of tokenData.hash
    this.prngB = new sfc32(tokenData.hash.substring(34, 66));
    for (let i = 0; i < 1e6; i += 2) {
      this.prngA();
      this.prngB();
    }
  }
  // random number between 0 (inclusive) and 1 (exclusive)
  random_dec() {
    this.useA = !this.useA;
    return this.useA ? this.prngA() : this.prngB();
  }
  // random number between a (inclusive) and b (exclusive)
  random_num(a, b) {
    return a + (b - a) * this.random_dec();
  }
  // random integer between a (inclusive) and b (inclusive)
  // requires a < b for proper probability distribution
  random_int(a, b) {
    return Math.floor(this.random_num(a, b + 1));
  }
  // random boolean with p as percent liklihood of true
  random_bool(p) {
    return this.random_dec() < p;
  }
  // random value in an array of items
  random_choice(list) {
    return list[this.random_int(0, list.length - 1)];
  }
} // derive randomness from token hash
let R = new Random();
const seed = R.random_dec()*9999999;

class Points {
    constructor(rows, columns, wid, hei) {
        this.rows = rows;
        this.columns = columns;
        this.width = wid;
        this.height = hei;
        this.x = wid/columns;
        this.y = hei/rows;
        this.gridPoints = this.gridPoints();
    }

    // given rows, columns, width, and height, return an array of points, that form a grid
    gridPoints() {
        let points = [];
        for (let row = 0; row <= this.rows; row++) {
            for (let col = 0; col <= this.columns; col++) {
                let xx = this.x * col;
                let yy = this.y * row;
                let pt = new Point(xx, yy, col, row)
                points.push(pt);
            }
        }
        return points;
    }

    // given a column, row, and array of points, return a point
    getPoint(co, ro) {
        for (let i of this.gridPoints) {
            if ((i.col == co) && (i.row == ro)) {
                return (i)
            }
        }
    }
} // grid

class Point {   
    constructor(x, y, col, row) {
        this.x = x;
        this.y = y;
        this.col = col;
        this.row = row;
    }

    display(clr, maxCanv) {
        strokeWeight(0);
        let d = random(1, 6)*maxCanv*0.0015;
        let w = color(clr);
        w.setAlpha(120);
        fill(w)
        circle(this.x, this.y, d)
    }
}  // given (x, y, col, row), draw a circle


// --------------------------------------------------
// Functions
// --------------------------------------------------

function borderPoints(q) {
    let borderPoints = [];
  
    //bottom border
    for (let column = (grid.columns - 1); column >= 0; column--) {
        pt = grid.getPoint(column, grid.rows)
        pt.border = 'bottom'
        borderPoints.push(pt)
    }
  
    //right border
    for (let row = 1; row <= grid.rows; row++) {
        pt = grid.getPoint(grid.columns, row)
        pt.border = 'right'
        borderPoints.push(pt)
    }

    //top border
    for (let column = 1; column <= grid.columns; column++) {
        pt = grid.getPoint(column, 0)
        pt.border = 'top'
        borderPoints.push(pt)
    }

    //left border
    for (let row = (grid.rows - 1); row >= 0; row--) {
        pt = grid.getPoint(0, row)
        pt.border = 'left'
        borderPoints.push(pt)
    }

    return borderPoints;
}  // given a grid, return array of (top, bottom, right, and left) border points

function circlee(grid, cPt, r) {
    let circlePoints = [];

    for (let j of grid.gridPoints) {
        d = dist(j.col, j.row, cPt.col, cPt.row)
        if (d < r) {
            circlePoints.push(j)
        }
    }
    return circlePoints;
}  // given a grid, center point, and radius, return an array of points that form a circle around the center point, based on radius 

function secondPoint(pt0) {  // given a border point, return another border point from a different border
    differentBorder = false;
    while (!differentBorder) {
        pt1 = random(borderPts)
        if (pt1.border != pt0.border) {
          differentBorder = true;
        }
    }
    return pt1
}

function intersection(p0, p1, circlePoints) {
    for (let i of circlePoints) {
        d = distance(i.col, i.row, p0.col, p0.row, p1.col, p1.row)
        if (d < 1) {
            return true
        }
    }
    return false
}  // given two border points and a circle point, determine if a line drawn from the border points would intersect the circle point

function distance(x, y, x1, y1, x2, y2) {  
    let A = x - x1;
    let B = y - y1;
    let C = x2 - x1;
    let D = y2 - y1;

    let dot = A * C + B * D;
    let len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    let dx = x - xx;
    let dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
} // calculate the distance between a point (x, y) and two points that form a line (x1, y1) (x2, y2)

// window.windowResized = () => {
//   start();
// };

function windowResized() {
  start();
}

// --------------------------------------------------
// Colour Palettes
// --------------------------------------------------

lollipopLove = [
  ["#CFFFFE", "#F9F7D9", "#FCE2CE", "#FFC1F3"],
  ["#FB929E", "#FFDFDF", "#FFF6F6", "#AEDEFC"],
  ["#BE8ABF", "#EA9ABB", "#FEA5AD", "#F8C3AF"],
  ["#A8E6CF", "#FDFFAB", "#FFD3B6", "#FFAAA5"],
  ["#A1EAFB", "#FDFDFD", "#FFCEF3", "#CABBE9"],
  ["#FD8A8A", "#F1F7B5", "#A8D1D1", "#9EA1D4"]
];
brewedBeans = [
  ["#1A120B", "#3C2A21", "#D5CEA3", "#E5E5CB"],
  ["#E0D8B0", "#FCFFE7", "#DEA057", "#CE9461"],
  ["#8E3200", "#A64B2A", "#D7A86E", "#FFEBC1"],
  ["#FDEFEF", "#F4DFD0", "#DAD0C2", "#CDBBA7"],
  ["#EEB76B", "#E2703A", "#9C3D54", "#310B0B"],
  ["#E6E6E6", "#C5A880", "#532E1C", "#0F0F0F"]
];
blackbird = [
  ["#000000", "#3E065F", "#700B97", "#8E05C2"],
  ["#2B2E4A", "#E84545", "#903749", "#53354A"],
  ["#212121", "#323232", "#0D7377", "#14FFEC"],
  ["#2B2E4A", "#E84545", "#903749", "#53354A"],
  ["#222831", "#393E46", "#FFD369", "#EEEEEE"],
  ["#000000", "#150050", "#3F0071", "#FB2576"] 
];
timelessBeauty = [
  ["#F38181", "#FCE38A", "#EAFFD0", "#95E1D3"],
  ["#A8D8EA", "#AA96DA", "#FCBAD3", "#FFFFD2"],
  ["#FFB6B9", "#FAE3D9", "#BBDED6", "#61C0BF"],
  ["#BAD7DF", "#FFE2E2", "#F6F6F6", "#99DDCC"],
  ["#B5EAEA", "#EDF6E5", "#FFBCBC", "#F38BA0"],
  ["#FCF8E8", "#D4E2D4", "#ECB390", "#DF7861"]
];
cheekyCupcake = [
  ["#0079FF", "#00DFA2", "#F6FA70", "#FF0060"], 
  ["#00B8A9", "#F8F3D4", "#F6416C", "#FFDE7D"],
  ["#52006A", "#CD113B", "#FF7600", "#FFA900"],
  ["#53BF9D", "#F94C66", "#BD4291", "#FFC54D"],
  ["#EB5353", "#F9D923", "#36AE7C", "#187498"],
  ["#D61355", "#F94A29", "#FCE22A", "#30E3DF"]
];
ripeHarvest = [
  ["#FEFFDE", "#DDFFBC", "#91C788", "#52734D"],
  ["#AC4425", "#224B0C", "#C1D5A4", "#F0F2B6"],
  ["#5F7161", "#6D8B74", "#EFEAD8", "#D0C9C0"],
  ["#213363", "#17594A", "#8EAC50", "#D3D04F"],
  ["#4C4B16", "#898121", "#E7B10A", "#F7F1E5"],
  ["#F97B22", "#FEE8B0", "#9CA777", "#7C9070"]
];
bubblyBreeze = [
  ["#E4F9F5", "#30E3CA", "#11999E", "#40514E"],
  ["#1B262C", "#0F4C75", "#3282B8", "#BBE1FA"],
  ["#364F6B", "#3FC1C9", "#F5F5F5", "#FC5185"],
  ["#48466D", "#3D84A8", "#46CDCF", "#ABEDD8"],
  ["#6FE7DD", "#3490DE", "#6639A6", "#521262"],
  ["#192f9f", "#213ed7", "#8395ec", "#cad2f7"]
];
sunKissed = [
  ["#F67280", "#C06C84", "#6C5B7B", "#355C7D"],
  ["#F9ED69", "#F08A5D", "#B83B5E", "#6A2C70"],
  ["#F67280", "#C06C84", "#6C5B7B", "#355C7D"],
  ["#2D4059", "#EA5455", "#F07B3F", "#FFD460"],
  ["#630606", "#890F0D", "#E83A14", "#D9CE3F"],
  ["#155263", "#FF6F3C", "#FF9A3C", "#FFC93C"]
];
canvas1 = [lollipopLove, brewedBeans, blackbird, timelessBeauty, cheekyCupcake, ripeHarvest, bubblyBreeze, sunKissed];

frame1 = ["#404258", "#404258", "#404258", "#404258"];
frame2 = ["#FEFCF3", "#FEFCF3", "#FEFCF3", "#FEFCF3"];
frame3 = ["#0E2954", "#404258", "#0E2954", "#072227"];
canvas2 = [frame1, frame2, frame3];

// promotional = [
//   ["#00235B", "#E21818", "#FFDD83", "#98DFD6"],
//   ["#37E2D5", "#590696", "#C70A80", "#FBCB0A"],
//   ["#DEFCF9", "#CADEFC", "#C3BEF0", "#CCA8E9"],
//   ["#CAF7E3", "#EDFFEC", "#F6DFEB", "#E4BAD4"],
//   ["#F2D7D9", "#D3CEDF", "#9CB4CC", "#748DA6"],
//   ["#FFC7C7", "#FFE2E2", "#F6F6F6", "#8785A2"]
// ];
  

// --------------------------------------------------
// Features
// --------------------------------------------------

// --------------------------------------------------
// Palette Feature
// --------------------------------------------------

let i = R.random_int(0, 7);
let q = R.random_int(0, 5);
let u = R.random_int(0, 3);
let palette = canvas1[i];  
let paletteName = "BS!";
  if (palette == lollipopLove) {
    paletteName = "Lollipop Love";
  } else if (palette == brewedBeans) {
    paletteName = "Brewed Beans";
  } else if (palette == blackbird) {
    paletteName = "Blackbird";
  } else if (palette == timelessBeauty) {
    paletteName = "Timeless Beauty";
  } else if (palette == cheekyCupcake) {
    paletteName = "Cheeky Cupcake";
  } else if (palette == bubblyBreeze) {
    paletteName = "Bubbly Breeze";
  } else if (palette == sunKissed) {
    paletteName = "Sun-kissed";
  } else {
    paletteName = "Ripe Harvest";
  }
let pSet = canvas1[i][q];
let pColour = canvas1[i][q][u];
//console.log(pSet);
//console.log(pColour);

// promotional
// let pSet = promotional[q];
// let pColour = promotional[q][u];

// --------------------------------------------------
// Health Feature
// --------------------------------------------------

let crows = 0;
let x = R.random_dec();
let healthName = "BS!";
  if (x < 0.6) {
     crows = 80;
     healthName = "Chaos";
   } else if (x < 0.95) {
     crows = 40;
     healthName = "Control";
   } else {
     crows = 15;
     healthName = "Order";
   }
//console.log(healthName);
//console.log(crows);

// --------------------------------------------------
// Circle Feature
// --------------------------------------------------

let radius = 0;
  if (crows == 80) {
    radius = R.random_int(40, crows) / 2;
  } else if (crows == 40) {
    radius = R.random_int(20, crows) / 2;
  } else {
    radius = R.random_int(1, crows) / 2;
  }
let circleSize = "BS!";
  if (crows/radius < 2.6) {
      circleSize = "Large";
  } else if (crows/radius < 4) {
      circleSize = "Medium";
  } else {
      circleSize = "Small";
  }
//console.log(radius);
//console.log(circleSize);

// --------------------------------------------------
// Frame Feature
// --------------------------------------------------

let l = R.random_int(0, 2);
let z = R.random_int(0, 3);
let frame = canvas2[l];  
let frameName = "BS!";
  if (frame == frame1) {
    frameName = "Yep!";
  } else if (frame == frame2) {
    frameName = "Nope!";
  } else {
    frameName = "Yep!";
  }
let fColour = canvas2[l][z];
// console.log(frameName);
// console.log(fColour);


// --------------------------------------------------
// Canvas
// --------------------------------------------------

function setup() {
  start();
}

function start() {
  randomSeed(seed);
  
  // canvas
  let w = window.innerWidth*2;
  let h = ((window.innerWidth/3)*4)*2;
  let maxCanv = Math.min(window.innerWidth, window.innerHeight);
  createCanvas(w, h);
  if (height > windowHeight) {
    resizeCanvas((windowHeight / 4) * 3, windowHeight);
  }
  background(51);
  
  // background
  fill(pColour);
  rect(0, 0, width, height);
  
  // grid
  grid = new Points(crows, crows, width, height);

  // border points
  borderPts = borderPoints(grid);
 
  // circle points
  center = int(random(0, grid.gridPoints.length));
  circlePoints = circlee(grid, grid.gridPoints[center], radius);
  for (let e of circlePoints) {
        clr = random(pSet);
        e.display(clr, maxCanv);
    }
  
  // lines
  for (v = 0; v < 3; v++) {
       for (const [key, pt0] of borderPts.entries()) {
          strokeWeight(1*maxCanv*0.002)
          stroke(random(pSet))
          pt1 = secondPoint(pt0)
          if (!intersection(pt0, pt1, circlePoints)) {
               line(pt0.x, pt0.y, pt1.x, pt1.y)
          }
        }
  }  // given two border points and a circle point, draw a line between both border points as long as that line doesn't intersect the circle point
  
  // more lines
  for (v = 0; v < 100; v++) {
       
       let t = random();
       if (t < 0.5) {
         t = 1;
       } else if (t < 0.7) {
         t = 2;
       } else if (t < 0.9) {
         t = 3;
       } else {
         t = 5;
       }
       strokeWeight(t*maxCanv*0.002)
       stroke(random(pSet))
       pt0 = random(borderPts);
       pt1 = secondPoint(pt0)
       if (!intersection(pt0, pt1, circlePoints)) {
            line(pt0.x, pt0.y, pt1.x, pt1.y)
          }
        }
  
  // border
  strokeWeight(maxCanv*0.035);
  stroke(fColour);
  noFill();
  rect(0, 0, width, height)
  
}


  








  






