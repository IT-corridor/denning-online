denningOnline
  // =========================================================================
  // Header Messages and Notifications list Data
  // =========================================================================

  .service('messageService', ['$resource', function($resource){
    this.getMessage = function(img, user, text) {
      var gmList = $resource("data/messages-notifications.json");
      
      return gmList.get({
        img: img,
        user: user,
        text: text
      });
    }
  }])
  

  // =========================================================================
  // Best Selling Widget Data (Home Page)
  // =========================================================================

  .service('bestsellingService', ['$resource', function($resource){
    this.getBestselling = function(img, name, range) {
      var gbList = $resource("data/best-selling.json");
      
      return gbList.get({
        img: img,
        name: name,
        range: range,
      });
    }
  }])

  // =========================================================================
  // Malihu Scroll - Custom Scroll bars
  // =========================================================================
  .service('scrollService', function() {
    var ss = {};
    ss.malihuScroll = function scrollBar(selector, theme, mousewheelaxis) {
      $(selector).mCustomScrollbar({
        theme: theme,
        scrollInertia: 100,
        axis:'yx',
        mouseWheel: {
          enable: true,
          axis: mousewheelaxis,
          preventDefault: true
        }
      });
    }
    
    return ss;
  })


  //==============================================
  // BOOTSTRAP GROWL
  //==============================================

  .service('growlService', function(){
    var gs = {};
    gs.growl = function(message, type) {
      $.growl({
        message: message
      },{
        type: type,
        allow_dismiss: false,
        label: 'Cancel',
        className: 'btn-xs btn-inverse',
        placement: {
          from: 'top',
          align: 'right'
        },
        delay: 2500,
        animate: {
            enter: 'animated bounceIn',
            exit: 'animated bounceOut'
        },
        offset: {
          x: 20,
          y: 85
        }
      });
    }
    
    return gs;
  })

  .filter('ddate', function() {
    return function(strDate) {
      if (strDate) {
        return moment(strDate).format('DD/MM/YYYY');
      } else {
        return '';
      }
    }
  })

  .filter('dow', function() {
    return function(strDate) {
      var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (strDate) {
        return dayNames[moment(strDate).day()];
      } else {
        return '';
      }
    }
  })

  .filter('dnumber', function(refactorService, $filter) {
    return function(strNum, decp) {
      return $filter('number')(refactorService.convertFloat(strNum), decp);
    }
  })
