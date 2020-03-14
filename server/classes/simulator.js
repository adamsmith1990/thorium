import uuid from "uuid";
import App from "../app";
import Team from "./teams";
import DamageStep from "./generic/damageStep";
import DamageTask from "./generic/damageTask";
import {Station} from "./stationSet";
import {lowerCase, camelCase} from "change-case";
import {Record, RecordSnippet} from "./records";
import LifeSupport from "./lifeSupport";
class Ambiance {
  constructor(params = {}) {
    this.id = params.id || uuid.v4();
    this.class = "Ambiance";
    this.name = params.name || "Ambiance";
    this.asset = params.asset || "/Sounds/ambiance.ogg";
    this.volume = params.volume || 1;
    this.channel = params.channel || [0, 1];
    this.playbackRate = params.playbackRate || 1;
  }
  update({name, asset, volume, channel, playbackRate}) {
    if (name) this.name = name;
    if (asset || asset === "") this.asset = asset;
    if (volume || volume === 0) this.volume = volume;
    if (channel || channel === 0) this.channel = channel;
    if (playbackRate || playbackRate === 0) this.playbackRate = playbackRate;
  }
}
class Lighting {
  constructor(params = {}) {
    this.class = "Lighting";
    this.intensity = params.intensity || 0;

    // One of 'normal', 'fade', 'shake', 'strobe', 'oscillate'
    this.action = params.action || "normal";
    this.actionStrength = params.actionStrength || 1;
    this.transitionDuration = params.transitionDuration || 1000;

    // If it's null, use the alert color
    this.useAlertColor = params.useAlertColor === false ? false : true;
    this.color = params.color || null;
  }
  update({intensity, action, actionStrength, transitionDuration, color}) {
    if (intensity || intensity === 0) this.intensity = intensity;
    if (action) this.action = action;
    if (actionStrength || actionStrength === 0)
      this.actionStrength = actionStrength;
    if (transitionDuration || transitionDuration === 0)
      this.transitionDuration = transitionDuration;
    if (color || color === null) {
      this.color = color;
      this.useAlertColor = color === null;
    }
  }
}

class RemoteAccess {
  constructor(params = {}) {
    this.id = params.id || uuid.v4();
    this.code = params.code || "";
    this.state = params.state || "sent";
    this.station = params.station || "";
    this.timestamp = params.timestamp || new Date().toISOString();
  }
}
// A separate object for vestigial parts of the ship
class Ship {
  constructor(params = {}, newlyCreated) {
    this.clamps = params.clamps || false; // Detached
    this.ramps = params.ramps || false; // Retracted
    this.airlock = params.airlock || false; // Closed
    this.legs = params.legs || false; //Retracted
    this.bridgeCrew = params.bridgeCrew || 14;
    this.extraPeople = params.extraPeople || 0;
    this.radiation = params.radiation || 0.1;
    this.speed = params.speed || 0;
    this.selfDestructTime = params.selfDestructTime || null;
    this.selfDestructCode = params.selfDestructCode || null;
    this.selfDestructAuto = params.selfDestructAuto || false; // Automatically black out stations when self destructed
    this.remoteAccessCodes = [];
    this.extraSystems = [];
    const codes = params.remoteAccessCodes || [];
    codes.forEach(c => this.remoteAccessCodes.push(new RemoteAccess(c)));

    // Inventory Logs
    this.inventoryLogs = newlyCreated
      ? []
      : params.inventoryLogs
      ? params.inventoryLogs.concat()
      : [];
  }
}

class Assets {
  constructor(params = {}) {
    this.mesh = params.mesh || "/Simulator/default/mesh.obj";
    this.texture = params.texture || "/Simulator/default/texture.jpg";
    this.side = params.side || "/Simulator/default/side.png";
    this.top = params.top || "/Simulator/default/top.png";
    this.logo = params.logo || "/Simulator/default/logo.svg";
    this.bridge = params.bridge || "/Simulator/default/bridge.svg";
  }
}

class SoundEffects {
  constructor(params = {}) {
    this.buttonClick = params.buttonClick || [];
    this.buttonHover = params.buttonHover || [];
    this.cardChange = params.cardChange || [];
    this.notification = params.notification || [];
    this.login = params.login || [];
    this.buttonClickVolume = params.buttonClickVolume || 1;
    this.buttonHoverVolume = params.buttonHoverVolume || 1;
    this.cardChangeVolume = params.cardChangeVolume || 1;
    this.notificationVolume = params.notificationVolume || 1;
    this.loginVolume = params.loginVolume || 1;
  }
}

class TimelineInstance {
  constructor(params = {}) {
    this.id = uuid.v4();
    this.missionId = params.missionId || null;
    this.currentTimelineStep = params.currentTimelineStep || 0;
    this.executedTimelineSteps = params.executedTimelineSteps || [];
  }
  setTimelineStep(step) {
    this.currentTimelineStep = step;
  }
}

