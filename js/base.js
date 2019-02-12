//Global Variables
var gv_timer = 300000,
  gv_count = 0,
  scanStatus;
var alert1 = document.getElementById("myAudio");



function u3() {
  var lvref = Math.abs(parseInt(document.getElementById("par2").value));
  gv_timer = lvref * 60 * 1000;
}

function u4() {
  if (document.getElementById("par5").checked) {
    runScanner();
  } else {
    clearInterval(scanStatus);
  }
}

function runScanner() {
  scanBinance();
  scanStatus = setInterval(runScanner, gv_timer);
}

function scanBinance() {
  var r1 = new XMLHttpRequest();
  var url = 'https://cors-anywhere.herokuapp.com/https://api.binance.com/api/v3/ticker/bookTicker'
  r1.open('GET', url, true);
  r1.setRequestHeader('Original', url)
  r1.onload = function () {
    identifyArbitrage(r1.responseText);
  }
  r1.send();
}

function identifyArbitrage(data) {
  var d1 = JSON.parse(data);
  var gv_sym = [],
    gv_resp = {},
    gv_final = [],
    lv_calc1 = 0,
    lv_calc2 = 0,
    lv_calc3 = 0,
    lv_str1 = '',
    lv_str2 = '',
    lv_str3 = '',
    lv_alert = '';

  //Convert JSON Array into JSON
  for (i = 0; i < d1.length; i++) {
    gv_resp[d1[i]["symbol"]] = d1[i];
    var lv_sym = d1[i]["symbol"];
    if (lv_sym.substring(lv_sym.length - 4, lv_sym.length) == 'USDT') {
      gv_sym.push(lv_sym.substring(0, lv_sym.length - 4));
      gv_sym.push(lv_sym.substring(lv_sym.length - 4, lv_sym.length));
    } else {
      gv_sym.push(lv_sym.substring(0, lv_sym.length - 3));
      gv_sym.push(lv_sym.substring(lv_sym.length - 3, lv_sym.length));
    }
  }

  //Get Unique symbols
  var gv_sym = gv_sym.filter(onlyUnique);

  for (i = 0; i < gv_sym.length; i++) {
    for (j = 0; j < gv_sym.length; j++) {
      for (k = 0; k < gv_sym.length; k++) {
        if (!(gv_sym[i] == gv_sym[j] || gv_sym[j] == gv_sym[k] || gv_sym[k] == gv_sym[i])) { //All 3 symbols are different

          var lv1 = [],
            lv2 = [],
            lv3 = [];
          //Level 1
          if (gv_resp[gv_sym[i] + gv_sym[j]]) {
            lv1.push(gv_sym[i] + gv_sym[j]);
          }
          if (gv_resp[gv_sym[j] + gv_sym[i]]) {
            lv1.push(gv_sym[j] + gv_sym[i]);
          }

          //Level 2
          if (gv_resp[gv_sym[j] + gv_sym[k]]) {
            lv2.push(gv_sym[j] + gv_sym[k]);
          }
          if (gv_resp[gv_sym[k] + gv_sym[j]]) {
            lv2.push(gv_sym[k] + gv_sym[j]);
          }

          //Level 3
          if (gv_resp[gv_sym[i] + gv_sym[k]]) {
            lv3.push(gv_sym[i] + gv_sym[k]);
          }
          if (gv_resp[gv_sym[k] + gv_sym[i]]) {
            lv3.push(gv_sym[k] + gv_sym[i]);
          }

          //Loop through all combinations
          for (l = 0; l < lv1.length; l++) {

            //Check buy/sell
            //If i is at the beginning then sell otherwise buy
            if (parseFloat(gv_resp[lv1[l]]["bidPrice"])) {
              if (lv1[l].substring(0, gv_sym[i].length) == gv_sym[i]) {
                lv_calc1 = parseFloat(gv_resp[lv1[l]]["bidPrice"]);
                lv_str1 = gv_sym[i] + '->' + lv1[l] + "['bidP']['" + gv_resp[lv1[l]]["bidPrice"] + "']" + '->' + gv_sym[j] + '<br/>';
              } else {
                lv_calc1 = parseFloat(1 / gv_resp[lv1[l]]["askPrice"]);
                lv_str1 = gv_sym[i] + '->' + lv1[l] + "['askP']['" + gv_resp[lv1[l]]["askPrice"] + "']" + '->' + gv_sym[j] + '<br/>';
              }

              for (m = 0; l < lv2.length; l++) {

                //Check if buy/sell
                //If j is at the beginning then sell otherwise buy
                if (parseFloat(gv_resp[lv2[m]]["bidPrice"])) {
                  if (lv2[m].substring(0, gv_sym[j].length) == gv_sym[j]) {
                    lv_calc2 = lv_calc1 * parseFloat(gv_resp[lv2[m]]["bidPrice"]);
                    lv_str2 = lv_str1 + gv_sym[j] + '->' + lv2[m] + "['bidP']['" + gv_resp[lv2[m]]["bidPrice"] + "']" + '->' + gv_sym[k] + '<br/>';
                  } else {
                    lv_calc2 = parseFloat(lv_calc1 / gv_resp[lv2[m]]["askPrice"]);
                    lv_str2 = lv_str1 + gv_sym[j] + '->' + lv2[m] + "['askP']['" + gv_resp[lv2[m]]["askPrice"] + "']" + '->' + gv_sym[k] + '<br/>';
                  }

                  for (n = 0; l < lv3.length; l++) {

                    //Check if buy/sell
                    //If k is at the beginning then sell otherwise buy
                    if (parseFloat(gv_resp[lv3[n]]["bidPrice"])) {
                      if (lv3[n].substring(0, gv_sym[k].length) == gv_sym[k]) {
                        lv_calc3 = lv_calc2 * parseFloat(gv_resp[lv3[n]]["bidPrice"]);
                        lv_str3 = lv_str2 + gv_sym[k] + '->' + lv3[n] + "['bidP']['" + gv_resp[lv3[n]]["bidPrice"] + "']" + '->' + gv_sym[i];
                      } else {
                        lv_calc3 = parseFloat(lv_calc2 / gv_resp[lv3[n]]["askPrice"]);
                        lv_str3 = lv_str2 + gv_sym[k] + '->' + lv3[n] + "['askP']['" + gv_resp[lv3[n]]["askPrice"] + "']" + '->' + gv_sym[i];
                      }

                      //Update gv_final JSON
                      //gv_final[lv_str3] = parseFloat(parseFloat((lv_calc3 - 1)*100).toFixed(3));
                      gv_final.push({
                        "seq": lv_str3,
                        "pct": parseFloat(parseFloat((lv_calc3 - 1) * 100).toFixed(3))
                      });

                    }
                  }
                }
              }
            }
          }

        }
      }
    }
  }

  //Sort descending
  gv_final = sortByKey(gv_final, 'pct');
  gv_final.reverse();


  //Empty existing rows
  $("#tartbit tbody").html("");

  //Get Max Rows
  gv_count = parseInt(document.getElementById("par1").value);

  //Add new rows
  var lv_sno = 0;
  for (i = 0; i <= gv_count - 1; i++) {
    var markup = '';
    lv_sno++;

    //Alert
    if (gv_final[i]["pct"] >= parseFloat(document.getElementById("par4").value)) {
      lv_alert = 'X';
    }

    if (gv_final[i]["pct"] > 0.225) { //Binance Fees 0.075% per trade. Total = 0.075*3=0.225
      markup = "<tr class='table-success'><td>" + lv_sno + "</td><td>" + gv_final[i]["seq"] + "</td><td>" + gv_final[i]["pct"] + "</td></tr>";
    } else if (gv_final[i]["pct"] > 0) { //Binance Fees 0.075% per trade. Total = 0.075*3=0.225
      markup = "<tr class='table-warning'><td>" + lv_sno + "</td><td>" + gv_final[i]["seq"] + "</td><td>" + gv_final[i]["pct"] + "</td></tr>";
    } else {
      markup = "<tr class='table-danger'><td>" + lv_sno + "</td><td>" + gv_final[i]["seq"] + "</td><td>" + gv_final[i]["pct"] + "</td></tr>";
    }
    $("#tartbit tbody").append(markup);
  }


  if (lv_alert && document.getElementById("par3").checked) {
    alert1.play();
  }

}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}
