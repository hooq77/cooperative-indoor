const model = require('./sequelize');
const wkx = require('wkx');
function validateBuilding(building, callback) {

}
function findBuilding(){
  let geometry = wkx.
  model.User.findAll().then((res) => {
    console.log(res.length)
    console.log(res[0].name)
  })
}
findBuilding();
function creatBuilding(building) {
  Building.create(building).then(res => {
  
  })
}