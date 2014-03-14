var aWindow;

aWindow = aWindow || {};

aWindow.modelBuildr = (function() {
  'use strict';
  var createCleanModel, getData, init;
  init = function(callback) {
    return getData(callback);
  };
  getData = function(callback) {
    var contentSpreadsheetID, request;
    contentSpreadsheetID = '0AvY0yhzqHzgSdDRjV1UzcUxfQnRmSDNKcEhkUDlKeHc';
    request = $.ajax({
      url: 'https://spreadsheets.google.com/feeds/list/' + contentSpreadsheetID + '/od6/public/values?alt=json-in-script',
      dataType: 'jsonp'
    });
    request.done(function(data) {
      return createCleanModel(data, callback);
    });
    return request.fail(function(data) {
      aWindow.model = {
        status: 'error',
        description: 'unable to talk to Google',
        data: data
      };
      return callback();
    });
  };
  createCleanModel = function(data, callback) {
    var postProcessing, processGeneral, sortRawInput;
    aWindow.model = {};
    sortRawInput = function(obj) {
      var key, tempCleanObj;
      key = obj.gsx$newpagetype.$t;
      tempCleanObj = processGeneral(obj, key);
      switch (key) {
        case 'edition':
          aWindow.model.settings = aWindow.model.settings || {};
          aWindow.model.settings.currentEdition = tempCleanObj.normalized;
          tempCleanObj = _.extend(tempCleanObj, {
            items: [],
            collaborators: [],
            location: obj['gsx$edition-location']['$t'].replace(/\n/g, '<br/>'),
            hours: obj['gsx$edition-hours']['$t'].replace(/\n/g, '<br/>'),
            contact: {
              email: obj['gsx$edition-contact-email']['$t'],
              phone: obj['gsx$edition-contact-phone']['$t']
            }
          });
          break;
        case 'collaborator':
          tempCleanObj = _.extend(tempCleanObj, {
            associatedWithEditions: [],
            items: []
          });
          break;
        case 'item':
          tempCleanObj = _.extend(tempCleanObj, {
            creator: obj['gsx$item-creator']['$t'],
            edition: obj['gsx$item-edition']['$t'],
            price: obj['gsx$item-price']['$t'],
            madeToOrder: obj['gsx$item-madetoorder']['$t'] === 'TRUE' ? true : false,
            productionRun: obj['gsx$item-productionrun']['$t'],
            timeToShip: obj['gsx$item-timetoship']['$t'],
            windowDisplay: {
              media: obj['gsx$item-windowdisplaymedia']['$t'],
              position: {
                top: obj['gsx$item-windowdisplaymediaposition-top']['$t'] !== '' ? obj['gsx$item-windowdisplaymediaposition-top']['$t'] : 0,
                left: obj['gsx$item-windowdisplaymediaposition-left']['$t'] !== '' ? obj['gsx$item-windowdisplaymediaposition-left']['$t'] : 0
              }
            }
          });
      }
      aWindow.model[key] = aWindow.model[key] || {};
      return aWindow.model[key][tempCleanObj.normalized] = tempCleanObj;
    };
    processGeneral = function(obj, key) {
      return {
        type: key,
        title: obj['gsx$' + key + '-title']['$t'],
        normalized: obj['gsx$' + key + '-normalized']['$t'],
        description: obj['gsx$' + key + '-description']['$t'].replace(/\n/g, '<br/>'),
        media: obj['gsx$' + key + '-media']['$t']
      };
    };
    postProcessing = function(callback) {
      aWindow.model.meta.root = {
        type: 'meta',
        title: 'Root',
        normalized: 'root',
        description: 'This is the homepage.'
      };
      aWindow.model.meta.editions = {
        type: 'meta',
        title: 'Editions',
        normalized: 'editions',
        description: 'This is the Editions list.',
        displayOrder: _.keys(aWindow.model.edition)
      };
      aWindow.model.meta.collaborators = {
        type: 'meta',
        title: 'Collaborators',
        normalized: 'collaborators',
        description: 'This is the Collaborators list.',
        displayOrder: _.keys(aWindow.model.collaborator).sort()
      };
      _.each(aWindow.model.item, function(value, key) {
        aWindow.model.edition[value.edition].items.push(key);
        aWindow.model.edition[value.edition].collaborators.push(value.creator);
        return aWindow.model.collaborator[value.creator].items.push(key);
      });
      _.each(aWindow.model.edition, function(value, key) {
        value.collaborators.sort();
        return value.items.sort();
      });
      _.each(aWindow.model.collaborator, function(value, key) {
        return value.items.sort();
      });
      return callback();
    };
    if (data.feed.entry) {
      _.each(data.feed.entry, sortRawInput);
      return postProcessing(function() {
        return callback();
      });
    } else {
      aWindow.model = {
        status: 'error',
        description: 'no "entry" object returned',
        data: data
      };
      return callback();
    }
  };
  return {
    init: init
  };
})();
