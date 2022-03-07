/*! RESOURCE: scripts/GwtListEditCurrency2.js */
(function (window, $) {
  var CURRENCY_SELECT_SELECTOR = '#cell_edit_currency2_select';
  var CURRENCY_SELECTED_LABEL_SELECTOR =
    CURRENCY_SELECT_SELECTOR + ' :selected';
  function _$getCurrencies() {
    return $.get('/api/now/table/fx_currency', {
      sysparm_query: 'active=true',
    }).then(function (response) {
      return response.result.map(function (item) {
        return {
          symbol: item.symbol,
          code: item.code,
        };
      });
    });
  }
  function _$templateCurrencyOptions(currencies, currencyValue) {
    var currencyOptionsString = currencies
      .map(function (currency) {
        if (currency.symbol == currencyValue)
          return (
            '<option selected="" value="' +
            currency.code +
            '">' +
            currency.symbol +
            '</option>'
          );
        return (
          '<option value="' +
          currency.code +
          '">' +
          currency.symbol +
          '</option>'
        );
      })
      .join('\n');
    return $.when(currencyOptionsString);
  }
  function _getAmountSelector() {
    return '#' + window.GwtListEditWindow.inputID;
  }
  function _getValue() {
    var AMOUNT_SELECTOR = _getAmountSelector();
    var currency = $(CURRENCY_SELECT_SELECTOR).val();
    var amount = $(AMOUNT_SELECTOR).val();
    return currency + ',' + amount;
  }
  function _getDisplayValue() {
    var AMOUNT_SELECTOR = _getAmountSelector();
    var currencyLabel = $(CURRENCY_SELECTED_LABEL_SELECTOR).text();
    var amount = $(AMOUNT_SELECTOR).val();
    return currencyLabel + amount;
  }
  var GwtListEditCurrency2 = Class.create(window.GwtListEditText, {
    createEditControls: function () {
      var displayValue = this.editor.getDisplayValue();
      var currencyValue = displayValue.substring(0, 1);
      var amountValue = displayValue.substring(1);
      _$getCurrencies()
        .then(function (currencies) {
          return _$templateCurrencyOptions(currencies, currencyValue);
        })
        .then(
          function (currencyOptionsString) {
            var divString = [
              '<div class="input-group input-group_collapsed list-edit-input-group">',
              '	<input class="form-control" id="' +
                GwtListEditWindow.inputID +
                '" value="' +
                amountValue +
                '" />',
              '	<span class="input-group-addon input-group-select input-group-select_right">',
              '		<select class="form-control" id="cell_edit_currency2_select">',
              currencyOptionsString,
              '		</select>',
              '		<label class="sr-only" for=".currency_type">Currency Type</label>',
              '		<i aria-hidden="true" class="select-indicator icon-vcr-down"></i>',
              '	</span>',
              '</div>',
            ].join('\n');
            this.setTitle(divString);
            this.createEditControlsComplete();
          }.bind(this)
        );
    },
    save: function () {
      var value = _getValue();
      var displayValue = _getDisplayValue();
      if (value) this.setValue(null, value);
    },
    toString: function () {
      return 'GwtListEditCurrency2';
    },
  });
  window.GwtListEditCurrency2 = GwtListEditCurrency2;
})(window, jQuery);
