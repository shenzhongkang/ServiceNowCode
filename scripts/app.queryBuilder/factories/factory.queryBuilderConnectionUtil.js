/*! RESOURCE: /scripts/app.queryBuilder/factories/factory.queryBuilderConnectionUtil.js */
angular.module('sn.queryBuilder').factory('queryBuilderConnectionUtil', [
  'CONSTQB',
  'i18n',
  function (CONST, i18n) {
    'use strict';
    function _emptyLine() {
      return [
        {
          x: 0,
          y: 0,
        },
        {
          x: 0,
          y: 0,
        },
        {
          x: 0,
          y: 0,
        },
        {
          x: 0,
          y: 0,
        },
      ];
    }
    function _calculateLine(conn, line) {
      var source = conn.info.first[conn.info.first_side + 'Center'];
      var target = conn.info.second[conn.info.second_side + 'Center'];
      var diffX = target.x - source.x;
      var dx = Math.max(
        Math.abs(diffX < 0 ? diffX * 2 : diffX) * CONST.D3.LINKCURVEWEIGHT,
        CONST.D3.DXMAX
      );
      if (Math.abs(diffX) < 110) dx *= Math.abs(diffX) / 110;
      var firstStem = Math.max(dx, CONST.D3.STEMLENGTH);
      var secondStem = conn.info.isOperatorConnection
        ? dx
        : Math.max(dx, CONST.D3.STEMLENGTH);
      line[0].x = source.x;
      line[0].y = source.y;
      line[1].x = source.x + firstStem;
      line[1].y = source.y;
      line[2].x = target.x - secondStem;
      line[2].y = target.y;
      line[3].x = target.x;
      line[3].y = target.y;
    }
    return {
      emptyLine: _emptyLine,
      calculateLine: _calculateLine,
    };
  },
]);
