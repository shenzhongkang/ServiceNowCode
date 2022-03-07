/*! RESOURCE: scripts/GlideFilterCurrency2.js */
(function (window, undefined) {
  var CurrencyValuesModel = function (values) {
    this.values = [];
    if (!values) return;
    this.parseValues(values);
  };
  CurrencyValuesModel.prototype = {
    parseValues: function (values) {
      this.values = values.map(function (value) {
        var splitValue = (value || '').split(/[,;]+/);
        if (splitValue.length > 1) {
          return {
            currency: splitValue[0],
            amount: splitValue[1],
          };
        } else {
          return {
            currency: '',
            amount: splitValue[0],
          };
        }
      });
    },
  };
  var GlideFilterCurrency2 = Class.create(GlideFilterString, {
    initialize: function (tableName, item, isTemplate) {
      GlideFilterHandler.prototype.initialize.call(this, tableName, item);
      this.isTemplate = isTemplate;
    },
    _operOnChange: function () {
      var lastOp = this.lastOperator;
      this.lastOperator = this._getOperator();
      if (
        fieldComparisonOperators.indexOf(lastOp) >= 0 !=
        fieldComparisonOperators.indexOf(this.lastOperator) >= 0
      ) {
        this.inputCnt = 0;
        this.input = [];
      }
      if (lastOp != 'BETWEEN' && this._getOperator() == 'BETWEEN') {
        this.values.splice(1, 0, '');
        if (this.values.length === 2) {
          var firstValue = this.values.slice(0, 1)[0];
          this.values.splice(2, 0, firstValue);
        }
      } else if (lastOp == 'BETWEEN') {
        this.values.unshift();
      }
      this._build();
    },
    _setup: function () {
      this.maxValues = 2;
      this.id = this.tr.tableField + '.' + guid();
      this.listenForOperChange = true;
    },
    _build: function () {
      GlideFilterString.prototype._build.call(this);
      if (!this._isEmptyOper()) {
        var s = this._addSelect(60, false, 1);
        this._getCurrencies(s);
      }
    },
    _getCurrencies: function (s) {
      var currencies = [];
      if (currencies.length != 0) return currencies;
      var ajax = new GlideAjax('CurrencyConverter');
      ajax.addParam('sysparm_name', 'getCurrencies');
      ajax.getXMLAnswer(this._getCurrenciesResponse.bind(this), null, s);
    },
    _getCurrenciesResponse: function (answer, s) {
      var values = answer;
      var currencies = values.split(',');
      var cache = this._getCache();
      cache.put('currencies', values);
      for (var i = 0; i < currencies.length; i++)
        addOption(s, currencies[i], currencies[i], i == 0);
      this.currency_widget = s;
      this._parseValue();
    },
    _resolveFromCache: function () {
      var cache = this._getCache();
      var value = cache.get('currencies');
      if (value) return value.split(',');
      return [];
    },
    _getCache: function () {
      if (typeof g_cache_currency != 'undefined') return g_cache_currency;
      g_cache_currency = new GlideClientCache(1);
      return g_cache_currency;
    },
    _parseValue: function () {
      if (this.inputs.length == 0) return;
      var model = new CurrencyValuesModel(this.values);
      var input;
      for (var i = 0; i < this.inputs.length; i++) {
        input = this.inputs[i];
        switch (input.type) {
          case 'select-one':
          case 'select':
            var currency = model.values[model.values.length - 1].currency;
            if (currency) input.value = currency;
            break;
          default:
            input.value = model.values[i].amount;
            break;
        }
      }
      var sel = new Select(this.currency_widget);
      sel.selectValue(currency);
    },
    getValues: function () {
      if (this._isMappingEnabled) return this.getMappingValue();
      if (!this.currency_widget) return '';
      var delimiter = this.isTemplate ? ';' : ',';
      var v = GlideFilterString.prototype.getValues.call(this);
      var valList = v.split('@');
      var fromVal = this.currency_widget.value + delimiter + valList[0];
      if (valList.length > 1 && this._getOperator() == 'BETWEEN')
        return (
          fromVal + '@' + this.currency_widget.value + delimiter + valList[1]
        );
      return fromVal;
    },
    destroy: function () {
      GlideFilterString.prototype.destroy.call(this);
      this.currency_widget = null;
    },
    z: null,
  });
  window.numericTypes['currency2'] = 1;
  window.GlideFilterCurrency2 = GlideFilterCurrency2;
})(window);
