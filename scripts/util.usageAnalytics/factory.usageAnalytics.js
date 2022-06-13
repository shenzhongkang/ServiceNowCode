/*! RESOURCE: /scripts/util.usageAnalytics/factory.usageAnalytics.js */
angular
  .module('cmdb.usageAnalytics')
  .factory('usageAnalytics', function ($resource) {
    var _uaAPI = $resource(
      '/cmdbusageanalytics.do',
      {},
      {
        post: {
          method: 'POST',
          isArray: false,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        },
      }
    );
    var _appName = '';
    var _registering = false;
    var _registered = false;
    var _config;
    var _attempt = 0;
    var _loadTimeInterval = 500;
    var _sendQueue = [];
    function _URLEncode(data) {
      var payload = '';
      for (var property in data) {
        if (data.hasOwnProperty(property)) {
          payload += property + '=' + encodeURI(data[property]) + '&';
        }
      }
      return payload;
    }
    usageAnalytics.register = function (appName, config) {
      if (_attempt <= 3) {
        _appName = appName;
        _attempt++;
        addLoadTimeAggregationKeys(config);
        _config = config;
        _loadTimeInterval = config.loadTimeInterval;
        _registering = true;
        return _uaAPI
          .post(
            {
              cmd: 'register',
            },
            _URLEncode({
              appName: appName,
              aggregationConfig: JSON.stringify(config.events),
            })
          )
          .$promise.then(function (response) {
            _registering = false;
            if (response.status == 'OK') {
              _registered = true;
              for (var i = 0; i < _sendQueue.length; i++) {
                send(_sendQueue[i].analyticsData);
              }
              _sendQueue = [];
            }
            return response.status;
          });
      }
    };
    usageAnalytics.addToQueue = function (uaInstance) {
      _sendQueue.push(uaInstance);
    };
    usageAnalytics.getAppName = function () {
      return _appName;
    };
    usageAnalytics.registered = function () {
      return _registered;
    };
    usageAnalytics.registrationInProgress = function () {
      return _registering;
    };
    usageAnalytics.getUaAPI = function () {
      return _uaAPI;
    };
    usageAnalytics.getConfig = function () {
      return _config;
    };
    usageAnalytics.maxAttemptsReached = function () {
      return _attempt >= 3;
    };
    usageAnalytics.getLoadTimeInterval = function () {
      return _loadTimeInterval;
    };
    usageAnalytics.addLoadTime = function (eventType) {
      for (var i = 0; i < _config.events.length; i++) {
        if (_config.events[i].eventType == eventType)
          return _config.events[i].addLoadTime;
      }
    };
    usageAnalytics.getInstance = function (eventType) {
      return new usageAnalytics(eventType);
    };
    function usageAnalytics(eventType) {
      this.startTimeStamp = new Date().getTime();
      this.eventType = eventType;
      this.analyticsData = {};
      return this;
    }
    usageAnalytics.prototype.addMetric = function (key, value) {
      this.analyticsData['ua.' + key] = value;
      return this;
    };
    usageAnalytics.prototype.flush = function (data) {
      if (!usageAnalytics.registered()) {
        if (!usageAnalytics.maxAttemptsReached()) {
          prepareData(this, data);
          usageAnalytics.addToQueue(this);
          if (!usageAnalytics.registrationInProgress())
            usageAnalytics.register(
              usageAnalytics.getAppName(),
              usageAnalytics.getConfig()
            );
          return;
        }
      } else return flushEvent(this, data);
    };
    function flushEvent(uaInstance, data) {
      prepareData(uaInstance, data);
      return send(uaInstance.analyticsData);
    }
    function prepareData(uaInstance, data) {
      uaInstance.endTimeStamp = new Date().getTime();
      if (data) data = prefixTheMatrixKeys(uaInstance.analyticsData, data);
      uaInstance.analyticsData['eventType'] = uaInstance.eventType;
      uaInstance.analyticsData['appName'] = usageAnalytics.getAppName();
      if (usageAnalytics.addLoadTime(uaInstance.eventType))
        calculateLoadTime(
          uaInstance.endTimeStamp - uaInstance.startTimeStamp,
          usageAnalytics.getLoadTimeInterval(),
          uaInstance.analyticsData
        );
    }
    function send(analyticsData) {
      return _uaAPI
        .post(
          {
            cmd: 'send',
          },
          _URLEncode(analyticsData)
        )
        .$promise.then(function (response) {
          return response;
        });
    }
    function prefixTheMatrixKeys(analyticsData, data) {
      for (matrix in data) analyticsData['ua.' + matrix] = data[matrix];
    }
    function calculateLoadTime(loadTIme, loadTimeInterval, data) {
      var low = parseInt(loadTIme / loadTimeInterval) * loadTimeInterval;
      data['ua.range.low.value'] = low;
      data['ua.range.high.value'] = low + loadTimeInterval;
    }
    function addLoadTimeAggregationKeys(config) {
      for (var i = 0; i < config.events.length; i++) {
        if (config.events[i].addLoadTime) {
          if (!config.events[i].aggKeys) config.events[i].aggKeys = [];
          if (config.events[i].aggKeys.indexOf('range.low.value') == -1)
            config.events[i].aggKeys.push('range.low.value');
          if (config.events[i].aggKeys.indexOf('range.high.value') == -1)
            config.events[i].aggKeys.push('range.high.value');
        }
      }
    }
    return usageAnalytics;
  });