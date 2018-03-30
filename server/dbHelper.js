const model = require('./sequelize').Building;

function validateBuilding(building, callback) {

}
function findBuilding(){
  model.sequelize.sync().then((res) => {
    model.User.
  })
}

function creatBuilding(building) {
  Building.create(building).then(res => {
  
  })
}