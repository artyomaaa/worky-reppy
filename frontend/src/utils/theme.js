module.exports = {
  Color: {
    green: '#64ea91',
    blue: '#8fc9fb',
    purple: '#d897eb',
    red: '#f69899',
    yellow: '#f8c82e',
    peach: '#f797d6',
    borderBase: '#e5e5e5',
    borderSplit: '#f4f4f4',
    grass: '#d6fbb5',
    sky: '#c1e0fc',
  },
  isColorLikeWhite(hashColor){
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (hashColor.length === 4) {
      r = "0x" + hashColor[1] + hashColor[1];
      g = "0x" + hashColor[2] + hashColor[2];
      b = "0x" + hashColor[3] + hashColor[3];

      // 6 digits
    } else if (hashColor.length === 7) {
      r = "0x" + hashColor[1] + hashColor[2];
      g = "0x" + hashColor[3] + hashColor[4];
      b = "0x" + hashColor[5] + hashColor[6];
    }
    let sumColor = (+r) + (+g) + (+b);
    return sumColor > 632;
  }
};
