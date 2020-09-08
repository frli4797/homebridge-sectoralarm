
const sectoralarm = require("sectoralarm");

module.exports = (api) => {
    api.registerAccessory('ESectoralarmAccessoryPlugin', SectoralarmAccessory);
  };
  
  class SectoralarmAccessory {
  
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
  
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
  
        // extract name from config
        this.name = config.name;

        this.currentState;
  
        // create a new Security System service
        this.service = new this.Service(this.Service.SecuritySystem);
  
        // create handlers for required characteristics
        this.service.getCharacteristic(this.Characteristic.SecuritySystemCurrentState)
          .on('get', this.handleSecuritySystemCurrentStateGet.bind(this));
  
        this.service.getCharacteristic(this.Characteristic.SecuritySystemTargetState)
          .on('get', this.handleSecuritySystemTargetStateGet.bind(this))
          .on('set', this.handleSecuritySystemTargetStateSet.bind(this));
  
    }
  
    /**
     * Handle requests to get the current value of the "Security System Current State" characteristic
     */
    handleSecuritySystemCurrentStateGet(callback) {
      this.log.debug('Triggered GET SecuritySystemCurrentState');
  
        sectoralarm.connect(email,password,siteId)
        .then(site => {
            return site.status();
        })
        .then(siteStatus => {
            status = JSON.parse(siteStatus);
            this.log.debug("Armed state: " + status.armedStatus);
            translatedSate = translateToState(status.armedStatus);
            callback(null, translatedSate);   
        })
        .catch(error => {
            this.log.error(error.message);
            this.log.error(error.code);
            callback(error);
        });
    }
  
  
    /**
     * Handle requests to get the current value of the "Security System Target State" characteristic
     */
    handleSecuritySystemTargetStateGet(callback) {
      this.log.debug('Triggered GET SecuritySystemTargetState');
  
      // set this to a valid value for SecuritySystemTargetState
      const currentValue = 1;
  
      callback(null, currentValue);
    }
  
    /**
     * Handle requests to set the "Security System Target State" characteristic
     */
    handleSecuritySystemTargetStateSet(value, callback) {
      this.log.debug('Triggered SET SecuritySystemTargetState:' + value);
  
      callback(null);
    }

    /**
     * Translating from a Sectoralarm state to SecuritySystemTargetState.
     * @param {Sectoralarm} aState 
     */
    translateToState(aState) {

        this.log.debug("translateToState() State is " + aState);
    
        // 0 -  Characteristic.SecuritySystemTargetState.STAY_ARM:
        // 1 -  Characteristic.SecuritySystemTargetState.AWAY_ARM:
        // 2-   Characteristic.SecuritySystemTargetState.NIGHT_ARM:
        // 3 -  Characteristic.SecuritySystemTargetState.DISARM:
        var translatedSate = "UNKNOWN";
    
        switch (String(aState)) {
        case "partialArmed":
            translatedSate = Characteristic.SecuritySystemTargetState.NIGHT_ARM;
            break;
        case "annex":
            translatedSate = Characteristic.SecuritySystemTargetState.STAY_ARM;
            break;
        case "armed":
            translatedSate = Characteristic.SecuritySystemTargetState.AWAY_ARM;
            break;
        case "disarmed":
            translatedSate = Characteristic.SecuritySystemTargetState.DISARM;
            break;
        case 4:
            translatedSate = "ALARM";
            break;
        }
    
        this.log.debug("translateToState() Translated state is " + translatedSate);
        return translatedSate;
    }

    /**
     * ranslating from a SecuritySystemTargetState state to Sectoralarm state.
     * @param {SecuritySystemTargetState} aState the state
     */
    translateFromState(aState) {
        this.log.debug("translateFromState() State is " + aState);
        var translatedSate = "UNKNOWN";
    
        switch (aState) {
        case Characteristic.SecuritySystemTargetState.STAY_ARM:
            translatedSate = "partial";
            break;
        case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
            translatedSate = "partial";
            break;
        case Characteristic.SecuritySystemTargetState.AWAY_ARM:
            translatedSate = "armed";
            break;
        case Characteristic.SecuritySystemTargetState.DISARM:
            translatedSate = "disarmed";
            break;
        case 4:
            translatedSate = "ALARM";
            break;
        }
    
        return translatedSate;
    }
  
}