export default class Simulator {
  constructor(params = {}, newlyCreated) {
    this.id = params.id || uuid.v4();
    this.name = params.name || "Simulator";
    this.layout = params.layout || "LayoutCorners";
    this.caps = params.caps || false;
    this.hasLegs = params.hasLegs || false;
    this.alertLevel = params.alertLevel || "5";
    this.alertLevelLock = params.alertLevelLock || false;
    this.template = params.template || false;
    this.templateId = params.templateId || null;
    this.class = "Simulator";
    this.assets = new Assets({...params.assets});
    this.soundEffects = new SoundEffects({...params.soundEffects});
    this.stationSet = params.stationSet || null;
    this.stations = [];
    this.exocomps = params.exocomps || 0;
    this.lifeSupport = new LifeSupport(params.lifeSupport || {});
    this.lifeSupport.simulatorId = this.id;

    // Mission Stuff
    this.mission = params.mission || null;
    this.currentTimelineStep = params.currentTimelineStep || 0;
    this.executedTimelineSteps = params.executedTimelineSteps || [];
    this.timelines = [];
    params.timelines &&
      params.timelines.forEach(t =>
        this.timelines.push(new TimelineInstance(t, this.id)),
      );
    this.missionConfigs = params.missionConfigs || {};

    this.bridgeOfficerMessaging =
      params.bridgeOfficerMessaging === false ? false : true;
    this.teams = [];
    this.training = params.training || false;
    this.ship = new Ship({...params.ship}, newlyCreated);
    this.panels = params.panels || [];
    this.commandLines = params.commandLines || [];
    this.triggers = params.triggers || [];
    this.triggersPaused = params.triggersPaused || false;
    this.interfaces = params.interfaces || [];

    params.stations &&
      params.stations.forEach(s => this.stations.push(new Station(s)));
    // Effects Control
    this.lighting = new Lighting({...params.lighting});
    this.ambiance = [];
    if (params.ambiance)
      params.ambiance.forEach(a => this.ambiance.push(new Ambiance(a)));
    this.midiSets = params.midiSets || [];

    this.crackedClients = params.crackedClients || {};
    // The name of the current card which each
    // station is on.
    this.clientCards = params.clientCards || {};

    // Cards assigned to another station from a different station.
    this.stationAssignedCards = params.stationAssignedCards || {};

    this.flipped = params.flipped || false;
    // Set up the teams
    if (params.teams) {
      params.teams.forEach(t => this.teams.push(new Team(t)));
    }
    this.hasPrinter = params.hasPrinter === false ? false : true;

    // Damage reports
    this.stepDamage = params.stepDamage === false ? false : true;
    this.verifyStep = params.verifyStep || false;
    this.requiredDamageSteps = [];
    this.optionalDamageSteps = [];
    params.requiredDamageSteps &&
      params.requiredDamageSteps.forEach(s =>
        this.requiredDamageSteps.push(new DamageStep(s)),
      );
    params.optionalDamageSteps &&
      params.optionalDamageSteps.forEach(s =>
        this.optionalDamageSteps.push(new DamageStep(s)),
      );

    // Task-based damage reports
    this.damageTasks = [];
    params.damageTasks &&
      params.damageTasks.forEach(s => this.damageTasks.push(new DamageTask(s)));

    // Command Lines
    this.commandLineOutputs = {};
    this.commandLineFeedback = {};

    // Records
    this.records = [];
    this.recordSnippets = [];
    params.records &&
      params.records.forEach(r => this.records.push(new Record(r)));
    params.recordSnippets &&
      params.recordSnippets.forEach(r =>
        this.recordSnippets.push(
          new RecordSnippet({...r, simulatorId: this.id}),
        ),
      );
    // For Space EdVentures
    this.spaceEdventuresId = params.spaceEdventuresId || null;
  }
  get alertlevel() {
    const stealthField = App.systems.find(
      s => s.simulatorId === this.id && s.type === "StealthField",
    );
    if (!stealthField) return this.alertLevel;
    if (
      stealthField.changeAlert &&
      stealthField.activated &&
      stealthField.state
    )
      return "p";
    return this.alertLevel;
  }
  set alertlevel(level) {
    this.alertLevel = level;
  }

