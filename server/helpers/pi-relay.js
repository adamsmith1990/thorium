import Axios from "axios";
import {waterTankMax, oxygenTankMax} from "../processes/environment-params.js";

const PI_PORT = 8080;
const PI_URL = "http://192.168.1.137";

function normalize(value, max) {
  return parseInt((value / max) * 10);
}

export function updatePi(lifeSupportSystem) {
  var lss = lifeSupportSystem;
  return Axios.post(`${PI_URL}:${PI_PORT}/data`, {
    water: normalize(lss.waterTank, waterTankMax),
    oxygen: normalize(lss.oxygenTank, oxygenTankMax),
  })
    .then(response => {
      // console.log("Updated data on pi");
    })
    .catch(err => {
      console.error(err);
    });
}

export default updatePi;
