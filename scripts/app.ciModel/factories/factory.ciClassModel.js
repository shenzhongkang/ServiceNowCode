/*! RESOURCE: /scripts/app.ciModel/factories/factory.ciClassModel.js */
angular.module('sn.ciModel').factory('ciClassModel', [
  'i18n',
  'ciRelMapConstants',
  'CONSTANTS',
  function (i18n, ciRelMapConstants, CONSTANTS) {
    'use strict';
    var table,
      tableLabel,
      sysId,
      icon,
      description,
      isExtendable,
      isPrincipalClass,
      managedByGroup,
      parentTable,
      columns,
      identifier = {},
      dependencies = {},
      governanceRules = [],
      reconciliation = {},
      tempId,
      inclusionRule = {},
      idGen = 1,
      createdColumnId = 0,
      hasColumnIdentifiers,
      columnIdentifiers;
    dependencies[CONSTANTS.CLIENT.HOSTING] = [];
    dependencies[CONSTANTS.CLIENT.CONTAINMENT] = [];
    hasColumnIdentifiers = false;
    columnIdentifiers = [];
    var columnIdentifierLabels = [];
    function init(
      _table,
      _tableLabel,
      _icon,
      _sysId,
      _parentTable,
      _description,
      _isExtendable,
      _isPrincipalClass,
      _managedByGroup
    ) {
      table = _table;
      tableLabel = _tableLabel;
      sysId = _sysId;
      icon = _icon;
      parentTable = _parentTable;
      description = _description;
      isExtendable = _isExtendable;
      isPrincipalClass = _isPrincipalClass;
      managedByGroup = _managedByGroup;
      columns = {
        added: [],
        inherited: [],
      };
    }
    function getBulkCreateObject() {
      var bulk = {
        name: table,
        label: tableLabel,
        description: description,
        super_class: parentTable,
        icon: icon,
        is_extendable: isExtendable,
        principal_class: isPrincipalClass,
        managed_by_group: managedByGroup,
        columns: [],
        identifier: null,
        reconciliation: null,
      };
      var addedColumns = getAddedColumns();
      for (var c in addedColumns) {
        var column = {};
        column.name = addedColumns[c].element;
        column.label = addedColumns[c].column_label;
        column.type = addedColumns[c].internal_type.value;
        column.max_length = isNaN(parseInt(addedColumns[c].max_length))
          ? ''
          : addedColumns[c].max_length;
        column.display = addedColumns[c].display;
        column.mandatory = addedColumns[c].mandatory;
        column.default_value = addedColumns[c].default_value;
        column.reference = addedColumns[c].reference.value;
        bulk.columns.push(column);
      }
      if (identifier.added) {
        bulk.identifier = {
          name: identifier.added.name,
          applies_to: identifier.added.applies_to,
          description: identifier.added.description,
          active: identifier.added.active,
          independent: identifier.added.independent,
          identifier_entries: [],
        };
        for (var e in identifier.added.entries) {
          var entry = {};
          entry.table = identifier.added.entries[e].table;
          entry.attributes = identifier.added.entries[e].fields.toString();
          entry.order = identifier.added.entries[e].priority;
          entry.active = identifier.added.entries[e].active;
          entry.allow_null_attribute =
            identifier.added.entries[e].allow_null_attribute;
          entry.allow_fallback = identifier.added.entries[e].allow_fallback;
          entry.condition = identifier.added.entries[e].condition;
          entry.exact_count_match =
            identifier.added.entries[e].exact_count_match;
          entry.hybridEntryCIFieldLabels =
            identifier.added.entries[e].hybridEntryCIFieldLabels;
          entry.hybridEntryCIFields =
            identifier.added.entries[e].hybridEntryCIFields;
          entry.fieldLabels = identifier.added.entries[e].fieldLabels;
          entry.fields = identifier.added.entries[e].fields;
          entry.hybridLookupRule = identifier.added.entries[e].hybridLookupRule;
          (entry.hybrid_entry_ci_criterion_attributes =
            typeof identifier.added.entries[e].hybridEntryCIFields !==
            'undefined'
              ? identifier.added.entries[e].hybridEntryCIFields.toString()
              : ''),
            bulk.identifier.identifier_entries.push(entry);
        }
      }
      if (dependencies.hosting) {
        if (!bulk.identifier) bulk.identifier = {};
        bulk.identifier.dependencies = [];
        for (var d in dependencies.hosting) {
          var dependency = {
            parent_type: dependencies.hosting[d].child_type,
            rel_type: dependencies.hosting[d].rel_type,
            is_reverse: dependencies.hosting[d].is_reverse,
            is_hosting: true,
          };
          bulk.identifier.dependencies.push(dependency);
        }
      }
      if (dependencies.containment) {
        if (!bulk.identifier) bulk.identifier = {};
        if (!bulk.identifier.dependencies) bulk.identifier.dependencies = [];
        for (var d in dependencies.containment) {
          var dependency = {
            parent_type: dependencies.containment[d].parent_type,
            parent_id: dependencies.containment[d].parent_id || null,
            rel_type: dependencies.containment[d].rel_type,
            is_reverse: dependencies.containment[d].is_reverse,
            is_hosting: false,
          };
          bulk.identifier.dependencies.push(dependency);
        }
      }
      if (reconciliation) {
        bulk.reconciliation = {
          reconciliation_definitions: [],
          datasource_refreshness: [],
        };
        for (var r in reconciliation.reconciliation) {
          if (reconciliation.reconciliation[r].is_inherited) continue;
          var rule = {
            reconciliation_definitions:
              reconciliation.reconciliation[r].reconciliation_definitions,
            discovery_source: reconciliation.reconciliation[r].discovery_source,
            applies_to: table,
            active: reconciliation.reconciliation[r].active,
            attributes: reconciliation.reconciliation[r].attributes,
            null_update: reconciliation.reconciliation[r].null_update,
            condition: reconciliation.reconciliation[r].condition,
          };
          bulk.reconciliation.reconciliation_definitions.push(rule);
        }
        for (var r in reconciliation.datasourcerefreshness) {
          if (reconciliation.datasourcerefreshness[r].is_inherited) continue;
          var rule = {
            discovery_source:
              reconciliation.datasourcerefreshness[r].discovery_source,
            applies_to: table,
            active: reconciliation.datasourcerefreshness[r].active,
            duration: reconciliation.datasourcerefreshness[r].duration,
          };
          bulk.reconciliation.datasource_refreshness.push(rule);
        }
      }
      if (governanceRules.length > 0) {
        var rule = null;
        bulk.relationship_rules = [];
        for (var i = 0; i < governanceRules.length; i++) {
          rule = {
            child_type: governanceRules[i]['class'].name,
            rel_type: governanceRules[i].cmdb_rel_type,
            is_reverse: governanceRules[i].is_reverse,
            is_preferred: governanceRules[i].preferred,
          };
          bulk.relationship_rules.push(rule);
        }
      }
      return bulk;
    }
    function setInheritedIdentifier(ident) {
      identifier.inherited = ident;
    }
    function getAddedColumns() {
      return columns.added.sort(function (a, b) {
        var aTest = a.column_label.toLowerCase();
        var bTest = b.column_label.toLowerCase();
        return aTest > bTest ? 1 : -1;
      });
    }
    function addNewColumn(column) {
      if (column[CONSTANTS.COLUMN_LABEL_COLUMN_NAME] !== '') {
        column.sys_id = createdColumnId;
        createdColumnId++;
        return columns.added.push(column);
      }
      return null;
    }
    function updateNewColumn(column) {
      if (column[CONSTANTS.COLUMN_LABEL_COLUMN_NAME] !== '') {
        var index = -1;
        for (var i = 0; i < columns.added.length; i++) {
          if (column.sys_id === columns.added[i].sys_id) {
            index = i;
            break;
          }
        }
        if (index > -1) {
          return (columns.added[i] = column);
        }
      }
      return null;
    }
    function removeNewColumn(column) {
      var index = -1;
      for (var i = 0; i < columns.added.length; i++) {
        if (column.sys_id === columns.added[i].sys_id) {
          index = i;
          break;
        }
      }
      if (index > -1) {
        return columns.added.splice(index, 1);
      }
      return null;
    }
    function getTableLabel() {
      return tableLabel;
    }
    function getInheritedColumns() {
      return columns.inherited.sort(function (a, b) {
        var aTest = a.column_label.toLowerCase();
        var bTest = b.column_label.toLowerCase();
        return aTest > bTest ? 1 : -1;
      });
    }
    function setInheritedColumns(column) {
      return (columns.inherited = column);
    }
    function getAllColumns() {
      return columns.inherited.concat(getAddedColumns()).sort(function (a, b) {
        var aTest = a.column_label.toLowerCase();
        var bTest = b.column_label.toLowerCase();
        return aTest > bTest ? 1 : -1;
      });
    }
    function getTable() {
      return table;
    }
    function getInheritedIdentifier(ident) {
      return identifier.inherited;
    }
    function setInheritedInclusionRule(ident) {
      inclusionRule.inherited = ident;
    }
    function getInheritedInclusionRule(ident) {
      return inclusionRule.inherited;
    }
    function setInclusionRule(ident) {
      ident.id = idGen++;
      inclusionRule.inherited = ident;
    }
    function getInclusionRule(ident) {
      return inclusionRule.inherited;
    }
    function getParentTable() {
      return parentTable;
    }
    function setIdentifier(ident) {
      ident.sysId = idGen++;
      identifier.added = ident;
    }
    function getIdentifier() {
      return identifier.added;
    }
    function deleteIdentifier() {
      return (identifier.added = null);
    }
    function addIdentifierEntry(entry) {
      if (!identifier.added.entries) identifier.added.entries = [];
      entry.tempId = idGen++;
      identifier.added.entries.push(entry);
    }
    function removeIdentifierEntryById(entryId) {
      for (var i in identifier.added.entries) {
        if (identifier.added.entries[i].tempId === entryId) {
          identifier.added.entries.splice(i, 1);
          break;
        }
      }
    }
    function updateIdentifierEntry(entry) {
      for (var i in identifier.added.entries) {
        if (identifier.added.entries[i].tempId === entry.tempId) {
          identifier.added.entries[i] = entry;
          break;
        }
      }
    }
    function setReconciliation(rec) {
      reconciliation = angular.copy(rec);
    }
    function getReconciliation(rec) {
      return reconciliation;
    }
    function addRefreshnessRule(rule) {
      if (!reconciliation.datasourcerefreshness)
        reconciliation.datasourcerefreshness = [];
      rule.sys_id = idGen++;
      reconciliation.datasourcerefreshness.push(rule);
    }
    function editRefreshnessRule(rule) {
      for (var i in reconciliation.datasourcerefreshness) {
        if (reconciliation.datasourcerefreshness[i].sys_id === rule.sys_id) {
          reconciliation.datasourcerefreshness[i] = rule;
          break;
        }
      }
    }
    function deleteRefreshnessRule(rule) {
      for (var i in reconciliation.datasourcerefreshness) {
        if (reconciliation.datasourcerefreshness[i].sys_id === rule.sys_id) {
          reconciliation.datasourcerefreshness.splice(i, 1);
          break;
        }
      }
    }
    function editReconciliationRule(rule) {
      for (var i in reconciliation.reconciliation) {
        if (reconciliation.reconciliation[i].sys_id === rule.sys_id) {
          reconciliation.reconciliation[i] = rule;
          break;
        }
      }
    }
    function deleteReconciliationRule(rule) {
      for (var i in reconciliation.reconciliation) {
        if (reconciliation.reconciliation[i].sys_id === rule.sys_id) {
          reconciliation.reconciliation.splice(i, 1);
          break;
        }
      }
    }
    function addReconciliationRule(rule) {
      if (!reconciliation.reconciliation) reconciliation.reconciliation = [];
      rule.mapped_tile = idGen++;
      reconciliation.reconciliation.push(rule);
    }
    function addHostDependency(dep) {
      dep.tempId = idGen++;
      dependencies.hosting.push(dep);
    }
    function addContainmentDependency(dep) {
      dep.tempId = idGen++;
      dependencies.containment.push(dep);
    }
    function addGovernanceRule(rule) {
      rule.tempId = idGen++;
      governanceRules.push(rule);
    }
    function editGovernanceRule(rule) {
      var id = rule.id.split('_')[0];
      for (var i in governanceRules) {
        if (governanceRules[i].tempId == id) {
          governanceRules[i] = rule;
          governanceRules[i].tempId = id;
          break;
        }
      }
    }
    function editContainmentDependency(rule) {
      var id = rule.id.split('_')[0];
      for (var i in dependencies.containment) {
        if (dependencies.containment[i].tempId == id) {
          dependencies.containment[i] = rule;
          dependencies.containment[i].tempId = id;
          break;
        }
      }
    }
    function editHostingDependency(rule) {
      var id = rule.id.split('_')[0];
      for (var i in dependencies.hosting) {
        if (dependencies.hosting[i].tempId == id) {
          dependencies.hosting[i] = rule;
          dependencies.hosting[i].tempId = id;
          break;
        }
      }
    }
    function resetDependencies() {
      dependencies.containment = [];
      dependencies.hosting = [];
    }
    function resetGovernanceRules() {
      governanceRules = [];
    }
    function deleteHostingDependency(dep) {
      var id = dep.id.split('_')[0];
      for (var i in dependencies.hosting) {
        if (dependencies.hosting[i].tempId == id) {
          dependencies.hosting.splice(i, 1);
          break;
        }
      }
    }
    function deleteGovernanceRule(dep) {
      var id = dep.id.split('_')[0];
      for (var i in governanceRules) {
        if (governanceRules[i].tempId == id) {
          governanceRules.splice(i, 1);
          break;
        }
      }
    }
    function deleteContainmentDependency(dep) {
      var id = dep.id.split('_')[0];
      for (var i in dependencies.containment) {
        if (dependencies.containment[i].tempId == id) {
          dependencies.containment.splice(i, 1);
          break;
        }
      }
    }
    function getDependencies() {
      return dependencies;
    }
    function getGovernanceRules() {
      return governanceRules;
    }
    function getHasColumnIdentifiers() {
      return hasColumnIdentifiers;
    }
    function setHasColumnIdentifiers(val, colIdentifiers) {
      columnIdentifiers = [];
      hasColumnIdentifiers = val;
      if (colIdentifiers.length > 0) {
        columnIdentifiers = colIdentifiers;
        setColumnIdentifierLabels(colIdentifiers);
      }
    }
    function setColumnIdentifierLabels(colIdentifiers) {
      columnIdentifierLabels = [];
      var allColumns = getAllColumns();
      for (var i = 0; i < allColumns.length; i++) {
        for (var j = 0; j < colIdentifiers.length; j++) {
          if (allColumns[i].element === colIdentifiers[j]) {
            columnIdentifierLabels.push(allColumns[i].column_label);
            break;
          }
        }
      }
    }
    function getColumnIdentifiers() {
      return columnIdentifiers;
    }
    function getColumnIdentifierLabels() {
      return columnIdentifierLabels;
    }
    return {
      init: init,
      getBulkCreateObject: getBulkCreateObject,
      getAddedColumns: getAddedColumns,
      addNewColumn: addNewColumn,
      updateNewColumn: updateNewColumn,
      removeNewColumn: removeNewColumn,
      setInheritedColumns: setInheritedColumns,
      getInheritedColumns: getInheritedColumns,
      getAllColumns: getAllColumns,
      getTable: getTable,
      getTableLabel: getTableLabel,
      getParentTable: getParentTable,
      setReconciliation: setReconciliation,
      getReconciliation: getReconciliation,
      setIdentifier: setIdentifier,
      getIdentifier: getIdentifier,
      getInclusionRule: getInclusionRule,
      getInheritedInclusionRule: getInheritedInclusionRule,
      setInclusionRule: setInclusionRule,
      setInheritedInclusionRule: setInheritedInclusionRule,
      addReconciliationRule: addReconciliationRule,
      deleteReconciliationRule: deleteReconciliationRule,
      editReconciliationRule: editReconciliationRule,
      addRefreshnessRule: addRefreshnessRule,
      deleteRefreshnessRule: deleteRefreshnessRule,
      editRefreshnessRule: editRefreshnessRule,
      setInheritedIdentifier: setInheritedIdentifier,
      getInheritedIdentifier: getInheritedIdentifier,
      addHostDependency: addHostDependency,
      addContainmentDependency: addContainmentDependency,
      resetDependencies: resetDependencies,
      resetGovernanceRules: resetGovernanceRules,
      addGovernanceRule: addGovernanceRule,
      editGovernanceRule: editGovernanceRule,
      deleteGovernanceRule: deleteGovernanceRule,
      deleteHostingDependency: deleteHostingDependency,
      deleteContainmentDependency: deleteContainmentDependency,
      updateIdentifierEntry: updateIdentifierEntry,
      removeIdentifierEntryById: removeIdentifierEntryById,
      deleteIdentifier: deleteIdentifier,
      addIdentifierEntry: addIdentifierEntry,
      getDependencies: getDependencies,
      editHostingDependency: editHostingDependency,
      editContainmentDependency: editContainmentDependency,
      getGovernanceRules: getGovernanceRules,
      getHasColumnIdentifiers: getHasColumnIdentifiers,
      setHasColumnIdentifiers: setHasColumnIdentifiers,
      getColumnIdentifiers: getColumnIdentifiers,
      getColumnIdentifierLabels: getColumnIdentifierLabels,
    };
  },
]);
