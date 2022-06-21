/*! RESOURCE: /scripts/app.$sp/directive.spAnnouncements.js */
angular
  .module('sn.$sp')
  .directive('spAnnouncements', function ($timeout, spAriaFocusManager) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'sp_announcements.xml',
      controllerAs: 'c',
      controller: function ($scope, spAnnouncement, i18n, $window) {
        var c = this;
        var _announcements;
        c.showAll = false;
        c.announcements = [];
        c.totalAnnouncements = 0;
        c.i18n = {
          dismiss: i18n.getMessage('Dismiss'),
          collapse: i18n.getMessage('HIDE ALL'),
          announcement: i18n.getMessage('announcement'),
          announcements: i18n.getMessage('announcements'),
          defaultLinkText: i18n.getMessage('Learn More'),
          more: i18n.getMessage('MORE'),
          less: i18n.getMessage('LESS'),
        };
        function _updateCurrentAnnouncements() {
          c.announcements = c.showAll ? _announcements : [_announcements[0]];
        }
        function _getCurrentAnnouncements() {
          c.totalAnnouncements = 0;
          _announcements = spAnnouncement.get(function (announcement) {
            return (
              !announcement.dismissed &&
              spAnnouncement.filterOnType('banner')(announcement)
            );
          });
          if (_announcements.length) {
            c.totalAnnouncements = _announcements.length;
            if (c.totalAnnouncements > 1) {
              c.expandMoreCount = i18n.format(
                i18n.getMessage('EXPAND ALL {0}'),
                c.totalAnnouncements - 1
              );
              if (!c.showAll) c.showMore = c.expandMoreCount;
            } else c.showMore = c.showAll ? c.i18n.less : c.i18n.more;
            _announcements = c.totalAnnouncements > 0 ? _announcements : [];
            _updateCurrentAnnouncements();
          }
        }
        c.dismiss = function (id, index) {
          spAnnouncement.dismiss(id);
          $timeout(function () {
            focusNextAnnouncement(index);
          }, 10);
        };
        function focusNextAnnouncement(index) {
          var nxtAnnouncementEle = $(
            'div.announcement-container .text-container'
          );
          if (nxtAnnouncementEle[index]) nxtAnnouncementEle[index].focus();
          else {
            if (index > 0) focusNextAnnouncement(index - 1);
            else {
              var skipLinkEle = $('.skip-link');
              if (skipLinkEle.length > 0) skipLinkEle[0].focus();
            }
          }
        }
        c.toggleShowAll = function ($event) {
          c.showAll = !c.showAll;
          if (c.totalAnnouncements > 1) {
            _updateCurrentAnnouncements();
            c.showMore = c.showAll ? c.i18n.collapse : c.expandMoreCount;
          } else c.showMore = c.showAll ? c.i18n.less : c.i18n.more;
          if (!c.showAll) {
            $window.scrollTo(0, 0);
            if ($event.currentTarget.classList.contains('text-container'))
              $('.text-container')[0].focus();
            else $('.sp-announcement-list-actions')[0].focus();
          }
        };
        c.getStyle = function (announcement) {
          var style = announcement.displayStyle || {};
          return {
            backgroundColor: style.backgroundColor || '#006ED5',
            color: style.foregroundColor || '#ffffff',
            textAlign: (style.alignment || 'left').toLowerCase(),
          };
        };
        c.getJustifyContentValue = function (announcement) {
          return (announcement.displayStyle || {}).alignment === 'CENTER'
            ? 'center'
            : 'flex-start';
        };
        c.linkSetup = function (a) {
          a.linkTarget = '_self';
          if ('urlNew' === a.clickTarget) {
            a.linkTarget = '_blank';
          }
          a.linkType = !a.targetLink
            ? 'none'
            : a.targetLinkText
            ? 'normal'
            : 'title';
        };
        spAnnouncement.subscribe($scope, _getCurrentAnnouncements);
        _getCurrentAnnouncements();
        if (
          c.totalAnnouncements === 1 &&
          !c.announcements[0].targetLinkText &&
          !c.announcements[0].summary
        ) {
          c.singleEmptyTitle = true;
        }
        $(document).ready(function () {
          $('body').tooltip({
            selector: '[data-toggle="tooltip"]',
          });
        });
      },
    };
  });
