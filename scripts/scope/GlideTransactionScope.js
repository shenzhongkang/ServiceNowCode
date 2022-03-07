/*! RESOURCE: /scripts/scope/GlideTransactionScope.js */
var GlideTransactionScope = (function () {
  var SYSPARM_TRANASACTION_SCOPE = 'sysparm_transaction_scope';
  var SYSPARM_RECORD_SCOPE = 'sysparm_record_scope';
  var SYSPARM_TRANSACTION_UPDATE_SET = 'sysparm_transaction_update_set';
  var transactionScope;
  var recordScope;
  var transactionUpdateSet;
  function appendTransactionScope(
    appender,
    appendRecordScope,
    appendTransactionUpdateSet
  ) {
    if (appender && typeof appender == 'function') {
      if (transactionScope)
        appender(SYSPARM_TRANASACTION_SCOPE, transactionScope);
      if (appendRecordScope && recordScope)
        appender(SYSPARM_RECORD_SCOPE, recordScope);
      if (appendTransactionUpdateSet && transactionUpdateSet)
        appender(SYSPARM_TRANSACTION_UPDATE_SET, transactionUpdateSet);
    }
  }
  function setTransactionScope(scope) {
    transactionScope = scope;
  }
  function setRecordScope(scope) {
    recordScope = scope;
  }
  function setTransactionUpdateSet(updateSet) {
    transactionUpdateSet = updateSet;
  }
  return {
    appendTransactionScope: appendTransactionScope,
    setTransactionScope: setTransactionScope,
    setRecordScope: setRecordScope,
    setTransactionUpdateSet: setTransactionUpdateSet,
  };
})();