  trainingMode(tf) {
    this.training = tf;
  }
  rename(name) {
    this.name = name;
  }
  setAlertLevel(alertlevel = "5") {
    if (["5", "4", "3", "2", "1", "p"].indexOf(alertlevel) === -1) {
      return;
    }
    this.alertlevel = alertlevel;
  }
  setAlertLevelLock(lock) {
    this.alertLevelLock = lock;
  }
  setLayout(layout) {
    this.layout = layout;
  }
  setClientCard(client, cardName) {
    this.clientCards[client] = cardName;
  }
  addStationAssignedCard(station, card) {
    const stationCards = this.stationAssignedCards[station];
    this.stationAssignedCards[station] = stationCards
      ? stationCards.concat(card)
      : [card];
  }
  removeStationAssignedCard(cardName) {
    const stationEntry = Object.entries(
      this.stationAssignedCards,
    ).find(([key, value]) => value.find(c => c.name === cardName));
    const station = stationEntry?.[0];
    if (!station) return;

    const stationCards = this.stationAssignedCards[station];
    this.stationAssignedCards[station] = stationCards
      ? stationCards.filter(c => c.name !== cardName)
      : [];
  }

  setTimelineStep(step, timelineId) {
    if (timelineId) {
      this.setAuxTimelineStep(timelineId, step);
    } else {
      this.currentTimelineStep = step;
    }
  }
  executeTimelineStep(stepId) {
    this.executedTimelineSteps.push(stepId);
    this.executedTimelineSteps = this.executedTimelineSteps.filter(
      (a, i, arr) => arr.indexOf(a) === i,
    );
  }
  addAuxTimeline(missionId) {
    const timeline = new TimelineInstance({missionId}, this.id);
    this.timelines.push(timeline);
    return timeline.id;
  }
  setAuxTimelineStep(timelineId, step) {
    const timeline = this.timelines.find(t => t.id === timelineId);
    timeline && timeline.setTimelineStep(step);
  }
  setMissionConfig(missionId, stationSetId, actionId, args) {
    this.missionConfigs[missionId] = this.missionConfigs[missionId] || {};
    this.missionConfigs[missionId][stationSetId] =
      this.missionConfigs[missionId][stationSetId] || {};
    this.missionConfigs[missionId][stationSetId][actionId] = {
      ...this.missionConfigs[missionId][stationSetId][actionId],
      ...args,
    };
  }
  updateLighting(lighting) {
    this.lighting.update(lighting);
  }
  updateAmbiance(ambiance) {
    this.ambiance.find(a => a.id === ambiance.id).update(ambiance);
  }
  addAmbiance(ambiance) {
    this.ambiance.push(new Ambiance(ambiance));
  }
  removeAmbiance(id) {
    this.ambiance = this.ambiance.filter(a => a.id !== id);
  }

  // Ship
  clamps(tf) {
    this.ship.clamps = tf;
  }
  ramps(tf) {
    this.ship.ramps = tf;
  }
  airlock(tf) {
    this.ship.airlock = tf;
  }
  legs(tf) {
    this.ship.legs = tf;
  }
  bridgeCrew(num) {
    this.ship.bridgeCrew = num;
  }
  extraPeople(num) {
    this.ship.extraPeople = num;
  }
  radiation(num) {
    this.ship.radiation = num;
  }
  speed(num) {
    this.ship.speed = num;
  }
  sendCode(code, station) {
    this.ship.remoteAccessCodes.push(new RemoteAccess({code, station}));
  }
  updateCode(codeId, state) {
    this.ship.remoteAccessCodes.find(c => c.id === codeId).state = state;
  }
  setSelfDestructTime(time) {
    this.ship.selfDestructTime = time;
  }
  setSelfDestructCode(code) {
    this.ship.selfDestructCode = code;
  }
  setSelfDestructAuto(tf) {
    this.ship.selfDestructAuto = tf;
  }
  updatePanels(panels) {
    this.panels = panels || [];
  }
  updateCommandLines(commandLines) {
    this.commandLines = commandLines || [];
  }
  updateTriggers(triggers) {
    this.triggers = triggers || [];
  }
  setTriggersPaused(paused) {
    this.triggersPaused = paused;
  }
  updateInterfaces(interfaces) {
    this.interfaces = interfaces || [];
  }
  setAssets(assets) {
    this.assets = new Assets(assets);
  }
  setLifeSupport(lifeSupport) {
    this.lifeSupport = new Assets(lifeSupport);
  }
  setSoundEffects(effects) {
    this.soundEffects = new SoundEffects(effects);
  }
  setHasPrinter(hasPrinter) {
    this.hasPrinter = hasPrinter;
  }
  setHasLegs(hasLegs) {
    this.hasLegs = hasLegs;
  }

  // Damage Steps
  addDamageStep({name, args, type}) {
    this[`${type}DamageSteps`].push(new DamageStep({name, args}));
  }
  updateDamageStep({id, name, args}) {
    const step =
      this.requiredDamageSteps.find(s => s.id === id) ||
      this.optionalDamageSteps.find(s => s.id === id);
    step.update({name, args});
  }
  removeDamageStep(stepId) {
    // Check both required and optional
    this.requiredDamageSteps = this.requiredDamageSteps.filter(
      s => s.id !== stepId,
    );
    this.optionalDamageSteps = this.optionalDamageSteps.filter(
      s => s.id !== stepId,
    );
  }

