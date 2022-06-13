/*! RESOURCE: /scripts/sn/common/stream/controller.snStream.js */
angular
  .module('sn.common.stream')
  .controller(
    'snStream',
    function (
      $rootScope,
      $scope,
      $attrs,
      $http,
      nowStream,
      snRecordPresence,
      snCustomEvent,
      userPreferences,
      $window,
      $q,
      $timeout,
      $sce,
      snMention,
      i18n,
      getTemplateUrl,
      $injector,
      dynamicTranslation
    ) {
      'use strict';
      if (angular.isDefined($attrs.isInline)) {
        bindInlineStreamAttributes();
      }
      var globalMembers = NOW.recordMembers || {};
      function putGlobalMember(sysId, name, initials, avatar) {
        if (!sysId || !name || !initials) return;
        if (!globalMembers[sysId]) {
          globalMembers[sysId] = {
            name: name,
            initials: initials,
            sys_id: sysId,
            record_is_visible: true,
            avatar: avatar,
          };
          return;
        }
        if (
          (globalMembers[sysId].avatar === undefined ||
            globalMembers[sysId].avatar === '') &&
          avatar
        )
          globalMembers[sysId].avatar = avatar;
      }
      function getMembersFromPageContext(members, term) {
        var matching = [],
          matchingSysIds = [];
        var memberKeys = Object.keys(globalMembers);
        term = term.toLowerCase().trim();
        memberKeys.forEach(function (sysId) {
          var member = globalMembers[sysId];
          if (
            (typeof member.name !== 'undefined' &&
              member.name.toLowerCase().indexOf(term) == 0) ||
            (typeof member.last_name !== 'undefined' &&
              member.last_name.toLowerCase().indexOf(term) == 0)
          ) {
            matching.push(member);
            matchingSysIds.push(sysId);
          }
        });
        members.forEach(function (member) {
          if (
            globalMembers[member.sys_id] &&
            globalMembers[member.sys_id].avatar === undefined
          )
            globalMembers[member.sys_id].avatar = member.avatar;
          if (matchingSysIds.indexOf(member.sys_id) === -1)
            matching.push(member);
        });
        return matching;
      }
      function bindInlineStreamAttributes() {
        var streamAttributes = {};
        if ($attrs.table) {
          streamAttributes.table = $attrs.table;
        }
        if ($attrs.query) {
          streamAttributes.query = $attrs.query;
        }
        if ($attrs.sysId) {
          streamAttributes.sysId = $attrs.sysId;
        }
        if ($attrs.active) {
          streamAttributes.active = $attrs.active == 'true';
        }
        if ($attrs.template) {
          streamAttributes.template = $attrs.template;
        }
        if ($attrs.preferredInput) {
          streamAttributes.preferredInput = $attrs.preferredInput;
        }
        if ($attrs.useMultipleInputs) {
          streamAttributes.useMultipleInputs =
            $attrs.useMultipleInputs == 'true';
        }
        if ($attrs.expandEntries) {
          streamAttributes.expandEntries = $attrs.expandEntries == 'true';
        }
        if ($attrs.pageSize) {
          streamAttributes.pageSize = parseInt($attrs.pageSize, 10);
        }
        if ($attrs.truncate) {
          streamAttributes.truncate = $attrs.truncate == 'true';
        }
        if ($attrs.attachments) {
          streamAttributes.attachments = $attrs.attachments == 'true';
        }
        if ($attrs.showCommentsAndWorkNotes) {
          streamAttributes.attachments =
            $attrs.showCommentsAndWorkNotes == 'true';
        }
        angular.extend($scope, streamAttributes);
      }
      var stream;
      var processor = $attrs.processor || 'list_history';
      var interval;
      var FROM_LIST = 'from_list';
      var FROM_FORM = 'from_form';
      var source = $scope.sysId ? FROM_FORM : FROM_LIST;
      var _firstPoll = true;
      var _firstPollTimeout;
      var fieldsInitialized = false;
      var primaryJournalFieldOrder = ['comments', 'work_notes'];
      var primaryJournalField = null;
      $scope.defaultShowCommentsAndWorkNotes =
        $scope.sysId != null &&
        !angular.isUndefined($scope.sysId) &&
        $scope.sysId.length > 0;
      $scope.canWriteWorkNotes = false;
      $scope.inputTypeValue = '';
      $scope.entryTemplate = getTemplateUrl(
        $attrs.template || 'list_stream_entry'
      );
      $scope.isFormStream = $attrs.template === 'record_stream_entry.xml';
      $scope.allFields = null;
      $scope.fields = {};
      $scope.fieldColor = 'transparent';
      $scope.multipleInputs = $scope.useMultipleInputs;
      $scope.checkbox = {};
      $scope.attachmentAdviceRequired = $window.NOW.attachmentAdviceRequired;
      var infectedAttachmnentMsg =
        'The file {0} did not pass security scan and cannot be downloaded';
      i18n.getMessage(infectedAttachmnentMsg, function (message) {
        infectedAttachmnentMsg = message;
      });
      var typing = '{0} is typing',
        viewing = '{0} is viewing',
        entered = '{0} has entered';
      var probablyLeft = '{0} has probably left',
        exited = '{0} has exited',
        offline = '{0} is offline',
        auditMessage = '{0} was {1}',
        was = 'was';
      i18n.getMessages(
        [
          typing,
          viewing,
          entered,
          probablyLeft,
          exited,
          offline,
          was,
          auditMessage,
        ],
        function (results) {
          typing = results[typing];
          viewing = results[viewing];
          entered = results[entered];
          probablyLeft = results[probablyLeft];
          exited = results[exited];
          offline = results[offline];
          was = results[was];
          $scope.auditMessageParts = buildAuditMessageParts(
            results[auditMessage],
            was
          );
        }
      );
      function buildAuditMessageParts(auditMessage, was) {
        var tMessagePattern = /^([^{]*)\{([01])\}([^{]*)\{([01])\}(.*)$/;
        var messageParts = tMessagePattern.exec(auditMessage);
        var auditMessageParts = messageParts
          ? {
              prefix: messageParts[1].trim(),
              newValPosition: messageParts[2],
              middle: messageParts[3].trim(),
              oldValPosition: messageParts[4],
              postfix: messageParts[5].trim(),
            }
          : {
              prefix: '',
              newValPosition: '0',
              middle: was,
              oldValPosition: '1',
              postfix: '',
            };
        return auditMessageParts;
      }
      $scope.parsePresence = function (sessionData) {
        var status = sessionData.status;
        var name = sessionData.user_display_name;
        switch (status) {
          case 'typing':
            return i18n.format(typing, name);
          case 'viewing':
            return i18n.format(viewing, name);
          case 'entered':
            return i18n.format(entered, name);
          case 'probably left':
            return i18n.format(probablyLeft, name);
          case 'exited':
            return i18n.format(exited, name);
          case 'offline':
            return i18n.format(offline, name);
          default:
            return '';
        }
      };
      $scope.members = [];
      $scope.members.loading = true;
      var mentionMap = {};
      $scope.selectAtMention = function (item) {
        if (item.termLengthIsZero) return (item.name || '') + '\n';
        mentionMap[item.name] = item.sys_id;
        return '@[' + item.name + ']';
      };
      var typingTimer;
      $scope.searchMembersAsync = function (term) {
        $scope.members = getMembersFromPageContext([], term);
        $scope.members.loading = true;
        $timeout.cancel(typingTimer);
        if (term.length === 0) {
          $scope.members = [
            {
              termLengthIsZero: true,
            },
          ];
          $scope.members.loading = false;
        } else {
          typingTimer = $timeout(function () {
            snMention.retrieveMembers($scope.table, $scope.sysId, term).then(
              function (members) {
                $scope.members = getMembersFromPageContext(members, term);
                $scope.members.loading = false;
              },
              function () {
                $scope.members = getMembersFromPageContext(
                  [
                    {
                      termLengthIsZero: true,
                    },
                  ],
                  term
                );
                $scope.members.loading = false;
              }
            );
          }, 500);
        }
      };
      $scope.expandMentions = function (text) {
        return stream.expandMentions(text, mentionMap);
      };
      $scope.reduceMentions = function (text) {
        if (!text) return text;
        var regexMentionParts = /[@\w\d\s/\']+/gi;
        text = text.replace(
          /@\[[\w\d\s]+:[@\w\d\s/\']+\]/gi,
          function (mention) {
            var mentionParts = mention.match(regexMentionParts);
            if (mentionParts.length === 3) {
              var name = mentionParts[2];
              mentionMap[name] = mentionParts[1];
              return '@[' + name + ']';
            }
            return mentionParts;
          }
        );
        return text;
      };
      $scope.parseMentions = function (entry) {
        var regexMentionParts = /[\w\d\s/\']+/gi;
        entry = entry.replace(
          /@\[[\w\d\s]+:[\w\d\s/\']+\]/gi,
          function (mention) {
            var mentionParts = mention.match(regexMentionParts);
            if (mentionParts.length === 2) {
              return (
                '<a class="at-mention at-mention-user-' +
                mentionParts[0] +
                '">@' +
                mentionParts[1] +
                '</a>'
              );
            }
            return mentionParts;
          }
        );
        return entry;
      };
      $scope.parseLinks = function (text) {
        var regexLinks = /@L\[([^|]+?)\|([^\]]*)]/gi;
        return text.replace(regexLinks, "<a href='$1' target='_blank'>$2</a>");
      };
      $scope.trustAsHtml = function (text) {
        return $sce.trustAsHtml(text);
      };
      $scope.parseSpecial = function (text) {
        var parsedText = $scope.parseLinks(text);
        parsedText = $scope.parseMentions(parsedText);
        return $scope.trustAsHtml(parsedText);
      };
      $scope.containsHTML = function (text) {
        return /<([a-z][a-z0-9]*)\b[^>]*>[\s\S]*<\/\1>/im.test(text);
      };
      $scope.isHTMLField = function (change) {
        return (
          change.field_type === 'html' ||
          change.field_type === 'translated_html'
        );
      };
      $scope.shouldEncapsulate = function (journal) {
        return (
          $scope.isHTMLField(journal) ||
          $scope.containsHTML(journal.sanitized_new_value)
        );
      };
      $scope.getFullEntryValue = function (entry, event) {
        event.stopPropagation();
        var index = getEntryIndex(entry);
        var journal = $scope.entries[index].entries.journal[0];
        journal.loading = true;
        $http
          .get('/api/now/ui/stream_entry/full_entry', {
            params: {
              sysparm_sys_id: journal.sys_id,
            },
          })
          .then(function (response) {
            journal.sanitized_new_value = journal.new_value =
              response.data.result.replace(/\n/g, '<br/>');
            journal.is_truncated = false;
            journal.loading = false;
            journal.showMore = true;
          });
      };
      function getEntryIndex(entry) {
        for (var i = 0, l = $scope.entries.length; i < l; i++) {
          if (entry === $scope.entries[i]) {
            return i;
          }
        }
      }
      $scope.$watch('active', function (n, o) {
        if (n === o) return;
        if ($scope.active) startPolling();
        else cancelStream();
      });
      $scope.defaultControls = {
        getTitle: function (entry) {
          if (entry && entry.short_description) {
            return entry.short_description;
          } else if (entry && entry.shortDescription) {
            return entry.shortDescription;
          }
        },
        showCreatedBy: function () {
          return true;
        },
        hideCommentLabel: function () {
          return false;
        },
        showRecord: function ($event, entry) {},
        showRecordLink: function () {
          return true;
        },
      };
      if ($scope.controls) {
        for (var attr in $scope.controls)
          $scope.defaultControls[attr] = $scope.controls[attr];
      }
      $scope.controls = $scope.defaultControls;
      if ($scope.showCommentsAndWorkNotes === undefined) {
        $scope.showCommentsAndWorkNotes =
          $scope.defaultShowCommentsAndWorkNotes;
      }
      snCustomEvent.observe(
        'sn.stream.change_input_display',
        function (table, display) {
          if (table != $scope.table) return;
          $scope.showCommentsAndWorkNotes = display;
          $scope.$apply();
        }
      );
      snCustomEvent.observe(
        'sn.stream.attachment_state_updated',
        function (entry) {
          $scope.entries.forEach(function (e) {
            if (
              e.attachment &&
              e.attachment.sys_id === entry.attachment.sys_id
            ) {
              e.attachment.state = entry.attachment.state;
            }
          });
        }
      );
      $scope.$on('$destroy', function () {
        cancelStream();
      });
      $scope.$on('sn.stream.interval', function ($event, time) {
        interval = time;
        reschedulePoll();
      });
      $scope.$on('sn.stream.tap', function () {
        if (stream) stream.tap();
        else startPolling();
      });
      $scope.$on('window_visibility_change', function ($event, hidden) {
        interval = hidden ? 120000 : undefined;
        reschedulePoll();
      });
      snCustomEvent.observe('sn.stream.clearOnSilentSubmit', function () {
        clearInputs();
      });
      $scope.$on('sn.stream.refresh', function (event, data) {
        stream._successCallback(data.response);
      });
      $scope.$on('sn.stream.reload', function () {
        startPolling();
      });
      snCustomEvent.observe('sn.stream.toggle_multiple_inputs', function () {
        $scope.useMultipleInputs = true;
      });
      $scope.$on('sn.stream.input_value', function (otherScope, type, value) {
        setMultipleInputs();
        if (!$scope.multipleInputs) {
          $scope.inputType = type;
          $scope.inputTypeValue = value;
        }
      });
      $scope.$watchCollection('[table, query, sysId]', startPolling);
      $scope.changeInputType = function (field) {
        if (!primaryJournalField) {
          angular.forEach($scope.fields, function (item) {
            if (item.isPrimary) primaryJournalField = item.name;
          });
        }
        $scope.inputType = field.checked ? field.name : primaryJournalField;
        userPreferences.setPreference(
          'glide.ui.' + $scope.table + '.stream_input',
          $scope.inputType
        );
      };
      $scope.selectedInputType = function (value) {
        if (angular.isDefined(value)) {
          $scope.inputType = value;
          userPreferences.setPreference(
            'glide.ui.' + $scope.table + '.stream_input',
            $scope.inputType
          );
        }
        return $scope.inputType;
      };
      $scope.$watch('inputType', function () {
        if (!$scope.inputType || !$scope.preferredInput) return;
        $scope.preferredInput = $scope.inputType;
      });
      $scope.submitCheck = function (event) {
        var key = event.keyCode || event.which;
        if (key === 13) {
          $scope.postJournalEntryForCurrent(event);
        }
      };
      $scope.postJournalEntry = function (type, entry, event) {
        type = type || primaryJournalFieldOrder[0];
        event.stopPropagation();
        var requestTable = $scope.table || 'board:' + $scope.board.sys_id;
        stream.insertForEntry(
          type,
          entry.journalText,
          requestTable,
          entry.document_id
        );
        entry.journalText = '';
        entry.commentBoxVisible = false;
        snRecordPresence.termPresence();
      };
      $scope.postJournalEntryForCurrent = function (event) {
        event.stopPropagation();
        var entries = [];
        if ($scope.multipleInputs) {
          angular.forEach($scope.fields, function (item) {
            if (!item.value) return;
            entries.push({
              field: item.name,
              text: item.value,
            });
          });
        } else {
          entries.push({
            field: $scope.inputType,
            text: $scope.inputTypeValue,
          });
        }
        var request = stream.insertEntries(
          entries,
          $scope.table,
          $scope.sysId,
          mentionMap
        );
        if (request) {
          request.then(function () {
            for (var i = 0; i < entries.length; i++) {
              fireClearEvent(entries[i].field);
            }
          });
        }
        clearInputs();
        return false;
      };
      $scope.doesFormHasMandatoryJournalFields = function () {
        if (window.g_form) {
          var fields = Object.values($scope.fields);
          for (var index = 0; index < fields.length; index++) {
            if (fields[index].mandatory) return true;
          }
        }
        return false;
      };
      function fireInsertEvent(name, value) {
        snCustomEvent.fire('sn.stream.insert', name, value);
      }
      function fireClearEvent(name) {
        snCustomEvent.fire('sn.stream.clear', name);
      }
      function clearInputs() {
        $scope.inputTypeValue = '';
        angular.forEach($scope.fields, function (item) {
          if (item.value) item.filled = true;
          item.value = '';
        });
      }
      $scope.showCommentBox = function (entry, event) {
        event.stopPropagation();
        if (entry !== $scope.selectedEntry) $scope.closeEntry();
        $scope.selectedEntry = entry;
        entry.commentBoxVisible = !entry.commentBoxVisible;
        if (entry.commentBoxVisible) {
          snRecordPresence.initPresence($scope.table, entry.document_id);
        }
      };
      $scope.showMore = function (journal, event) {
        event.stopPropagation();
        journal.showMore = true;
      };
      $scope.showLess = function (journal, event) {
        event.stopPropagation();
        journal.showMore = false;
      };
      $scope.closeEntry = function () {
        if ($scope.selectedEntry)
          $scope.selectedEntry.commentBoxVisible = false;
      };
      $scope.handleListASAttachmentClick = function (evt, entry) {
        evt.stopPropagation();
        $scope.handleASAttachmentClick(evt, entry);
      };
      $scope.handleListASAttachmentKeydown = function (evt, entry) {
        if (evt.keyCode === 13 || evt.keyCode === 32) {
          evt.stopPropagation();
          $scope.handleASAttachmentClick(evt, entry);
        }
      };
      $scope.handleASAttachmentClick = function (evt, entry) {
        var attachment = entry.attachment;
        if (
          attachment.state === 'available' ||
          !$scope.attachmentAdviceRequired
        ) {
          previewOrDownloadAttachment(evt, entry, false);
        } else if (attachment.state === 'not_available') {
          evt.preventDefault();
          $scope.showAttachmentUnAvailabilityMessage(attachment.file_name);
        } else {
          evt.preventDefault();
          getAttachmentAvailability(attachment.sys_id).then(
            function (res) {
              entry.attachment.state = res.state;
              previewOrDownloadAttachment(evt, entry, true);
            },
            function (res) {
              entry.attachment.state = res.state;
              if (res.forceDownload) {
                downloadAttachment(evt.currentTarget);
              } else {
                $scope.showAttachmentUnAvailabilityMessage(
                  attachment.file_name,
                  res.message
                );
              }
            }
          );
        }
      };
      function getAttachmentAvailability(attachmentSysId) {
        var deferred = $q.defer();
        $http
          .get('/api/now/as_attachment/getAvailability/' + attachmentSysId)
          .then(
            function (response) {
              var _res = response.data.result;
              if (_res && _res.availability) {
                if (_res.availability === 'available') {
                  deferred.resolve({ state: _res.availability });
                } else {
                  deferred.reject({
                    state: _res.availability,
                    message: _res.message,
                  });
                }
              } else {
                deferred.reject({ state: '', forceDownload: true });
              }
            },
            function () {
              deferred.reject({ state: '', forceDownload: true });
            }
          );
        return deferred.promise;
      }
      function escapeHtml(unsafe) {
        return unsafe
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
      $scope.showAttachmentUnAvailabilityMessage = function (
        fileName,
        customMsg
      ) {
        var errMsg =
          customMsg ||
          i18n.format(infectedAttachmnentMsg, escapeHtml(fileName));
        if (typeof g_form !== 'undefined') {
          g_form.addErrorMessage(errMsg);
        } else if (typeof window.parent.GlideUI !== 'undefined') {
          var topWindow = window.parent;
          topWindow.CustomEvent.fireTop(
            topWindow.GlideUI.UI_NOTIFICATION + '.error',
            new topWindow.GlideUINotification({ type: 'error', text: errMsg })
          );
        } else if (window.NOW && window.NOW.CustomEvent) {
          window.NOW.CustomEvent.fire('stream.attachment.unavailable', errMsg);
        }
      };
      function downloadAttachment(ele) {
        var link = document.createElement('a');
        link.href = ele.getAttribute('href');
        link.download = ele.getAttribute('file-name');
        var event =
          typeof window.MouseEvent === 'function'
            ? new MouseEvent('click')
            : document.createEvent('Event');
        event.initEvent('click', true, true);
        link.dispatchEvent(event);
      }
      function previewOrDownloadAttachment(evt, entry, isAsync) {
        if (!$scope.isFormStream) {
          evt.preventDefault();
          if (isAsync && entry.type === 'attachment-image') return;
          openAttachment(entry.attachment.sys_id);
          return;
        }
        if (entry.type === 'attachment-image') {
          if (snCustomEvent.events['sn.attachment.preview'] && !isAsync) {
            snCustomEvent.fire('sn.attachment.preview', evt, entry.attachment);
          }
        } else if (
          (entry.attachment.extension === 'mp4' ||
            entry.attachment.extension === 'webm') &&
          typeof GlideVideoPlayer !== 'undefined'
        ) {
          evt.preventDefault();
          entry.attachment.playVideo = true;
        } else if (isAsync) {
          downloadAttachment(evt.currentTarget);
        }
      }
      function openAttachment(sysId) {
        var url = '/sys_attachment.do?view=true&sys_id=' + sysId;
        var newTab = window.open(url, '_blank');
        newTab.focus();
      }
      $rootScope.$on('sn.sessions', function (someOtherScope, sessions) {
        if ($scope.selectedEntry && $scope.selectedEntry.commentBoxVisible)
          $scope.selectedEntry.sessions = sessions;
      });
      $scope.$watch('inputTypeValue', function (n, o) {
        if (n !== o) {
          emitTyping($scope.inputTypeValue);
        }
      });
      $scope.$watch('selectedEntry.journalText', function (newValue) {
        if ($scope.selectedEntry) emitTyping(newValue || '');
      });
      var multipleInputWatcher = function () {};
      $scope.$watch('useMultipleInputs', function () {
        if ($scope.useMultipleInputs) {
          multipleInputWatcher = $scope.$watch(
            'fields',
            function (n, o, s) {
              if (n !== o) {
                var strVal = '';
                angular.forEach($scope.fields, function (item) {
                  if (item.value) strVal = item.value;
                });
                emitTyping(strVal);
              }
            },
            true
          );
        } else {
          multipleInputWatcher();
        }
        setMultipleInputs();
      });
      function emitTyping(inputValue) {
        if (!angular.isDefined(inputValue)) {
          return;
        }
        var status = inputValue.length ? 'typing' : 'viewing';
        $scope.$emit('record.typing', {
          status: status,
          value: inputValue,
          field_type: $scope.inputType,
          table: $scope.table,
          sys_id: $scope.sys_id,
        });
      }
      function preloadedData() {
        if (
          typeof window.NOW.snActivityStreamData === 'object' &&
          window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId]
        ) {
          _firstPoll = false;
          var data =
            window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId];
          stream = nowStream.create(
            $scope.table,
            $scope.query,
            $scope.sysId,
            processor,
            interval,
            source,
            $scope.attachments
          );
          stream.callback = onPoll;
          stream.preRequestCallback = beforePoll;
          stream.lastTimestamp = data.sys_timestamp;
          if (data.entries && data.entries.length) {
            stream.lastEntry = angular.copy(data.entries[0]);
          }
          _firstPollTimeout = setTimeout(function () {
            stream.poll(onPoll, beforePoll);
            _firstPollTimeout = false;
          }, 20000);
          beforePoll();
          onPoll(data);
          return true;
        }
        return false;
      }
      function scheduleNewPoll(lastTimestamp) {
        cancelStream();
        stream = nowStream.create(
          $scope.table,
          $scope.query,
          $scope.sysId,
          processor,
          interval,
          source,
          $scope.attachments
        );
        stream.lastTimestamp = lastTimestamp;
        stream.poll(onPoll, beforePoll);
      }
      function reschedulePoll() {
        var lastTimestamp = stream ? stream.lastTimestamp : 0;
        if (cancelStream()) {
          scheduleNewPoll(lastTimestamp);
        }
      }
      function reset() {
        removeInlineStream();
        $scope.loaded = false;
        startPolling();
      }
      function emitFilterChange() {
        $scope.$emit('sn.stream.is_filtered_change', $scope.isFiltered);
      }
      function startPolling() {
        if ($scope.loading && !$scope.loaded) return;
        if (!$scope.active) return;
        $scope.entries = [];
        $scope.allEntries = [];
        $scope.showAllEntriesButton = false;
        $scope.loaded = false;
        $scope.loading = true;
        if (_firstPoll && preloadedData()) {
          return;
        }
        scheduleNewPoll();
        $scope.$emit('sn.stream.entries_change', $scope.entries);
      }
      function onPoll(response) {
        $scope.loading = false;
        if (response.primary_fields)
          primaryJournalFieldOrder = response.primary_fields;
        if (!fieldsInitialized) processFields(response.fields);
        processEntries(response.entries);
        if (response.inlineStreamLoaded) {
          $scope.inlineStreamLoaded = true;
          addInlineStreamEntryClass();
        }
        if (!$scope.loaded) {
          $scope.loaded = true;
          $scope.$emit('sn.stream.loaded', response);
        }
      }
      function beforePoll() {
        $scope.$emit('sn.stream.requested');
      }
      function processFields(fields) {
        if (!fields || !fields.length) return;
        fieldsInitialized = true;
        $scope.allFields = fields;
        setShowAllFields();
        $scope.fieldsVisible = 0;
        var i = 0;
        angular.forEach(fields, function (field) {
          if (!field.isJournal) return;
          if (i == 0) $scope.firstJournal = field.name;
          i++;
          if ($scope.fields[field.name]) {
            angular.extend($scope.fields[field.name], field);
          } else {
            $scope.fields[field.name] = field;
          }
          $scope.fields[field.name].visible =
            !$scope.formJournalFields && $scope.fields[field.name].canWrite;
          if ($scope.fields[field.name].visible) $scope.fieldsVisible++;
          var fieldColor = field.color;
          if (fieldColor)
            fieldColor = field.color.replace(/background-color: /, '');
          if (!fieldColor || fieldColor == 'transparent') fieldColor = null;
          $scope.fields[field.name].color = fieldColor;
        });
        setFieldVisibility();
        setPrimaryJournalField();
        setMultipleInputs();
      }
      $scope.$watch(
        'formJournalFields',
        function () {
          setFieldVisibility();
          setPrimaryJournalField();
          setMultipleInputs();
        },
        true
      );
      function setFieldVisibility() {
        if (
          !$scope.formJournalFields ||
          !$scope.fields ||
          !$scope.showCommentsAndWorkNotes
        )
          return;
        $scope.fieldsVisible = 0;
        angular.forEach($scope.formJournalFields, function (formField) {
          if (!$scope.fields[formField.name]) return;
          var formValue = angular
            .element('#' + $scope.table + '\\.' + formField.name)
            .val();
          if (
            formValue &&
            formValue.indexOf($window.NOW.STREAM_VALUE_KEY) !== 0
          ) {
            $scope.fields[formField.name].value = $scope.reduceMentions(
              formField.value
            );
          } else if (formValue === '') {
            $scope.fields[formField.name].value = '';
          }
          $scope.fields[formField.name].mandatory = formField.mandatory;
          $scope.fields[formField.name].label = formField.label;
          $scope.fields[formField.name].messages = formField.messages;
          $scope.fields[formField.name].visible =
            formField.visible && !formField.readonly;
          if ($scope.fields[formField.name].visible) $scope.fieldsVisible++;
        });
      }
      $scope.getStubbedFieldModel = function (fieldName) {
        if ($scope.fields[fieldName]) return $scope.fields[fieldName];
        $scope.fields[fieldName] = {
          name: fieldName,
        };
        return $scope.fields[fieldName];
      };
      function setPrimaryJournalField() {
        if (!$scope.fields || !$scope.showCommentsAndWorkNotes) return;
        angular.forEach($scope.fields, function (item) {
          item.isPrimary = false;
          item.checked = false;
        });
        var visibleFields = Object.keys($scope.fields).filter(function (item) {
          return $scope.fields[item].visible;
        });
        if (visibleFields.indexOf($scope.preferredInput) != -1) {
          var field = $scope.fields[$scope.preferredInput];
          field.checked = true;
          field.isPrimary = true;
          $scope.inputType = $scope.preferredInput;
          primaryJournalField = $scope.preferredInput;
        } else {
          for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
            var fieldName = primaryJournalFieldOrder[i];
            if (visibleFields.indexOf(fieldName) != -1) {
              $scope.fields[fieldName].isPrimary = true;
              primaryJournalField = fieldName;
              $scope.inputType = fieldName;
              $scope.inputTypeValue = $scope.fields[fieldName].value;
              break;
            }
          }
        }
        if (visibleFields.length === 0) {
          primaryJournalField = '';
          $scope.inputType = primaryJournalField;
        } else if (!$scope.inputType && visibleFields.length > 0) {
          primaryJournalField = visibleFields[0];
          $scope.inputType = primaryJournalField;
          $scope.fields[primaryJournalField].isPrimary = true;
        }
        if ($scope.fields && visibleFields.indexOf(primaryJournalField) == -1) {
          var keys = Object.keys($scope.fields);
          if (keys.length) $scope.fields[keys[0]].isPrimary = true;
        }
      }
      function safeArialiveAssertive(message) {
        if (
          window.NOW &&
          window.NOW.accessibility &&
          window.NOW.accessibility.ariaLiveAssertive
        ) {
          window.NOW.accessibility.ariaLiveAssertive(message);
        }
      }
      function setShowAllFields() {
        var ariaLiveAllActivities = '';
        $scope.checkbox.showAllFields = $scope.showAllFields =
          $scope.allFields &&
          !$scope.allFields.some(function (item) {
            return !item.isActive;
          });
        $scope.hideAllFields =
          !$scope.allFields ||
          !$scope.allFields.some(function (item) {
            return item.isActive;
          });
        $scope.isFiltered =
          !$scope.showAllFields ||
          $scope.allFields.some(function (item) {
            return !item.isActive;
          });
        if ($scope.checkbox.showAllFields)
          ariaLiveAllActivities = 'All activities are displayed';
        else if ($scope.hideAllFields)
          ariaLiveAllActivities = 'All activities are hidden';
        safeArialiveAssertive(ariaLiveAllActivities);
      }
      $scope.setPrimary = function (entry) {
        angular.forEach($scope.fields, function (item) {
          item.checked = false;
        });
        for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
          var fieldName = primaryJournalFieldOrder[i];
          if (entry.writable_journal_fields.indexOf(fieldName) != -1) {
            entry.primaryJournalField = fieldName;
            entry.inputType = fieldName;
            return;
          }
        }
        if (!entry.inputType) {
          var primaryField = entry.writable_journal_fields[0];
          entry.primaryJournalField = primaryField;
          entry.inputType = primaryField;
        }
      };
      $scope.updateFieldVisibilityAll = function () {
        $scope.showAllFields = !$scope.showAllFields;
        angular.forEach($scope.allFields, function (item) {
          item.isActive = $scope.showAllFields;
        });
        $scope.updateFieldVisibility();
      };
      $scope.updateFieldVisibility = function () {
        var activeFields = $scope.allFields.map(function (item) {
          return item.name + ',' + item.isActive;
        });
        setShowAllFields();
        emitFilterChange();
        userPreferences
          .setPreference(
            $scope.table + '.activity.filter',
            activeFields.join(';')
          )
          .then(function () {
            reset();
          });
      };
      $scope.configureAvailableFields = function () {
        $window.personalizer($scope.table, 'activity', $scope.sysId);
      };
      function handleFieldInputsOnToggle() {
        angular.forEach($scope.fields, function (item) {
          var itemIsInput = $scope.inputType == item.name ? true : false;
          if (!itemIsInput) item.value = '';
          else if ($scope.multipleInputs) item.value = $scope.inputTypeValue;
          else $scope.inputTypeValue = item.value;
        });
      }
      function shouldJournalFieldsToggle() {
        var toggle = true;
        if (!$scope.multipleInputs) return toggle;
        angular.forEach($scope.fields, function (item) {
          if ($scope.inputType != item.name && item.value) toggle = false;
        });
        return toggle;
      }
      $scope.toggleMultipleInputs = function (val) {
        if (!shouldJournalFieldsToggle()) return;
        userPreferences
          .setPreference(
            'glide.ui.activity_stream.multiple_inputs',
            val ? 'true' : 'false'
          )
          .then(function () {
            $scope.useMultipleInputs = val;
            setMultipleInputs();
            if ($scope.multipleInputs === val) handleFieldInputsOnToggle();
          });
      };
      $scope.changeEntryInputType = function (fieldName, entry) {
        var checked = $scope.fields[fieldName].checked;
        entry.inputType = checked ? fieldName : entry.primaryJournalField;
      };
      function processEntries(entries) {
        if (!entries || !entries.length) return;
        entries = entries.reverse();
        var newEntries = [];
        angular.forEach(entries, function (entry) {
          var entriesToAdd = [entry];
          if (entry.attachment) {
            entry.type = getAttachmentType(entry.attachment);
            entry.attachment.extension = getAttachmentExt(entry.attachment);
          } else if (entry.is_email === true) {
            entry.email = {};
            var allFields = entry.entries.custom;
            for (var i = 0; i < allFields.length; i++) {
              entry.email[allFields[i].field_name] = {
                label: allFields[i]['field_label'],
                displayValue: allFields[i]['new_value'],
              };
              entry.email['is_translation_enabled'] =
                allFields[i]['is_translation_enabled'];
            }
            entry['entries'].custom = [];
          } else if ($scope.sysId) {
            entriesToAdd = extractJournalEntries(entry);
          } else {
            entriesToAdd = handleJournalEntriesWithoutExtraction(entry);
          }
          putGlobalMember(
            entry['user_id'],
            entry['sys_created_by'],
            entry['initials'],
            entry['user_image']
          );
          if (entriesToAdd instanceof Array) {
            entriesToAdd.forEach(function (e) {
              $scope.entries.unshift(e);
              newEntries.unshift(e);
            });
          } else {
            $scope.entries.unshift(entriesToAdd);
            newEntries.unshift(entriesToAdd);
          }
          if (source != FROM_FORM) $scope.entries = $scope.entries.slice(0, 49);
          if ($scope.maxEntries != undefined) {
            var maxNumEntries = parseInt($scope.maxEntries, 10);
            $scope.entries = $scope.entries.slice(0, maxNumEntries);
          }
        });
        if ($scope.inlineStreamLoaded) {
          if ($scope.entries.length > 0) {
            removeInlineStreamEntryClass();
          }
        }
        if ($scope.loaded) {
          $scope.$emit('sn.stream.new_entries', newEntries);
          triggerResize();
        } else if ($scope.pageSize && $scope.entries.length > $scope.pageSize) {
          setUpPaging();
        }
        $timeout(function () {
          $scope.$emit('sn.stream.entries_change', $scope.entries);
        });
      }
      function removeInlineStream() {
        angular
          .element(document)
          .find('#sn_form_inline_stream_container')
          .hide()
          .remove();
      }
      function removeInlineStreamEntryClass() {
        angular
          .element(document)
          .find('#sn_form_inline_stream_entries')
          .removeClass('sn-form-inline-stream-entries-only');
      }
      function addInlineStreamEntryClass() {
        angular
          .element(document)
          .find('#sn_form_inline_stream_entries')
          .addClass('sn-form-inline-stream-entries-only');
      }
      function setUpPaging() {
        $scope.showAllEntriesButton = true;
        $scope.allEntries = $scope.entries;
        $scope.entries = [];
        loadEntries(0, $scope.pageSize);
      }
      $scope.loadMore = function () {
        if (
          $scope.entries.length + $scope.pageSize >
          $scope.allEntries.length
        ) {
          $scope.loadAll();
          return;
        }
        loadEntries(
          $scope.loadedEntries,
          $scope.loadedEntries + $scope.pageSize
        );
      };
      $scope.loadAll = function () {
        $scope.showAllEntriesButton = false;
        loadEntries($scope.loadedEntries, $scope.allEntries.length);
      };
      $scope.translateStreamEntryClick = function (entry, isRetry) {
        getTranslationDetails(entry, isRetry);
      };
      $scope.translateStreamEntryKeypress = function (event, entry, isRetry) {
        var key = event.keyCode || event.which;
        if (key === 32) {
          event.preventDefault();
          getTranslationDetails(entry, isRetry);
        }
      };
      function getTranslationDetails(entry, isRetry) {
        if ($injector.has('translateStream')) {
          var handler = $injector.get('translateStream');
          handler.getTranslatedContent(entry, isRetry);
        }
      }
      $scope.translationToggleClick = function (entry) {
        toggleTranslationLink(entry);
      };
      $scope.translationToggleKeypress = function (event, entry) {
        var key = event.keyCode || event.which;
        if (key === 32) {
          event.preventDefault();
          toggleTranslationLink(entry);
        }
      };
      function toggleTranslationLink(entry) {
        if ($injector.has('translateStream')) {
          var handler = $injector.get('translateStream');
          handler.toggleTranslation(entry);
        }
      }
      $scope.$on('sn.stream.translation_successful', function (event, data) {
        data.entry.translatedText = $scope.parseSpecial(data.translatedText);
      });
      function loadEntries(start, end) {
        $scope.entries = $scope.entries.concat(
          $scope.allEntries.slice(start, end)
        );
        $scope.loadedEntries = $scope.entries.length;
        $scope.$emit('sn.stream.entries_change', $scope.entries);
      }
      function getAttachmentType(attachment) {
        if (
          attachment.content_type.startsWith('image/') &&
          attachment.content_type.indexOf('tiff') < 0 &&
          attachment.size_bytes < 5 * 1024 * 1024 &&
          attachment.path.indexOf(attachment.sys_id) == 0
        )
          return 'attachment-image';
        return 'attachment';
      }
      function getAttachmentExt(attachment) {
        var filename = attachment.file_name;
        return filename.substring(filename.lastIndexOf('.') + 1);
      }
      function handleJournalEntriesWithoutExtraction(oneLargeEntry) {
        if (oneLargeEntry.entries.journal.length === 0) return oneLargeEntry;
        for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
          newLinesToBR(oneLargeEntry.entries.journal);
        }
        return oneLargeEntry;
      }
      function extractJournalEntries(oneLargeEntry) {
        var smallerEntries = [];
        if (oneLargeEntry.entries.journal.length === 0) return oneLargeEntry;
        for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
          var journalEntry = angular.copy(oneLargeEntry);
          journalEntry.entries.journal = journalEntry.entries.journal.slice(
            i,
            i + 1
          );
          newLinesToBR(journalEntry.entries.journal);
          journalEntry.entries.changes = [];
          journalEntry.type = 'journal';
          smallerEntries.unshift(journalEntry);
        }
        oneLargeEntry.entries.journal = [];
        oneLargeEntry.type = 'changes';
        if (oneLargeEntry.entries.changes.length > 0)
          smallerEntries.unshift(oneLargeEntry);
        return smallerEntries;
      }
      function newLinesToBR(entries) {
        angular.forEach(entries, function (item) {
          if (item.new_value) {
            item.new_value = item.new_value.replace(/\n/g, '<br/>');
          }
          if (item.sanitized_new_value) {
            item.sanitized_new_value = item.sanitized_new_value.replace(
              /\n/g,
              '<br/>'
            );
          }
        });
      }
      function cancelStream() {
        if (_firstPollTimeout) {
          clearTimeout(_firstPollTimeout);
          _firstPollTimeout = false;
        }
        if (!stream) return false;
        stream.cancel();
        stream = null;
        return true;
      }
      function setMultipleInputs() {
        $scope.multipleInputs = $scope.useMultipleInputs;
        if ($scope.useMultipleInputs === true || !$scope.formJournalFields) {
          return;
        }
        var numAffectedFields = 0;
        angular.forEach($scope.formJournalFields, function (item) {
          if (item.mandatory || item.value) numAffectedFields++;
        });
        if (numAffectedFields > 0) $scope.multipleInputs = true;
      }
      function triggerResize() {
        if (window._frameChanged) setTimeout(_frameChanged, 0);
      }
      var filterPopoverButton = angular.element(
        '#activity_field_filter_button'
      );
      var filterPopoverContents = angular.element(
        '#activity_field_filter_popover'
      );
      var filterFocusTrap;
      var scrollingContainer;
      var screenSize;
      $scope.filterOpen = false;
      filterPopoverButton.on('shown.bs.popover', function () {
        $scope.$apply(function () {
          $scope.filterOpen = true;
          filterPopoverContents.parent().parent().attr('role', 'presentation');
        });
        filterFocusTrap = $window.focusTrap(filterPopoverContents[0], {
          clickOutsideDeactivates: true,
        });
        filterFocusTrap.activate();
      });
      filterPopoverButton.on('hidden.bs.popover', function () {
        $scope.$apply(function () {
          $scope.filterOpen = false;
        });
        filterFocusTrap.deactivate();
      });
      filterPopoverContents.on('keydown', function (evt) {
        if (evt.keyCode !== 27) {
          return;
        }
        filterPopoverButton.popover('hide');
      });
      filterPopoverContents.on('focus', 'input[type=checkbox]', function () {
        if (!scrollingContainer) {
          scrollingContainer =
            filterPopoverContents.parent('.popover-content')[0];
          screenSize = scrollingContainer.offsetHeight;
        }
        var scrollTopPos = scrollingContainer.scrollTop;
        var itemSize = this.parentElement.offsetHeight;
        var offsetTop = this.offsetTop;
        var offsetBot = offsetTop + itemSize;
        if (this.id == 'activity_filter_all') {
          scrollingContainer.scrollTop = 0;
        } else if (scrollTopPos > offsetTop) {
          scrollingContainer.scrollTop = offsetTop;
        } else if (offsetBot > screenSize + scrollTopPos) {
          scrollingContainer.scrollTop = offsetBot - screenSize;
        }
      });
      snCustomEvent.fire('sn.stream.loaded');
    }
  )
  .filter('visibleFields', function () {
    return function (fields) {
      var obj = {};
      angular.forEach(fields, function (field) {
        if (field.visible) {
          obj[field.name] = field;
        }
      });
      return obj;
    };
  });