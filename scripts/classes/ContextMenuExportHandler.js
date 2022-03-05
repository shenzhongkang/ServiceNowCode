/*! RESOURCE: /scripts/classes/ContextMenuExportHandler.js */
var ContextMenuExportHandler = Class.create({
  initialize: function (g_list, export_format) {
    this.g_list = g_list;
    this.export_format = export_format;
  },
  exportRecords: function () {
    var sysparm_rows = this.g_list.grandTotalRows;
    var num_rows = parseInt(sysparm_rows);
    var sysparm_query = this.g_list.getQuery({ orderby: true, fixed: true });
    var sysparm_view = this.g_list.view;
    var sysparm_query_no_domain = false;
    if (
      'submitValues' in this.g_list &&
      'sysparm_query_no_domain' in this.g_list.submitValues
    )
      sysparm_query_no_domain =
        this.g_list.submitValues.sysparm_query_no_domain;
    if (num_rows < g_export_warn_threshold) {
      var dialog = new GwtPollDialog(
        this.g_list.tableName,
        sysparm_query,
        sysparm_rows,
        sysparm_view,
        this.export_format,
        undefined,
        undefined,
        sysparm_query_no_domain
      );
      dialog.execute();
      return;
    }
    var dialog = new GwtExportScheduleDialog(
      this.g_list.tableName,
      sysparm_query,
      sysparm_rows,
      sysparm_view,
      this.export_format,
      undefined,
      this.export_format,
      sysparm_query_no_domain
    );
    dialog.execute();
  },
});
