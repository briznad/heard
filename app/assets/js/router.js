var aWindow;

aWindow = aWindow || {};

aWindow.router = function() {
  var beforePageRefresh, routes, sendContactForm, updateCurrentPage;
  beforePageRefresh = function() {
    if (aWindow.model.settings.currentPage) {
      return aWindow.cache.$body.removeClass(aWindow.model.settings.currentPage.type + ' ' + aWindow.model.settings.currentPage.titleNormalized);
    }
  };
  updateCurrentPage = function(type, titleNormalized) {
    var pageTitle;
    aWindow.model.settings.currentPage = _.extend(aWindow.model.settings.currentPage || {}, {
      type: type,
      titleNormalized: titleNormalized
    });
    pageTitle = type !== 'meta' && titleNormalized !== 'root' ? '{a window] | ' + type + ' | ' + aWindow.model[type][titleNormalized].title : titleNormalized === 'root' ? '{a window]' : '{a window] | ' + aWindow.model[type][titleNormalized].title;
    aWindow.cache.$title.text(pageTitle);
    aWindow.cache.$body.addClass(type + ' ' + titleNormalized);
    return $('#primaryContainer').html(aWindow.template.primary({
      data: aWindow.model,
      currentType: type,
      currentTitleNormalized: titleNormalized,
      currentPageTitle: pageTitle
    }));
  };
  sendContactForm = function(req) {
    var contactReq;
    return contactReq = $.ajax({
      type: 'POST',
      url: req.path,
      data: req.params,
      success: function(data) {
        return console.log(data);
      },
      error: function(data) {
        return console.log(data);
      }
    });
  };
  routes = Davis(function() {
    this.configure(function(config) {
      return config.generateRequestOnPageLoad = true;
    });
    this.before(beforePageRefresh);
    this.get('/', function() {
      return updateCurrentPage('meta', 'root');
    });
    this.get('/:titleNormalized', function(req) {
      return updateCurrentPage('meta', req.params.titleNormalized);
    });
    this.get('/:type/:titleNormalized', function(req) {
      return updateCurrentPage(req.params.type, req.params.titleNormalized);
    });
    return this.post('/contact', sendContactForm);
  });
  return {
    routes: routes
  };
};
