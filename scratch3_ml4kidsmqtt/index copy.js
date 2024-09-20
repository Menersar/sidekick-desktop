/***/ "./node_modules/scratch-vm/src/extensions/scratch3_ml4kidsmqtt/index.js":
/*!******************************************************************************!*\
  !*** ./node_modules/scratch-vm/src/extensions/scratch3_ml4kidsmqtt/index.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

    function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
    function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
    var BlockType = __webpack_require__(/*! ../../extension-support/block-type */ "./node_modules/scratch-vm/src/extension-support/block-type.js");
    var ArgumentType = __webpack_require__(/*! ../../extension-support/argument-type */ "./node_modules/scratch-vm/src/extension-support/argument-type.js");
    var MQTT_BROKERS = {
      mosquitto: {
        id: 'mosquitto',
        peripheralId: 'mosquitto',
        key: 'mosquitto',
        name: 'Mosquitto',
        rssi: 1,
        brokerAddress: 'wss://test.mosquitto.org:8081'
      },
      eclipse: {
        id: 'eclipse',
        peripheralId: 'eclipse',
        key: 'eclipse',
        name: 'Eclipse Projects',
        rssi: 2,
        brokerAddress: 'wss://mqtt.eclipseprojects.io:443/mqtt'
      },
      hivemq: {
        id: 'hivemq',
        peripheralId: 'hivemq',
        key: 'hivemq',
        name: 'HiveMQ',
        rssi: 3,
        brokerAddress: 'wss://broker.hivemq.com:8884/mqtt'
      },
      emqx: {
        id: 'emqx',
        peripheralId: 'emqx',
        key: 'emqx',
        name: 'EMQX',
        rssi: 4,
        brokerAddress: 'wss://broker.emqx.io:8084/mqtt'
      }
    };
    var MqttConnection = /*#__PURE__*/function () {
      function MqttConnection(runtime, extensionId) {
        _classCallCheck(this, MqttConnection);
        this._isMqttConnected = false;
        this._running = false;
        this._runtime = runtime;
        this._runtime.on('PROJECT_START', this.projectStart.bind(this));
        this._runtime.on('PROJECT_STOP_ALL', this.projectStop.bind(this));
        this._extensionId = extensionId;
        this._runtime.registerPeripheralExtension(extensionId, this);
        this._scan();
        this._subscriptions = {};
      }
      _createClass(MqttConnection, [{
        key: "projectStart",
        value: function projectStart() {
          this._running = true;
        }
      }, {
        key: "projectStop",
        value: function projectStop() {
          this._running = false;
          if (this._isMqttConnected) {
            console.log('[mlforkids] mqtt unsubscribing');
            this._mqttClient.unsubscribe(Object.keys(this._subscriptions));
            this._subscriptions = {};
          }
        }
      }, {
        key: "scan",
        value: function scan() {
          var _this = this;
          setTimeout(function () {
            _this._scan();
          }, 200);
        }
      }, {
        key: "_scan",
        value: function _scan() {
          this._runtime.emit(this._runtime.constructor.PERIPHERAL_LIST_UPDATE, MQTT_BROKERS);
        }
      }, {
        key: "connect",
        value: function connect(id) {
          var _this2 = this;
          console.log('[mlforkids] mqtt connect', id);
          this._mqttClient = mqtt.connect(MQTT_BROKERS[id].brokerAddress);
          this._mqttClient.on('connect', function () {
            _this2._isMqttConnected = true;
            _this2._runtime.emit(_this2._runtime.constructor.PERIPHERAL_CONNECTED);
          });
          this._mqttClient.on('error', function (err) {
            _this2._isMqttConnected = false;
            console.log('[mlforkids] mqtt error', err);
            _this2._runtime.emit(_this2._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
              message: "Connection error",
              extensionId: _this2._extensionId
            });
          });
          this._mqttClient.on('message', function (topic, message) {
            console.log('[mlforkids] message', topic);
            if (_this2._running && topic in _this2._subscriptions) {
              _this2._subscriptions[topic].push(message.toString());
            }
          });
        }
      }, {
        key: "disconnect",
        value: function disconnect() {
          console.log('[mlforkids] mqtt disconnect', id);
          var force = true;
          this._mqttClient.end(force);
          delete this._mqttClient;
          this._isMqttConnected = false;
          this._subscriptions = {};
          this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
        }
      }, {
        key: "isConnected",
        value: function isConnected() {
          return this._isMqttConnected;
        }
      }, {
        key: "mqttPublish",
        value: function mqttPublish(topic, messageString) {
          if (this._isMqttConnected && this._running) {
            this._mqttClient.publish(topic, messageString.toString());
          }
        }
      }, {
        key: "mqttSubscribe",
        value: function mqttSubscribe(topic) {
          var _this3 = this;
          if (!this._isMqttConnected || !this._running) {
            return false;
          }
          if (!(topic in this._subscriptions)) {
            console.log('[mlforkids] mqtt subscribing to', topic);
            this._subscriptions[topic] = [];
            this._mqttClient.subscribe(topic, function (err) {
              if (err) {
                console.log('[mlforkids] mqtt subscription error', err);
                delete _this3._subscriptions[topic];
              }
            });
          }
          return this._subscriptions[topic].length > 0;
        }
      }, {
        key: "mqttMessage",
        value: function mqttMessage(topic) {
          if (this._isMqttConnected && this._running && this._subscriptions[topic] && this._subscriptions[topic].length > 0) {
            return this._subscriptions[topic].shift();
          }
          return '';
        }
      }]);
      return MqttConnection;
    }();
    var Scratch3ML4KMqtt = /*#__PURE__*/function () {
      function Scratch3ML4KMqtt(runtime) {
        _classCallCheck(this, Scratch3ML4KMqtt);
        this._runtime = runtime;
        this._libraryReady = false;
        this._loadMQTT();
      }
      _createClass(Scratch3ML4KMqtt, [{
        key: "getInfo",
        value: function getInfo() {
          return {
            id: 'mlforkidsMQTT',
            name: 'MQTT',
            // colour for the blocks
            color1: '#660066',
            // colour for the menus in the blocks
            color2: '#ffffff',
            // border for blocks and parameter gaps
            color3: '#660066',
            showStatusButton: true,
            menuIconURI: 'data:image/png;base64,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',
            blocks: [{
              opcode: 'publish',
              text: 'publish [MESSAGE] to [TOPIC]',
              blockType: BlockType.COMMAND,
              arguments: {
                TOPIC: {
                  type: ArgumentType.STRING,
                  defaultValue: 'scratch/mqtt'
                },
                MESSAGE: {
                  type: ArgumentType.STRING,
                  defaultValue: 'hello world'
                }
              }
            }, {
              opcode: 'subscribe',
              text: 'new message from [TOPIC]',
              blockType: BlockType.HAT,
              arguments: {
                TOPIC: {
                  type: ArgumentType.STRING,
                  defaultValue: 'scratch/mqtt'
                }
              }
            }, {
              opcode: 'message',
              text: 'message from [TOPIC]',
              blockType: BlockType.REPORTER,
              arguments: {
                TOPIC: {
                  type: ArgumentType.STRING,
                  defaultValue: 'scratch/mqtt'
                }
              }
            }]
          };
        }
      }, {
        key: "publish",
        value: function publish(_ref) {
          var TOPIC = _ref.TOPIC,
            MESSAGE = _ref.MESSAGE;
          if (this._mqttConnection) {
            this._mqttConnection.mqttPublish(TOPIC, MESSAGE);
          }
        }
      }, {
        key: "subscribe",
        value: function subscribe(_ref2) {
          var TOPIC = _ref2.TOPIC;
          if (this._mqttConnection) {
            return this._mqttConnection.mqttSubscribe(TOPIC);
          }
        }
      }, {
        key: "message",
        value: function message(_ref3) {
          var TOPIC = _ref3.TOPIC;
          if (this._mqttConnection) {
            return this._mqttConnection.mqttMessage(TOPIC);
          }
        }
      }, {
        key: "_loadMQTT",
        value: function _loadMQTT() {
          var id = 'mlforkids-script-mqtt';
          if (document.getElementById(id)) {
            console.log('[mlforkids] MQTT library already loaded');
          } else {
            console.log('[mlforkids] loading MQTT library');
            var scriptObj = document.createElement('script');
            scriptObj.id = id;
            scriptObj.type = 'text/javascript';
            scriptObj.src = './mlforkids-thirdparty-libs/mqtt/mqtt.min.js';
            scriptObj.onreadystatechange = this._mqttLibraryLoaded.bind(this);
            scriptObj.onload = this._mqttLibraryLoaded.bind(this);
            document.head.appendChild(scriptObj);
          }
        }
      }, {
        key: "_mqttLibraryLoaded",
        value: function _mqttLibraryLoaded() {
          this._libraryReady = true;
          this._mqttConnection = new MqttConnection(this._runtime, 'mlforkidsMQTT');
        }
      }]);
      return Scratch3ML4KMqtt;
    }();
    module.exports = Scratch3ML4KMqtt;
    
    /***/ }),