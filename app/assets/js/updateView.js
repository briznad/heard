var heardApp;

heardApp = heardApp || {};

heardApp.updateView = (function() {
  'use strict';
  var beforeUpdate, update, _computePageTitle, _removeBodyClasses;
  beforeUpdate = function(request) {};
  update = function(type, titleNormalized, purchasePage) {
    var bodyClasses;
    if (purchasePage == null) {
      purchasePage = false;
    }
    _removeBodyClasses();
    heardApp.model.settings.currentPage = _.extend(heardApp.model.settings.currentPage || {}, {
      type: type,
      titleNormalized: titleNormalized,
      purchasePage: purchasePage
    });
    bodyClasses = [type, titleNormalized, purchasePage ? 'purchase' : void 0];
    heardApp.cache.$body.addClass(bodyClasses.join(' '));
    heardApp.cache.$title.add(heardApp.cache.$h1).text(_computePageTitle(type, heardApp.model[type][titleNormalized].title, purchasePage));
    return heardApp.cache.$dynamicContainer.html(heardApp.template.primaryTemplate({
      data: heardApp.model,
      currentType: type,
      currentTitleNormalized: titleNormalized,
      currentEdition: heardApp.model.settings.currentEdition,
      purchasePage: purchasePage
    }));
  };
  _removeBodyClasses = function() {
    var bodyClasses;
    if (heardApp.model.settings.currentPage) {
      bodyClasses = [heardApp.model.settings.currentPage.type, heardApp.model.settings.currentPage.titleNormalized, 'purchase'];
      return heardApp.cache.$body.removeClass(bodyClasses.join(' '));
    }
  };
  _computePageTitle = function(type, title, purchasePage) {
    if (title === 'Root') {
      return '{a window]';
    } else if (type === 'edition') {
      if (purchasePage) {
        return '{a window] | ' + 'purchase edition' + title;
      } else {
        return '{a window] | ' + 'edition' + title;
      }
    } else if (purchasePage) {
      return '{a window] | ' + 'purchase ' + title;
    } else {
      return '{a window] | ' + title;
    }
  };
  return {
    beforeUpdate: beforeUpdate,
    update: update
  };
})();
