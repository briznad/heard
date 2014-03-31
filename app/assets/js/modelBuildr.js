var heardApp;

heardApp = heardApp || {};

heardApp.modelBuildr = (function() {
  'use strict';
  var createCleanModel, init, _getData;
  init = function(callback) {
    return callback();
  };
  _getData = function(callback) {
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
      heardApp.model = {
        status: 'error',
        description: 'unable to talk to Google',
        data: data
      };
      return callback();
    });
  };
  createCleanModel = function(data, callback) {
    var postProcessing, processGeneral, sortRawInput;
    heardApp.model = {};
    sortRawInput = function(obj) {
      var key, tempCleanObj;
      key = obj.gsx$newpagetype.$t;
      tempCleanObj = processGeneral(obj, key);
      switch (key) {
        case 'edition':
          heardApp.model.settings = heardApp.model.settings || {};
          heardApp.model.settings.currentEdition = tempCleanObj.normalized;
          tempCleanObj = _.extend(tempCleanObj, {
            items: [],
            collaborators: [],
            location: {
              address: obj['gsx$edition-location-address']['$t'],
              media: obj['gsx$edition-location-media']['$t'],
              description: obj['gsx$edition-location-description']['$t'].replace(/\n/g, '<br/>')
            },
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
            additionalMedia: obj['gsx$item-additionalmedia']['$t'] === '' ? false : obj['gsx$item-additionalmedia']['$t'].replace(/,\s/g, ',').split(','),
            purchasePageMedia: obj['gsx$item-purchasepage-media']['$t'],
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
      heardApp.model[key] = heardApp.model[key] || {};
      return heardApp.model[key][tempCleanObj.normalized] = tempCleanObj;
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
      heardApp.model.meta.root = {
        type: 'meta',
        title: 'Root',
        normalized: 'root',
        description: 'This is the homepage.'
      };
      heardApp.model.meta.editions = {
        type: 'meta',
        title: 'Editions',
        normalized: 'editions',
        description: 'This is the Editions list.',
        displayOrder: _.keys(heardApp.model.edition)
      };
      heardApp.model.meta.collaborators = {
        type: 'meta',
        title: 'Collaborators',
        normalized: 'collaborators',
        description: 'This is the Collaborators list.',
        displayOrder: _.keys(heardApp.model.collaborator).sort()
      };
      heardApp.model.meta.where = {
        type: 'meta',
        title: 'Where',
        normalized: 'where',
        description: 'Where are we now?'
      };
      _.each(heardApp.model.item, function(value, key) {
        heardApp.model.edition[value.edition].items.push(key);
        heardApp.model.edition[value.edition].collaborators.push(value.creator);
        return heardApp.model.collaborator[value.creator].items.push(key);
      });
      _.each(heardApp.model.edition, function(value, key) {
        value.collaborators.sort();
        return value.items.sort();
      });
      _.each(heardApp.model.collaborator, function(value, key) {
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
      heardApp.model = {
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
