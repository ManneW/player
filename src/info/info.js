/* 
   MODULE: INFO
   Show title and description for the video
   
   Listens for:
   - player:settings: The app was loaded, time to show the info pane
   - player:video:loaded: New title and description to show

   Listens for:
   - player:infoengaged: Info pane was toggles somehow
   
   Answers properties:
   - showDescriptions [get/set]
   - infoTimeout [get]
*/

Player.provide('info', 
  {
    showDescriptions: true,
    infoTimeout: 10000
  },
  function(Player,$,opts){
      var $this = this;
      $.extend($this, opts);
      $this.infoTimeoutId = null;
      
      // Listen to find if we show show info
      Player.bind('player:settings', function(e,settings){
          PlayerUtilities.mergeSettings($this, ['showDescriptions', 'infoTimeout']);
        });

      function triggerInfoTimeout() {
        Player.set('showDescriptions', true);
        if($this.infoTimeout>0) {
            window.clearTimeout($this.infoTimeoutId);
            $this.infoTimeoutId = setTimeout(function(){Player.set('showDescriptions', false);}, $this.infoTimeout);
        }
      }

      // Bind to events
      Player.bind('player:infoengaged', function(e,video){
          $this.render();
      });
      Player.bind('player:video:play', function(e,video){
          Player.set('showDescriptions', false);
      });
      Player.bind('player:settings player:video:loaded', function(e,video){
          if($this.infoTimeout>0) {
            window.clearTimeout($this.infoTimeoutId);
            $this.infoTimeoutId = setTimeout(function(){Player.set('showDescriptions', false);}, $this.infoTimeout);
          }
          Player.fire('player:infoengaged');
        });

      Player.bind('player:video:pause', function(){
        if (!Player.get('playing') && !Player.get('browseMode')) {
          triggerInfoTimeout();
        }
      });

      /* GETTERS */
      Player.getter('showDescriptions', function(){
          return $this.showDescriptions;
        });
      Player.getter('infoTimeout', function(){
          return $this.infoTimeout;
        });
     
      /* SETTERS */
      Player.setter('showDescriptions', function(sd){
          $this.showDescriptions = sd;
          Player.fire('player:infoengaged');
          $(window).resize();
        });

      $(document).mousemove(function(){
        if (!Player.get('playing') && !Player.get('browseMode')) {
          triggerInfoTimeout();
        }
      });
      $(document).mouseleave(function(){
        Player.set('showDescriptions', false);
      });

      return $this;
  }
);
