/*! RESOURCE: scripts/SNCredStoreFormUtil.js */
var SNCredStoreFormUtil = {
  mandatoryFieldMap: {
    name: 'Name',
    type: 'Type',
    hostname: 'Hostname',
  },
  validateMandatoryFields: function () {
    var unfilledMandatoryFields = [];
    for (var key in this.mandatoryFieldMap) {
      g_form.hideErrorBox(key);
      if (!g_form.getValue(key)) {
        g_form.showErrorBox(key, this.mandatoryFieldMap[key] + ' is required');
        unfilledMandatoryFields.push(this.mandatoryFieldMap[key]);
      }
    }
    if (unfilledMandatoryFields.length > 0)
      g_form.addErrorMessage(
        g_scratchpad.unfilledMandatoryFieldsMsg + unfilledMandatoryFields.join()
      );
    return unfilledMandatoryFields;
  },
  isValidHistoryLimit: function () {
    var limit;
    if (g_form.getBooleanValue('enforce_history_policy')) {
      limit = this.getPwdHistoryLimit();
      if (limit === -1) {
        g_form.addErrorMessage(g_scratchpad.mandatoryHistoryParamMsg);
        return false;
      }
    }
    return true;
  },
  _showHistoryLimitConfirmation: function (newLimit, oldLimit, action) {
    var modal = new GlideModal('pwd_history_change_confirmation');
    modal.setTitle('Confirmation');
    modal.setPreference('sysparm_old_limit', oldLimit);
    modal.setPreference('sysparm_new_limit', newLimit);
    modal.setPreference('sysparm_action', action);
    modal.setPreference('sysparm_conf_type', 'limit_decrease_confirmation');
    modal.setWidth(350);
    modal.render();
  },
  _showEnforceHistoryUncheckConfirmation: function (action) {
    var modal = new GlideModal('pwd_history_change_confirmation');
    modal.setTitle('Confirmation');
    modal.setPreference('sysparm_action', action);
    modal.setPreference('sysparm_conf_type', 'history_uncheck_confirmation');
    modal.setWidth(350);
    modal.render();
  },
  getPwdHistoryLimit: function () {
    var list = GlideList2.getListsForTable('pwd_cred_store_param')[0];
    if (list) {
      var numRows = list.table.rows.length;
      for (var i = 1; i < numRows - 1; i++) {
        var curRow = list.table.rows[i];
        var paramId = curRow.getAttribute('sys_id');
        var paramName = list.getCell(paramId, 'name').textContent;
        if (paramName == 'password_history_limit') {
          if (curRow.className.indexOf('list_delete') > 0) {
            return -1;
          }
          if (list.getCell(paramId, 'value').textContent)
            return parseInt(list.getCell(paramId, 'value').textContent);
          return -1;
        }
      }
    }
    return -1;
  },
  save: function () {
    this.saveOrSubmit('save');
  },
  update: function () {
    this.saveOrSubmit('submit');
  },
  saveOrSubmit: function (action) {
    if (!action) action = 'submit';
    var hasIssues = false;
    if (this.validateMandatoryFields().length > 0) {
      hasIssues = true;
      return;
    }
    if (
      !g_form.getBooleanValue('enforce_history_policy') &&
      g_scratchpad.cur_enforce_history_policy
    ) {
      hasIssues = true;
      this._showEnforceHistoryUncheckConfirmation(action);
    }
    if (g_form.getBooleanValue('enforce_history_policy')) {
      if (!this.isValidHistoryLimit()) {
        hasIssues = true;
        return;
      }
      var newLimit = this.getPwdHistoryLimit();
      var oldLimit = g_scratchpad.cur_password_history_limit;
      if (newLimit < oldLimit) {
        hasIssues = true;
        this._showHistoryLimitConfirmation(newLimit, oldLimit, action);
      }
    }
    if (!hasIssues) {
      if (action == 'submit') {
        gsftSubmit(null, g_form.getFormElement(), 'sysverb_update');
        return;
      }
      gsftSubmit(null, g_form.getFormElement(), 'sysverb_update_and_stay');
    }
  },
};
