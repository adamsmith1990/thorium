import App from '../../app.js';

export const SystemsQueries = {
  systems(rootValue, {simulatorId, type}){
    let returnSystems = App.systems;
    if (simulatorId) {
      returnSystems = returnSystems.filter(s => s.simulatorId === simulatorId);
    }
    if (type) {
      returnSystems = returnSystems.filter(s => s.type === type);
    }
    return returnSystems;
  }
};

export const SystemsMutations = {
  addSystemToSimulator(rootValue, params) {
    App.handleEvent(params, 'addSystemToSimulator');
  },
  removeSystemFromSimulator(rootValue, params) {
    App.handleEvent(params, 'removeSystemFromSimulator');
  },
  damageSystem(rootValue, params) {
    App.handleEvent(params, 'damageSystem');
  },
  repairSystem(rootValue, params) {
    App.handleEvent(params, 'repairSystem');
  },
  changePower(rootValue, params) {
    App.handleEvent(params, 'changePower');
  }
};

export const SystemsSubscriptions = {
  systemsUpdate(rootValue, {simulatorId, type}){
    let returnSystems = rootValue;
    if (simulatorId) {
      returnSystems = returnSystems.filter(s => s.simulatorId === simulatorId);
    }
    if (type) {
      returnSystems = returnSystems.filter(s => s.type === type);
    }
    return returnSystems;
  }
};

export const SystemsTypes = {
  SystemUnion: {
    __resolveType(obj, context, info) {
      return obj.type || null;
    }
  }
}