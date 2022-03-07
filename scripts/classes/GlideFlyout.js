/*! RESOURCE: /scripts/classes/GlideFlyout.js */
var GlideFlyout = Class.create({
  initialize: function (options) {
    this.options = options;
    this.expanded = false;
    this.pinned = false;
    this._box = $(cel('div'));
    this._box.className = '';
    this._createBox(
      this._createBoxContent(
        this.options.minHeight,
        this.options.maxWidth,
        this.options.id,
        this.options.title,
        this.options.content
      )
    );
    this._setMouseEvents();
  },
  _createFlyoutTable: function (minHeight, divBar, img, title) {
    var table = cel('table');
    table.style.display = 'block';
    table.style.position = 'relative';
    table.style.width = '100%';
    table.style.height = minHeight + 'px';
    $(table).addClassName('flyout_bar');
    divBar.appendChild(table);
    var tbody = cel('tbody');
    table.appendChild(tbody);
    var tr = cel('tr');
    tbody.appendChild(tr);
    var tdImg = cel('td');
    tr.appendChild(tdImg);
    tdImg.appendChild(img);
    var tdTitle = cel('td');
    tdTitle.style.paddingTop = '0px';
    tdTitle.style.fontSize = '12px';
    tdTitle.style.width = '100%';
    tdTitle.style.color = 'white';
    tdTitle.innerHTML = '&nbsp;' + title;
    tr.appendChild(tdTitle);
  },
  _createBoxContent: function (minHeight, maxWidth, id, title, content) {
    var divBar = cel('div');
    divBar.setAttribute('id', id + '_bar');
    divBar.style.fontSize = '4px';
    divBar.style.overflow = 'hidden';
    divBar.style.height = minHeight + 'px';
    divBar.style.width = maxWidth + 'px';
    divBar.style.border = '1px solid #777777';
    divBar.style.right = '0px';
    divBar.style.position = 'absolute';
    $(divBar).addClassName('flyout_bar');
    var imgDown = cel('img');
    imgDown.style.width = '16px';
    imgDown.style.height = '16px';
    imgDown.setAttribute('src', 'images/list_th_down_2.gif');
    this._createFlyoutTable(minHeight, divBar, imgDown, title);
    var divBody = cel('div');
    divBody.setAttribute('id', id + '_body');
    $(divBody).addClassName(id + '_body');
    divBody.style.background = '#777777';
    divBody.style.display = 'none';
    divBody.style.overflow = 'visible';
    divBody.style.width = '100%';
    divBody.style.height = '100%';
    divBody.style.border = '1px solid #777777';
    divBody.style.right = '0px';
    divBody.style.position = 'absolute';
    var imgPin = cel('img');
    imgPin.setAttribute('id', id + '_pin');
    imgPin.setAttribute('title', getMessage('Pin this flyout'));
    imgPin.style.cursor = 'pointer';
    imgPin.setAttribute('src', 'images/unpinned6.png');
    this._createFlyoutTable(minHeight, divBody, imgPin, title);
    var flyout = this;
    $(imgPin).on('click', function () {
      if (!flyout.pinned) {
        flyout.pinned = true;
        this.src = 'images/pinned5.png';
        this.title = getMessage('Unpin this flyout');
      } else {
        flyout.pinned = false;
        this.src = 'images/unpinned6.png';
        this.title = getMessage('Pin this flyout');
      }
    });
    var divContent = cel('div');
    divContent.style.border = '4px solid #434547';
    divContent.style.background = 'white';
    divContent.style.overflowY = 'auto';
    if (Prototype.Browser.IE == true) {
      divContent.style.position = 'relative';
      divContent.style.height = '100%';
      divContent.style.top = '0px';
      divContent.style.width = '100%';
    } else {
      divContent.style.position = 'absolute';
      divContent.style.top = minHeight + 1 + 'px';
      divContent.style.bottom = '0px';
      divContent.style.left = '0px';
      divContent.style.right = '0px';
    }
    divBody.appendChild(divContent);
    for (var i = 0; i < content.length; i++) divContent.appendChild(content[i]);
    return [divBar, divBody];
  },
  _createBox: function (content) {
    for (var i = 0; i < content.length; i++) this._box.appendChild(content[i]);
    this._box.style.position = this.options.position;
    this._box.style.top = this._getAdjustedDimension(this.options.top);
    if (this.options.right)
      this._box.style.right = this._getAdjustedDimension(this.options.right);
    if (this.options.left)
      this._box.style.right = this._getAdjustedDimension(this.options.left);
    this._box.style.height = this._getAdjustedDimension(this.options.minHeight);
    this._box.style.width = this._getAdjustedDimension(this.options.maxWidth);
    this._box.style.zIndex = 3000;
    this._box.setAttribute('id', this.options.id);
    this.options.parent.appendChild(this._box);
  },
  _setMouseEvents: function () {
    var flyout = this;
    $(this._box).on('mouseenter', function (evt, elem) {
      flyout.expand();
    });
    $(this._box).on('mouseleave', function (evt, elem) {
      flyout.collapse();
    });
  },
  toggle: function () {
    var bar = gel(this.options.id + '_bar');
    var body = gel(this.options.id + '_body');
    if (bar && body) {
      $(bar).toggle();
      $(body).toggle();
    }
  },
  expand: function () {
    if (!this.expanded) {
      this.expanded = true;
      $(this).toggle();
      $(this._box).style.height = this.options.height;
    }
  },
  collapse: function () {
    if (this.expanded && !this.pinned) {
      this.expanded = false;
      $(this).toggle();
      $(this._box).style.height = this.options.minHeight + 'px';
      return true;
    }
    return false;
  },
  _getAdjustedDimension: function (dimension) {
    if (typeof dimension == 'number') return dimension + 'px';
    else if (dimension.indexOf('px') > -1) return dimension;
    else if (dimension.indexOf('%') > -1) return dimension;
    else return dimension + 'px';
  },
});