  // Damage Tasks
  // As a side note, can I just say how much more elegant
  // the damage tasks system is already? Look at this!
  // It's much simpler. Why didn't I do it this
  // way in the first place? ~A
  addDamageTask(task) {
    if (!task || !task.id || this.damageTasks.find(t => t.id === task.id))
      return;
    this.damageTasks.push(new DamageTask(task));
  }
  updateDamageTask(task) {
    this.damageTasks.find(t => t.id === task.id).update(task);
  }
  removeDamageTask(id) {
    this.damageTasks = this.damageTasks.filter(t => t.id !== id);
  }
  hideCard(cardName) {
    const name = lowerCase(camelCase(cardName));
    const cards = this.stations
      ? this.stations.reduce((acc, s) => acc.concat(s.cards), [])
      : [];
    cards.forEach(card => {
      if (
        card &&
        (lowerCase(camelCase(card.name)) === name ||
          lowerCase(camelCase(card.component)) === name)
      ) {
        card.hidden = true;
      }
    });
  }
  unhideCard(cardName) {
    const name = lowerCase(camelCase(cardName));
    const cards = this.stations
      ? this.stations.reduce((acc, s) => acc.concat(s.cards), [])
      : [];
    cards.forEach(card => {
      if (
        card &&
        (lowerCase(camelCase(card.name)) === name ||
          lowerCase(camelCase(card.component)) === name)
      ) {
        card.hidden = false;
      }
    });
  }
  // Command Line
  addCommandLineOutput(clientId, line) {
    if (!this.commandLineOutputs[clientId])
      this.commandLineOutputs[clientId] = [];
    this.commandLineOutputs[clientId].push(line);
  }
  addCommandLineFeedback(clientId, feedback) {
    if (!this.commandLineFeedback[clientId])
      this.commandLineFeedback[clientId] = [];
    this.commandLineFeedback[clientId].push(feedback);
  }
  removeCommandLineFeedback(clientId, id) {
    this.commandLineFeedback[clientId] = this.commandLineFeedback[
      clientId
    ].filter(c => c.id !== id);
  }
  clearCommandLine(clientId) {
    this.commandLineOutputs[clientId] = [];
  }

  crackClient(clientId) {
    this.crackedClients[clientId] = true;
  }
  uncrackClient(clientId) {
    this.crackedClients[clientId] = false;
  }
  flip(flip) {
    this.flipped = flip;
  }

  // Records
  createRecord(record) {
    const r = new Record(record);
    this.records.push(r);
    return r;
  }
  createRecordOnSnippet({
    snippetId,
    snippetName = "",
    contents,
    timestamp = 0,
    category,
  }) {
    const snippet = this.recordSnippets.find(
      s =>
        s.id === snippetId ||
        s.name.toLowerCase() === snippetName.toLowerCase(),
    );

    if (!snippet) return null;

    function isValidDate(d) {
      return d instanceof Date && !isNaN(d);
    }

    // Get the latest record in this snippet and
    // add the timestamp value to it.
    const ts = snippet.records
      .map(r => this.records.find(({id}) => id === r))
      .reduce((acc, record) => {
        const d = new Date(record.timestamp);
        if (!isValidDate(d)) return acc;
        if (acc > d) return acc;
        return d;
      }, 0);

    const record = this.createRecord({
      contents,
      timestamp: new Date(
        new Date(ts).getTime() + Number(timestamp),
      ).toISOString(),
      category,
      snippetId: snippet.id,
    });
    this.addRecordToSnippet(snippet.id, [record.id]);

    return snippet;
  }
  createRecordSnippet(snippet) {
    const s = new RecordSnippet({...snippet, simulatorId: this.id});
    this.recordSnippets.push(s);
    return s.id;
  }
  addRecordToSnippet(snippetId, recordIds) {
    const snippet = this.recordSnippets.find(s => s.id === snippetId);
    snippet.addRecords(recordIds);
  }
  removeRecordFromSnippet(snippetId, recordId) {
    const snippet = this.recordSnippets.find(s => s.id === snippetId);
    snippet.removeRecord(recordId);
  }
  showSnippet(snippetId) {
    const snippet = this.recordSnippets.find(s => s.id === snippetId);
    snippet.visible = true;
    return snippet;
  }
  hideSnippet(snippetId) {
    const snippet = this.recordSnippets.find(s => s.id === snippetId);
    snippet.visible = false;
    return snippet;
  }
  deleteRecord(recordId) {
    this.records = this.records.filter(r => r.id !== recordId);
  }

  setSpaceEdventuresId(id) {
    this.spaceEdventuresId = id;
  }
}
